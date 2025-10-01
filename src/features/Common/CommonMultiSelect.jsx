import React from "react";
import {
  Autocomplete,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";
import "./commonstyles.css";

export default function CommonMultiSelect({
  options = [],
  onChange,
  value,
  label,
  defaultValue,
  height,
  fontSize,
  valueMarginTop,
  optionsFontSize,
  required,
  error,
  dontallowFreeSolo,
}) {
  return (
    <div>
      <FormControl fullWidth className="common_selectfield" required={required}>
        <Autocomplete
          multiple
          freeSolo={dontallowFreeSolo ? false : true}
          limitTags={2}
          size="small"
          id="multiple-limit-tags"
          options={options}
          getOptionLabel={(option) =>
            typeof option === "string"
              ? option
              : option.role_name
              ? option.role_name
              : option.name
          }
          defaultValue={defaultValue}
          {...(dontallowFreeSolo && {
            isOptionEqualToValue: (option, value) =>
              option.role_id === value.role_id,
          })}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              className="common_inputfield"
              sx={{
                "& .MuiInputBase-input": {
                  fontSize: "12px", // 👈 input text font size
                },
                "& .MuiInputLabel-root": {
                  fontSize: "14px", // 👈 label font size
                },
                "& .MuiAutocomplete-endAdornment": {
                  top: "43%",
                },
              }}
              required={required}
              error={error ? true : false}
            />
          )}
          sx={{
            width: "100%",
            "& .MuiInputBase-root": {
              height: height || "auto",
              minHeight: height || "46px",
              alignItems: "start",
              flexWrap: "wrap",
            },
            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
              fontSize: fontSize ? fontSize : "14px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              height: "100%", // Ensure the outline stretches
            },
            "& .MuiInputLabel-root": {
              fontSize: "14px", // Change this value as needed
              // marginTop: "-6px",
            },
            "& .MuiChip-root": {
              height: "26px",
              fontSize: "11px",
              padding: "2px 4px",
              display: "flex",
              alignItems: "center",
            },
          }}
          slotProps={{
            paper: {
              sx: {
                fontSize: optionsFontSize || "13px", // 👈 Option font size
                "& .MuiAutocomplete-option[aria-selected='true']": {
                  backgroundColor: "#5b69ca26",
                },
                "& .MuiAutocomplete-option[aria-selected='true']:hover": {
                  backgroundColor: "#5b69ca26",
                },
              },
            },
          }}
          onChange={onChange}
          value={value || []}
        />
        {error && (
          <div>
            <FormHelperText
              className="common_selectfield_errortext"
              sx={{
                marginTop: "0px",
                fontFamily: "Poppins, sans-serif",
                fontSize: "11px",
              }}
            >
              {label + " " + error}
            </FormHelperText>
          </div>
        )}
      </FormControl>
    </div>
  );
}
