import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {createBrowserRouter} from "react-router-dom";
import App from "./App";
import { routes } from "./router";
import "./index.css";

const stored = localStorage.getItem("titops-theme");
if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
  document.documentElement.classList.add("dark");
}

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App router={router} />
  </StrictMode>
);
