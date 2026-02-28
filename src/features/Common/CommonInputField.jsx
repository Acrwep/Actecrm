import React, { useRef, useLayoutEffect } from "react";
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
  ref: passedRef,
  maxLength,
  type,
  onFocus,
  disabled,
  onInput,
  borderLeftNone,
  rows,
  multiline = false,
}) {
  const inputRef = useRef(null);
  const cursorRef = useRef(null);

  const handleChange = (e) => {
    let rawValue = e.target.value.replace(/^\s+/, ""); // Removes leading spaces
    const { selectionStart, selectionEnd } = e.target;

    // Store cursor position
    cursorRef.current = { start: selectionStart, end: selectionEnd };

    if (
      label === "Email" ||
      label === "Trainer Email" ||
      label === "User Id" ||
      label === "Role Name" ||
      label === "IFSC Code" ||
      label === "Address" ||
      label == "Brouchures Link" ||
      label == "Syllabus" ||
      label === "Attendance Sheet Link"
    ) {
      if (onChange) {
        onChange({ target: { value: rawValue } });
      }
    } else {
      const newValue = capitalizeWords(rawValue);
      if (onChange) {
        onChange({ target: { value: newValue } });
      }
    }
  };

  useLayoutEffect(() => {
    if (inputRef.current && cursorRef.current) {
      const { start, end } = cursorRef.current;
      inputRef.current.setSelectionRange(start, end);
      cursorRef.current = null;
    }
  }, [value]);

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
        inputRef={(node) => {
          inputRef.current = node;
          if (passedRef) {
            if (typeof passedRef === "function") passedRef(node);
            else passedRef.current = node;
          }
        }}
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
