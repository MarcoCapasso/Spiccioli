import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import "@fontsource-variable/google-sans/wght.css";
import "@fontsource-variable/inter";

import "./styles/tokens.css";
import "./styles/themes.css";
import "./styles/base.css";
import "./styles/typography.css";
import "./styles/layout.css";
import "./styles/button.css";
import "./styles/icon-button.css";
import "./styles/badge.css";
import "./styles/card.css";
import "./styles/input.css";
import "./styles/field.css";
import "./styles/amount-input.css";
import "./styles/type-toggle.css";
import "./styles/modal.css";
import "./styles/toast.css";
import "./styles/states.css";
import "./styles/brand.css";
import "./styles/coin-deco.css";
import "./styles/auth.css";
import "./styles/alert.css";
import "./styles/google-button.css";
import "./styles/app-layout.css";
import "./styles/topbar.css";
import "./styles/fab.css";


import { ToastProvider } from "./components/ToastProvider";
import { AuthProvider } from "./auth/AuthProvider";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
);
