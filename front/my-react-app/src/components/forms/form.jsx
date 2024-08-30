import { Box } from "@mui/material";

export function GenericForm({ inputValue, inputName, setInputValue }) {
  const formHandler = (e, setFunction) => {
    setFunction(e.target.value);
  };

  return (
    <Box>
      <form>
        <input
          className="input"
          type="text"
          placeholder={inputName}
          value={inputValue}
          onChange={(e) => formHandler(e, setInputValue)}
        />
      </form>
    </Box>
  );
}
