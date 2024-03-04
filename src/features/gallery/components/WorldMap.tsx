// import Image from "../assets/world_map.png";
// import styles from "./WorldMap.module.css";
// import RedDot from "../assets/reddot.png";
// import CenterIcon from "../assets/center-icon.svg";
// import { useState, useRef } from "react";

// export const WorldMap = () => {
//   const wrapperRef = useRef<HTMLDivElement>(null);

//   const imageContainerRef = useRef<HTMLDivElement>(null);
//   const redDotRef = useRef<HTMLImageElement>(null);
//   const mainImageRef = useRef<HTMLImageElement>(null);

//   const [zoomLevel, setZoomLevel] = useState(1);

//   // Lift state up that record current transform coordinates of the container so all handlers
//   // can refer to it and manintaing the state of the container

//   const [pointerWasDown, setPointerWasDown] = useState(false);
//   const [initialX, setInitialX] = useState(0);
//   const [initialY, setInitialY] = useState(0);

//   const [currentTransformStart, setCurrentTransformStart] = useState([0, 0]);

//   const onCenterClickHandler = () => {
//     if (imageContainerRef.current && wrapperRef.current) {
//       imageContainerRef.current.style.transform = `translate(0px, 0px ) scale(1)`;
//       mainImageRef.current.style.transform = `scale(1)`;
//       setZoomLevel(1);
//     }
//   };

//   const onPointerDownHandler = (
//     event: React.PointerEvent<HTMLImageElement>
//   ) => {
//     event.preventDefault();
//     if (imageContainerRef.current) {
//       const initialXValue = event.clientX;
//       const initialYValue = event.clientY;

//       const currentTranslateX = +window
//         .getComputedStyle(imageContainerRef.current)
//         .transform.split(",")[4];
//       const currentTranslateY = +window
//         .getComputedStyle(imageContainerRef.current)
//         .transform.split(",")[5]
//         .split(")")[0];

//       console.log(currentTranslateY, "currentTranslareY");

//       setCurrentTransformStart([currentTranslateX, currentTranslateY]);
//       console.log(currentTransformStart, "currentTransformStart");

//       setInitialX(initialXValue);
//       setInitialY(initialYValue);
//       setPointerWasDown(true);
//     }
//   };

//   const onPointerMoveHandler = (
//     event: React.PointerEvent<HTMLImageElement>
//   ) => {
//     console.log("onPointerMoveHandler");
//     const dot = redDotRef.current;
//     const container = wrapperRef.current;
//     const dotRect = dot?.getBoundingClientRect();
//     const containerRect = container?.getBoundingClientRect();

//     // Keep rect values for more precise calculations in case there are hidden margins or dynamically set
//     // element width and height
//     const x = event.clientX - containerRect!.left;
//     const y = event.clientY - containerRect!.top;

//     // console.log(x, y);

//     const centerXoffset = dotRect!.width / 2;
//     const centerYoffset = dotRect!.height / 2;

//     dot.style.transform = `translate(${x - centerXoffset}px, ${
//       y - centerYoffset
//     }px)`;

//     // if (dot) {
//     //   const currentDotCoordinates = getComputedStyle(dot).transform;
//     //   console.log(currentDotCoordinates, "currentDotCoordinates");
//     //   // Use the 'currentDotCoordinates' variable here if needed
//     // }
//     //////////////////////////////////////////////////////////////////////////

//     if (pointerWasDown && imageContainerRef.current) {
//       const movementDistanceX = event.clientX - initialX;
//       const movementDistanceY = event.clientY - initialY;

//       console.log(
//         movementDistanceX,
//         "movementDistanceX",
//         movementDistanceY,
//         "movementDistanceY"
//       );
//       imageContainerRef.current.style.transform = `translate(${
//         currentTransformStart[0] + movementDistanceX
//       }px, ${
//         currentTransformStart[1] + movementDistanceY
//       }px) scale(${zoomLevel})`;
//     }
//   };

