import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css'
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="780757491223-4etgert52ti9t799dcvnv2qm9610tbte.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);