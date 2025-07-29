import React from "react";
import { Autocomplete, TextField } from "@mui/material";

export default function CommonMultiSelect({
  options = [],
  label,
  defaultValue,
  height,
  fontSize,
  valueMarginTop,
  optionsFontSize,
}) {
  return (
    <div>
      <Autocomplete
        multiple
        freeSolo
        limitTags={2}
        size="small"
        id="multiple-limit-tags"
        options={[]}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.title
        }
        defaultValue={defaultValue}
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
          />
        )}
        className="common_inputfield"
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
            marginTop: "-1px",
            fontSize: "11px",
            padding: "0 4px",
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
      />
    </div>
  );
}
