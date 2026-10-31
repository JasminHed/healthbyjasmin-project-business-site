import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import HealthByJasmin from "./pages/HealthByJasmin";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HealthByJasmin />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
