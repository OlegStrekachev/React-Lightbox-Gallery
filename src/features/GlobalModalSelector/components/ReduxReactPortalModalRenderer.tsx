import { useSelector } from "react-redux";
import { ReactPortalInitiator } from "./ReactPortalInitiator";
import { LightboxModal } from "@/features/LightboxModal";

import { RootState } from "@/store/store";
import { useEffect } from "react";

export const ReduxReactPortalModalRenderer = () => {
  const modalState = useSelector(
    (state: RootState) => state.modals.currentModal
  ); // Declare modalState variable

  useEffect(() => {
    // Disable scrolling when the modal is open to avoid conflict with the zoom scroll feature
    if (modalState === "openLightboxGallery") {
      document.body.style.overflow = "hidden";
      // Re-enable scrolling when the modal is closed
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [modalState]);

  const renderModalContent = () => {
    switch (modalState) {
      case "openLightboxGallery":
        return <LightboxModal />;
      case null:
        return null;
      default:
        return null;
    }
  };

  // Conditional rendering of the Modal based on the modalState

  return (
    modalState && (
      <ReactPortalInitiator>{renderModalContent()}</ReactPortalInitiator>
    )
  );
};
