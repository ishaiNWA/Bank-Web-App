//import { Button } from "@react-email/components";
import {
  Box,
  Select,
  MenuItem,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { useState } from "react";

export function GenericSubmitButton({
  buttonText,
  buttonHandler,
  submissionDataObj,
}) {
  return (
    <button
      className="submitButton"
      type="button"
      onClick={() => buttonHandler(submissionDataObj)}
    >
      {buttonText}
    </button>
  );
}

export function TransactionButton({
  buttonText,
  buttonHandler,
  submissionDataObj,
}) {
  return (
    <button
      className="submitButton"
      type="button"
      onClick={() => buttonHandler(submissionDataObj)}
    >
      {buttonText}
    </button>
  );
}

/*****************************************************************************/

export function TransactionTableLimitButton({ setTransactionLimit }) {
  const [selectedLimit, setSelectedLimit] = useState(10);
  const handleSelectedLimitChange = (event) => {
    setSelectedLimit(event.target.value);
  };

  const setNewLimit = () => {
    setTransactionLimit(selectedLimit);
  };

  return (
    <Box id="transaction-limit-control" display="flex">
      <Typography variant="body1" mr={1}>
        limit transactios to:
      </Typography>
      <Select value={selectedLimit} onChange={handleSelectedLimitChange}>
        <MenuItem value={10}>10</MenuItem>
        <MenuItem value={50}>50</MenuItem>
        <MenuItem value={100}>100</MenuItem>
        <MenuItem value={"All"}>"All"</MenuItem>
      </Select>
      <Button variant="contained" onClick={setNewLimit} size="small">
        Set limit
      </Button>
    </Box>
  );
}
/*****************************************************************************/

export function TransactionTableOffsetButton({ setTransactionsOffset }) {
  const [enteredOffsetValue, SetEnteredOffsetValue] = useState(0);
  const [error, setError] = useState(false);

  const handleOffsetChange = (event) => {
    const value = event.target.value;
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      SetEnteredOffsetValue(value);
      setError(false);
    } else {
      setError(true);
    }
  };

  const setNewOffset = () => {
    setTransactionsOffset(enteredOffsetValue);
  };

  return (
    <Box
      id="transaction-limit-control"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Typography variant="body1">Number of transactions to skip:</Typography>
      <TextField
        value={enteredOffsetValue}
        onChange={handleOffsetChange}
        error={error}
        helperText={error ? "Please enter a non-negative integer" : ""}
        type="number"
        size="small"
        inputProps={{ min: 0 }}
        sx={{ width: "100px" }}
      />
      <Button
        variant="contained"
        onClick={setNewOffset}
        size="small"
        disabled={enteredOffsetValue === "" || error}
      >
        Set
      </Button>
    </Box>
  );
}

//export function TransactionTableSelectButton()
