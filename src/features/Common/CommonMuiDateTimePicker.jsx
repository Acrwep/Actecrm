import * as React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function CommonMuiDateTimePicker({
  label,
  required,
  onChange,
  value,
  onlyTime = false,
  height,
  fontSize,
  iconSize,
  labelFontSize,
  labelMarginTop,
  error,
  errorFontSize,
  disablePreviousDates,
  allowAllDates,
  disabled,
}) {
  const [open, setOpen] = React.useState(false);

  if (onlyTime) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <TimePicker
          label={label}
          value={value ? dayjs(value) : null}
          onChange={(newValue) => {
            const jsDate = newValue ? newValue.toDate() : null;
            onChange(jsDate);
          }}
          open={!disabled && open}
          format="HH:mm"
          onClose={() => setOpen(false)}
          onOpen={() => {
            if (!disabled) setOpen(true);
          }}
          slotProps={{
            actionBar: {
              actions: ["clear", "accept"],
              sx: {
                "& .MuiButton-root": {
                  fontSize: "12px",
                  fontFamily: "Poppins, sans-serif",
                },
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
            textField: {
              fullWidth: true,
              size: "small",
              required,
              error,
              disabled,
              helperText: error ? (
                <span
                  style={{
                    position: "absolute",
                    bottom: "-18px",
                    left: "0",
                    fontSize: errorFontSize || "11px",
                    color: "#d32f2f",
                  }}
                >
                  {label + error}
                </span>
              ) : null,
              onClick: () => setOpen(true),
              sx: {
                "& .MuiPickersInputBase-root": {
                  height: height || "42px !important",
                  fontFamily: "Poppins, sans-serif !important",
                  fontSize: "13px",
                },
                "& .MuiInputBase-input": {
                  fontFamily: "Poppins, sans-serif !important",
                  fontSize: "13px",
                },
                "& .MuiInputLabel-root": {
                  fontFamily: "Poppins, sans-serif",
                  fontSize: labelFontSize || "13px",
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
                    borderColor: error
                      ? "#d32f2f"
                      : "rgba(128, 128, 128, 0.712)",
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimePicker
        label={label}
        value={value ? dayjs(value) : null}
        onChange={(newValue) => {
          const jsDate = newValue ? newValue.toDate() : null;
          onChange(jsDate);
        }}
        open={!disabled && open}
        format="DD/MM/YYYY HH:mm" // ✅ includes time
        views={["year", "month", "day", "hours", "minutes"]}
        onClose={() => setOpen(false)}
        onOpen={() => {
          if (!disabled) setOpen(true);
        }}
        shouldDisableDate={(date) => {
          if (allowAllDates) return false;

          const today = dayjs();

          if (disablePreviousDates) {
            return date.isBefore(today, "day");
          } else {
            return date.isAfter(today, "day");
          }
        }}
        slotProps={{
          actionBar: {
            actions: ["clear", "accept"],
            sx: {
              "& .MuiButton-root": {
                fontSize: "12px",
                fontFamily: "Poppins, sans-serif",
              },
            },
          },
          day: {
            sx: {
              "&.Mui-selected": {
                backgroundColor: "#5b69ca !important",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#4a58b0",
                },
              },
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
              "& .MuiPickersDay-root": {
                fontSize: "12px",
                fontFamily: "Poppins, sans-serif",
              },
              "& .MuiMultiSectionDigitalClockSection-item": {
                fontSize: "12px",
                fontFamily: "Poppins, sans-serif",
                "&.Mui-selected": {
                  backgroundColor: "#5b69ca !important",
                  color: "#fff !important",
                },
              },
              "& .MuiYearCalendar-button, & .MuiYearCalendar-root button": {
                fontSize: "13px !important",
                fontFamily: "Poppins, sans-serif !important",
              },
              "& .MuiYearCalendar-button.Mui-selected, & .MuiYearCalendar-root button.Mui-selected":
                {
                  backgroundColor: "#5b69ca !important",
                  color: "#fff !important",
                },
              "& .MuiYearCalendar-button.Mui-selected:hover, & .MuiYearCalendar-root button.Mui-selected:hover":
                {
                  backgroundColor: "#4a58b0 !important",
                },
              // Month Button Styles
              "& .MuiPickersMonth-monthButton, & .MuiMonthCalendar-root button":
                {
                  fontSize: "13px !important",
                  fontFamily: "Poppins, sans-serif !important",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                },
              "& .MuiPickersMonth-monthButton.Mui-selected, & .MuiMonthCalendar-root button.Mui-selected":
                {
                  backgroundColor: "#5b69ca !important",
                  color: "#fff !important",
                },
              "& .MuiPickersMonth-monthButton.Mui-selected:hover, & .MuiMonthCalendar-root button.Mui-selected:hover":
                {
                  backgroundColor: "#4a58b0 !important",
                },
              "& .MuiPickersCalendarHeader-label": {
                fontSize: "13px", // slightly larger for header
                fontWeight: 600,
              },
            },
          },
          textField: {
            fullWidth: true,
            size: "small",
            required,
            error,
            disabled,
            helperText: error ? (
              <span
                style={{
                  position: "absolute",
                  bottom: "-18px",
                  left: "0",
                  fontSize: errorFontSize || "11px",
                  color: "#d32f2f",
                }}
              >
                {label + error}
              </span>
            ) : null,
            onClick: () => setOpen(true),
            sx: {
              "& .MuiPickersInputBase-root": {
                height: height || "42px !important",
                fontFamily: "Poppins, sans-serif !important",
                fontSize: "13px",
              },
              "& .MuiInputBase-input": {
                fontFamily: "Poppins, sans-serif !important",
                fontSize: "13px",
              },
              "& .MuiInputLabel-root": {
                fontFamily: "Poppins, sans-serif",
                fontSize: labelFontSize || "13px",
                marginTop: labelMarginTop || "3px",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: error ? "#d32f2f" : "#5b69ca",
              },
              "& .MuiPickersSectionList-section": {
                fontFamily: "Poppins, sans-serif !important",
                fontSize: fontSize || "13px",
                marginTop: "3px",
              },
              "& .MuiPickersSectionList-sectionContent": {
                fontFamily: "Poppins, sans-serif",
                fontSize: "13px",
              },
              "& .MuiSvgIcon-root": {
                fontSize: "20px",
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
