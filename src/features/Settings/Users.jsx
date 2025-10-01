import React, { useState, useEffect } from "react";
import { Row, Col, Drawer, Flex, Tooltip, Button, Radio } from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CiSearch } from "react-icons/ci";
import CommonSelectField from "../Common/CommonSelectField";
import CommonTable from "../Common/CommonTable";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import "./styles.css";
import CommonInputField from "../Common/CommonInputField";
import { FiEyeOff, FiEye } from "react-icons/fi";
import {
  addressValidator,
  confirmPasswordValidator,
  nameValidator,
  passwordValidator,
  userIdValidator,
} from "../Common/Validation";
import { createUser, getUsers, updateUser } from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import { useDispatch, useSelector } from "react-redux";
import { storeUsersList } from "../Redux/Slice";
import { IoFilter } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";

export default function Users({ userTableLoading, setUserTableLoading }) {
  const dispatch = useDispatch();
  const usersData = useSelector((state) => state.userslist);

  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const departmentOptions = [
    { id: 1, name: "All" },
    { id: 2, name: "Admin" },
  ];
  const [department, setDepartment] = useState(1);
  const [userId, setUserId] = useState("");
  const [userIdError, setUserIdError] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileNameError, setProfileNameError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  // const [usersData, setUsersData] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState(1);

  const columns = [
    { title: "User Id", key: "user_id", dataIndex: "user_id" },
    { title: "Profile Name", key: "user_name", dataIndex: "user_name" },
    { title: "Password", key: "password", dataIndex: "password" },
    {
      title: "Status",
      key: "is_active",
      dataIndex: "is_active",
      render: (text, record) => {
        return (
          <div>
            <p>{text === 1 ? "Active" : "Inactive"}</p>
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            <AiOutlineEdit
              size={20}
              className="trainers_action_icons"
              onClick={() => handleEdit(record)}
            />
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
  const getUsersData = async (searchvalue) => {
    setUserTableLoading(true);
    const payload = {
      ...(searchvalue && filterType === 1
        ? { user_name: searchvalue }
        : searchvalue && filterType === 2
        ? { user_id: searchvalue }
        : {}),
    };
    try {
      const response = await getUsers(payload);
      console.log("users response", response);
      dispatch(storeUsersList(response?.data?.data || []));
    } catch (error) {
      dispatch(storeUsersList([]));
      console.log(error);
    } finally {
      setTimeout(() => {
        setUserTableLoading(false);
      }, 300);
    }
  };

  const handleEdit = (item) => {
    console.log("clicked user", item);
    setEditUserId(item.id);
    setUserId(item.user_id);
    setProfileName(item.user_name);
    setPassword(item.password);
    setConfirmPassword(item.password);
    setIsOpenAddDrawer(true);
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setTimeout(() => {
      getUsersData(e.target.value);
    }, 300);
  };

  const formReset = () => {
    setIsOpenAddDrawer(false);
    setUserId("");
    setUserIdError("");
    setProfileName("");
    setProfileNameError("");
    setPassword("");
    setPasswordError("");
    setConfirmPassword("");
    setConfirmPasswordError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setValidationTrigger(false);
    setButtonLoading(false);
    setEditUserId(null);
  };

  const handleSubmit = async () => {
    setValidationTrigger(true);
    const userIdValidate = addressValidator(userId);
    const profileNameValidate = nameValidator(profileName);
    const passwordValidate = passwordValidator(password);
    const confirmPasswordValidate = confirmPasswordValidator(
      password,
      confirmPassword
    );

    setUserIdError(userIdValidate);
    setProfileNameError(profileNameValidate);
    setPasswordError(passwordValidate);
    setConfirmPasswordError(confirmPasswordValidate);

    if (
      userIdValidate ||
      profileNameValidate ||
      passwordValidate ||
      confirmPasswordValidate
    )
      return;
    setButtonLoading(true);

    const payload = {
      ...(editUserId && { id: editUserId }),
      user_id: userId,
      user_name: profileName,
      password: password,
    };

    if (editUserId) {
      try {
        const response = await updateUser(payload);
        console.log(response);
        CommonMessage("success", "User Updated");
        setTimeout(() => {
          getUsersData();
          formReset();
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.message ||
            "Something went wrong. Try again later"
        );
      }
    } else {
      try {
        const response = await createUser(payload);
        console.log(response);
        CommonMessage("success", "User Created");
        setTimeout(() => {
          getUsersData();
          formReset();
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.message ||
            "Something went wrong. Try again later"
        );
      }
    }
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12}>
          <div
            className="leadmanager_filterContainer"
            style={{ position: "relative" }}
          >
            <CommonOutlinedInput
              label={filterType === 1 ? "Search By Name" : "Search By User Id"}
              width="40%"
              height="33px"
              labelFontSize="12px"
              icon={
                searchValue ? (
                  <div
                    className="users_filter_closeIconContainer"
                    onClick={() => {
                      setSearchValue("");
                      getUsersData(null);
                    }}
                  >
                    <IoIosClose size={11} />
                  </div>
                ) : (
                  <CiSearch size={16} />
                )
              }
              labelMarginTop="-1px"
              style={{
                borderTopRightRadius: "0px",
                borderBottomRightRadius: "0px",
              }}
              onChange={handleSearch}
              value={searchValue}
            />
            <div className="users_filterContainer">
              <Flex
                justify="center"
                align="center"
                style={{ whiteSpace: "nowrap" }}
              >
                <Tooltip
                  placement="bottomLeft"
                  color="#fff"
                  title={
                    <Radio.Group
                      value={filterType}
                      onChange={(e) => {
                        console.log(e.target.value);
                        setFilterType(e.target.value);
                        if (searchValue === "") {
                          return;
                        } else {
                          setSearchValue("");
                          getUsersData(null);
                        }
                      }}
                    >
                      <Radio
                        value={1}
                        style={{ marginTop: "6px", marginBottom: "12px" }}
                      >
                        Search by Name
                      </Radio>
                      <Radio value={2} style={{ marginBottom: "6px" }}>
                        Search by User Id
                      </Radio>
                    </Radio.Group>
                  }
                >
                  <Button className="users_filterbutton">
                    <IoFilter size={18} />
                  </Button>
                </Tooltip>
              </Flex>
            </div>
            {/* <CommonSelectField
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
            /> */}
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
          loading={userTableLoading}
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
            <CommonInputField
              label="User Id"
              required={true}
              onChange={(e) => {
                setUserId(e.target.value);
                if (validationTrigger) {
                  setUserIdError(addressValidator(e.target.value));
                }
              }}
              value={userId}
              error={userIdError}
            />
          </Col>
          <Col span={12}>
            <CommonInputField
              label="Profile Name"
              required={true}
              onChange={(e) => {
                setProfileName(e.target.value);
                if (validationTrigger) {
                  setProfileNameError(nameValidator(e.target.value));
                }
              }}
              value={profileName}
              error={profileNameError}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={12}>
            <CommonOutlinedInput
              label="Password"
              type={showPassword ? "text" : "password"}
              required={true}
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
                if (validationTrigger) {
                  setPasswordError(passwordValidator(e.target.value));
                  setConfirmPasswordError(
                    confirmPasswordValidator(e.target.value, confirmPassword)
                  );
                }
              }}
              value={password}
              error={passwordError}
              helperTextContainerStyle={{
                position: "absolute",
                bottom: "-21px",
                width: "100%",
              }}
            />
          </Col>

          <Col span={12}>
            <CommonOutlinedInput
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              required={true}
              icon={
                <>
                  {showConfirmPassword ? (
                    <FiEye
                      size={18}
                      color="gray"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    />
                  ) : (
                    <FiEyeOff
                      size={18}
                      color="gray"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    />
                  )}
                </>
              }
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (validationTrigger) {
                  setConfirmPasswordError(
                    confirmPasswordValidator(password, e.target.value)
                  );
                }
              }}
              value={confirmPassword}
              error={confirmPasswordError}
              helperTextContainerStyle={{
                position: "absolute",
                bottom:
                  confirmPasswordError === " is required" ? "0px" : "-21px",
                width: "100%",
              }}
            />{" "}
          </Col>
        </Row>

        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            {buttonLoading ? (
              <button className="users_adddrawer_loadingcreatebutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="users_adddrawer_createbutton"
                onClick={handleSubmit}
              >
                {editUserId ? "Update" : "Create"}
              </button>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
