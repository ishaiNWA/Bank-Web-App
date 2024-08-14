

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';


import { registerHandler } from "../../services/AuthUtils";
import { GenericAuthForm } from "../../components/forms/form";
import { GenericSubmitButton } from "../../components/buttons/buttons";
import { REGISTER_URL } from "../../services/ApiUtils";
import { LoginHandler } from "../../services/AuthUtils";
import { useState } from "react";
import { RegisterModal } from "../../components/Modals/Modals";

export function Register() {

  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [openModel, setOpenModel] = useState(false);


  const registerCredentials = {
    name: name,
    email: registerEmail,
    password: password,
    passwordConfirmation: passwordConfirmation
  }

  const registerDataObj = {
    method: "POST",
    registerCredentials: registerCredentials,
    setOpenModel: setOpenModel
  };

  return (
    <header >

      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Register
          </Typography>

          <Box className="flex flex-col h-full" component="form" noValidate sx={{ mt: 1 }}>
            <div id="registerCredentials">

              <ul className="flex flex-col gap-4 ">
                <li>
                  <GenericAuthForm
                    credential={name}
                    credentialName="name"
                    setCredential={setName}
                  />
                </li>
                <li>
                  <GenericAuthForm
                    credential={registerEmail}
                    credentialName="registerEmail"
                    setCredential={setRegisterEmail}
                  />
                </li>
                <li>
                  <GenericAuthForm
                    credential={password}
                    credentialName="RegisterPasswordForm"
                    setCredential={setPassword}
                  />
                </li>
                <li>
                  <GenericAuthForm
                    credential={passwordConfirmation}
                    credentialName="passwordConfirmation"
                    setCredential={setPasswordConfirmation}
                  />
                </li>
              </ul>



            </div>

            <div id="submitRegister">

              <GenericSubmitButton
                buttonText="sign up"
                buttonHandler={registerHandler}
                submissionDataObj={registerDataObj}
              />

            </div>

            <RegisterModal
              openModel={openModel}
              setOpenModel={setOpenModel}
              registerEmail={registerEmail}
              password={password}

            />

          </Box>
        </Box>
      </Container>
    </header>
  );
}