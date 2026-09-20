import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./app.css";
import "./styles/labs.css";
import App from "./app.js";
import { DomainProvider } from "./lib/domain-context.js";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DomainProvider>
      <App />
    </DomainProvider>
  </StrictMode>,
);
