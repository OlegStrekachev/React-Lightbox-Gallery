import ReactDOM from "react-dom";
import { ReactNode } from "react";

interface ReactPortalInitiatorProps {
  children: ReactNode;
}

export const ReactPortalInitiator = ({
  children,
}: ReactPortalInitiatorProps) => {
  const root = document.getElementById("modal-root")!; // Add '!' to assert that root is not null

  if (!root) {
    throw new Error("Modal Root element not found");
  }

  return ReactDOM.createPortal(children, root);
};
