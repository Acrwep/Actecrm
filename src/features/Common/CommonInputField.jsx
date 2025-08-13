import React from "react";
import { TextField } from "@mui/material";
import "./commonstyles.css";

export default function CommonInputField({
  label,
  value,
  onChange,
  error,
  required,
  height,
  labelFontSize,
  ref,
  maxLength,
  type,
}) {
  return (
    <div>
      <TextField
        className="common_inputfield"
        label={label}
        value={value}
        onChange={onChange}
        size="small"
        error={error ? true : false}
        helperText={error ? label + error : ""}
        required={required}
        sx={{
          width: "100%",
          "& .MuiInputLabel-root": {
            fontSize: labelFontSize ? labelFontSize : "14px",
          },
          "& .MuiInputBase-input": {
            height: height || "auto",
            boxSizing: "border-box",
            fontSize: "14px",
          },
        }}
        inputRef={ref}
        slotProps={{ htmlInput: { maxLength: maxLength, type: type } }}
      />
    </div>
  );
}
