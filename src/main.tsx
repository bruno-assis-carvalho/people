import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { applyStoredCustomSkin } from "./app/customSkin"
import "./index.css"

try {
  const storedTheme = localStorage.getItem("nexus-theme")
  const storedSkin = localStorage.getItem("nexus-skin")
  document.documentElement.dataset.theme =
    storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
  document.documentElement.dataset.skin =
    storedSkin === "newmorphism" ||
    storedSkin === "liquid-glass" ||
    storedSkin === "neon-glass" ||
    storedSkin === "neon" ||
    storedSkin === "custom"
      ? storedSkin
      : "default"
  if (storedSkin === "custom") applyStoredCustomSkin()
} catch {
  document.documentElement.dataset.theme = "light"
  document.documentElement.dataset.skin = "default"
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
