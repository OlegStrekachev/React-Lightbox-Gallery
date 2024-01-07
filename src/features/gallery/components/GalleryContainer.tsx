import styles from "./GalleryContainer.module.css";
import { useRef } from "react";

// Define the type for the imported image modules
type ImageModule = {
  default: string;
};

// Use import.meta.glob with the { eager: true } option
const moduleFiles = import.meta.glob("../assets/*.jpg", {
  eager: true,
}) as Record<string, ImageModule>;

console.log("Logging moduleFiles", moduleFiles);

// Transform the imported modules into an array of (ts) images
// using Object.values(moduleFiles), you're extracting just the modules
// (the values of the moduleFiles object) and putting them into an array.
const imageModules: ImageModule[] = Object.values(moduleFiles);

console.log("Logging Image Modules", imageModules);

export const GalleryContainer = () => {


  const handleClick = (index: number) => {
    console.log("Logging index", index);

  };


  const imageRefs = useRef(new Map()).current;

  console.log("Logging imageRefs", imageRefs.get(0))

  if (imageRefs) {
    console.log(imageRefs);
  }

  return (
    <div className={styles.galleryContainer}>
      {imageModules.map((imageModule, index: number) => (
        <img
          key={index}
          ref={(el) => {
            if (el) {
              imageRefs.set(index, el);
            } else {
              imageRefs.delete(index);
            }
          }}
          onClick={() => handleClick(index)}
          src={imageModule.default}
          alt="Gallery item"
        />
      ))}
    </div>
  );
};
