import React from "react";
import {
  Autocomplete,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";
import "./commonstyles.css";
import Checkbox from "@mui/material/Checkbox";
import { MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { IoMdCheckbox } from "react-icons/io";

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
  checkBox,
}) {
  const icon = <MdOutlineCheckBoxOutlineBlank size={18} />;
  const checkedIcon = <IoMdCheckbox size={18} color="#535bf2" />;

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
          disableCloseOnSelect
          getOptionLabel={(option) =>
            typeof option === "string"
              ? option
              : option.role_name
              ? option.role_name
              : option.user_name
              ? option.user_name
              : option.name
          }
          defaultValue={defaultValue}
          {...(dontallowFreeSolo && {
            isOptionEqualToValue: (option, value) => {
              if (option?.role_id && value?.role_id) {
                return option.role_id === value.role_id;
              }
              if (option?.user_id && value?.user_id) {
                return option.user_id === value.user_id;
              }
              return option?.id === value?.id;
            },
          })}
          {...(dontallowFreeSolo && checkBox === true
            ? {
                renderOption: (props, option, { selected }) => {
                  const { key, ...optionProps } = props;
                  return (
                    <li key={key} {...optionProps}>
                      <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {typeof option === "string"
                        ? option
                        : option.role_name
                        ? option.role_name
                        : option.user_name
                        ? option.user_name
                        : option.name}
                    </li>
                  );
                },
              }
            : {})}
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
              minHeight: height || "46px",
              alignItems: "flex-start",
              // flexWrap: "wrap",
              // overflowX: "hidden",
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
            "& .MuiAutocomplete-tag": {
              margin: "2px 2px 8px 2px",
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
