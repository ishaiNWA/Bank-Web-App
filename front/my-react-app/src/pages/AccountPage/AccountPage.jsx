import React, { useState, useEffect, useContext, createContext } from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { TransactionsTable } from "../../components/tables/TransactionsTable";
import {
  logOutHandler,
  fetchTransactions,
  fetchBalance,
  DEAFULT_TRANSACTIONS_LIMIT,
  DEAFULT_TRANSACTIONS_OFFSET,
} from "../../services/AccountUtils";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@mui/material";
import { MakeTransactionModal } from "../../components/Modals/Modals";
import {
  GenericSubmitButton,
  TransactionTableLimitButton,
  TransactionTableOffsetButton,
} from "../../components/buttons/buttons";
import Toolbar from "@mui/material/Toolbar";

//export const accountUpdateContext = createContext();

export function AccountPage() {
  const location = useLocation();

  const { name, jwt } = location.state;

  const navigate = useNavigate();

  const [currentBalance, setCurrentBalance] = useState(0);

  const [transactionsArray, setTransactionsArray] = useState([]);

  const [openTransactionModal, setOpenTransactionModal] = useState(false);

  const [accountUpdate, setAccountUpdate] = useState(false);
  const [transactionLimit, setTransactionLimit] = useState(
    DEAFULT_TRANSACTIONS_LIMIT
  );
  const [transactionOffset, setTransactionsOffset] = useState(
    DEAFULT_TRANSACTIONS_OFFSET
  );

  const notifyAccountUpdate = () => {
    console.log("notifyAccountUpdate!!!");
    setAccountUpdate((prev) => !prev);
  };

  const getOperationsDataObj = {
    jwt: jwt,
    navigate,
    limit: transactionLimit,
    offset: transactionOffset,
  };

  useEffect(() => {
    fetchTransactions(getOperationsDataObj, setTransactionsArray);
  }, [transactionLimit, transactionOffset]);

  useEffect(() => {
    fetchTransactions(getOperationsDataObj, setTransactionsArray);
    fetchBalance(getOperationsDataObj, setCurrentBalance);
  }, [accountUpdate]);

  return (
    <Box
      id="account_page"
      className="h-full"
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%", // Ensure the box takes full height of its container
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "center" }}>
        <Typography variant="h6" noWrap component="div">
          {`Hello ${name}`}
        </Typography>
      </Toolbar>
      <Box
        id="upper_section"
        className="flex justify-between w-10/12 h-3/6"
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "40%", // Ensure the box takes full height of its container
        }}
      >
        <Box id="current_balance" className="flex justify-start w-1/3 mr-4">
          <Box
            sx={{
              padding: 3, // Adjust padding as needed
              border: "2px solid blue", // Custom border
              backgroundColor: "lightgray", // Background color
              color: "black", // Text color
              borderRadius: 4, // Rounded corners
              display: "inline-block",
            }}
          >
            <Typography variant="h6">
              current balance is {currentBalance}
            </Typography>
          </Box>
        </Box>

        <Box id="make_transaction" className="flex justify-end w-1/3 ml-10">
          <Button
            onClick={() => {
              setOpenTransactionModal(true);
            }}
          >
            make transaction
          </Button>

          <MakeTransactionModal
            openTransactionModal={openTransactionModal}
            setOpenTransactionModal={setOpenTransactionModal}
            jwt={jwt}
            navigate={navigate}
            notifyAccountUpdate={notifyAccountUpdate}
          ></MakeTransactionModal>
        </Box>
      </Box>
      <Box
        id=" lower section"
        sx={{
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: "60%", // Bottom row takes 60% of the height
        }}
      >
        <Box
          id="table-select-buttons"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start , space-around",
            gap: 2, // Adds space between items
            height: "50%", // Take full height of parent
            padding: 2, // Adds padding around all items
          }}
        >
          <TransactionTableLimitButton
            setTransactionLimit={setTransactionLimit}
          />
          <TransactionTableOffsetButton
            setTransactionsOffset={setTransactionsOffset}
          />
        </Box>
        <Box id="transactions_table" className="flex justify-end h-3/6">
          <TransactionsTable transactionsArray={transactionsArray} />
        </Box>

        <Box id="logout_button">
          <GenericSubmitButton
            buttonText="Logout"
            buttonHandler={logOutHandler}
            submissionDataObj={getOperationsDataObj}
          />
        </Box>
      </Box>
    </Box>
  );
}
