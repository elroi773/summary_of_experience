import { Routes, Route } from "react-router-dom";
import CheckoutPage from "./Checkoutpage";
import MyStrength from "./MyStrength";
import AddExperience from "./AddExperience";
import Result from "./Result";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CheckoutPage />} /> // ✅ 첫 시작 화면
      <Route path="/my-strength" element={<MyStrength />} />
      <Route path="/addexperience" element={<AddExperience />} />
      <Route path="/result" element={<Result />} />
    </Routes>
  );
}
