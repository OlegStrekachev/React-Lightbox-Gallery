import { useEffect } from 'react';

const useCenterImageOnRelease = () => {
    useEffect(() => {
        if (shouldCenterImage && currentImageIndex !== null) {
          const closestImage = imageRefs.get(currentImageIndex);
          if (closestImage && galleryContainerRef.current) {
            scrollImageToCenter(closestImage);
            console.log(closestImage);
          }
          // Reset the shouldCenterImage state to false to prevent the useEffect from being triggered again
          setShouldCenterImage(false);
        }
        // Disable the exhaustive-deps rule for this useEffect since we want to trigger the useEffect only when the shouldCenterImage state changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [shouldCenterImage]);
    
}