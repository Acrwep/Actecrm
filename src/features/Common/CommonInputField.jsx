import React from "react";
import { TextField } from "@mui/material";
import "./commonstyles.css";
import { capitalizeWords } from "./Validation";

export default function CommonInputField({
  label,
  value,
  onChange,
  error,
  required,
  height,
  labelFontSize,
  errorFontSize,
  ref,
  maxLength,
  type,
  onFocus,
  disabled,
  onInput,
  borderLeftNone,
  rows,
  multiline = false,
}) {
  const handleChange = (e) => {
    let value = e.target.value.replace(/^\s+/, ""); // Removes leading spaces

    if (
      label === "Email" ||
      label === "Trainer Email" ||
      label === "User Id" ||
      label === "Role Name" ||
      label === "IFSC Code" ||
      label === "Address" ||
      label === "Attendance Sheet Link"
    ) {
      onChange({ target: { value } });
    } else {
      const newValue = capitalizeWords(value);
      if (onChange) {
        onChange({ target: { value: newValue } });
      }
    }
  };

  return (
    <div>
      <TextField
        className="common_inputfield"
        label={label}
        value={value}
        rows={rows}
        onChange={handleChange}
        multiline={multiline}
        size="small"
        error={error ? true : false}
        autoComplete="on"
        helperText={
          error ? (
            <span
              style={{
                fontSize: errorFontSize ? errorFontSize : "11px",
              }}
            >
              {label === "Paid Now" ? "" : label}
              {error}
            </span>
          ) : null
        }
        required={required}
        disabled={disabled}
        type={type}
        onFocus={onFocus}
        sx={{
          width: "100%",
          "& .MuiInputLabel-root": {
            fontSize: labelFontSize ? labelFontSize : "14px",
          },
          "& .MuiInputBase-root.MuiOutlinedInput-root": {
            borderLeft: "0px",
            borderTopLeftRadius: borderLeftNone ? "0px" : "4px",
            borderBottomLeftRadius: borderLeftNone ? "0px" : "4px",
          },
          "& fieldset": {
            borderLeft: borderLeftNone ? "0px" : "", // ✅ this controls the visible border
          },
          "& .MuiInputBase-input": {
            height: height || "auto",
            boxSizing: "border-box",
            fontSize: "14px",
          },
          "& .Mui-disabled": {
            backgroundColor: "#f5f5f5", // change background
            color: "#888", // change text color
            WebkitTextFillColor: "#888", // needed for iOS/Chrome to change disabled text color
          },
        }}
        inputRef={ref}
        slotProps={{
          htmlInput: { maxLength: maxLength },
          input: {
            maxLength: { maxLength },
          },
        }}
        onInput={onInput}
      />
    </div>
  );
}
