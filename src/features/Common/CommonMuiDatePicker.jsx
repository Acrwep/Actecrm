import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function CommonMuiDatePicker({
  label,
  required,
  onChange,
  onAccept,
  value,
  height,
  fontSize,
  labelFontSize,
  labelMarginTop,
  iconSize,
  error,
  errorFontSize,
  disablePreviousDates,
  allowAllDates,
  disabled,
  is_nextdue_date = false,
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value ? dayjs(value) : null} // convert JS Date to Dayjs
        onChange={(newValue, context) => {
          const jsDate = newValue ? newValue.toDate() : null;
          onChange(jsDate);

          // if (context?.validationError == null && newValue) {
          // setOpen(false);
          // }
        }}
        open={!disabled && open} // ✅ only open if not disabled
        format="DD/MM/YYYY"
        views={["year", "month", "day"]}
        onClose={() => setOpen(false)}
        onAccept={(acceptedValue) => {
          setOpen(false);
          const jsDate = acceptedValue ? acceptedValue.toDate() : null;
          onAccept?.(jsDate);
        }}
        onOpen={() => {
          if (!disabled) {
            setOpen(true);
          }
        }}
        shouldDisableDate={(date) => {
          if (allowAllDates) {
            return false; // ✅ allow everything
          }

          const today = dayjs();

          // If next due date, allow only today + next 7 days
          if (is_nextdue_date) {
            const next7Days = today.add(7, "day");

            return (
              date.isBefore(today, "day") || date.isAfter(next7Days, "day")
            );
          }

          if (disablePreviousDates) {
            return date.isBefore(today, "day"); // disable past dates
          } else {
            return date.isAfter(today, "day"); // disable future dates
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
            disablePortal: false,
            sx: {
              zIndex: 999999999999999,
              "& .MuiTypography-root": {
                fontFamily: "Poppins, sans-serif !important",
                fontSize: "12px",
              },
              "& .MuiMultiSectionDigitalClockSection-item": {
                fontSize: "12px",
                fontFamily: "Poppins, sans-serif",
                "&.Mui-selected": {
                  backgroundColor: "#5b69ca !important",
                  color: "#fff !important",
                },
              },
            },
          },
          actionBar: {
            actions: ["clear"], // ✅ add "clear" action
          },
          textField: {
            fullWidth: true,
            size: "small",
            required: required,
            error: error,
            disabled: disabled,
            helperText: error ? (
              <span
                style={{
                  position: "absolute",
                  bottom: "-16px", // adjust distance below the input
                  left: "12px",
                  fontSize: errorFontSize ? errorFontSize : "10px",
                  color: "#d32f2f",
                }}
              >
                {label + error}
              </span>
            ) : null,
            onClick: () => setOpen(true),
            sx: {
              "& .MuiPickersInputBase-root": {
                height: height || "36px !important",
                fontFamily: "Poppins, sans-serif !important",
                fontSize: "12px",
              },
              "& .MuiInputBase-input": {
                fontFamily: "Poppins, sans-serif !important",
                fontSize: fontSize || "12px",
                paddingTop: "10px", // Align vertically for 42px height
                paddingBottom: "10px",
              },
              "& .MuiPickersSectionList-root": {
                paddingTop: "10px",
                paddingBottom: "10px",
              },
              "& .MuiPickersSectionList-section": {
                fontFamily: "Poppins, sans-serif !important",
                fontSize: fontSize || "12px",
              },
              "& .MuiPickersSectionList-sectionContent": {
                fontFamily: "Poppins, sans-serif",
                fontSize: fontSize || "12px",
              },
              "& .MuiInputLabel-root": {
                fontFamily: "Poppins, sans-serif",
                fontSize: labelFontSize || "12px",
                marginTop: labelMarginTop || "3px",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: error ? "#d32f2f" : "#5b69ca",
              },
              "& .MuiSvgIcon-root": {
                fontSize: iconSize || "20px",
                marginTop: "-1px",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: error ? "#d32f2f" : "#b0b0b0",
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
              "& .Mui-disabled": {
                backgroundColor: "#f5f5f5",
                color: "#888",
                WebkitTextFillColor: "#888",
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}
