import React from "react";
import "react-international-phone/style.css";
import "./commonstyles.css";
import {
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
  ListSubheader,
} from "@mui/material";
import {
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from "react-international-phone";
import CommonInputField from "./CommonInputField";

export default function PhoneWithCountry({
  onChange,
  value, // raw number from parent
  label,
  error,
  placeholder,
  labelFontSize,
  height,
  borderLeftNone,
  countryCode,
  countrySelectPadding,
  countryFlagSize,
  onCountryChange,
  selectedCountry,
  disabled = false,
  disableCountrySelect = false,
  errorFontSize,
  errorLabel,
  ...restProps
}) {
  const [internalValue, setInternalValue] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const { inputRef, country, setCountry } = usePhoneInput({
    defaultCountry: selectedCountry || "in",
    countries: defaultCountries,
  });

  const prevDialCodeRef = React.useRef(country.dialCode);
  const typingRef = React.useRef(false);

  // Call countryCode initially
  React.useEffect(() => {
    if (countryCode) {
      countryCode(country.dialCode);
    }
  }, [country.dialCode, countryCode]);

  // Sync internal value when parent value changes
  React.useEffect(() => {
    if (!typingRef.current && value !== undefined) {
      const newValue = value || "";
      if (newValue !== internalValue) {
        setInternalValue(newValue);
      }
      prevDialCodeRef.current = country.dialCode;
    }
  }, [value, country.dialCode]);

  // Sync selectedCountry prop with internal state
  React.useEffect(() => {
    if (selectedCountry && selectedCountry !== country.iso2) {
      setCountry(selectedCountry);
    }
  }, [selectedCountry, country.iso2, setCountry]);

  const handleInputChange = (e) => {
    typingRef.current = true;
    let userInput = e.target.value;

    let onlyDigits = userInput.replace(/\D/g, "").replace(/^0+/, "");

    if (userInput.startsWith(`+${country.dialCode}`)) {
      onlyDigits = userInput
        .slice(`+${country.dialCode}`.length)
        .replace(/\D/g, "")
        .replace(/^0+/, "");
    }

    setInternalValue(onlyDigits);
    onChange?.(onlyDigits, country.iso2);

    setTimeout(() => {
      typingRef.current = false;
    }, 0);
  };

  // Handle country change
  const handleCountryChange = (e) => {
    const newCountryIso2 = e.target.value;
    setCountry(newCountryIso2);
    onCountryChange?.(newCountryIso2);

    const countryObj = defaultCountries.find(
      (c) => parseCountry(c).iso2 === newCountryIso2,
    );
    if (!countryObj) return;

    const newDialCode = parseCountry(countryObj).dialCode;

    prevDialCodeRef.current = newDialCode;
    onChange?.(internalValue || "", newCountryIso2);
    countryCode?.(newDialCode);
  };

  const filteredCountries = React.useMemo(() => {
    if (!searchQuery) return defaultCountries;
    return defaultCountries.filter((c) => {
      const countryItem = parseCountry(c);
      return (
        countryItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `+${countryItem.dialCode}`.includes(searchQuery) ||
        countryItem.dialCode.includes(searchQuery.replace("+", ""))
      );
    });
  }, [searchQuery]);

  return (
    <FormControl
      sx={{
        width: "100%",
        "& .Mui-disabled": {
          backgroundColor: "#f5f5f5", // change background
          color: "#888", // change text color
          WebkitTextFillColor: "#888", // needed for iOS/Chrome to change disabled text color
        },
      }}
    >
      <TextField
        variant="outlined"
        label={label}
        placeholder={placeholder}
        required
        value={internalValue}
        onChange={handleInputChange}
        type="tel"
        inputRef={inputRef}
        onFocus={(e) => {
          const target = e.target;
          setTimeout(() => {
            const val = target.value;
            target.setSelectionRange(val.length, val.length);
          }, 0);
          if (restProps.onFocus) {
            restProps.onFocus(e);
          }
        }}
        className="common_inputfield"
        error={!!error}
        disabled={disabled}
        helperText={
          error && (
            <span style={{ fontSize: errorFontSize || "11px" }}>
              {(errorLabel || label) !== "Paid Now" && (errorLabel || label)}
              {error}
            </span>
          )
        }
        sx={{
          width: "100%",
          "& .MuiInputLabel-root": { fontSize: labelFontSize || "12px" },
          "& .MuiInputBase-root.MuiOutlinedInput-root": {
            borderLeft: "0px",
            borderTopLeftRadius: borderLeftNone ? "0px" : "4px",
            borderBottomLeftRadius: borderLeftNone ? "0px" : "4px",
          },
          "& fieldset": { borderLeft: borderLeftNone ? "0px" : "" },
          "& .MuiInputBase-input": {
            height: height || "36px",
            boxSizing: "border-box",
            fontSize: "12px",

            "&::placeholder": {
              fontSize: "12px",
              color: "gray",
              opacity: 1,
            },
          },
        }}
        slotProps={{
          htmlInput: { maxLength: 17 },
          input: {
            startAdornment: (
              <InputAdornment
                position="start"
                style={{ marginRight: "0px", marginLeft: "-8px" }}
              >
                <Select
                  disabled={disableCountrySelect}
                  tabIndex={-1}
                  inputProps={{ tabIndex: -1 }}
                  onClose={() => setSearchQuery("")}
                  MenuProps={{
                    autoFocus: false,
                    PaperProps: {
                      style: {
                        maxHeight: "300px",
                        width: "280px",
                      },
                    },
                    style: {
                      top: "10px",
                      left: "-34px",
                    },
                    transformOrigin: { vertical: "top", horizontal: "left" },
                  }}
                  sx={{
                    width: "max-content",
                    fieldset: { display: "none" },
                    ".MuiSelect-select": {
                      padding: countrySelectPadding || "8px 0px 8px 8px",
                      display: "flex",
                      alignItems: "center",
                    },
                  }}
                  value={country.iso2}
                  onChange={handleCountryChange}
                  renderValue={(v) => {
                    const countryItem = defaultCountries.find(
                      (c) => parseCountry(c).iso2 === v,
                    );
                    const dialCode = countryItem
                      ? parseCountry(countryItem).dialCode
                      : "";
                    return (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <FlagImage
                          iso2={v}
                          style={{ display: "flex" }}
                          size={countryFlagSize || 22}
                        />
                        <Typography
                          sx={{
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "12.5px",
                            marginTop: "1px",
                            fontWeight: 500,
                            color: "#333",
                          }}
                        >
                          +{dialCode}
                        </Typography>
                      </div>
                    );
                  }}
                >
                  <ListSubheader
                    sx={{
                      padding: "8px 12px 0px 12px",
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      backgroundColor: "#fff",
                    }}
                    onKeyDownCapture={(e) => e.stopPropagation()}
                  >
                    <CommonInputField
                      label={"Search country..."}
                      // autoFocus
                      size="small"
                      fullWidth
                      variant="outlined"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoComplete="off"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "4px",
                        },
                        "& .MuiInputBase-input": {
                          padding: "8px 12px",
                          fontSize: "14px",

                          "&::placeholder": {
                            fontSize: "12px",
                            color: "gray",
                            opacity: 1,
                          },
                        },
                      }}
                    />
                  </ListSubheader>
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((c) => {
                      const countryItem = parseCountry(c);
                      return (
                        <MenuItem
                          key={countryItem.iso2}
                          value={countryItem.iso2}
                        >
                          <FlagImage
                            iso2={countryItem.iso2}
                            style={{ marginRight: "8px" }}
                          />
                          <Typography
                            marginRight="8px"
                            sx={{
                              fontFamily: "Poppins, sans-serif",
                              fontSize: "13px",
                            }}
                          >
                            {countryItem.name}
                          </Typography>
                          <Typography
                            color="gray"
                            sx={{
                              fontFamily: "Poppins, sans-serif",
                              fontSize: "13px",
                            }}
                          >
                            +({countryItem.dialCode})
                          </Typography>
                        </MenuItem>
                      );
                    })
                  ) : (
                    <MenuItem
                      disabled
                      style={{ fontSize: "12px", color: "#000" }}
                    >
                      No countries found
                    </MenuItem>
                  )}
                </Select>
              </InputAdornment>
            ),
          },
        }}
        {...restProps}
      />
    </FormControl>
  );
}
