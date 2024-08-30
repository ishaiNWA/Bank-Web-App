import React, { useState } from "react";
import { GenericForm } from "../../components/forms/form";
import { GenericSubmitButton } from "../../components/buttons/buttons";
import { useNavigateContext } from "../../pages/AuthenticationPage/AuthPage";
import { loginHandler } from "../../services/AuthUtils";
import { Avatar, Box, Container, CssBaseline, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import "../../styles.css";

/*****************************************************************************/

export function Login() {
  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigateContext();
  const loginDataObj = {
    method: "POST",
    userEmail: loginEmail,
    password: password,
    navigate: navigate,
  };

  const formArray = [
    {
      inputValue: loginEmail,
      inputName: "Login Email",
      setInputValue: setLoginEmail,
    },
    {
      inputValue: password,
      inputName: "Login Password",
      setInputValue: setPassword,
    },
  ];

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box className="auth-inputs-layout">
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Login
        </Typography>

        <Box
          className="flex flex-col h-full"
          component="form"
          noValidate
          sx={{ mt: 1 }}
        >
          <Box id="auth section" className="h-2/3">
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

          <Box id="submit button section" className="h-1/3">
            <GenericSubmitButton
              buttonText="Login"
              buttonHandler={loginHandler}
              submissionDataObj={loginDataObj}
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
