import "./App.css";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeContext";
import { Analytics } from '@vercel/analytics/react';

import NoPage from "./view/pages/NoPage";
import Home from "./view/pages/Home";
import Info from "./view/pages/Info";
import SystemPage from "./view/pages/SystemPage";

export default function App(props) {
  return (
    <ThemeProvider>
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<Info />} path="/info" />
        <Route element={<SystemPage />} path="/systems/:slug" />
        <Route element={<NoPage />} path="*" />
      </Routes>
      <Analytics />
    </ThemeProvider>
  );
}
