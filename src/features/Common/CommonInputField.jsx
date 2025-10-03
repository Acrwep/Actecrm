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
  disabled,
  onInput,
}) {
  const handleChange = (e) => {
    if (
      label === "Email" ||
      label === "Trainer Email" ||
      label === "User Id" ||
      label === "Role Name" ||
      label === "IFSC Code"
    ) {
      onChange({ target: { value: e.target.value } });
    } else {
      const newValue = capitalizeWords(e.target.value);
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
        onChange={handleChange}
        size="small"
        error={error ? true : false}
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
          "& .Mui-disabled": {
            backgroundColor: "#f5f5f5", // change background
            color: "#888", // change text color
            WebkitTextFillColor: "#888", // needed for iOS/Chrome to change disabled text color
          },
        }}
        inputRef={ref}
        slotProps={{
          input: {
            maxLength: maxLength,
          },
        }}
        onInput={onInput}
      />
    </div>
  );
}
