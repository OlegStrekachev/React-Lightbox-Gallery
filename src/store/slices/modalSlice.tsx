import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentModal: null,
  initialIndex: null,
};
export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal(state, action) {
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
