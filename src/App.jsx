import { Routes, Route } from "react-router-dom";
import CheckoutPage from "./CheckoutPage";
import MyStrength from "./MyStrength";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CheckoutPage />} /> // ✅ 첫 시작 화면
      <Route path="/my-strength" element={<MyStrength />} />
    </Routes>
  );
}
