import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "../utils/trpc";

const search = () => {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string>();

  const navigate = useNavigate();

  const { client } = trpc.useContext();
  const { mutateAsync } = useMutation(["search", input], client.search.query);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const searchRes = await mutateAsync(input);
        if (!searchRes) {
          setError(`Start '${input}' not found`);
          return;
        }
        navigate("/star/" + searchRes.oid);
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

      <Button type="submit">Search</Button>
    </form>
  );
};

export default search;
