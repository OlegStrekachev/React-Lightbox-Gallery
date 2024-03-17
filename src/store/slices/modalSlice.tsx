import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for the modal states.
type ModalType = "openLightboxGallery" | null;

// Define the state shape with types.
interface ModalState {
  currentModal: ModalType;
  initialIndex: number | null;
}

// Define the payload type for the openModal action.
interface OpenModalPayload {
  modalType: ModalType;
  initialIndex: number;
}

// Initial state typed according to ModalState interface
const initialState: ModalState = {
  currentModal: null,
  initialIndex: null,
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    // Use PayloadAction to type the action's payload.
    openModal(state, action: PayloadAction<OpenModalPayload>) {
      state.currentModal = action.payload.modalType;
      state.initialIndex = action.payload.initialIndex;
    },
    closeModal(state) {
      state.currentModal = null;
      state.initialIndex = null;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
