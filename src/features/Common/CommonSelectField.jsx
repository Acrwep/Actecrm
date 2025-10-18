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
  disabled,
  errorFontSize,
  renderOption,
  groupBy,
  showLabelStatus,
  borderRightNone,
  borderLeftNone,
  onFocus,
  onBlur,
}) {
  return (
    <div style={style}>
      <FormControl
        fullWidth
        className="common_selectfield"
        size="small"
        sx={{
          flex: 1,
          width: width ? width : "100%",
          "& .MuiInputLabel-root": {
            fontSize: labelFontSize || "14px",
            padding: "0px 0px",
            marginTop: labelMarginTop ? labelMarginTop : "1px",
            fontFamily: "Poppins,  sans-serif",
          },
          "& .MuiOutlinedInput-root": {
            height: height || "42px",
          },
          "& .MuiAutocomplete-input": {
            fontSize: fontSize || "14px",
            marginTop: "0px",
          },
          "& .Mui-disabled": {
            backgroundColor: "#f5f5f5", // change background
            color: "#888", // change text color
            WebkitTextFillColor: "#888", // needed for iOS/Chrome to change disabled text color
          },
        }}
      >
        <Autocomplete
          options={options}
          value={
            options.find(
              (opt) => String(opt.user_id ?? opt.id) === String(value)
            ) || null
          }
          getOptionLabel={(option) =>
            showLabelStatus === "Name"
              ? option?.name
              : showLabelStatus === "Email"
              ? option?.email
              : showLabelStatus === "Mobile"
              ? option?.mobile
              : showLabelStatus === "Trainer Id"
              ? option?.trainer_code
              : option?.user_name
              ? `${option.user_id} - ${option.user_name} `
              : option?.exp_range || option?.name || ""
          }
          onChange={(event, newValue) =>
            onChange({
              target: {
                value: newValue
                  ? String(newValue.user_id ?? newValue.id ?? "")
                  : "",
              },
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
                "& .MuiOutlinedInput-notchedOutline": {
                  borderRight: borderRightNone ? "none" : "", // ⬅️ removes the right border
                  borderLeft: borderLeftNone ? "none" : "",
                  borderTopRightRadius: borderRightNone ? "0px" : "4px",
                  borderBottomRightRadius: borderRightNone ? "0px" : "4px",
                  borderTopLeftRadius: borderLeftNone ? "0px" : "4px",
                  borderBottomLeftRadius: borderLeftNone ? "0px" : "4px",
                },
              }}
              className="common_inputfield"
              error={error}
              onFocus={onFocus}
              onBlur={onBlur}
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
          disabled={disabled}
          renderOption={renderOption}
          groupBy={groupBy}
        />

        {error && (
          <div style={helperTextContainerStyle}>
            <FormHelperText
              className="common_selectfield_errortext"
              style={{
                fontSize: errorFontSize ? errorFontSize : "11px",
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
