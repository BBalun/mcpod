import { useToast } from "@chakra-ui/react";
import { System } from "../types/systems";
import { trpc } from "../utils/trpc";

type UseFetchSystemsOptions = {
  suspense: boolean;
};

export function useFetchSystems(options?: UseFetchSystemsOptions) {
  const toast = useToast();
  const { data } = trpc.getSystems.useQuery(undefined, {
    onError(error) {
      console.error("Fetching of systems failed");
      console.error(error);
      toast({
        description: "Failed to fetch systems and filters",
        status: "error",
        position: "bottom-right",
      });
    },
    staleTime: Infinity,
    suspense: options?.suspense ?? true,
  });

  return data as System[];
}
