import React, { useState, useEffect } from "react";

export default function WorkSheet() {
  const [formFields, setFormFields] = React.useState([{ name: "", age: "" }]);
  //timer
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const addFormFields = () => {
    const obj = { name: "", age: "" };

    setFormFields([...formFields, obj]);
  };

  const handleFormFields = (index, field, value) => {
    const updateFormFields = [...formFields];
    updateFormFields[index][field] = value;
    setFormFields(updateFormFields);
  };

  const deleteFormFields = (index) => {
    if (formFields.length >= 2) {
      let data = [...formFields];
      data.splice(index, 1);
      setFormFields(data);
    }
  };

  return (
    <div>
      <div style={{ width: "50%" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <p>Dynamic Form</p>
          <button onClick={addFormFields}>Add</button>
        </div>

        {formFields.map((item, index) => {
          return (
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <input
                placeholder="Name"
                onChange={(e) => {
                  handleFormFields(index, "name", e.target.value);
                }}
                value={item.name}
              />
              <input
                placeholder="Age"
                onChange={(e) => {
                  handleFormFields(index, "age", e.target.value);
                }}
                value={item.age}
              />
              <button
                onClick={() => {
                  deleteFormFields(index);
                }}
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>

      <div>
        <h2>{seconds}</h2>

        <button onClick={() => setRunning(true)}>Start</button>
        <button onClick={() => setRunning(false)}>Stop</button>
        <button
          onClick={() => {
            setRunning(false);
            setSeconds(0);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
