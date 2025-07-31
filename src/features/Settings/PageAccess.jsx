import React, { useState } from "react";
import { Row, Col, Drawer } from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CiSearch } from "react-icons/ci";
import "./styles.css";
import CommonInputField from "../Common/CommonInputField";
import CommonMultiSelect from "../Common/CommonMultiSelect";
import CommonOptionsMultiSelect from "../Common/CommonOptionsMultiSelect";

export default function PageAccess() {
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const columns = [
    { title: "Group Name", key: "groupname", dataIndex: "groupname" },
    { title: "Users", key: "users", dataIndex: "users" },
    { title: "Access", key: "access", dataIndex: "access" },
  ];
  const groupData = [{ id: 1, groupname: "Sale", access: "test" }];

  const formReset = () => {
    setIsOpenAddDrawer(false);
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="leadmanager_filterContainer">
            <CommonOutlinedInput
              label="Search"
              width="40%"
              height="33px"
              labelFontSize="12px"
              icon={<CiSearch size={16} />}
              labelMarginTop="-1px"
            />
          </div>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={12}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <button
            className="leadmanager_addleadbutton"
            onClick={() => {
              setIsOpenAddDrawer(true);
            }}
          >
            Add Group
          </button>
        </Col>
      </Row>

      <Row gutter={24} style={{ marginTop: "20px" }}>
        <Col span={8}>
          <div
            className="settings_groupcard"
            style={{ borderLeft: "3px solid #753f2f" }}
          >
            <div style={{ display: "flex", gap: "16px" }}>
              <div
                className="groupname_container"
                style={{ backgroundColor: "#f2d5cd", color: "#753f2f" }}
              >
                <p>VK</p>
              </div>

              <div className="settings_group_contentContainer">
                <p>
                  Group Name: <span style={{ fontWeight: 600 }}>Test</span>
                </p>
                <p>
                  Users: <span style={{ fontWeight: 600 }}>5</span>
                </p>
              </div>
            </div>

            <div className="settings_groupcard_footer_container">
              <button className="settings_group_footer_buttons">
                View Users
              </button>
              <button className="settings_group_footer_buttons">
                View Permission
              </button>{" "}
            </div>
          </div>
        </Col>
        <Col span={8}>
          <div
            className="settings_groupcard"
            style={{ borderLeft: "3px solid #2c2653" }}
          >
            <div style={{ display: "flex", gap: "16px" }}>
              <div
                className="groupname_container"
                style={{ backgroundColor: "#d6d4e9", color: "#2c2653" }}
              >
                <p>BJ</p>
              </div>

              <div className="settings_group_contentContainer">
                <p>
                  Group Name: <span style={{ fontWeight: 600 }}>Test</span>
                </p>
                <p>
                  Users: <span style={{ fontWeight: 600 }}>5</span>
                </p>
              </div>
            </div>

            <div className="settings_groupcard_footer_container">
              <button className="settings_group_footer_buttons">
                View Users
              </button>
              <button className="settings_group_footer_buttons">
                View Permission
              </button>{" "}
            </div>
          </div>
        </Col>

        <Col span={8}>
          <div
            className="settings_groupcard"
            style={{ borderLeft: "3px solid #2b4651" }}
          >
            <div style={{ display: "flex", gap: "16px" }}>
              <div
                className="groupname_container"
                style={{ backgroundColor: "#d6e3e9", color: "#2b4651" }}
              >
                <p>ST</p>
              </div>

              <div className="settings_group_contentContainer">
                <p>
                  Group Name: <span style={{ fontWeight: 600 }}>Test</span>
                </p>
                <p>
                  Users: <span style={{ fontWeight: 600 }}>5</span>
                </p>
              </div>
            </div>

            <div className="settings_groupcard_footer_container">
              <button className="settings_group_footer_buttons">
                View Users
              </button>
              <button className="settings_group_footer_buttons">
                View Permission
              </button>{" "}
            </div>
          </div>
        </Col>
      </Row>

      {/* add group drawer */}
      <Drawer
        title="Add Group"
        open={isOpenAddDrawer}
        onClose={formReset}
        width="38%"
        style={{ position: "relative" }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <CommonInputField label="Name" required={true} />
          </Col>
          <Col span={12}>
            <CommonOptionsMultiSelect
              label="Users"
              required={true}
              options={[{ id: 1, title: "Balaji" }]}
            />
          </Col>
        </Row>

        <p className="settings_permission_heading">Permission</p>
      </Drawer>
    </div>
  );
}
