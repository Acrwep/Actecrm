import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../Login/Login";

export default function Pages() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route element={<Login />} path="/login" />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
