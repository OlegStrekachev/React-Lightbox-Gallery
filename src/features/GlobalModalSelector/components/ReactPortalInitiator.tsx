import ReactDOM from "react-dom";
import { ReactNode } from "react";

interface ReactPortalInitiatorProps {
  children: ReactNode;
}

// This component is used to create a portal to the modal-root element in the index.html file
export const ReactPortalInitiator = ({
  children,
}: ReactPortalInitiatorProps) => {
  const root = document.getElementById("modal-root")!; // Add '!' to assert that root is not null

  if (!root) {
    throw new Error("Modal Root element not found");
  }

  return ReactDOM.createPortal(children, root);
};
