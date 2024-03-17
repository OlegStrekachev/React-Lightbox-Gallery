import styles from "./MainGallery.module.css";
import { useDispatch } from "react-redux";
import { openModal } from "@/store/slices/modalSlice";

type ImageModule = {
  default: string;
};

const moduleFiles = import.meta.glob("../assets/*.jpg", {
  eager: true,
}) as Record<string, ImageModule>;

const imageModules: ImageModule[] = Object.values(moduleFiles);

console.log(imageModules);

export const MainGallery = () => {
  const dispatch = useDispatch();
  const handleClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const target = event.target as HTMLImageElement;
    const initialIndex = parseInt(target.dataset.index || "0");
    console.log(target.dataset.index);
    dispatch(
      openModal({
        modalType: "openLightboxGallery",
        initialIndex: initialIndex,
      })
    );
  };
  return (
    <div className={styles.gridContainer}>
      <div className={styles.galleryGrid}>
        {imageModules.map((imageModule, index) => (
          <img
            key={index}
            onClick={handleClick}
            src={imageModule.default}
            alt={`Image ${index}`}
            data-index={index}
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
};
