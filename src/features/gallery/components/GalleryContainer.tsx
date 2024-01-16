import styles from "./GalleryContainer.module.css";
import { useRef, useState, useEffect } from "react";
// Import SVG as a URL
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
  const [mouseWasDown, setMouseWasDown] = useState(false);

  const [moveStartX, setMoveStartX] = useState<number>(0);

  const [isDragging, setIsDragging] = useState(false);
  const [isDraggable, setIsDraggable] = useState(true);
  const [currentTranslateX, setCurrentTranslateX] = useState<number>(0);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const [shouldCenterImage, setShouldCenterImage] = useState(false);

  const imageRefs = useRef(new Map<number, HTMLImageElement>()).current;
  const reverseImageRefs = useRef(new Map<HTMLImageElement, number>()).current;
  const galleryContainerRef = useRef<HTMLDivElement>(null);

  // UseEffect to center the image when the currentImageIndex changes

  useEffect(() => {
    if (shouldCenterImage && currentImageIndex !== null) {
      setIsDraggable(false);
      const closestImage = imageRefs.get(currentImageIndex);
      if (closestImage && galleryContainerRef.current) {
        scrollImageToCenter(closestImage);
      }
      setShouldCenterImage(false);
      setIsDraggable(true);
    }
  }, [shouldCenterImage, currentImageIndex]);

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

  // Function that takes an image in atd scrolls it to the viewport center

  const scrollImageToCenter = (image: HTMLImageElement) => {
    if (galleryContainerRef.current) {
      const imageRect = image.getBoundingClientRect();
      const imageCenter = imageRect.left + imageRect.width / 2;
      const middleOfTheViewport = window.innerWidth / 2;
      const movementDistance = middleOfTheViewport - imageCenter;
      const newTranslateX = currentTranslateX + movementDistance;
      galleryContainerRef.current.style.transform = `translateX(${newTranslateX}px)`;
      // Update state after applying the transformation
      setCurrentTranslateX(newTranslateX);
    }
  };
  // defining click and drag events handlers for the gallery container

  const onDragStart = (event: React.MouseEvent<HTMLDivElement>) => {
    // Apply the new transformation
    if (galleryContainerRef.current) {
      galleryContainerRef.current.style.transition = "none";

      setMouseWasDown(true);
      setMoveStartX(event.clientX);
      const galleryContainerCurrentTranslateX = window
        .getComputedStyle(galleryContainerRef.current)
        .transform.split(",")[4];
      setCurrentTranslateX(Number(galleryContainerCurrentTranslateX));
      console.log(
        "User Interaction was initiated",
        galleryContainerCurrentTranslateX
      );
    } else {
      console.log("The element is not rendered yet or the ref is not attached");
    }
  };
  
  const movementDistanceRef = useRef<number>(0);
  
  const onDragMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (mouseWasDown && isDraggable) {
      const movementDistance = event.clientX - moveStartX;

      // Check if any significant movement has been made
      if (Math.abs(movementDistance) >= 4 && !isDragging) {
        setIsDragging(true);
        console.log("Drag action was started");
      }

      if (isDragging) {
        const passingByImageIndex = findClosestImageIndex();
        setCurrentImageIndex(passingByImageIndex);
        galleryContainerRef.current.style.transform = `translateX(${
          currentTranslateX + movementDistance
        }px)`;
      }
    }
  };

  const onDragEnd = (event: React.MouseEvent<HTMLDivElement>) => {
    setMouseWasDown(false);
    const movementDistance = event.clientX - moveStartX;
    const newTranslateX = currentTranslateX + movementDistance;
    setCurrentTranslateX(newTranslateX);

    if (isDragging) {
      console.log("Drag action was ended");
      const closestImageIndex = findClosestImageIndex();
      if (closestImageIndex !== null) {
        console.log("Closest image index is", closestImageIndex);
        setShouldCenterImage(true);
        galleryContainerRef.current.style.transition =
          "transform 0.2s ease-in-out";
      }
    } else if (!isDragging) {
      galleryContainerRef.current.style.transition =
        "transform 0.2s ease-in-out";
      console.log("Click is registered");
      if (event.target.tagName === "IMG") {
        // The click occurred on an image
        console.log("Image was clicked", event.target);
        scrollImageToCenter(event.target);
        setCurrentImageIndex(reverseImageRefs.get(event.target));
        
      }
    }
    setIsDragging(false);
  };

  const onDragTerminate = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setMouseWasDown(false);
      setIsDragging(false);
      console.log("Cursor left the element");
    }
  };

  // Defining click handlers for the arrow buttons to slide the gallery

  const onSlideRightClick = () => {};

  const onSlideLeftClick = () => {};

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
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onPointerLeave={onDragTerminate}
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
