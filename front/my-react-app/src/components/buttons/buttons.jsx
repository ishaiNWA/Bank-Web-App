import { Box, Select, MenuItem, TextField, Button } from "@mui/material";
import { useState } from "react";
import "../../styles.css";

/*****************************************************************************/

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

/*****************************************************************************/

export function MakeTransactionButton({ setOpenTransactionModal }) {
  return (
    <Button
      variant="contained"
      size="large"
      onClick={() => setOpenTransactionModal(true)}
      sx={{
        fontSize: "1.2rem",
        padding: "25px 35px",
        fontWeight: "bold",
        backgroundColor: "#3f51b5", // Indigo color
        color: "white",
        "&:hover": {
          backgroundColor: "#303f9f", // Darker shade of indigo on hover
        },
      }}
    >
      Make Transaction
    </Button>
  );
}

/*****************************************************************************/

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
    <Box
      id="transaction-limit-control"
      display="flex"
      alignItems="center"
      gap={2}
    >
      <Select
        value={selectedLimit}
        onChange={handleSelectedLimitChange}
        size="small"
        sx={{
          width: "120px",
          height: "40px",
        }}
      >
        <MenuItem value={10}>10</MenuItem>
        <MenuItem value={50}>50</MenuItem>
        <MenuItem value={100}>100</MenuItem>
        <MenuItem value="All">All</MenuItem>
      </Select>
      <Button
        variant="contained"
        onClick={setNewLimit}
        size="small"
        className="common-button"
      >
        Set Limit
      </Button>
    </Box>
  );
}

/*****************************************************************************/

export function TransactionTableOffsetButton({ setTransactionsOffset }) {
  const [enteredOffsetValue, setEnteredOffsetValue] = useState(0);
  const [error, setError] = useState(false);

  const handleOffsetChange = (event) => {
    const value = event.target.value;
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setEnteredOffsetValue(value);
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
      id="transaction-offset-control"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <TextField
        value={enteredOffsetValue}
        onChange={handleOffsetChange}
        error={error}
        helperText={error ? "Please enter a non-negative integer" : ""}
        type="number"
        size="small"
        inputProps={{ min: 0 }}
        sx={{
          width: "120px",
          "& .MuiInputBase-root": {
            height: "40px",
          },
        }}
      />
      <Button
        variant="contained"
        onClick={setNewOffset}
        size="small"
        disabled={enteredOffsetValue === "" || error}
        className="common-button"
      >
        Set Offset
      </Button>
    </Box>
  );
}
