import { useSelector, useDispatch } from "react-redux";
import { ReactPortalInitiator } from "./ReactPortalInitiator";
import { LightboxModal } from "@/features/LightboxModal";
import { closeModal } from "@/store/slices/modalSlice";
import { RootState } from "@/store/store";

export const ReduxReactPortalModalRenderer = () => {
  const modalState = useSelector(
    (state: RootState) => state.modals.currentModal
  ); // Declare modalState variable

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
