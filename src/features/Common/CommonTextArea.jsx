import React, { useRef, useLayoutEffect } from "react";
import { Input } from "antd";
import { capitalizeWords } from "./Validation";
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
  disabled = false,
}) => {
  const textAreaRef = useRef(null);
  const cursorRef = useRef(null);

  const handleChange = (e) => {
    const { selectionStart, selectionEnd, value: rawValue } = e.target;
    // Store cursor position
    cursorRef.current = { start: selectionStart, end: selectionEnd };

    const newValue = capitalizeWords(rawValue);

    if (onChange) {
      // pass transformed value to parent
      onChange({ target: { value: newValue } });
    }
  };

  useLayoutEffect(() => {
    if (textAreaRef.current && cursorRef.current) {
      const { start, end } = cursorRef.current;
      // Get the native textarea element from Ant Design's TextArea
      const nativeTextArea = textAreaRef.current.resizableTextArea?.textArea;
      if (nativeTextArea) {
        nativeTextArea.setSelectionRange(start, end);
        cursorRef.current = null; // Clear after restoring
      }
    }
  }, [value]);

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
        ref={textAreaRef}
        rows={4}
        placeholder="Type here..."
        onChange={handleChange}
        value={value}
        status={error ? "error" : ""}
        maxLength={maxLength}
        disabled={disabled}
        className={`${
          !error ? "commontextarea" : "commontextarea_error"
        } ${className || ""}`}
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
