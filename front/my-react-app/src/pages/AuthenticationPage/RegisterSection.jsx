import React, { useState } from "react";
import { Avatar, Box, Container, CssBaseline, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { registerHandler } from "../../services/AuthUtils";
import { GenericForm } from "../../components/forms/form";
import { GenericSubmitButton } from "../../components/buttons/buttons";
import { RegisterModal } from "../../components/Modals/Modals";
import "../../styles.css";
/*****************************************************************************/

export function Register() {
  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [openModel, setOpenModel] = useState(false);

  const formArray = [
    {
      inputValue: name,
      inputName: "name",
      setInputValue: setName,
    },
    {
      inputValue: registerEmail,
      inputName: "registerEmail",
      setInputValue: setRegisterEmail,
    },
    {
      inputValue: password,
      inputName: "RegisterPasswordForm",
      setInputValue: setPassword,
    },
    {
      inputValue: passwordConfirmation,
      inputName: "passwordConfirmation",
      setInputValue: setPasswordConfirmation,
    },
  ];

  const registerCredentials = {
    name: name,
    email: registerEmail,
    password: password,
    passwordConfirmation: passwordConfirmation,
  };

  const registerDataObj = {
    method: "POST",
    registerCredentials: registerCredentials,
    setOpenModel: setOpenModel,
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box className="auth-inputs-layout">
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Register
        </Typography>

        <Box
          className="flex flex-col h-full"
          component="form"
          noValidate
          sx={{ mt: 1 }}
        >
          <Box id="registerCredentials">
            <ul className="flex flex-col gap-4 ">
              {formArray.map((formElement, index) => (
                <li key={index}>
                  <GenericForm
                    inputValue={formElement.inputValue}
                    inputName={formElement.inputName}
                    setInputValue={formElement.setInputValue}
                  />
                </li>
              ))}
            </ul>
          </Box>

          <Box id="submitRegister">
            <GenericSubmitButton
              buttonText="sign up"
              buttonHandler={registerHandler}
              submissionDataObj={registerDataObj}
            />
          </Box>

          <RegisterModal
            openModel={openModel}
            setOpenModel={setOpenModel}
            registerEmail={registerEmail}
            password={password}
          />
        </Box>
      </Box>
    </Container>
  );
}
