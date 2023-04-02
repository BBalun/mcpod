import React, { Suspense } from "react";
import { useGlobalLoadingSpinner } from "../atoms/globalLoadingSpinner";
import FullPageSpinner from "./FullPageSpinner";

const LoadingLayout = ({ children }: { children: React.ReactNode }) => {
  const { isSpinnerVisible } = useGlobalLoadingSpinner();

  return (
    <Suspense fallback={<FullPageSpinner />}>
      {isSpinnerVisible && <FullPageSpinner />}
      {children}
    </Suspense>
  );
};

export default LoadingLayout;
