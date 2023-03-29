import React from "react";
import { Spinner } from "@chakra-ui/react";
import { useGlobalLoadingSpinner } from "../atoms/globalLoadingSpinner";

const LoadingLayout = ({ children }: { children: React.ReactNode }) => {
  const { isSpinnerVisible } = useGlobalLoadingSpinner();

  return (
    <div>
      {isSpinnerVisible && (
        <div className="fixed top-0 left-0 z-50 flex h-screen w-screen items-center justify-center bg-slate-300 bg-opacity-50">
          <Spinner size="xl" />
        </div>
      )}
      {children}
    </div>
  );
};

export default LoadingLayout;
