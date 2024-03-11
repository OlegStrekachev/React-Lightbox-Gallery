import { MainGallery } from "@/features/MainGallery";
import { ReduxReactPortalModalRenderer } from "@/features/GlobalModalSelector";

function App() {
  return (
    <>
      <ReduxReactPortalModalRenderer />
      <MainGallery />
    </>
  );
}

export default App;
