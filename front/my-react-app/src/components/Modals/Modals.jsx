import React, { useState } from "react";
import { useNavigateContext } from "../../pages/AuthenticationPage/AuthPage";
import { makeTransactionHandler } from "../../services/AccountUtils";
import { confirmationHandler } from "../../services/AuthUtils";
import { GenericForm } from "../forms/form";
import { GenericSubmitButton } from "../buttons/buttons";
import { Modal, Box, Typography } from "@mui/material";
import "../../styles.css";

/*****************************************************************************/

export function RegisterModal({
  openModel,
  setOpenModel,
  registerEmail,
  password,
}) {
  const [confirmationPassword, setConfirmationPassword] = useState("");
  const navigate = useNavigateContext();

  const confirmationHandlerDataObj = {
    method: "POST",
    confirmationPassword: confirmationPassword,
    registerEmail: registerEmail,
    password: password,
    navigate: navigate,
  };

  return (
    <Modal open={openModel}>
      <Box className="modal-layout">
        <Typography
          variant="h5"
          component="h2"
          sx={{
            textAlign: "center",
            mb: 4,
            color: "#333",
            fontWeight: "bold",
          }}
        >
          Enter Confirmation Code
        </Typography>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <GenericForm
            inputValue={confirmationPassword}
            inputName="confirmation password"
            setInputValue={setConfirmationPassword}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            mt: 4,
          }}
        >
          <GenericSubmitButton
            buttonText="Confirm Registration"
            buttonHandler={confirmationHandler}
            submissionDataObj={confirmationHandlerDataObj}
          />
          <GenericSubmitButton
            buttonText="Close"
            buttonHandler={setOpenModel}
            submissionDataObj={false}
          />
        </Box>
      </Box>
    </Modal>
  );
}

/*****************************************************************************/

export function MakeTransactionModal({
  openTransactionModal,
  setOpenTransactionModal,
  jwt,
  navigate,
  notifyAccountUpdate,
}) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState(0);

  const makeTransactionDataObj = {
    jwt: jwt,
    navigate: navigate,
    recipientEmail: recipientEmail,
    amount: amount,
    notifyAccountUpdate: notifyAccountUpdate,
  };

  return (
    <Modal
      open={openTransactionModal}
      onClose={null}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className="modal-layout">
        <Typography
          id="modal-modal-title"
          variant="h5"
          component="h2"
          sx={{
            textAlign: "center",
            mb: 4,
            color: "#333",
            fontWeight: "bold",
          }}
        >
          Enter Transaction Details
        </Typography>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            flex: 1,
          }}
        >
          <GenericForm
            inputValue={amount}
            inputName="amount"
            setInputValue={setAmount}
          />
          <GenericForm
            inputValue={recipientEmail}
            inputName="recipientEmail"
            setInputValue={setRecipientEmail}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            mt: 4,
          }}
        >
          <GenericSubmitButton
            buttonText="submit transaction"
            buttonHandler={makeTransactionHandler}
            submissionDataObj={makeTransactionDataObj}
          />
          <GenericSubmitButton
            buttonText="close"
            buttonHandler={setOpenTransactionModal}
            submissionDataObj={false}
          />
        </Box>
      </Box>
    </Modal>
  );
}
