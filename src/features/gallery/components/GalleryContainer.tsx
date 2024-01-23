import styles from "./GalleryContainer.module.css";
import { useRef, useState, useEffect, useCallback } from "react";
import SlideRightIcon from "../assets/vector/slideRightIcon.svg";

// Define the type for the imported image modules
type ImageModule = {
  default: string;
};

// Use import.meta.glob with the { eager: true } option
const moduleFiles = import.meta.glob("../assets/*.jpg", {
  eager: true,
}) as Record<string, ImageModule>;

// Transform the imported modules into an array of (ts) images
// using Object.values(moduleFiles), you're extracting just the modules
// (the values of the moduleFiles object) and putting them into an array.
const imageModules: ImageModule[] = Object.values(moduleFiles);

export const GalleryContainer = () => {
  // Defining state variables

  const [mouseWasDown, setMouseWasDown] = useState(false);
  const [moveStartX, setMoveStartX] = useState<number>(0);

  // State to defferentiate between click and drag actions
  const [isDragging, setIsDragging] = useState(false);

  // State to keep track of the current translateX value of the  draggable gallery container
  const [currentTranslateX, setCurrentTranslateX] = useState<number>(0);

  // State to keep track of the index of the image that is currently passing by the viewport center
  // Also used to change the main image according to the passing by image or the clicked image
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // State to trigger the centering of the image with useEffect when the dragging action is finished
  const [shouldCenterImage, setShouldCenterImage] = useState(false);

  // Ref to search the image element from the image index
  const imageRefs = useRef(new Map<number, HTMLImageElement>()).current;
  // Ref to reverse search the image index from the image element
  const reverseImageRefs = useRef(new Map<HTMLImageElement, number>()).current;
  // Ref to the gallery container
  const galleryContainerRef = useRef<HTMLDivElement>(null);

  // useEffect to center the image when the drag action is finished and pointer

  useEffect(() => {
    if (shouldCenterImage && currentImageIndex !== null) {
      const closestImage = imageRefs.get(currentImageIndex);
      if (closestImage && galleryContainerRef.current) {
        scrollImageToCenter(closestImage);
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
      return closestIndex;
    }
    return null;
  };

  // Utility function that takes an image as an argument and scrolls gallery container parent to the center of the viewport
  const scrollImageToCenter = useCallback(
    (image: HTMLImageElement) => {
      if (galleryContainerRef.current) {
        const imageRect = image.getBoundingClientRect();
        const imageCenter = imageRect.left + imageRect.width / 2;
        const middleOfTheViewport = window.innerWidth / 2;
        const movementDistance = middleOfTheViewport - imageCenter;
        const newTranslateX = currentTranslateX + movementDistance;
        galleryContainerRef.current.style.transform = `translateX(${newTranslateX}px)`;
        // Update state (currentTranslateX) to keep track of the current translateX value of the gallery container
        setCurrentTranslateX(newTranslateX);
      }
    },
    [currentTranslateX]
  ); // Add an empty array as the second argument to useCallback

  // defining click and drag events handlers for the gallery container
  const onPointerDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (galleryContainerRef.current) {
      // Resetting the transition property of the gallery container to none to prevent the gallery from delayed response to the
      // user interaction (dragging) when the user starts dragging the gallery container
      galleryContainerRef.current.style.transition = "none";
      // Recording start of user interaction
      setMouseWasDown(true);
      // Recording the starting position of the pointer cursor at the start of the user interaction
      setMoveStartX(event.clientX);
      // Retrieve the current translateX value of the gallery container from the real dom (returnx matrix)
      const galleryContainerCurrentTranslateX = window
        .getComputedStyle(galleryContainerRef.current)
        .transform.split(",")[4];
      console.log(
        "User Interaction was initiated",
        galleryContainerCurrentTranslateX
      );
    } else {
      console.log("The element is not rendered yet or the ref is not attached");
    }
  };

  const onPointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    // Check if the mouse was down before the move event to prevent calculating the movement distance when the user is not interacting with the gallery container
    if (mouseWasDown) {
      const movementDistance = event.clientX - moveStartX;
      // Check if any significant movement has been made to differentiate between click and drag actions
      if (Math.abs(movementDistance) >= 4 && !isDragging) {
        setIsDragging(true);
        console.log("Drag action was started");
      }

      // It is better to use local conditions for the drag action to be performed instead of relying on isDragging state.
      // This way you dont need to rely on react state updates to perform the action cause it can be delayed due to the async nature of the state updates.

      if (Math.abs(movementDistance) >= 4) {
        // Initiate tracking index of the image that is currently passing closest to the viewport center
        const passingByImageIndex = findClosestImageIndex();
        console.log("Passing by image index is", passingByImageIndex);
        // Update the current image index state to the index of the image that is currently passing closest to the viewport center
        if (passingByImageIndex && passingByImageIndex !== currentImageIndex) {
          setCurrentImageIndex(passingByImageIndex);
        }
        // Update the translateX value of the gallery container to move the gallery container
        if (galleryContainerRef.current !== null) {
          galleryContainerRef.current.style.transform = `translateX(${
            currentTranslateX + movementDistance
          }px)`;
        }
      }
    }
  };

  const onPointerUp = (event: React.MouseEvent<HTMLDivElement>) => {
    // Terminate the drag action and calulations of the movement distance when the user releases the mouse button
    setMouseWasDown(false);
    // Calculate the aggregate movement distance
    const movementDistance = event.clientX - moveStartX;
    // Update the translateX value of the gallery container to move the gallery container according to the aggregate movement distance
    const newTranslateX = currentTranslateX + movementDistance;
    setCurrentTranslateX(newTranslateX);

    // Differentiate between click and drag actions logic here
    if (isDragging && galleryContainerRef.current !== null) {
      console.log("Drag action was ended");
      const closestImageIndex = findClosestImageIndex();
      if (closestImageIndex !== null) {
        // Change transition property of the gallery container to enable smooth transition of the gallery container when the user releases the mouse button
        // and useEffect is triggered to center the image
        galleryContainerRef.current.style.transition =
          "transform 0.2s ease-in-out";
        console.log("Closest image index is", closestImageIndex);
        // When pointer is released, below setters will trigger the useEffect to center the image
        setShouldCenterImage(true);
      }
    } else if (!isDragging && galleryContainerRef.current !== null) {
      // Change transition property of the gallery container to enable smooth transition of the gallery container when the user releases the mouse button
      galleryContainerRef.current.style.transition =
        "transform 0.2s ease-in-out";
      console.log("Click is registered");
      // Checking prototype of the clicked element to differentiate between click on the image and click on something else
      // Since we have to pass the image element to the scrollImageToCenter function, we need to check if the clicked element is an image
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
        // You can add more logic here, like identifying which image was clicked
      } else {
        // The click occurred on something else
        console.log("Something else was clicked but image", event.target);
      }
    }
    setIsDragging(false);
  };

  const onPointerLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setMouseWasDown(false);
      setIsDragging(false);
      // Calculate the aggregate movement distance before the pointer left the gallery container
      const movementDistance = event.clientX - moveStartX;
      // Updating the translateX value of the gallery container to move the gallery container according to the aggregate movement distance
      setCurrentTranslateX(currentTranslateX + movementDistance);
      // Center the image that is currently passing closest to the viewport center with useEffect by triggering the shouldCenterImage state change
      if (galleryContainerRef.current !== null) {
        galleryContainerRef.current.style.transition =
          "transform 0.2s ease-in-out";
        const closestImageIndex = findClosestImageIndex();
        if (closestImageIndex !== null) {
          setCurrentImageIndex(closestImageIndex);
        }
        setShouldCenterImage(true);
      }
      console.log("Cursor left the element");
    }
  };

  // Define onSlideRightClick and onSlideLeftClick with useCallback
  const onSlideRightClick = useCallback(() => {
    console.log("Right arrow button was clicked", currentImageIndex);
    if (currentImageIndex < imageModules.length - 1) {
      const nextImageIndex = currentImageIndex + 1;
      const nextImage = imageRefs.get(nextImageIndex);
      if (nextImage !== undefined) {
        scrollImageToCenter(nextImage);
        setCurrentImageIndex(nextImageIndex);
      }
    } else return;
  }, [currentImageIndex, imageRefs, scrollImageToCenter]);

  const onSlideLeftClick = useCallback(() => {
    if (currentImageIndex >= 1) {
      const previousImageIndex = currentImageIndex - 1;
      const previousImage = imageRefs.get(previousImageIndex);
      if (previousImage !== undefined) {
        scrollImageToCenter(previousImage);
        setCurrentImageIndex(previousImageIndex);
      }
    } else return;
  }, [currentImageIndex, imageRefs, scrollImageToCenter]);

  // Add throttling or debouncing here to prevent the event handler from being triggered too many times
  // Instead of this add global event listener to the entire component and then register arroqw key press events
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        onSlideRightClick();
      } else if (event.key === "ArrowLeft") {
        onSlideLeftClick();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [onSlideRightClick, onSlideLeftClick]);

  return (
    <div className={styles.galleryWrapper}>
      <div className={styles.mainImage}>
        {imageModules[currentImageIndex] && (
          <img
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

      <div className={styles.carouselWrapper}>
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
            />
          ))}
        </div>
      </div>
    </div>
  );
};
