import { useEffect } from "react";

export const useWindowResizeListener = (
  handleOrientationChange: () => void
) => {
  const setViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight();
      handleOrientationChange(); // Call the passed function to handle orientation logic
    };

    handleResize(); // Initial call to set everything up
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleOrientationChange]);
};
