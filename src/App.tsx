import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import BilibiliParser from "@/pages/BilibiliParser";

export default function App() {
  return (
    <Router basename="/jo">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tool/bilibili" element={<BilibiliParser />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}
