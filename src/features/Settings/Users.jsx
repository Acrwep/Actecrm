import React, { useState } from "react";
import { Row, Col, Drawer } from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CiSearch } from "react-icons/ci";
import CommonSelectField from "../Common/CommonSelectField";
import CommonTable from "../Common/CommonTable";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import "./styles.css";
import CommonInputField from "../Common/CommonInputField";
import { FiEyeOff, FiEye } from "react-icons/fi";
import { passwordValidator } from "../Common/Validation";

export default function Users() {
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const departmentOptions = [
    { id: 1, name: "All" },
    { id: 2, name: "Admin" },
  ];
  const [department, setDepartment] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const columns = [
    { title: "User Name", key: "username", dataIndex: "username" },
    { title: "Profile Name", key: "profilename", dataIndex: "profilename" },
    { title: "Department", key: "department", dataIndex: "department" },
    { title: "Pre QA", key: "preqa", dataIndex: "preqa" },
    { title: "RA", key: "ra", dataIndex: "ra" },
    { title: "HR", key: "hr", dataIndex: "hr" },
    { title: "Post RA", key: "postra", dataIndex: "postra" },

    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            <AiOutlineEdit size={20} className="trainers_action_icons" />
            <RiDeleteBinLine
              size={19}
              color="#d32f2f"
              className="trainers_action_icons"
            />
          </div>
        );
      },
    },
  ];

  const usersData = [
    {
      id: 1,
      username: "Balaji",
      profilename: "Balaji",
      department: "Admin",
      preqa: "7004",
      ra: "5005",
      hr: "8009",
      postra: "800",
    },
  ];

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
            <CommonSelectField
              label="Select"
              height="39px"
              style={{ width: "36%" }}
              labelFontSize="12px"
              options={departmentOptions}
              value={department}
              labelMarginTop="-1px"
              valueMarginTop="-6px"
              downArrowIconTop="43%"
              fontSize="13px"
              onChange={(e) => {
                setDepartment(e.target.value);
              }}
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
            Add User
          </button>
        </Col>
      </Row>
      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 800 }}
          columns={columns}
          dataSource={usersData}
          dataPerPage={10}
          // loading={tableLoading}
          checkBox="false"
          size="small"
          className="questionupload_table"
        />
      </div>

      <Drawer
        title="Add User"
        open={isOpenAddDrawer}
        onClose={formReset}
        width="38%"
        style={{ position: "relative" }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <CommonInputField label="User Id" required={true} />
          </Col>
          <Col span={12}>
            <CommonInputField label="Profile Name" required={true} />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={12}>
            <CommonSelectField label="Position" required={true} />
          </Col>
          <Col span={12}>
            <CommonSelectField label="Associate Role" required={true} />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={12}>
            <CommonSelectField label="Manager" required={true} />
          </Col>
          <Col span={12}>
            <CommonOutlinedInput
              label="Password"
              type={showPassword ? "text" : "password"}
              icon={
                <>
                  {showPassword ? (
                    <FiEye
                      size={18}
                      color="gray"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  ) : (
                    <FiEyeOff
                      size={18}
                      color="gray"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  )}
                </>
              }
              onChange={(e) => {
                setPassword(e.target.value);
                // setPasswordError(passwordValidator(e.target.value));
              }}
              value={password}
              //   error={passwordError}
              helperTextContainerStyle={{
                position: "absolute",
                bottom: "-21px",
                width: "100%",
              }}
            />
          </Col>
        </Row>

        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            <button className="users_adddrawer_createbutton">Create</button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
