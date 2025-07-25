import React from "react";
import { DatePicker, Space } from "antd";
import dayjs from "dayjs";
import "./commonstyles.css";

export default function CommonDatePicker({
  onChange,
  value,
  defaultValue,
  month,
  placeholder,
  label,
  error,
  mandatory,
  style,
  disabled,
  allowClear,
  width,
  height,
  labelFontSize,
}) {
  const handleChange = (date) => {
    if (date) {
      const dates = new Date(date.$d);

      // Format the date using toString method
      const formattedDate = dates.toString();
      onChange(formattedDate);
    } else {
      onChange(null);
    }
  };

  // Disable future dates
  const disableFutureDates = (current) => {
    return current && current > dayjs().endOf("day"); // Disable dates greater than today
  };

  const fontSizeClass = labelFontSize
    ? `datepicker-fontsize-${labelFontSize.replace("px", "")}`
    : "";

  return (
    <div style={style} className={fontSizeClass}>
      {labelFontSize && (
        <style>{`
          .${fontSizeClass} .ant-picker .ant-picker-input > input::placeholder {
            font-size: ${labelFontSize} !important;
          }
          .${fontSizeClass} .ant-picker .ant-picker-input > input {
            font-size: ${labelFontSize} !important;
          }
          .${fontSizeClass} .ant-picker .ant-picker-suffix {
            font-size: ${labelFontSize} !important;
            display: flex;
            align-items: center;
          }
        `}</style>
      )}
      {/* <Space direction="vertical"> */}
      <DatePicker
        className={
          error === "" || error === null || error === undefined
            ? "common_singledatepicker"
            : "common_singledatepicker_error"
        }
        picker={month === "true" ? "month" : "date"}
        onChange={handleChange}
        value={value ? dayjs(value) : null}
        defaultValue={defaultValue}
        format="DD-MM-YYYY"
        placeholder={placeholder}
        status={error ? "error" : ""}
        style={{
          width: "100%",
          height: height ? height : "40px",
        }}
        allowClear={allowClear}
        disabledDate={disableFutureDates}
        disabled={disabled}
      />
      {/* </Space> */}
      {error && (
        <div
          className={
            error
              ? "commoninput_errormessage_activediv"
              : "commoninput_errormessagediv"
          }
        >
          <p className="common_singledatepicker_errortext">
            {placeholder + error}
          </p>
        </div>
      )}
    </div>
  );
}
