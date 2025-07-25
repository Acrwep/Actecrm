import React from "react";
import {
  InputLabel,
  FormControl,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import FormHelperText from "@mui/material/FormHelperText";
import "./commonstyles.css";

export default function CommonOutlinedInput({
  label,
  icon,
  value,
  onChange,
  type,
  error,
  required,
  width,
  height,
  labelFontSize,
  labelMarginTop,
  helperTextContainerStyle,
}) {
  return (
    <FormControl
      variant="outlined"
      size="small"
      className="common_inputfield"
      error={error ? true : false}
      required={required}
      sx={{
        width: width ? width : "100%",
        "& .MuiInputLabel-root": {
          fontSize: labelFontSize ? labelFontSize : "14px",
          marginTop: labelMarginTop,
        },
        "& .MuiInputBase-input": {
          height: height || "auto",
          boxSizing: "border-box",
          fontSize: "14px",
        },
      }}
    >
      <InputLabel htmlFor="outlined-adornment-password">{label}</InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        endAdornment={<InputAdornment position="end">{icon}</InputAdornment>}
        label={label}
        value={value}
        onChange={onChange}
        type={type}
      />
      {error && (
        <div style={helperTextContainerStyle}>
          <FormHelperText className="common_selectfield_errortext">
            {label + " " + error}
          </FormHelperText>
        </div>
      )}
    </FormControl>
  );
}
