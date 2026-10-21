import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

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

import { ToastProvider } from "./components/ToastProvied.tsx";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
