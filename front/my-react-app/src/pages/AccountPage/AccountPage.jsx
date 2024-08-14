import React, { useState, useEffect, useContext, createContext } from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { TransactionsTable } from "../../components/tables/TransactionsTable";
import {
  getTransactionsHandler,
  getBalanceHandler,
  logOutHandler,
  DEAFULT_TRANSACTIONS_LIMIT,
} from "../../services/AccountUtils";
import { useNavigate } from "react-router";
import { Button } from "@mui/material";
import { MakeTransactionModal } from "../../components/Modals/Modals";
import { GenericSubmitButton } from "../../components/buttons/buttons";

//export const accountUpdateContext = createContext();

export function AccountPage(name, jwt) {
  jwt =
    "BearereyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImF2aUBnbWFpbC5jb20iLCJpYXQiOjE3MjIzNDAwOTEsImV4cCI6MTcyMjM0MzY5MX0.L_8Ro6tHPcA411V8NMx2inaLqHBTmfeflBZKBMXsC5k";

  const navigate = useNavigate();

  const [currentBalance, setCurrentBalance] = useState(0);

  const [transactionsArray, setTransactionsArray] = useState([]);

  const [openTransactionModal, setOpenTransactionModal] = useState(false);

  const [accountUpdate, setAccountUpdate] = useState(false);

  const notifyAccountUpdate = () => {
    console.log("notifyAccountUpdate!!!");
    setAccountUpdate((prev) => !prev);
  };

  const getOperationsDataObj = {
    jwt: jwt,
    navigate,
    limit: DEAFULT_TRANSACTIONS_LIMIT,
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      const res = await getTransactionsHandler(getOperationsDataObj);
      console.log(res);
      if (res.status === 200) {
        setTransactionsArray(res.data.transactions);
        console.log(transactionsArray);
      }
    };

    const fetchBalance = async () => {
      const res = await getBalanceHandler(getOperationsDataObj);
      console.log("balance is: ");
      console.log(res.data.balance);
      setCurrentBalance(res.data.balance);
    };

    fetchTransactions();
    fetchBalance();
  }, [accountUpdate]);

  return (
    //  <accountUpdateContext.Provider value={notifyAccountUpdate}>
    <div className="h-full">
      <h1> AccountPage </h1>
      <div id="upper_section" className="flex justify-between w-10/12 h-3/6">
        <div id="current_balance" className="flex justify-start w-1/3 mr-4">
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
        </div>

        <div id="make_transaction" className="flex justify-end w-1/3 ml-10">
          <p>make transaction</p>

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
        </div>
      </div>

      <div id="mid_section" className="flex justify-end h-3/6">
        <TransactionsTable transactionsArray={transactionsArray} />
      </div>

      <div id="lower_section">
        <GenericSubmitButton
          buttonText="Logout"
          buttonHandler={logOutHandler}
          submissionDataObj={getOperationsDataObj}
        />
      </div>
    </div>

    //  </accountUpdateContext.Provider>
  );
}

//export const useUpdateAccountContext= ()=>useContext(accountUpdateContext);
