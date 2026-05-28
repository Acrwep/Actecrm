import React from "react";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import "./commonstyles.css";

export default function CommonMultiSelectField({
  label,
  value = [],
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
  // Resolve the string IDs from value into option objects
  const selectedOptions = React.useMemo(() => {
    if (!value) return [];
    const valArray = Array.isArray(value) ? value : [value];
    return options.filter((opt) => {
      const optId = String(opt.user_id ?? opt.id ?? "");
      return valArray.map(String).includes(optId);
    });
  }, [value, options]);

  const handleChange = (event, newValue) => {
    if (!onChange) return;
    const selectedIds = newValue.map((opt) =>
      String(opt.user_id ?? opt.id ?? ""),
    );
    onChange({
      target: {
        value: selectedIds,
        options: newValue,
      },
    });
  };

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
            fontFamily: "Poppins, sans-serif",
          },
          "& .MuiOutlinedInput-root": {
            height: height || "42px",
            paddingTop: "0px !important",
            paddingBottom: "0px !important",
            display: "flex",
            alignItems: "center",
            flexWrap: "nowrap !important",
          },
          "& .MuiAutocomplete-input": {
            fontSize: fontSize || "14px",
            marginTop: "0px",
          },
          "& .Mui-disabled": {
            backgroundColor: "#f5f5f5",
            color: "#888",
            WebkitTextFillColor: "#888",
          },
        }}
      >
        <Autocomplete
          multiple
          disableCloseOnSelect
          options={options}
          value={selectedOptions}
          disableClearable
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
                      ? `${option.user_id} - ${option.user_name}`
                      : option?.exp_range || option?.name || ""
          }
          getOptionDisabled={(option) =>
            option.is_active === false || option.is_active === 0
          }
          onChange={handleChange}
          noOptionsText={
            <span
              style={{
                fontSize: "13px",
                color: "#888",
                fontFamily: "Poppins, sans-serif",
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
                  borderRight: borderRightNone ? "none" : "",
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
          renderOption={
            renderOption ||
            ((props, option, { selected }) => {
              const { key, ...restProps } = props;
              return (
                <li
                  key={key || option.user_id || option.id}
                  {...restProps}
                  style={{ padding: "4px 8px" }}
                >
                  <Checkbox
                    size="small"
                    checked={selected}
                    sx={{
                      color: "#5b69ca",
                      padding: "4px",
                      marginRight: "6px",
                      "&.Mui-checked": {
                        color: "#5b69ca",
                      },
                    }}
                  />
                  <span
                    style={{
                      fontSize: optionsFontSize || "13px",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {showLabelStatus === "Name"
                      ? option?.name
                      : showLabelStatus === "Email"
                        ? option?.email
                        : showLabelStatus === "Mobile"
                          ? option?.mobile
                          : showLabelStatus === "Trainer Id"
                            ? option?.trainer_code
                            : option?.user_name
                              ? `${option.user_id} - ${option.user_name}`
                              : option?.exp_range || option?.name || ""}
                  </span>
                </li>
              );
            })
          }
          renderTags={(tagValue, getTagProps) => {
            if (tagValue.length === 0) return null;

            const names = tagValue.map((option) => {
              return showLabelStatus === "Name"
                ? option?.name
                : showLabelStatus === "Email"
                  ? option?.email
                  : showLabelStatus === "Mobile"
                    ? option?.mobile
                    : showLabelStatus === "Trainer Id"
                      ? option?.trainer_code
                      : option?.user_name
                        ? option.user_name
                        : option?.name || "";
            });

            const limit = 2;
            const renderedNames = names.slice(0, limit).join(", ");
            const extraCount = tagValue.length - limit;

            let labelText = renderedNames;
            if (extraCount > 0) {
              labelText = `${renderedNames} + ${extraCount} more`;
            }

            return (
              <Chip
                label={labelText}
                size="small"
                {...getTagProps({ index: 0 })}
                onDelete={(e) => {
                  if (onChange) {
                    onChange(e, []);
                  }
                }}
                sx={{
                  height: "22px",
                  fontSize: "11px",
                  fontFamily: "Poppins, sans-serif",
                  backgroundColor: "#5b69ca1a",
                  border: "1px solid #5b69ca30",
                  color: "#5b69ca",
                  borderRadius: "4px",
                  maxWidth: "85%",
                  margin: "2px 0",
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontWeight: 500,
                  },
                  "& .MuiChip-deleteIcon": {
                    color: "#5b69ca",
                    fontSize: "13px",
                    "&:hover": {
                      color: "#3f4eb5",
                    },
                  },
                }}
              />
            );
          }}
          slotProps={{
            listbox: {
              sx: {
                "& .MuiAutocomplete-option": {
                  fontSize: optionsFontSize || "13px",
                  fontFamily: "Poppins, sans-serif",
                },
                "& .MuiAutocomplete-option[aria-selected='true']": {
                  backgroundColor: "#5b69ca1a",
                },
                "& .MuiAutocomplete-option[aria-selected='true']:hover": {
                  backgroundColor: "#5b69ca26",
                },
              },
            },
            popper: {
              sx: {
                "& .MuiPaper-root": {
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                },
              },
            },
          }}
          disabled={disabled}
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
