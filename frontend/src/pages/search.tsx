import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { trpc } from "../utils/trpc";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "@chakra-ui/react";

const search = () => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const { client } = trpc.useContext();
  const {
    isLoading,
    isError,
    mutateAsync: fetchHdNumber,
    error: mutationError,
  } = useMutation(["getStarHdNumber", input], client.getStarHdNumber.query);

  if (isError) {
    console.error(mutationError);
  }

  async function onSubmit() {
    const hdNumberRes = await fetchHdNumber(input);
    if (hdNumberRes.error) {
      setError(hdNumberRes.error.msg);
      return;
    }
    navigate("/star/" + hdNumberRes.data);
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label htmlFor="starId">Star identifier:</label>
      <Input
        type="text"
        name="starId"
        id="starId"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      {isError && <p className="text-red-500">Unexpected error ocurred</p>}

      <Button disabled={isLoading} type="submit">
        Search
      </Button>
    </form>
  );
};

export default search;
