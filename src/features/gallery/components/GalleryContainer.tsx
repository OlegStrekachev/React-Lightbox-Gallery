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
  const [initiatedInteraction, setInitiatedInteraction] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState<number>(0);

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  const imageRefs = useRef(new Map<number, HTMLImageElement>()).current;
  const reverseImageRefs = useRef(new Map<HTMLImageElement, number>()).current;

  const galleryContainerRef = useRef<HTMLDivElement>(null);

  // function to scroll to the image with the given id
  function scrollToId(imageNode: HTMLImageElement) {
    imageNode.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }

  //  function to determine the index of the closest gallery image to the center of the screen (for now let's assume the center of the screen is the center of the gallery container)

  const findClosestImageIndex = (): number | null => {
    // Assign to a local variable to ensure non-null value within the loop
    const galleryCurrent = galleryContainerRef.current;

    // Early return if galleryCurrent is null
    if (!galleryCurrent) return null;

    let closestDistance = Infinity;
    let closestImageIndex: number | null = null;

    imageRefs.forEach((imageNode) => {
      const imgRectModel = imageNode.getBoundingClientRect();
      const imgCenterX = imgRectModel.left + imgRectModel.width / 2;

      const galleryCenter =
        galleryCurrent.getBoundingClientRect().left +
        galleryCurrent.clientWidth / 2;
      const distance = Math.abs(imgCenterX - galleryCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        const index = reverseImageRefs.get(imageNode);
        closestImageIndex = index !== undefined ? index : null;
      }
    });

    return closestImageIndex;
  };

  // defining click and drag events handlers for the gallery container

  const onDragStart = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setInitiatedInteraction(true);
    setDragStartX(event.clientX);
    setScrollLeftStart(galleryContainerRef.current!.scrollLeft);
  };

  const onDragMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!galleryContainerRef.current) return;
    const initialMove = event.clientX - dragStartX;
    if (initiatedInteraction && Math.abs(initialMove) > 8) {
      console.log("dragging initiated");
      setIsDragging(true);
      galleryContainerRef.current.scrollLeft = scrollLeftStart - initialMove;
    }
  };

  const onDragEnd = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!galleryContainerRef.current) return;
    else if (initiatedInteraction && isDragging) {
      const centeredImageIndex = findClosestImageIndex();
      if (centeredImageIndex === null) return;
      setCurrentImageIndex(centeredImageIndex);
      const centeredImageNode = imageRefs.get(centeredImageIndex);
      if (centeredImageNode === undefined) return;
      scrollToId(centeredImageNode);
    } else if (initiatedInteraction && !isDragging) {
      console.log("Click is registered");
      const clickedImageIndex = reverseImageRefs.get(
        event.target as HTMLImageElement
      );
      if (clickedImageIndex === undefined) return;
      setCurrentImageIndex(clickedImageIndex);
      scrollToId(event.target as HTMLImageElement);
    }

    setInitiatedInteraction(false);
    setIsDragging(false);
  };

  // Defining click handlers for the arrow buttons to slide the gallery

  const onSlideRightClick = () => {
    const nextIndex = currentImageIndex + 1;
    if (nextIndex < imageModules.length) {
      setCurrentImageIndex(nextIndex);
      scrollToId(imageRefs.get(nextIndex));
    }
  };

  const onSlideLeftClick = () => {
    const previousIndex = currentImageIndex - 1;
    if (previousIndex >= 0) {
      setCurrentImageIndex(previousIndex);
      scrollToId(imageRefs.get(previousIndex));
    }
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
