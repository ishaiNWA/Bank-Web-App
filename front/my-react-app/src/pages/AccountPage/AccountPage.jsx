import React, { useState, useEffect } from "react";
import { Typography, Box } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { TransactionsTable } from "../../components/tables/TransactionsTable";
import { MakeTransactionModal } from "../../components/Modals/Modals";
import {
  GenericSubmitButton,
  MakeTransactionButton,
  TransactionTableLimitButton,
  TransactionTableOffsetButton,
} from "../../components/buttons/buttons";
import { PageHeader } from "../../components/headers/headers";
import {
  getBalance,
  getTransactions,
  logOutHandler,
  DEFAULT_TRANSACTIONS_LIMIT,
  DEFAULT_TRANSACTIONS_OFFSET,
} from "../../services/AccountUtils";
import "../../styles.css";

/*****************************************************************************/

export function AccountPage() {
  const location = useLocation();

  const { name, jwt } = location.state;

  const navigate = useNavigate();

  const [currentBalance, setCurrentBalance] = useState(0);

  const [transactionsArray, setTransactionsArray] = useState([]);

  const [openTransactionModal, setOpenTransactionModal] = useState(false);

  const [accountUpdate, setAccountUpdate] = useState(false);
  const [transactionLimit, setTransactionLimit] = useState(
    DEFAULT_TRANSACTIONS_LIMIT
  );
  const [transactionOffset, setTransactionsOffset] = useState(
    DEFAULT_TRANSACTIONS_OFFSET
  );

  const notifyAccountUpdate = () => {
    setAccountUpdate((prev) => !prev);
  };

  const getOperationsDataObj = {
    jwt,
    navigate,
    limit: transactionLimit,
    offset: transactionOffset,
  };

  const updateTransactionTable = async () => {
    const res = await getTransactions(getOperationsDataObj);

    if (res.status === 200) {
      setTransactionsArray(res.data.transactions);
    }
  };

  const updateCurrentBalance = async () => {
    const res = await getBalance(getOperationsDataObj);
    if (200 === res.status) {
      setCurrentBalance(res.data.balance);
    }
  };

  useEffect(() => {
    updateTransactionTable(getOperationsDataObj, setTransactionsArray);
  }, [transactionLimit, transactionOffset]);

  useEffect(() => {
    updateTransactionTable(getOperationsDataObj, setTransactionsArray);
    updateCurrentBalance(getOperationsDataObj, setCurrentBalance);
  }, [accountUpdate]);

  return (
    <Box id="account_page" className="page-layout">
      <PageHeader title={`Hello ${name}`} />
      <Box id="upper_section" className="account-page-upper-section">
        <Box id="current_balance" className="current-balance">
          <Typography variant="h5" fontWeight="bold">
            Current Balance
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            ${currentBalance}
          </Typography>
        </Box>

        <Box
          id="make_transaction"
          sx={{
            padding: 2,
            borderRadius: 2,
          }}
        >
          <MakeTransactionButton
            setOpenTransactionModal={setOpenTransactionModal}
          />

          <MakeTransactionModal
            openTransactionModal={openTransactionModal}
            setOpenTransactionModal={setOpenTransactionModal}
            jwt={jwt}
            navigate={navigate}
            notifyAccountUpdate={notifyAccountUpdate}
          />
        </Box>
      </Box>

      <Box id="lower_section" className="account-page-lower-section">
        <Box id="table-select-buttons" className="table-select-buttons-layout">
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
