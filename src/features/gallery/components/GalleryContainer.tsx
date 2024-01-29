import styles from "./GalleryContainer.module.css";
import { useRef, useState, useEffect } from "react";
import SlideRightIcon from "../assets/vector/slideRightIcon.svg";
import { current } from "@reduxjs/toolkit";

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

  const [containerStartX, setContainerStartX] = useState<number>(0);

  const [mouseWasDown, setMouseWasDown] = useState(false);
  const [moveStartX, setMoveStartX] = useState<number>(0);
  const [moveEndX, setMoveEndX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const imageRefs = useRef(new Map<number, HTMLImageElement>()).current;

  const reverseImageRefs = useRef(new Map<HTMLImageElement, number>()).current;
  const galleryContainerRef = useRef<HTMLDivElement>(null);

  // useEffect to center the image when the drag action is finished and pointer

  // useEffect(() => {
  //   if (shouldCenterImage && currentImageIndex !== null) {
  //     const closestImage = imageRefs.get(currentImageIndex);
  //     if (closestImage && galleryContainerRef.current) {
  //       scrollImageToCenter(closestImage);
  //     }
  //     // Reset the shouldCenterImage state to false to prevent the useEffect from being triggered again
  //     setShouldCenterImage(false);
  //   }
  //   // Disable the exhaustive-deps rule for this useEffect since we want to trigger the useEffect only when the shouldCenterImage state changes
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [shouldCenterImage]);

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

  // Utility function that takes an image as an argument and scrolls gallery container parent to the center of the viewport
  const scrollImageToCenter = (image: HTMLImageElement) => {
    if (galleryContainerRef.current) {
      const imageRect = image.getBoundingClientRect();
      const imageCenter = imageRect.left + imageRect.width / 2;
      const middleOfTheViewport = window.innerWidth / 2;
      const movementDistance = middleOfTheViewport - imageCenter;
      const newTranslateX = containerStartX + movementDistance;
      galleryContainerRef.current.style.transform = `translateX(${newTranslateX}px)`;
    }
  }; // Add an empty array as the second argument to useCallback

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
      setContainerStartX(parseInt(galleryContainerCurrentTranslateX));
    } else {
      console.log("The element is not rendered yet or the ref is not attached");
    }
  };

  const onPointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    // Check if the mouse was down before the move event
    if (mouseWasDown) {
      const movementDistance = event.clientX - moveStartX;
      // Check if any significant movement has been made
      if (Math.abs(movementDistance) >= 4 && !isDragging) {
        setIsDragging(true);
        console.log("Drag action was started");
        // Initiate tracking index of the image
        findClosestImageIndex();
      }
      // Update the translateX value of the gallery container to move it
      if (galleryContainerRef.current !== null) {
        galleryContainerRef.current.style.transform = `translateX(${
          containerStartX + movementDistance
        }px)`;
      }
    }
  };

  const onPointerUp = (event: React.MouseEvent<HTMLDivElement>) => {
    // Terminate the drag action and calulations of the movement distance when the user releases the mouse button
    setMouseWasDown(false);
    // Retrieve the current translateX value of the gallery container from the real dom (returnx matrix)
    setMoveEndX(event.clientX - moveStartX);

    // Differentiate between click and drag actions logic here
    if (isDragging && galleryContainerRef.current !== null) {
      console.log("Drag action was ended");
      findClosestImageIndex();
        galleryContainerRef.current.style.transition =
          "transform 0.2s ease-in-out";
        console.log("Closest image index is", currentImageIndex);
        // When pointer is released, below setters will trigger the useEffect to center the image
        // Empty
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
        // You can add more logic here, like identifying which image was clicked
      } else {
        // The click occurred on something else
        console.log("Something else was clicked but image", event.target);
      }
    }
    setIsDragging(false);
  };

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
      <button className={styles.slideRightIcon}>
        <img src={SlideRightIcon} alt="Slide Right" />
      </button>
      <button className={styles.slideLeftIcon}>
        <img src={SlideRightIcon} alt="Slide Right" />
      </button>

      <div className={styles.carouselWrapper}>
        <div
          ref={galleryContainerRef}
          className={styles.galleryContainer}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
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
