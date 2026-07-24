import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Avboka from "./pages/Avboka";
import HealthByJasmin from "./pages/HealthByJasmin";

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
