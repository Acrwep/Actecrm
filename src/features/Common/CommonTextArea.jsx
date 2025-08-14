import React from "react";
import { Input } from "antd";
import "./commonstyles.css";

const { TextArea } = Input;

const CommonTextArea = ({
  label,
  onChange,
  value,
  error,
  maxLength,
  required,
  className,
  style,
}) => {
  return (
    <div style={style}>
      <div style={{ display: "flex" }}>
        <label className="commontextarea_label">{label}</label>
        {required ? (
          <p style={{ color: "#d32f2f", marginLeft: "4px" }}>*</p>
        ) : (
          ""
        )}
      </div>
      <TextArea
        rows={4}
        placeholder="Type here..."
        onChange={onChange}
        value={value}
        error={error}
        status={error ? "error" : ""}
        maxLength={maxLength}
        className={`${
          error === "" || error === null || error === undefined
            ? "commontextarea"
            : "commontextarea_error"
        } ${className}`}
      />
      {error && (
        <div
          className={
            error
              ? "commontextarea_errormessage_activediv"
              : "commontextarea_errormessagediv"
          }
        >
          <p style={{ color: "#d32f2f", marginTop: "2px" }}>{label + error}</p>
        </div>
      )}
    </div>
  );
};
export default CommonTextArea;
