import React from "react";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import "./commonstyles.css";

export default function CommonSelectField({
  label,
  value,
  onChange,
  error,
  required,
  options = [],
  fontSize,
  valueMarginTop,
  labelFontSize,
  optionsFontSize,
  width,
  height,
  style,
  labelMarginTop,
  downArrowIconTop,
  helperTextContainerStyle,
  disableClearable,
}) {
  return (
    <div style={style}>
      <FormControl
        fullWidth
        className="common_selectfield"
        size="small"
        sx={{
          flex: 1,
          "& .MuiInputLabel-root": {
            fontSize: labelFontSize || "14px",
            padding: "0px 0px",
            marginTop: labelMarginTop ? labelMarginTop : "1px",
            fontFamily: "Poppins,  sans-serif ",
          },
          "& .MuiOutlinedInput-root": {
            height: height || "42px",
          },
          "& .MuiAutocomplete-input": {
            fontSize: fontSize || "14px",
            marginTop: "0px",
          },
        }}
      >
        <Autocomplete
          options={options}
          value={options.find((opt) => opt.id === value) || null}
          getOptionLabel={(option) => option?.exp_range || option?.name || ""}
          onChange={(event, newValue) =>
            onChange({
              target: { value: newValue ? newValue.id : "" },
            })
          }
          disableClearable={disableClearable ?? true}
          noOptionsText={
            <span
              style={{
                fontSize: "13px",
                color: "#888",
                fontStyle: "Poppins, sans-serif",
              }}
            >
              No data found
            </span>
          }
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label={label}
              required={required}
              sx={{
                "& .MuiInputBase-input": {
                  fontSize: fontSize || "14px",
                },
              }}
              className="common_inputfield"
              error={error}
            />
          )}
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

        {error && (
          <div style={helperTextContainerStyle}>
            <FormHelperText className="common_selectfield_errortext">
              {label + " " + error}
            </FormHelperText>
          </div>
        )}
      </FormControl>
    </div>
  );
}
