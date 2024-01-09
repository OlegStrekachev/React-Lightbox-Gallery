import styles from "./GalleryContainer.module.css";
import { useRef, useState } from "react";
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
  const [currentTranslateX, setCurrentTranslateX] = useState<number>(0);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [dragMovementDistance, setDragMovementDistance] = useState<number>(0);

  const imageRefs = useRef(new Map<number, HTMLImageElement>()).current;
  const reverseImageRefs = useRef(new Map<HTMLImageElement, number>()).current;
  const galleryContainerRef = useRef<HTMLDivElement>(null);

  //  function to determine the index of the closest gallery image to the center of the screen (for now let's assume the center of the screen is the center of the gallery container)

  // const findClosestImageIndex = (): number | null => {
  // };

  // defining click and drag events handlers for the gallery container

  const onDragStart = (event: React.MouseEvent<HTMLDivElement>) => {
    // Apply the new transformation
    if (galleryContainerRef.current) {
      setMouseWasDown(true);
      setMoveStartX(event.clientX);
      const galleryContainerCurrentTranslateX = window
        .getComputedStyle(galleryContainerRef.current)
        .transform.split(",")[4];
      setCurrentTranslateX(Number(galleryContainerCurrentTranslateX));
      console.log("drag start", galleryContainerCurrentTranslateX);
    } else {
      console.log("The element is not rendered yet or the ref is not attached");
    }
  };

  const onDragMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (mouseWasDown) {
      const movementDistance = event.clientX - moveStartX;

      setDragMovementDistance(movementDistance);
      galleryContainerRef.current.style.transform = `translateX(${
        currentTranslateX + movementDistance
      }px)`;
      console.log("movementDistance", movementDistance);
    }
  };

  const onDragEnd = (event: React.MouseEvent<HTMLDivElement>) => {
    setCurrentTranslateX(currentTranslateX + dragMovementDistance);
    setMouseWasDown(false);
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
