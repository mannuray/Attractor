import "./App.css";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeContext";

import NoPage from "./view/pages/NoPage";
import Home from "./view/pages/Home";
import Info from "./view/pages/Info";

export default function App(props) {
  return (
    <ThemeProvider>
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<Info />} path="/info" />
        <Route element={<NoPage />} path="*" />
      </Routes>
    </ThemeProvider>
  );
}
