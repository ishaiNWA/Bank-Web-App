

import { GenericAuthForm } from "../../components/forms/form";
import { GenericSubmitButton } from "../../components/buttons/buttons";
import { useState } from "react";
import { useNavigateContext } from "../../pages/AuthenticationPage/AuthPage";
import { LoginHandler } from "../../services/AuthUtils";

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
import { ThemeProvider } from '@mui/material/styles';




export function Login() {

  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigateContext()
  const loginDataObj = {
    method: "POST",
    userEmail: loginEmail,
    password: password,
    navigate: navigate
  }

  return (

    <header>

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
            Login
          </Typography>


          <Box className="flex flex-col h-full" component="form"  noValidate sx={{ mt: 1 }}>

            <div id="auth section"  className="h-2/3">
              <ul className="flex flex-col gap-4 ">
                <li>
                  <GenericAuthForm
                    credential={loginEmail}
                    credentialName="Login Email"
                    setCredential={setLoginEmail}
                  />
                </li>

                <li>
                  <GenericAuthForm
                    credential={password}
                    credentialName="Login Password"
                    setCredential={setPassword}
                  />
                </li>
              </ul>

            </div>

            <div id="submit button section"  className="h-1/3">
              <GenericSubmitButton
                buttonText="Login"
                buttonHandler={LoginHandler}
                submissionDataObj={loginDataObj}
              />

            </div>

          </Box>
        </Box>

      </Container>

    </header>


  );
}