//   const onPointerUpHandler = (event: React.PointerEvent<HTMLImageElement>) => {
//     event.preventDefault();
//     console.log("POINTER WAS LIFTED UP!");
//     setPointerWasDown(false);
//   };

//   const onPointerLeaveHandler = (
//     event: React.PointerEvent<HTMLImageElement>
//   ) => {
//     event.preventDefault();
//     console.log("POINTER LEFT THE AREA!");
//     setPointerWasDown(false);
//   };

//   const onWheelHandler = (event: React.WheelEvent<HTMLImageElement>) => {
//     event.preventDefault();

//     // retrieving current rect values before the zoom
//     setZoomLevel((prev) => {
//       const zoomSpeed = 0.2;
//       const direction = event.deltaY < 0 ? 1 : -1; // Determine zoom in or out based on scroll direction
//       const newZoomValue =
//         direction > 0 ? prev * (1 + zoomSpeed) : prev / (1 + zoomSpeed);

//       const minZoom = 0.3;
//       const maxZoom = 4;
//       const newLimitedZoomValue = Math.min(
//         Math.max(minZoom, newZoomValue),
//         maxZoom
//       );

//       console.log(newLimitedZoomValue, "newLimitedZoomValue");

//       if (
//         mainImageRef.current &&
//         wrapperRef.current &&
//         imageContainerRef.current
//       ) {
//         const imageRect = imageContainerRef.current.getBoundingClientRect();

//         // Calculating coordinates of the point under the mouse cursor relative to the image
//         const mouseXRelativeToImage = event.clientX - imageRect.left;
//         const mouseYRelativeToImage = event.clientY - imageRect.top;

//         console.log(
//           mouseXRelativeToImage,
//           "mouseXRelativeToImage",
//           mouseYRelativeToImage,
//           "mouseYRelativeToImage"
//         );

//         const scalingFactor = newLimitedZoomValue / prev;

//         console.log(scalingFactor, "scalingFactor");

//         const deltaX =
//           mouseXRelativeToImage * scalingFactor - mouseXRelativeToImage;
//         const deltaY =
//           mouseYRelativeToImage * scalingFactor - mouseYRelativeToImage;

//         console.log(deltaX, "deltaX");

//         const currentTranslateX = +window
//           .getComputedStyle(imageContainerRef.current)
//           .transform.split(",")[4];
//         const currentTranslateY = +window
//           .getComputedStyle(imageContainerRef.current)
//           .transform.split(",")[5]
//           .split(")")[0];

//         console.log(
//           currentTranslateX,
//           "currentTranslateX",
//           currentTranslateY,
//           "currentTranslateY"
//         );

//         imageContainerRef.current.style.transform = `translate(${
//           currentTranslateX - deltaX
//         }px, ${currentTranslateY - deltaY}px) scale(${newLimitedZoomValue})`;

//         // there need to be an additional tranlsation to keep the zoom centered. Maybe using useEffect and a state to keep track of the current zoom level and then calculate the new translation based on the new zoom level and the current mouse position
//       }

//       return newLimitedZoomValue;
//     });
//   };

//   return (
//     <div
//       className={styles.wrapper}
//       ref={wrapperRef}
//       onPointerDown={onPointerDownHandler}
//       onPointerMove={onPointerMoveHandler}
//       onPointerUp={onPointerUpHandler}
//       onPointerLeave={onPointerLeaveHandler}
//       onWheel={onWheelHandler}
//     >
//       <img
//         src={RedDot}
//         alt="RedDot"
//         className={styles.redDot}
//         ref={redDotRef}
//       />
//       <button
//         className={styles.buttonCenteringImage}
//         onClick={onCenterClickHandler}
//       >
//         <img src={CenterIcon} alt="CenterIcon" />
//         <h4>Center Image</h4>
//       </button>
//       <div className={styles.imageContainer} ref={imageContainerRef}>
//         <img
//           src={Image}
//           ref={mainImageRef}
//           className={styles.mainImage}
//           alt="WorldMap"
//         />
//       </div>
//     </div>
//   );
// };
