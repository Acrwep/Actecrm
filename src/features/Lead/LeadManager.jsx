import React, { useState } from "react";
import { Col, Row, Drawer } from "antd";
import { TextField } from "@mui/material";
import "./styles.css";
import CommonInputField from "../Common/CommonInputField";
import { nameValidator } from "../Common/Validation";

export default function LeadManager() {
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  const formReset = () => {
    setIsOpenAddDrawer(false);
    setName("");
    setNameError("");
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12}></Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={12}
          style={{ display: "flex", justifyContent: "flex-end" }}
        >
          <button
            className="leadmanager_addleadbutton"
            onClick={() => {
              setIsOpenAddDrawer(true);
            }}
          >
            Add Lead
          </button>
        </Col>
      </Row>

      <Drawer
        title="Add Lead"
        open={isOpenAddDrawer}
        onClose={formReset}
        width="45%"
      >
        <CommonInputField
          label="Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameError(nameValidator(e.target.value));
          }}
          error={nameError}
        />
      </Drawer>
    </div>
  );
}
