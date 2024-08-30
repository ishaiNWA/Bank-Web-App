import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthPage } from "./pages/AuthenticationPage/AuthPage";
import { AccountPage } from "../src/pages/AccountPage/AccountPage";

export function App() {
  return (
    <>
      {/* This is the alias of BrowserRouter i.e. Router */}
      <Router>
        <Routes>
          {/* This route is for home component 
          with exact path "/", in component props 
          we passes the imported component*/}
          <Route path="/" element={<AuthPage />} />

          <Route path="/account" element={<AccountPage />} />

          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </Router>
    </>
  );
}
