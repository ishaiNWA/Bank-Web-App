import { createContext, useContext } from "react";
import { Box } from "@mui/material";
import { Register } from "./RegisterSection";
import { Login } from "./LoginSection";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/headers/headers";
import "../../styles.css";

const NavigateContext = createContext();

export function AuthPage() {
  const navigate = useNavigate();

  return (
    <NavigateContext.Provider value={navigate}>
      <Box className="page-layout">
        <PageHeader title="Web Bank App" />
        <Box className="flex flex-row w-full">
          <Box className="w-1/2">
            <Login />
          </Box>

          <Box className="w-1/2">
            <Register />
          </Box>
        </Box>
      </Box>
    </NavigateContext.Provider>
  );
}

export const useNavigateContext = () => useContext(NavigateContext);
