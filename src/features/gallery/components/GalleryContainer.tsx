import styles from "./GalleryContainer.module.css";
import { useRef, useState, useEffect, useCallback } from "react";
import SlideRightIcon from "../assets/vector/slideRightIcon.svg";

// Custom hooks imports
import { useWindowResizeListener } from "../hooks/useWindowResizeListener";

// Explicitly stating the expected structure of the imported modules
type ImageModule = {
  default: string;
};

// Use import.meta.glob with the { eager: true } option
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

export const GalleryContainer = () => {
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
  const mainImageRef = useRef<HTMLImageElement>(null);
  const mainImageContainerRef = useRef<HTMLDivElement>(null);
  const reverseImageRefs = useRef(new Map<HTMLImageElement, number>()).current;
  const galleryContainerRef = useRef<HTMLDivElement>(null);
  const galleryWrapperRef = useRef<HTMLDivElement>(null);
  const galleryContainerWrapperRef = useRef<HTMLDivElement>(null);

  // Custom hook to listen for window resize events and update the viewport height custom property
  useWindowResizeListener();

  useEffect(() => {
    // Call the handler immediately to set the initial orientation on component load
    const initialOrientation = screen.orientation.type;
    setOrientation(initialOrientation);
    document.body.setAttribute(
      "data-orientation",
      screen.orientation.type.split("-")[0]
    );

    screen.orientation.addEventListener("change", handleOrientationChange);
    return () => {
      screen.orientation.removeEventListener("change", handleOrientationChange);
    };
  }, []);

  useEffect(() => {
    if (orientationHasChanged) {
      console.log("Orientation has changed");
      const image = imageRefs.get(currentImageIndex);
      if (image) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollImageToCenter(image);
          });
        });
      }
      setOrientationHasChanged(false);
    }
  }, [orientationHasChanged, currentImageIndex, imageRefs]);

  const handleOrientationChange = () => {
    const newOrientation = screen.orientation.type;

    console.log(newOrientation);

    if (newOrientation !== orientation) {
      const image = imageRefs.get(currentImageIndex);
      setOrientation(newOrientation);
      document.body.setAttribute(
        "data-orientation",
        newOrientation.split("-")[0]
      );

      setOrientationHasChanged(true);
    }
  };
  // Effect responsible for updating the orientation state when the orientation changes

  // useEffect is designed to finalize image centering to the middle of the viewport after pointer release
  // When drag action is ended (onpointerup), the image closest to the center of the viewport is centered

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

  // Utility function to find the closest image to the viewport center
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

  // Event listener for orientation change. It centers the image closest to the center of the viewport

  // Utility function that takes an image as an argument and scrolls gallery container parent to the center of the viewport
  const scrollImageToCenter = (image: HTMLImageElement) => {
    console.log("scrollImageToCenter function was called");
    if (galleryContainerRef.current) {
      const imageRect = image.getBoundingClientRect();
      const imageCenter = imageRect.left + imageRect.width / 2;
      const middleOfTheViewport = window.innerWidth / 2;

      const movementDistance = middleOfTheViewport - imageCenter;
      // Retrieving the current translateX value of the gallery container from the real dom (returnx matrix)

      const cssMatrix = new DOMMatrixReadOnly(
        galleryContainerRef.current.style.transform
      );
      const curernTranslateX = cssMatrix.m41;

      const newTranslateX = Number(curernTranslateX) + movementDistance;
      console.log("New translateX value is", newTranslateX);
      galleryContainerRef.current.style.transform = `translateX(${newTranslateX}px)`;
    }
  }; // Add an empty array as the second argument to useCallback

  /*
      const imageCenter = imageRect.left + imageRect.width / 2;
     


  */
  // defining click and drag events handlers for the gallery container
  const onPointerDown = (event: React.MouseEvent<HTMLDivElement>) => {
    console.log("Pointer down event was triggered");
    event.stopPropagation();
    console.log("Pointer down event was triggered");
    if (galleryContainerRef.current) {
      // Resetting the transition property of the gallery container to none to prevent the gallery from delayed response to the
      // user interaction (dragging) when the user starts dragging the gallery container
      galleryContainerRef.current.style.transition = "none";
      // Recording start of user interaction
      setMouseWasDown(true);
      // Recording the starting position of the pointer cursor at the start of the user interaction
      setMoveStartX(event.clientX);

      const cssMatrix = new DOMMatrixReadOnly(
        galleryContainerRef.current.style.transform
      );
      const curernTranslateX = cssMatrix.m41;
      setContainerStartX(curernTranslateX);
    } else {
      console.log("The element is not rendered yet or the ref is not attached");
    }
  };

  const onPointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    console.log("Pointer move event was triggered");
    // Check if the mouse was down before the move event
    if (mouseWasDown) {
      const movementDistance = event.clientX - moveStartX;
      findClosestImageIndex();
      // Update the translateX value of the gallery container to move it
      if (galleryContainerRef.current !== null) {
        galleryContainerRef.current.style.transform = `translateX(${
          containerStartX + movementDistance
        }px)`;
        // Check if any significant movement has been made
        if (Math.abs(movementDistance) >= 4 && !isDragging) {
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

  // const onPointerLeave = () => {
  //   console.log("Pointer leave event was triggered");
  //   // Terminate the drag action and calulations of the movement distance when the pointer leaves the gallery container
  //   setMouseWasDown(false);
  //   if (isDragging && galleryContainerRef.current !== null) {
  //     setIsDragging(false);
  //     console.log("Cursor left the container");
  //     galleryContainerRef.current.style.transition = "transform 0.1s ease-out";
  //   }
  //   const imageOnPointerLeave = imageRefs.get(currentImageIndex);
  //   if (imageOnPointerLeave !== undefined) {
  //     scrollImageToCenter(imageOnPointerLeave);
  //   }
  // };

  const [scale, setScale] = useState<number>(1);

  const onWheelScroll = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent the default scrolling behavior

    setScale((prevScale) => {
      const zoomableImage = mainImageRef.current;

      if (zoomableImage) {
        // Calculate the factor by which to zoom
        const zoomFactor = event.deltaY * -0.001;

        if (
          galleryWrapperRef.current &&
          galleryContainerWrapperRef.current &&
          mainImageContainerRef.current
        ) {
          if (scale > 1) {
            mainImageContainerRef.current.style.gridArea = `1 / 1 / -1 / -1`;
            galleryContainerWrapperRef.current.style.transform =
              "translateY(100%)";
            galleryContainerWrapperRef.current.style.opacity = "0";
          } else {
            mainImageContainerRef.current.style.gridArea = `1 / 2 / 2 / 3`;
            galleryContainerWrapperRef.current.style.transform =
              "translateY(0)";
            galleryContainerWrapperRef.current.style.opacity = "1";
          }
        }

        // Calculate the new scale, limiting it between 1 and 4
        let newScale = prevScale + zoomFactor;
        newScale = Math.max(1, Math.min(newScale, 4));

        zoomableImage.style.transform = `scale(${newScale})`;

        return newScale;
      }
    });

    if (event.deltaY > 0) {
      console.log("Zooming out");
    } else {
      console.log("Zooming in");
    }
  };

  const onSlideRightClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      console.log("Slide right button was clicked");
      event.stopPropagation();
      if (currentImageIndex < imageModules.length - 1) {
        const nextIndex = currentImageIndex + 1;
        const nextImage = imageRefs.get(nextIndex);
        console.log("Next image  is", nextImage);

        if (nextImage) {
          console.log("Next image  is", nextImage);
          scrollImageToCenter(nextImage);
        }
        setCurrentImageIndex(nextIndex);
      }
    },
    [scrollImageToCenter, currentImageIndex, imageRefs]
  );

  const onSlideLeftClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      console.log("Slide left button was clicked");
      event.stopPropagation();
      if (currentImageIndex > 0) {
        const prevIndex = currentImageIndex - 1;
        const prevImage = imageRefs.get(prevIndex);
        if (prevImage) {
          scrollImageToCenter(prevImage);
        }
        setCurrentImageIndex(prevIndex);
      }
    },
    [scrollImageToCenter, currentImageIndex, imageRefs]
  );

  return (
    <div className={styles.galleryWrapper} ref={galleryWrapperRef}>
      <div className={styles.mainImage} ref={mainImageContainerRef}>
        {imageModules[currentImageIndex] && (
          <img
            ref={mainImageRef}
            onWheel={onWheelScroll}
            key={currentImageIndex}
            src={imageModules[currentImageIndex].default}
            alt={`Gallery item ${currentImageIndex}`}
          />
        )}
      </div>
      <button className={styles.slideRightIcon} onClick={onSlideRightClick}>
        <img src={SlideRightIcon} alt="Slide Right" />
      </button>
      <button className={styles.slideLeftIcon} onClick={onSlideLeftClick}>
        <img src={SlideRightIcon} alt="Slide Right" />
      </button>

      <div className={styles.carouselWrapper} ref={galleryContainerWrapperRef}>
        <div
          ref={galleryContainerRef}
          className={styles.galleryContainer}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          // onPointerLeave={onPointerLeave}
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
