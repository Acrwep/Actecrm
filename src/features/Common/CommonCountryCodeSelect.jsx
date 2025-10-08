import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputAdornment from "@mui/material/InputAdornment";
import "./commonstyles.css";

export default function CommonCountryCodeSelect({
  label,
  value,
  onChange,
  error,
  required,
  fontSize,
  labelFontSize,
  optionsFontSize,
  width,
  height,
  style,
  labelMarginTop,
  helperTextContainerStyle,
  disableClearable,
  disabled,
  errorFontSize,
}) {
  // ✅ Full country data (you can import from a file if large)
  const countries = [
    { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳" },
    { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
    { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
    { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
    { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
    { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
    { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
    { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵" },
    { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬" },
  ];

  const selectedCountry = countries.find((c) => c.code === value) || null;

  return (
    <div style={style}>
      <FormControl
        fullWidth
        size="small"
        className="common_selectfield"
        sx={{
          "& .MuiInputLabel-root": {
            fontSize: labelFontSize || "14px",
            marginTop: labelMarginTop || "1px",
            fontFamily: "Poppins, sans-serif",
          },
          "& .MuiOutlinedInput-root": {
            height: height || "42px",
          },
          "& .MuiAutocomplete-input": {
            fontSize: fontSize || "14px",
          },
        }}
      >
        <Autocomplete
          options={countries}
          value={selectedCountry}
          disableClearable={disableClearable ?? true}
          disabled={disabled}
          getOptionLabel={() => ""} // hide text in input
          onChange={(e, newValue) =>
            onChange({ target: { value: newValue ? newValue.code : "" } })
          }
          renderOption={(props, option) => (
            <li
              {...props}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <img
                src={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png`}
                width="24"
                height="16"
                style={{ borderRadius: "2px" }}
                alt={option.name}
              />
              <span style={{ fontSize: "13px" }}>
                {option.name} {option.dialCode}
              </span>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              required={required}
              InputProps={{
                ...params.InputProps,
                startAdornment: selectedCountry ? (
                  <InputAdornment position="start">
                    <img
                      src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}
                      width="24"
                      height="16"
                      style={{ borderRadius: "2px" }}
                      alt={selectedCountry.name}
                    />
                  </InputAdornment>
                ) : null,
                readOnly: true,
              }}
              sx={{
                "& .MuiInputBase-input": {
                  paddingLeft: selectedCountry ? 0 : undefined,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none", // ⬅️ removes the right border
                },
              }}
              slotProps={{
                listbox: {
                  sx: {
                    "& .MuiAutocomplete-option": {
                      fontSize: optionsFontSize || "13px",
                    },
                    "& .MuiAutocomplete-option[aria-selected='true']": {
                      backgroundColor: "#5b69ca26",
                    },
                    "& .MuiAutocomplete-option[aria-selected='true']:hover": {
                      backgroundColor: "#5b69ca26",
                    },
                  },
                },
              }}
            />
          )}
        />
      </FormControl>
    </div>
  );
}
