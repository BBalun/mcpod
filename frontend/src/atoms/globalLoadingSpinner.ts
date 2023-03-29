import { atom } from "jotai";
import { useAtom } from "jotai/react";

const globalSpinnerAtom = atom(false);

export function useGlobalLoadingSpinner() {
  const [isSpinnerVisible, setSpinnerVisibility] = useAtom(globalSpinnerAtom);
  return { isSpinnerVisible, setSpinnerVisibility };
}
