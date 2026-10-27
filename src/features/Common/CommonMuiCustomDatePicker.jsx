import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Popover,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LuCalendarDays, LuChevronDown, LuX } from "react-icons/lu";
import dayjs from "dayjs";
import "./commonstyles.css";
import CommonMuiDatePicker from "./CommonMuiDatePicker";
import { CommonMessage } from "./CommonMessage";

const PRESET_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last15days", label: "Last 15 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "last60days", label: "Last 60 Days" },
  { value: "last90days", label: "Last 90 Days" },
  { value: "thisYear", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

export default function CommonMuiCustomDatePicker({
  label,
  onDateChange,
  value,
  isDashboard,
  dateFontSize,
  width,
  ...props
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [option, setOption] = useState("last7days");
  const [startDate, setStartDate] = useState(dayjs().subtract(6, "day"));
  const [endDate, setEndDate] = useState(dayjs());
  const [endPickerKey, setEndPickerKey] = useState(0);

  // Sync with parent prop only when it changes
  useEffect(() => {
    if (value && value.length === 2) {
      const [start, end] = value;
      if (start) setStartDate(dayjs(start));
      if (end) setEndDate(dayjs(end));

      const today = dayjs();
      const startDay = start ? dayjs(start) : null;
      const endDay = end ? dayjs(end) : null;

      if (startDay && endDay) {
        const todayDate = today.date();
        let expectedStart, expectedEnd;

        if (todayDate <= 25) {
          expectedStart = today.subtract(1, "month").date(26);
          expectedEnd = today.date(25);
        } else {
          expectedStart = today.date(26);
          expectedEnd = today.add(1, "month").date(25);
        }

        if (startDay.isSame(today, "day") && endDay.isSame(today, "day")) {
          setOption("today");
        } else if (
          startDay.isSame(today.subtract(1, "day"), "day") &&
          endDay.isSame(today.subtract(1, "day"), "day")
        ) {
          setOption("yesterday");
        } else if (
          startDay.isSame(expectedStart, "day") &&
          endDay.isSame(expectedEnd, "day")
        ) {
          setOption("thisMonth");
        } else if (
          startDay.isSame(today.subtract(6, "day"), "day") &&
          endDay.isSame(today, "day")
        ) {
          setOption("last7days");
        } else if (
          startDay.isSame(today.subtract(14, "day"), "day") &&
          endDay.isSame(today, "day")
        ) {
          setOption("last15days");
        } else if (
          startDay.isSame(today.subtract(29, "day"), "day") &&
          endDay.isSame(today, "day")
        ) {
          setOption("last30days");
        } else if (
          startDay.isSame(today.subtract(59, "day"), "day") &&
          endDay.isSame(today, "day")
        ) {
          setOption("last60days");
        } else if (
          startDay.isSame(today.subtract(89, "day"), "day") &&
          endDay.isSame(today, "day")
        ) {
          setOption("last90days");
        } else if (
          startDay.isSame(
            today.subtract(1, "year").month(11).date(26),
            "day",
          ) &&
          endDay.isSame(today.month(11).date(25), "day")
        ) {
          setOption("thisYear");
        } else {
          setOption("custom");
        }
      }
    }
  }, [value]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    if (startDate && endDate && endDate.isBefore(startDate, "day")) {
      CommonMessage("error", "End Date should not be less than Start Date");
      return;
    }
    onDateChange?.([
      startDate ? startDate.format("YYYY-MM-DD") : null,
      endDate ? endDate.format("YYYY-MM-DD") : null,
    ]);
    handleClose();
  };

  const handleOptionChange = (eventOrValue) => {
    const selectedVal =
      eventOrValue && eventOrValue.target
        ? eventOrValue.target.value
        : eventOrValue;
    setOption(selectedVal);

    const today = dayjs();
    let newStart = startDate;
    let newEnd = endDate;

    switch (selectedVal) {
      case "today":
        newStart = today;
        newEnd = today;
        break;
      case "yesterday":
        newStart = today.subtract(1, "day");
        newEnd = today.subtract(1, "day");
        break;
      case "thisMonth": {
        const todayDate = today.date(); // current day (1–31)

        if (todayDate <= 25) {
          // 1 → 25 → previous month 26 to current month 25
          newStart = today.subtract(1, "month").date(26);
          newEnd = today.date(25);
        } else {
          // 26 → 31 → current month 26 to next month 25
          newStart = today.date(26);
          newEnd = today.add(1, "month").date(25);
        }
        break;
      }
      case "last7days":
        newStart = today.subtract(6, "day");
        newEnd = today;
        break;
      case "last15days":
        newStart = today.subtract(14, "day");
        newEnd = today;
        break;
      case "last30days":
        newStart = today.subtract(29, "day");
        newEnd = today;
        break;
      case "last60days":
        newStart = today.subtract(59, "day");
        newEnd = today;
        break;
      case "last90days":
        newStart = today.subtract(89, "day");
        newEnd = today;
        break;
      case "thisYear":
        newStart = dayjs().subtract(1, "year").month(11).date(26); // Previous year Dec 26
        newEnd = dayjs().month(11).date(25); // Current year Dec 25
        break;
      case "custom":
        // keep current start/end
        break;
      default:
        return;
    }

    if (selectedVal !== "custom") {
      setStartDate(newStart);
      setEndDate(newEnd);
      onDateChange?.([
        newStart ? newStart.format("YYYY-MM-DD") : null,
        newEnd ? newEnd.format("YYYY-MM-DD") : null,
      ]);
      handleClose();
    }
  };

  const open = Boolean(anchorEl);

  const durationDays =
    startDate && endDate && !endDate.isBefore(startDate, "day")
      ? endDate.diff(startDate, "day") + 1
      : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ position: "relative", height: "100%" }} {...props}>
        {/* Button to open popover */}
        {isDashboard === true ? (
          <div
            className={`dashboard_scorecard_dateiconContainer ${
              open ? "is-active" : ""
            }`}
            onClick={handleOpen}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleOpen(e);
            }}
          >
            <LuCalendarDays size={18} />
            <p>Date Range</p>
          </div>
        ) : (
          <Button
            className={`common_muicustomdatepicker_daterange_button ${
              open ? "is-active" : ""
            }`}
            onClick={handleOpen}
            style={{ width: width ? width : "320px", boxShadow: "none" }}
            disableRipple
            disableFocusRipple
            disableElevation
          >
            {/* Floating Label */}
            {label && (
              <span
                className={`common_muicustomdatepicker_floating_label ${
                  open ? "is-focused" : ""
                }`}
              >
                {label}
              </span>
            )}

            <div className="common_muicustomdatepicker_content">
              <div className="common_muicustomdatepicker_left">
                <LuCalendarDays
                  className="common_muicustomdatepicker_calendar_icon"
                  size={16}
                />
                <div className="common_muicustomdatepicker_dates">
                  <span
                    className="common_muicustomdatepicker_date_text"
                    style={{ fontSize: dateFontSize ? dateFontSize : "12.5px" }}
                  >
                    {startDate ? startDate.format("YYYY-MM-DD") : "Start Date"}
                  </span>
                  <span className="common_muicustomdatepicker_separator">
                    →
                  </span>
                  <span
                    className="common_muicustomdatepicker_date_text"
                    style={{ fontSize: dateFontSize ? dateFontSize : "12.5px" }}
                  >
                    {endDate ? endDate.format("YYYY-MM-DD") : "End Date"}
                  </span>
                </div>
              </div>
              <div className="common_muicustomdatepicker_right">
                <LuChevronDown
                  className={`common_muicustomdatepicker_chevron ${
                    open ? "is-open" : ""
                  }`}
                  size={15}
                />
              </div>
            </div>
          </Button>
        )}

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          marginThreshold={12}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          slotProps={{
            paper: {
              className: "common_muicustomdatepicker_popover_paper",
              sx: {
                marginTop: "4px",
                maxHeight: "calc(100vh - 24px)",
                overflowY: "auto",
              },
            },
          }}
          sx={{
            zIndex: 1300,
          }}
        >
          <div className="common_muicustomdatepicker_popover_content">
            {/* Popover Header */}
            <div className="common_muicustomdatepicker_popover_header">
              <div className="common_muicustomdatepicker_header_title_wrapper">
                <div className="common_muicustomdatepicker_header_icon">
                  <LuCalendarDays size={15} />
                </div>
                <div>
                  <h4 className="common_muicustomdatepicker_header_title">
                    {label || "Date Range Filter"}
                  </h4>
                  <p className="common_muicustomdatepicker_header_subtitle">
                    {startDate && endDate
                      ? `${startDate.format("DD MMM YYYY")} — ${endDate.format("DD MMM YYYY")}`
                      : "Select preset or custom dates"}
                    {durationDays
                      ? ` (${durationDays} day${durationDays > 1 ? "s" : ""})`
                      : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="common_muicustomdatepicker_close_btn"
                onClick={handleClose}
                aria-label="Close"
              >
                <LuX size={16} />
              </button>
            </div>

            {/* Popover Body */}
            <div className="common_muicustomdatepicker_popover_body">
              {/* Preset Range Dropdown */}
              <div className="common_muicustomdatepicker_select_wrapper">
                <FormControl
                  fullWidth
                  size="small"
                  className="common_selectfield"
                  sx={{
                    "& .MuiInputLabel-root": {
                      fontSize: "11px",
                      fontFamily: "Poppins, sans-serif",
                    },
                    "& .MuiSelect-select": {
                      fontSize: "12px",
                      padding: "7px 12px",
                      fontFamily: "Poppins, sans-serif",
                    },
                    "& .MuiOutlinedInput-root": {
                      height: "36px",
                      borderRadius: "6px",
                    },
                  }}
                >
                  <Select value={option} onChange={handleOptionChange}>
                    {PRESET_OPTIONS.map((item) => (
                      <MenuItem
                        key={item.value}
                        value={item.value}
                        sx={{
                          fontSize: "12px",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Custom Date Pickers */}
              {option === "custom" && (
                <div className="common_muicustomdatepicker_custom_section">
                  <div className="common_muicustomdatepicker_custom_header">
                    <span className="common_muicustomdatepicker_custom_title">
                      Custom Date Range
                    </span>
                  </div>
                  <div className="common_muicustomdatepicker_pickers_row">
                    <div className="common_muicustomdatepicker_picker_col">
                      <CommonMuiDatePicker
                        label="Start date"
                        value={startDate}
                        onChange={(value) => {
                          const newStart = value ? dayjs(value) : null;
                          setStartDate(newStart);

                          // If startDate is after endDate → reset endDate
                          let adjustedEnd = endDate;
                          if (
                            newStart &&
                            endDate &&
                            newStart.isAfter(endDate, "day")
                          ) {
                            adjustedEnd = newStart;
                            setEndDate(adjustedEnd);
                            setEndPickerKey((prev) => prev + 1);
                            CommonMessage(
                              "error",
                              "End Date should not be less than Start Date",
                            );
                          }

                          onDateChange?.([
                            newStart ? newStart.format("YYYY-MM-DD") : null,
                            adjustedEnd
                              ? adjustedEnd.format("YYYY-MM-DD")
                              : null,
                          ]);
                        }}
                        allowAllDates={true}
                        height={"33px"}
                      />
                    </div>
                    <div className="common_muicustomdatepicker_picker_arrow">
                      <span>→</span>
                    </div>
                    <div className="common_muicustomdatepicker_picker_col">
                      <CommonMuiDatePicker
                        key={`end-picker-${endPickerKey}`}
                        label="End date"
                        value={endDate}
                        onChange={(value) => {
                          const newEnd = value ? dayjs(value) : null;

                          // Validate End Date against Start Date
                          if (
                            newEnd &&
                            startDate &&
                            newEnd.isBefore(startDate, "day")
                          ) {
                            CommonMessage(
                              "error",
                              "End Date should not be less than Start Date",
                            );
                            setEndPickerKey((prev) => prev + 1);
                            return;
                          }

                          setEndDate(newEnd);

                          onDateChange?.([
                            startDate ? startDate.format("YYYY-MM-DD") : null,
                            newEnd ? newEnd.format("YYYY-MM-DD") : null,
                          ]);

                          handleClose();
                        }}
                        allowAllDates={true}
                        height={"33px"}
                      />
                    </div>
                  </div>
                  <div className="common_muicustomdatepicker_custom_footer">
                    <button
                      type="button"
                      className="common_muicustomdatepicker_apply_btn"
                      onClick={handleApply}
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Popover>
      </Box>
    </LocalizationProvider>
  );
}
