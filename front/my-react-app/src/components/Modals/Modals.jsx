
import { makeTransactionHandler } from "../../services/AccountUtils";
import { useState } from "react";
import { useContext } from "react";
import { useNavigateContext } from "../../pages/AuthenticationPage/AuthPage";
import Modal from '@mui/material/Modal';
import { GenericAuthForm } from "../forms/form";
import { GenericSubmitButton } from "../buttons/buttons";
import { confirmationHandler } from "../../services/AuthUtils"
import Box from '@mui/material/Box';
import { Button } from '@mui/material';

import { Typography } from '@mui/material';
import { GenericForm } from "../forms/form";

export function RegisterModal({ openModel, setOpenModel, registerEmail, password }) {

  const [confirmationPassword, setConfirmationPassword] = useState("");
  const navigate = useNavigateContext();


  const confirmationHandlerDataObj = {
    method: "POST",
    confirmationPassword: confirmationPassword,
    registerEmail: registerEmail,
    password: password,
    navigate: navigate
  };

  console.log("Data1:");
  console.log(confirmationHandlerDataObj);

  return (

    <Modal open={openModel}>
      <div>
        <GenericAuthForm
          credential={confirmationPassword}
          credentialName="confirmation password"
          setCredential={setConfirmationPassword}
        />

        <GenericSubmitButton
          buttonText="confirm registration"
          buttonHandler={confirmationHandler}
          submissionDataObj={confirmationHandlerDataObj}
        />
        <GenericSubmitButton
          buttonText="close"
          buttonHandler={setOpenModel}
          submissionDataObj={false}
        />

      </div>

    </Modal>
  );

}


export function MakeTransactionModal({ openTransactionModal, setOpenTransactionModal, jwt , navigate ,notifyAccountUpdate}) {

  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState(0);


  const makeTransactionDataObj={
    jwt: jwt,
    navigate: navigate,
    recipientEmail : recipientEmail,
    amount : amount,
    notifyAccountUpdate : notifyAccountUpdate
  };

  return (
    <Modal
      open={openTransactionModal}
      onClose={null}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box >
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
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

        </Typography>
      </Box>
    </Modal>
  );
}