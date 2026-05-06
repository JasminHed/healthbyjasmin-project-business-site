import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import HealthByJasmin from "./pages/HealthByJasmin";
import Yoga from "./pages/Yoga";
import Ayurveda from "./pages/Ayurveda";
import About from "./pages/About";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/healthbyjasmin" element={<HealthByJasmin />} />
        <Route path="/yoga" element={<Yoga />} />
        <Route path="/ayurveda" element={<Ayurveda />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
