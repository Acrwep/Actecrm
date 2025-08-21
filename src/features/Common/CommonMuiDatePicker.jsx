import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function CommonMuiDatePicker({
  label,
  required,
  onChange,
  value,
  error,
  errorFontSize,
  disablePreviousDates,
  disabled,
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value ? dayjs(value) : null} // convert JS Date to Dayjs
        onChange={(newValue) => {
          // Convert Dayjs to JS Date
          const jsDate = newValue ? newValue.toDate() : null;
          onChange(jsDate);
        }}
        open={!disabled && open} // ✅ only open if not disabled
        format="DD/MM/YYYY"
        onClose={() => setOpen(false)}
        onOpen={() => {
          if (!disabled) {
            setOpen(true);
          }
        }}
        shouldDisableDate={(date) => {
          const today = dayjs();
          if (disablePreviousDates) {
            // disable past dates
            return date.isBefore(today, "day");
          } else {
            // disable future dates
            return date.isAfter(today, "day");
          }
        }}
        slotProps={{
          day: {
            sx: {
              "&.Mui-selected": {
                backgroundColor: "#5b69ca !important", // your custom color
                color: "#fff", // text color on selected
                "&:hover": {
                  backgroundColor: "#4a58b0", // hover state
                },
              },
            },
            "&.MuiPickersDay-today": {
              backgroundColor: "#5b69ca", // optional
            },
          },
          popper: {
            sx: {
              "& .MuiYearCalendar-button": {
                fontSize: "13px !important", // desired font size
                fontFamily: "Poppins, sans-serif", // desired font family
              },
            },
          },
          textField: {
            fullWidth: true,
            size: "small",
            required: required,
            error: error,
            disabled: disabled,
            helperText: error ? (
              <span
                style={{ fontSize: errorFontSize ? errorFontSize : "11px" }}
              >
                {label + error}
              </span>
            ) : null,
            onClick: () => setOpen(true),
            sx: {
              // label font
              "& .MuiPickersInputBase-root": {
                height: "42px !important",
                fontFamily: "Poppins, sans-serif !important",
              },
              "& .MuiInputLabel-root": {
                fontFamily: "Poppins, sans-serif",
                fontSize: "13px",
                marginTop: "3px",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: error ? "#d32f2f" : "#5b69ca", // custom focus color
              },
              // value font
              "& .MuiPickersSectionList-section": {
                fontFamily: "Poppins, sans-serif !important",
                fontSize: "13px",
                marginTop: "3px",
              },
              "& .MuiPickersSectionList-sectionContent": {
                fontFamily: "Poppins, sans-serif",
                fontSize: "13px",
              },
              "& .MuiSvgIcon-root": {
                fontSize: "20px",
                marginTop: "-1px",
              },
              /** ✅ Correct border overrides */
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: error ? "#d32f2f" : "#b0b0b0", // default
              },
              "& .MuiPickersOutlinedInput-root:hover .MuiPickersOutlinedInput-notchedOutline":
                {
                  borderColor: error ? "#d32f2f" : "rgba(128, 128, 128, 0.712)",
                },
              "& .MuiPickersOutlinedInput-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline":
                {
                  borderColor: error ? "#d32f2f" : "#5b69ca !important",
                  borderWidth: 1,
                },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}
