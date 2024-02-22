import { useEffect } from "react";



// Custom hook to listen for window resize events and update the viewport height custom property

const setViewportHeight = (): void => {
    // Calculate the viewport height measurment unit at 1% of the viewport's actual height
    const vh = window.innerHeight * 0.01;

    // Set the value of the --vh custom property to the root element
    // setProperty(propertyName, value)
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };


export const useWindowResizeListener = (): void => {
    useEffect(() => {
        // Set the viewport height on initial load
        setViewportHeight();

        // Add event listener for window resize
        window.addEventListener("resize", setViewportHeight);

        // Clean up the event listener
        return () => window.removeEventListener("resize", setViewportHeight);
    }, []);
};
