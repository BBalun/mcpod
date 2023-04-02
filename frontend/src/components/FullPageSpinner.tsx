import { Spinner } from "@chakra-ui/react";

const FullPageSpinner = () => {
  return (
    <div className="fixed top-0 left-0 z-50 flex h-screen w-screen items-center justify-center bg-slate-300 bg-opacity-50">
      <Spinner size="xl" />
    </div>
  );
};

export default FullPageSpinner;
