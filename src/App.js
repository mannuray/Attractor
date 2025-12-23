import "./App.css";
import { Routes, Route } from "react-router-dom";

import NoPage from "./view/pages/NoPage";
import Home from "./view/pages/Home";

export default function App(props) {
  return (
    <Routes>
      <Route element={<Home />} path="/" />
      <Route element={<NoPage />} path="*" />
    </Routes>
  );
}
