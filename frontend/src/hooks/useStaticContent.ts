import { useToast } from "@chakra-ui/toast";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

/**
 * Hook that fetches static HTML from the server
 * @param name Name of the file without .html extension
 * @returns HTML string
 */
export function useStaticContent(name: string) {
  const toast = useToast();
  const navigate = useNavigate();

  const { data } = useQuery(
    [`${name}-content`],
    () => fetch(`/${name}.html`).then((res) => res.text()),
    {
      onError(err) {
        console.error("Failed to load content of this page");
        console.error(err);
        toast({
          description: "Failed to load content of this page",
          status: "error",
          position: "bottom-right",
        });
        navigate("/error-page");
      },
      suspense: true,
    }
  );

  return data;
}
