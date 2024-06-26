// We use css modules to style the component
import styles from "./LightboxModal.module.css";
// React specific imports
import { useRef, useState, useEffect, useCallback } from "react";
// Redux specific imports
import { useSelector, useDispatch } from "react-redux";
import { closeModal } from "@/store/slices/modalSlice";
// Components imports
import SlideRightIcon from "../assets/vector/slideRightIcon.svg";

// Explicitly stating the expected structure of the imported modules
type ImageModule = {
  default: string;
};

// Saved a coment

// Use import.meta.glob with the { eager: true } option to import all the images in the assets folder
const moduleFiles = import.meta.glob("../assets/*.jpg", {
  eager: true,
}) as Record<string, ImageModule>;

/* it returns an object with the strucure {
  "key0": {"key1": "value1"},
  "key1": {"key2": "value2"}
}
*/

const imageModules: ImageModule[] = Object.values(moduleFiles);

/* Convert the object to an array of values
[{"key1": "value1"}, {"key2": "value2"}]
*/

export const LightboxModal = () => {
  const dispatch = useDispatch();

  /*****************************************************
DECLARING STATE VARIABLES
*****************************************************/

  // Initial index is the index of the image that was clicked to open the lightbox

  const initialIndex = useSelector((state: any) => state.modals.initialIndex);

  console.log("Initial index is", initialIndex);

  // Screen orienbtation tracking

  const [orientation, setOrientation] = useState<string>("");
  const [orientationHasChanged, setOrientationHasChanged] = useState(false);

  // Defining state variables

  const [containerStartX, setContainerStartX] = useState<number>(0);
  const [mouseWasDown, setMouseWasDown] = useState(false);
  const [moveStartX, setMoveStartX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [shouldCenterImage, setShouldCenterImage] = useState(false);

  // Defining refs
  const imageRefs = useRef(new Map<number, HTMLImageElement>()).current;
  const mainImageContainerRef = useRef<HTMLDivElement>(null);
  const reverseImageRefs = useRef(new Map<HTMLImageElement, number>()).current;
  const galleryContainerRef = useRef<HTMLDivElement>(null);
  const galleryWrapperRef = useRef<HTMLDivElement>(null);
  const galleryContainerWrapperRef = useRef<HTMLDivElement>(null);
  const slideRightIconRef = useRef<HTMLButtonElement>(null);
  const slideLeftIconRef = useRef<HTMLButtonElement>(null);
  const exitFullScreenButtonRef = useRef<HTMLButtonElement>(null);

  /******************************************************
DECLARING EFFECTS
*****************************************************/
  // Setting up the initial index of the image to be displayed in the lightbox

  useEffect(() => {
    setCurrentImageIndex(Number(initialIndex));
  }, [initialIndex]);

  // Effect to center the image closest to the center of the viewport after the initial load.
  //This solution is not perfect (timeout magic) but it is the only working solution I could come up with

  useEffect(() => {
    // This assumes initialIndex and images are set correctly and are available
    const timeoutId = setTimeout(() => {
      if (initialIndex !== null) {
        const imageElement = imageRefs.get(Number(initialIndex));
        if (imageElement) {
          console.log("Initial index was set to", imageElement);
          scrollImageToCenter(imageElement);
        }
      }
    }, 200); // Adjust delay as needed

    return () => clearTimeout(timeoutId);
  }, [initialIndex, imageRefs]);

  // Hook to handle window resize events and detect orientation changes on initial load
  // This  was necessary to avoid mobile browsers' address bars covering the content.

  useEffect(() => {
    // setting viewport height on initial load
    const setViewportHeight = () => {
      console.log("Setting initial viewport height");
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setViewportHeight();
  }, []);

  // Hook to handle window resize events and detect orientation changes.

  useEffect(() => {
    console.log("Initial setup effect  was triggered");

    // Handler function for the orientation change

    const determineAndSetOrientation = () => {
      const newOrientation =
        window.innerHeight > window.innerWidth ? "portrait" : "landscape";
      if (newOrientation !== orientation) {
        // Runs only on initial load
        if (orientation == "") {
          console.log(`Initial orientation has been set to ${newOrientation}`);
        }
        // Runs on every orientation change

        document.body.setAttribute("data-orientation", newOrientation);
        setOrientation(newOrientation);
        // triggers recentering on orientation change only on orientation chnanges after the initial load
        if (orientation !== "" && orientation !== newOrientation) {
          setOrientationHasChanged(true);
        }
      }
    };

    // Handler function for the resize event

    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      console.log(window.innerHeight, "before");
      document.documentElement.style.setProperty("--vh", `${vh}px`);
      console.log(window.innerHeight, "after");
    };

    // Combined handler for handling the resize and orientation change events

    const handleResize = () => {
      setViewportHeight();
      determineAndSetOrientation(); // Call the passed function to handle orientation logic
      console.log("Resize event was triggered");
    };

    // Call this from the hook itself to setup  the initial orientation
    determineAndSetOrientation();

    // Add the event listener to the window to listen for the resize event and execute the handleResize function on resize event

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [orientation]);

  // Hook to react to the orientation change and center the image closest to the center of the viewport on orientation change (not on initial load)

  useEffect(() => {
    if (orientationHasChanged) {
      console.log(
        "Block responsible for centering the image after orientation change was executed"
      );
      const image = imageRefs.get(currentImageIndex);
      if (image) {
        scrollImageToCenter(image);
      }
      setOrientationHasChanged(false);
    }
  }, [orientationHasChanged, currentImageIndex, imageRefs]);

  // Hook reacting to the pointer up event and centering the image closest to the center of the viewport at the point
  // where the pointer was released after dragging the gallery container

  useEffect(() => {
    if (shouldCenterImage && currentImageIndex !== null) {
      console.log(
        "Final centering adjustement block from the useEffect was executed"
      );
      const closestImage = imageRefs.get(currentImageIndex);
      if (closestImage && galleryContainerRef.current) {
        scrollImageToCenter(closestImage);
        console.log(closestImage);
      }
      // Reset the shouldCenterImage state to false to prevent the useEffect from being triggered again
      setShouldCenterImage(false);
    }
    // Disable the exhaustive-deps rule for this useEffect since we want to trigger the useEffect only when the shouldCenterImage state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldCenterImage]);

  // Utility function to find the closest image to the viewport center and update the current image index state
  const findClosestImageIndex = (): number | null => {
    if (galleryContainerRef.current) {
      let closestIndex = null;
      let smallestDistance = Infinity;
      const middleOfTheViewport = window.innerWidth / 2;

      imageRefs.forEach((imageRef, index) => {
        const imageRect = imageRef.getBoundingClientRect();
        const imageCenter = imageRect.left + imageRect.width / 2;
        const distance = Math.abs(middleOfTheViewport - imageCenter);

        if (distance < smallestDistance) {
          smallestDistance = distance;
          closestIndex = index;
        }
      });
      if (closestIndex !== null && closestIndex !== currentImageIndex) {
        setCurrentImageIndex(closestIndex);
      }
    }
    return null;
  };

  // Utility function that takes an image as an argument and scrolls gallery container parent to the center of the viewport
  const scrollImageToCenter = (image: HTMLImageElement) => {
    console.log("scrollImageToCenter function was called");
    if (galleryContainerRef.current && image) {
      const imageRect = image.getBoundingClientRect();
      const imageCenter = imageRect.left + imageRect.width / 2;
      // console.log("Image center is from function", imageCenter);
      // console.log("Image width is from function", imageRect.width);
      const middleOfTheViewport = window.innerWidth / 2;
      // console.log("Viewport width is from function", window.innerWidth);

      // Retrieving the current translateX value of the gallery container from the real dom (returnx matrix)

      const cssMatrix = new DOMMatrixReadOnly(
        galleryContainerRef.current.style.transform
      );
      const curernTranslateX = cssMatrix.m41;
      console.log("Current translateX value is", curernTranslateX);

      const movementDistance = middleOfTheViewport - imageCenter;
      console.log("Movement distance is", movementDistance);

      const newTranslateX = Number(curernTranslateX) + movementDistance;
      console.log("New translateX value is", newTranslateX);
      galleryContainerRef.current.style.transform = `translateX(${newTranslateX}px)`;
    }
  };

  /*****************************************************
  DEFINING EVENT HANDLERS FOR THE GALLERY PREVIEW CONTAINER
*****************************************************/

  // Defining click and drag events handlers for the gallery container

  const onPointerDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    console.log("Pointer down event was triggered");
    if (galleryContainerRef.current) {
      // Resetting the transition property of the gallery container to none to prevent the gallery from delayed response to the
      // user interaction (dragging) due to animation timing when the user starts dragging the gallery container
      galleryContainerRef.current.style.transition = "none";
      // Recording start of user interaction
      setMouseWasDown(true);
      // Recording the starting position of the pointer cursor at the start of the user interaction
      setMoveStartX(event.clientX);
      // Retrieving the current translateX value of the gallery container from the real dom (returnx matrix)
      const cssMatrix = new DOMMatrixReadOnly(
        galleryContainerRef.current.style.transform
      );
      const curernTranslateX = cssMatrix.m41;
      // Recording the starting value of translateX to the state variable
      setContainerStartX(curernTranslateX);
    } else {
      console.log("The element is not rendered yet or the ref is not attached");
    }
  };

  const onPointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    // Check if the mouse was down before the move event
    if (mouseWasDown) {
      const movementDistance = event.clientX - moveStartX;
      // Running the function to find the closest image to the center of the viewport and update the current image index state
      findClosestImageIndex();
      // Update the translateX value of the gallery container to move it
      if (galleryContainerRef.current !== null) {
        // Here we using previously recorded starting translateX value and the movement distance to calculate the new translateX value
        galleryContainerRef.current.style.transform = `translateX(${
          containerStartX + movementDistance
        }px)`;
        // Check if any significant movement has been made to determine click/drag action
        if (Math.abs(movementDistance) >= 4 && !isDragging) {
          // If the movement distance is greater than 4 pixels, the drag action is considered to be started
          setIsDragging(true);
          console.log("Drag action was started");
        }
      }
    }
  };

  const onPointerUp = (event: React.MouseEvent<HTMLDivElement>) => {
    console.log("Pointer up event was triggered");
    event.stopPropagation();
    // Terminate the drag action and calulations of the movement distance when the user releases the mouse button
    setMouseWasDown(false);
    // IF DRAGGING
    if (isDragging && galleryContainerRef.current !== null) {
      setIsDragging(false);
      console.log("Drag action was ended");
      galleryContainerRef.current.style.transition =
        "transform 0.2s ease-in-out";
      console.log("Closest image index is", currentImageIndex);
      // When pointer is released, below setters will trigger the useEffect to center the image from where the pointer was released
      setShouldCenterImage(true);
      // IF CLICKED
    } else if (!isDragging && galleryContainerRef.current !== null) {
      galleryContainerRef.current.style.transition =
        "transform 0.2s ease-in-out";
      console.log("Click is registered");
      // This condition prevents the gallety from scrolling if click was registered on something other than an image
      // And delegates event handling for children img to the parent gallery container
      if (event.target instanceof HTMLImageElement) {
        // The click occurred on an image
        console.log("Image was clicked", event.target);
        // Scroll the clicked image to the center of the viewport
        scrollImageToCenter(event.target);
        // Update the current image index state to the index of the clicked image using the reverseImageRefs map
        const clickedImageIndex = reverseImageRefs.get(event.target);
        if (typeof clickedImageIndex === "number") {
          setCurrentImageIndex(clickedImageIndex);
        } else {
          // Handle the case where the index is not found
          // For example, you could set it to a default value or handle the error
          console.log("Clicked image index not found");
        }
      } else {
        // The click occurred on something else
        console.log("Something else was clicked but image", event.target);
      }
    }
  };

  // Handles scenario when user initiated drag action and then pointer leaves the gallery container

  const onPointerLeave = () => {
    // Terminate the drag action and calulations of the movement distance when the pointer leaves the gallery container
    if (isDragging && galleryContainerRef.current !== null && mouseWasDown) {
      console.log(
        "Pointer leave event was triggered and condition to execute code block was met"
      );
      setIsDragging(false);
      setMouseWasDown(false);
      console.log("Cursor left the container");
      // Set the transition property to css animation to make the gallery container scroll smoothly to the closest image on pointer leave
      galleryContainerRef.current.style.transition = "transform 0.1s ease-out";
      const imageOnPointerLeave = imageRefs.get(currentImageIndex);
      if (imageOnPointerLeave !== undefined) {
        scrollImageToCenter(imageOnPointerLeave);
      }
    }
  };

  // Handles the click event on the slide right button
  // Wrapped in useCallback to prevent unnecessary re-renders since it is used as a dependency in the useEffect later

  const onSlideRightClick = useCallback(() => {
    console.log("Slide right button was clicked");
    navigator.vibrate(50);
    if (currentImageIndex < imageModules.length - 1 && imageRefs.size > 0) {
      const nextIndex = currentImageIndex + 1;
      const nextImage = imageRefs.get(nextIndex);
      console.log("Next image  is", nextImage);

      if (nextImage) {
        console.log("Next image  is", nextImage);
        scrollImageToCenter(nextImage);
      }
      setCurrentImageIndex(nextIndex);
    }
  }, [currentImageIndex, imageRefs, imageModules.length]);

  // Handles the click event on the slide left button

  const onSlideLeftClick = useCallback(() => {
    console.log("Slide left button was clicked");
    navigator.vibrate(50);
    if (currentImageIndex > 0) {
      const prevIndex = currentImageIndex - 1;
      const prevImage = imageRefs.get(prevIndex);
      if (prevImage) {
        scrollImageToCenter(prevImage);
      }
      setCurrentImageIndex(prevIndex);
    }
  }, [currentImageIndex, imageRefs]);

  // Handler for closing the modal
  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  // Handler for the various keydown events

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      console.log("Keydown event was triggered", event);
      // Repeat keydown events should be ignored since continous pressing will mess up function calls
      if (event.repeat) {
        return;
      }

      switch (event.key) {
        case "Escape":
          handleCloseModal();
          break;
        case "ArrowRight":
          onSlideRightClick();
          break;
        case "ArrowLeft":
          onSlideLeftClick();
          break;
        default:
          break;
      }
    },
    [handleCloseModal, onSlideLeftClick, onSlideRightClick]
  );

  // Hook to add the event listener to the window for the keydown event

  useEffect(() => {
    // Add the event listener to the window
    window.addEventListener("keydown", handleKeyDown);
    // Remove the event listener when the component is unmounted
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  /*****************************************************
  CODE BLOCK RESPONSIBLE FOR MAIN IMAGE TRANSLATE AND SCROLL ZOOM ON CURSOR
*****************************************************/

  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollZoomfunctionality, setScrollZoomfunctionality] = useState(false);
  const [pointerWasDownWindow, setPointerWasDownWindow] = useState(false);
  const [initialX, setInitialX] = useState(0);
  const [initialY, setInitialY] = useState(0);
  const [currentTransformStart, setCurrentTransformStart] = useState([0, 0]);

  // Three event handlers responsible for pannning while in the full screen zoom mode
  // They are specifically attached to the window to enable full screen panning and zooming user experience

  const onPointerDownWindowHandler = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    if (mainImageContainerRef.current && scrollZoomfunctionality) {
      const initialXValue = event.clientX;
      const initialYValue = event.clientY;

      const cssMatrix = new DOMMatrixReadOnly(
        mainImageContainerRef.current.style.transform
      );

      const curernTranslateX = cssMatrix.m41;
      const curernTranslateY = cssMatrix.m42;

      setCurrentTransformStart([curernTranslateX, curernTranslateY]);
      setInitialX(initialXValue);
      setInitialY(initialYValue);
      setPointerWasDownWindow(true);
    }
  };

  const onPointerMoveWindowHandler = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (mainImageContainerRef.current && pointerWasDownWindow) {
      const movementDistanceX = event.clientX - initialX;
      const movementDistanceY = event.clientY - initialY;

      mainImageContainerRef.current.style.transform = `translate(${
        currentTransformStart[0] + movementDistanceX
      }px, ${
        currentTransformStart[1] + movementDistanceY
      }px) scale(${zoomLevel})`;
    }
  };

  const onPointerUpWindowHandler = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    if (pointerWasDownWindow) {
      setPointerWasDownWindow(false);
    }
  };

  const zoomLevelRef = useRef(1); // Start with a zoom level of 1

  const triggerZoomFunctionality = useRef(false);

  // Effect responsible for tracking and initiating of full screen zoom and pan functionality
  // It is triggered when the zoom level changes from 1 to a value greater than 1 and vice versa

  useEffect(() => {
    if (
      mainImageContainerRef.current &&
      galleryContainerWrapperRef.current &&
      slideLeftIconRef.current &&
      slideRightIconRef.current &&
      exitFullScreenButtonRef.current
    ) {
      if (zoomLevel > 1) {
        // mainImageContainerRef.current.style.gridArea = `1 / 1 / -1 / -1`;
        // Moves gallery preview container off the screen and makes it invisible
        galleryContainerWrapperRef.current.style.transform = "translateY(100%)";
        galleryContainerWrapperRef.current.style.opacity = "0";
        // Hides the slide left and right buttons
        slideLeftIconRef.current.style.visibility = "hidden";
        slideRightIconRef.current.style.visibility = "hidden";
        // Shows the exit full screen button
        exitFullScreenButtonRef.current.style.visibility = "visible";
      } else {
        // mainImageContainerRef.current.style.gridArea = `1 / 2 / 2 / 3`;
        // Returns the gallery preview container to the initial position and scale and makes it visible
        galleryContainerWrapperRef.current.style.transform = "translateY(0)";
        mainImageContainerRef.current.style.transform =
          "translate(0, 0) scale(1)";
        galleryContainerWrapperRef.current.style.opacity = "1";
        slideLeftIconRef.current.style.visibility = "visible";
        slideRightIconRef.current.style.visibility = "visible";
        exitFullScreenButtonRef.current.style.visibility = "hidden";
        setScrollZoomfunctionality(false);
        setPointerWasDownWindow(false);
      }
    }
  }, [
    zoomLevel,
    scrollZoomfunctionality,
    pointerWasDownWindow,
    slideLeftIconRef,
    slideRightIconRef,
    galleryContainerWrapperRef,
    mainImageContainerRef,
  ]);

  // Handler for the exit full screen button

  const exitFullScreenHandler = () => {
    setZoomLevel(1);
    // Reseting the transform of the main image container to the initial state in order to avoid a jump on next zoom since transforms got memorized.
    if (mainImageContainerRef.current) {
      mainImageContainerRef.current.style.transform = `translate(0px) scale(1)`;
    }
    // Update the current zoom level stored in the ref
    zoomLevelRef.current = 1;
  };

  // Handler for the wheel scroll event on the window
  // Comment

  const onWheelWindowHandler = (event: React.WheelEvent<HTMLDivElement>) => {
    triggerZoomFunctionality.current = true;
    const zoomSpeed = 0.1;
    const direction = event.deltaY < 0 ? 1 : -1; // Determine zoom in or out based on scroll direction
    let newZoomValue =
      direction > 0
        ? zoomLevelRef.current * (1 + zoomSpeed)
        : zoomLevelRef.current / (1 + zoomSpeed);

    const minZoom = 1;
    const maxZoom = 4;
    // Here we offset gallery image container on zoom in order to keep the zoom centered on the cursor after zooming
    newZoomValue = Math.min(Math.max(minZoom, newZoomValue), maxZoom);
    setZoomLevel(newZoomValue);
    setScrollZoomfunctionality(true);

    if (mainImageContainerRef.current) {
      const imageRect = mainImageContainerRef.current.getBoundingClientRect();

      const mouseXRelativeToImage = event.clientX - imageRect.left;
      const mouseYRelativeToImage = event.clientY - imageRect.top;

      const scalingFactor = newZoomValue / zoomLevelRef.current;

      const deltaX =
        mouseXRelativeToImage * scalingFactor - mouseXRelativeToImage;
      const deltaY =
        mouseYRelativeToImage * scalingFactor - mouseYRelativeToImage;

      let cssMatrix = new DOMMatrixReadOnly(
        mainImageContainerRef.current.style.transform
      );
      const currentTranslateX = cssMatrix.m41;
      const currentTranslateY = cssMatrix.m42;

      mainImageContainerRef.current.style.transform = `translate(${
        currentTranslateX - deltaX
      }px, ${currentTranslateY - deltaY}px) scale(${newZoomValue})`;

      zoomLevelRef.current = newZoomValue; // Update the current zoom level stored in the ref
    }
  };

  // Handler for pinch zoom functionality on touch devices

  return (
    <div
      className={styles.galleryWrapper}
      ref={galleryWrapperRef}
      onPointerDown={onPointerDownWindowHandler}
      onPointerMove={onPointerMoveWindowHandler}
      onPointerUp={onPointerUpWindowHandler}
      onWheel={onWheelWindowHandler}
    >
      <button className={styles.closeButton} onClick={handleCloseModal}>
        {" "}
        &times; {/* Close button */}
      </button>
      <button
        onPointerDown={exitFullScreenHandler}
        ref={exitFullScreenButtonRef}
        className={styles.exitFullScreenButton}
      >
        <h4>Exit Full Screen </h4>
      </button>
      <div className={styles.mainImageContainer} ref={mainImageContainerRef}>
        {imageModules[currentImageIndex] && (
          <img
            key={currentImageIndex}
            src={imageModules[currentImageIndex].default}
            alt={`Gallery item ${currentImageIndex}`}
          />
        )}
      </div>
      <button
        className={styles.slideRightIcon}
        onClick={onSlideRightClick}
        ref={slideRightIconRef}
      >
        <img src={SlideRightIcon} alt="Slide Right" />
      </button>
      <button
        className={styles.slideLeftIcon}
        onClick={onSlideLeftClick}
        ref={slideLeftIconRef}
      >
        <img src={SlideRightIcon} alt="Slide Right" />
      </button>

      <div className={styles.carouselWrapper} ref={galleryContainerWrapperRef}>
        <div
          ref={galleryContainerRef}
          className={styles.galleryContainer}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
        >
          {imageModules.map((imageModule, index: number) => (
            <img
              key={index}
              ref={(el) => {
                if (el) {
                  imageRefs.set(index, el);
                  reverseImageRefs.set(el, index);
                }
              }}
              src={imageModule.default}
              alt="Gallery item"
              draggable="false"
              className={`${
                index === currentImageIndex ? styles.centeredImage : ""
              }
              ${orientation === "portrait" ? styles.portraitImage : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
