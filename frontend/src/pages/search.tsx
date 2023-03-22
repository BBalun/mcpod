import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "@chakra-ui/react";

const search = () => {
  const [input, setInput] = useState("");

  const navigate = useNavigate();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        navigate("/star/" + input);
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

      <Button type="submit">Search</Button>
    </form>
  );
};

export default search;
