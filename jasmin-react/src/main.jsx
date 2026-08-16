import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";

import HealthByJasmin from "./pages/HealthByJasmin";
import Avboka from "./pages/Avboka";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HealthByJasmin />} />
        <Route path="/avboka" element={<Avboka />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
