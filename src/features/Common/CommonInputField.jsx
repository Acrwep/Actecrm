import React from "react";
import { TextField } from "@mui/material";
import "./commonstyles.css";

export default function CommonInputField({ label, value, onChange, error }) {
  return (
    <div>
      <TextField
        className="common_inputfield"
        label={label}
        value={value}
        onChange={onChange}
        size="small"
        sx={{ width: "100%" }}
        error={error ? true : false}
        helperText={error}
      />
    </div>
  );
}
