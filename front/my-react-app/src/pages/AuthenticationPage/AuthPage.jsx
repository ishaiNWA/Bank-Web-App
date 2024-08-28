// <import { formControlClasses } from "@mui/material">
import { Register } from "./RegisterSection";
import { Login } from "./LoginSection";
import { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";

const NavigateContext = createContext();

export function AuthPage() {
  const navigate = useNavigate();

  return (
    <NavigateContext.Provider value={navigate}>
      <h1>Authentication page </h1>

      <div className="flex flex-row w-full">
        <div className="w-4/12">
          <Login />
        </div>

        <div className="w-8/12">
          <Register />
        </div>
      </div>
    </NavigateContext.Provider>
  );
}

export const useNavigateContext = () => useContext(NavigateContext);
