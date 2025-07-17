import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "antd/dist/reset.css"; // <-- Required AntD styles
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <div>
    <App />
  </div>
);
