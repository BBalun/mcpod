import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, useToast } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "../utils/trpc";
import { useGlobalLoadingSpinner } from "../atoms/globalLoadingSpinner";

const Search = () => {
  const [input, setInput] = useState("");
  const { setSpinnerVisibility } = useGlobalLoadingSpinner();

  const navigate = useNavigate();
  const toast = useToast();

  const { client } = trpc.useContext();
  const { mutateAsync } = useMutation(["search", input], client.search.query, {
    onError(e) {
      console.error(e);
      toast({
        description: "Something went wrong",
        status: "error",
        position: "bottom-right",
      });
    },
  });

  return (
    <form
      className="flex flex-row gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setSpinnerVisibility(true);
        const searchRes = await mutateAsync(input).finally(() =>
          setSpinnerVisibility(false)
        );
        if (!searchRes) {
          // setError(`Start '${input}' not found`);
          console.warn(`Start '${input}' not found`);
          toast({
            description: `Start '${input}' not found`,
            status: "info",
            position: "bottom-right",
          });
          return;
        }
        navigate("/star/" + searchRes.oid);
      }}
    >
      <Input
        type="text"
        name="starId"
        id="starId"
        aria-label="star identifier"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter Star Identifier (e.g. HD 2453)"
        className="bg-transparent text-white"
        rounded="full"
        required
      />
      {/* {error && <p className="text-red-500">{error}</p>} */}

      {/* <Button type="submit">Search</Button> */}
    </form>
  );
};

export default Search;
