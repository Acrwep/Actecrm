import React from "react";
import { Select, Checkbox } from "antd";
import "./commonstyles.css";
import { IoCaretDownSharp } from "react-icons/io5";

export default function CommonAntdMultiSelect({
  options,
  label,
  mandatory,
  onChange,
  value,
  error,
  disabled,
  loading,
  placeholder,
  defaultValue,
  allSelectLabel = "All",
}) {
  const allValues = options.map(
    (item) => item.user_id ?? item.role_id ?? item.id
  );

  const handleChange = (selectedValues) => {
    if (selectedValues.includes("all")) {
      const allSelected = allValues.every((val) => value.includes(val));
      onChange(allSelected ? [] : allValues);
    } else {
      onChange(selectedValues);
    }
  };

  // Determine if "All" should be checked
  const isAllSelected =
    allValues.every((val) => value.includes(val)) && value.length > 0;

  return (
    <div style={{ position: "relative" }}>
      {label && (
        <div style={{ display: "flex", position: "relative" }}>
          <label className="commonantdmultiselect_label">{label}</label>
          {mandatory && <p className="commonfield_asterisk">*</p>}
        </div>
      )}

      <Select
        className={
          !error
            ? "commonMultiselectfield"
            : "common_antdmultiselectfield_error"
        }
        style={{ width: "100%" }}
        suffixIcon={<IoCaretDownSharp color="rgba(0,0,0,0.54)" />}
        mode="multiple"
        placeholder={placeholder}
        disabled={disabled}
        allowClear
        showSearch
        value={value} // Only real selected values
        defaultValue={defaultValue}
        loading={loading}
        onChange={handleChange}
        status={error ? "error" : ""}
        optionLabelProp="label"
        filterOption={(input, option) =>
          option.label.toLowerCase().includes(input.toLowerCase())
        }
        dropdownRender={(menu) => menu} // keep default dropdown
      >
        {/* All Select Option */}
        <Select.Option key="all" value="all" label={allSelectLabel}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              checked={isAllSelected}
              style={{ marginRight: 8 }}
              onChange={() => {
                handleChange(["all"]);
              }}
            />
            {allSelectLabel}
          </div>
        </Select.Option>

        {/* Normal Options */}
        {options.map((item) => {
          const itemValue = item.user_id ?? item.role_id ?? item.id;
          const itemLabel = item.user_name
            ? `${item.user_id} - ${item.user_name}`
            : item.role_name ?? item.name;

          return (
            <Select.Option key={itemValue} value={itemValue} label={itemLabel}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  textWrap: "wrap",
                }}
              >
                <Checkbox
                  checked={value.includes(itemValue)}
                  style={{ marginRight: 8 }}
                  className="common_antdmultiselect_checkbox"
                />
                {itemLabel}
              </div>
            </Select.Option>
          );
        })}
      </Select>

      {error && (
        <div
          className={
            error
              ? "commoninput_errormessage_activediv"
              : "commoninput_errormessagediv"
          }
        >
          <p className="commonantdmultifield_errortext">
            {label ? label + error : error}
          </p>
        </div>
      )}
    </div>
  );
}
