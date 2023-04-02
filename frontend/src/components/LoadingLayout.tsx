import React, { Suspense } from "react";
import { useGlobalLoadingSpinner } from "../atoms/globalLoadingSpinner";
import FullPageSpinner from "./FullPageSpinner";

const LoadingLayout = ({ children }: { children: React.ReactNode }) => {
  const { isSpinnerVisible } = useGlobalLoadingSpinner();

  return (
    <Suspense fallback={<FullPageSpinner />}>
      <div>
        {isSpinnerVisible && <FullPageSpinner />}
        {children}
      </div>
    </Suspense>
  );
};

export default LoadingLayout;
