import React, { useState, useEffect } from "react";
import { Row, Col, Drawer, Flex, Tooltip, Button, Radio, Modal } from "antd";
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
  selectValidator,
  userIdValidator,
} from "../Common/Validation";
import { createUser, getUsers, updateUser } from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSpinner from "../Common/CommonSpinner";
import { useDispatch, useSelector } from "react-redux";
import { storeAllUsersList, storeUsersList } from "../Redux/Slice";
import { IoFilter } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";
import CommonMultiSelect from "../Common/CommonMultiSelect";
import { PiUserCirclePlus } from "react-icons/pi";
import CommonAntdMultiSelect from "../Common/CommonAntMultiSelect";

export default function Users({ userTableLoading, setUserTableLoading }) {
  const dispatch = useDispatch();
  const usersData = useSelector((state) => state.userslist);
  const allUsersData = useSelector((state) => state.alluserslist);
  const rolesData = useSelector((state) => state.rolelist);
  //permissions
  const permissions = useSelector((state) => state.userpermissions);

  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const departmentOptions = [
    { id: 1, name: "All" },
    { id: 2, name: "Admin" },
  ];
  const [department, setDepartment] = useState(1);
  const [assignUsersData, setAssignUsersData] = useState(allUsersData);
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
  const [childUsers, setChildUsers] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [userRolesError, setUserRolesError] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  // const [usersData, setUsersData] = useState([]);
  const [editUserId, setEditUserId] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState(1);
  const [isOpenRoleModal, setIsOpenRoleModal] = useState(false);

  const columns = [
    { title: "User Id", key: "user_id", dataIndex: "user_id" },
    {
      title: "Profile Name",
      key: "user_name",
      dataIndex: "user_name",
      width: 180,
    },
    { title: "Password", key: "password", dataIndex: "password" },
    {
      title: "Assigned Users",
      key: "child_users",
      dataIndex: "child_users",
      width: 180,
      render: (text, record) => {
        const childUsers = record.child_users || [];

        // Short inline text for display
        const shortText = childUsers.map((u) => u.user_name).join(", ");

        // Numbered multiline text for tooltip
        const longText = childUsers
          .map((user, index) => `${index + 1}. ${user.user_name}`)
          .join("\n");

        // Only show tooltip if text is long
        const isLong = shortText.length > 25;

        return (
          <>
            {isLong ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={
                  <div
                    style={{
                      maxHeight: "140px",
                      overflowY: "auto",
                      whiteSpace: "pre-line",
                      lineHeight: "26px",
                    }}
                  >
                    {longText}
                  </div>
                }
                className="leadtable_comments_tooltip"
                styles={{
                  body: {
                    backgroundColor: "#fff",
                    color: "#333",
                    fontWeight: 500,
                    fontSize: "13px",
                  },
                }}
              >
                <p
                  style={{
                    cursor: "pointer",
                    marginBottom: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {shortText.slice(0, 20) + "..."}
                </p>
              </Tooltip>
            ) : (
              <p style={{ marginBottom: 0 }}>{shortText}</p>
            )}
          </>
        );
      },
    },
    {
      title: "Roles",
      key: "roles",
      dataIndex: "roles",
      width: 160,
      render: (text, record) => {
        const roles = record.roles || [];

        // Short inline text for display
        const shortText = roles.map((r) => r.role_name).join(", ");

        // Numbered multiline text for tooltip
        const longText = roles
          .map((user, index) => `${index + 1}. ${user.role_name}`)
          .join("\n");

        // Only show tooltip if text is long
        const isLong = shortText.length > 25;

        return (
          <>
            {isLong ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={
                  <div
                    style={{
                      maxHeight: "140px",
                      overflowY: "auto",
                      whiteSpace: "pre-line",
                      lineHeight: "26px",
                    }}
                  >
                    {longText}
                  </div>
                }
                className="leadtable_comments_tooltip"
                styles={{
                  body: {
                    backgroundColor: "#fff",
                    color: "#333",
                    fontWeight: 500,
                    fontSize: "13px",
                  },
                }}
              >
                <p
                  style={{
                    cursor: "pointer",
                    marginBottom: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {shortText.slice(0, 20) + "..."}
                </p>
              </Tooltip>
            ) : (
              <p style={{ marginBottom: 0 }}>{shortText}</p>
            )}
          </>
        );
      },
    },
    {
      title: "Status",
      key: "is_active",
      dataIndex: "is_active",
      width: 140,
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
      width: 130,
      hidden: !["Update User", "Delete User"].some((p) =>
        permissions.includes(p)
      ),
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            {permissions.includes("Update User") && (
              <AiOutlineEdit
                size={20}
                className="trainers_action_icons"
                onClick={() => handleEdit(record)}
              />
            )}

            {permissions.includes("Delete User") && (
              <RiDeleteBinLine color="#d32f2f" size={19} />
            )}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    setAssignUsersData(allUsersData);
  }, [allUsersData]);

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

  const getAllUsersData = async () => {
    try {
      const response = await getUsers();
      dispatch(storeAllUsersList(response?.data?.data || []));
    } catch (error) {
      dispatch(storeAllUsersList([]));
      console.log(error);
    }
  };

  const handleEdit = (item) => {
    console.log("clicked user", item);
    setEditUserId(item.id);
    setUserId(item.user_id);
    setProfileName(item.user_name);
    setPassword(item.password);
    setConfirmPassword(item.password);
    const alterUserData = allUsersData.filter((f) => f.id != item.id);
    setAssignUsersData(alterUserData);

    if (item.child_users.length >= 1) {
      const alterChildUsers = item.child_users.map((c) => {
        return c.user_id;
      });
      setChildUsers(alterChildUsers);
    } else {
      setChildUsers([]);
    }

    if (item.roles.length >= 1) {
      const alterRoles = item.roles.map((r) => {
        return r.role_id;
      });
      setUserRoles(alterRoles);
    } else {
      setUserRoles([]);
    }
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
    setAssignUsersData(allUsersData);
    setChildUsers([]);
    setUserRoles([]);
    setUserRolesError("");
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
    const userRolesValidate = selectValidator(userRoles);

    setUserIdError(userIdValidate);
    setProfileNameError(profileNameValidate);
    setPasswordError(passwordValidate);
    setConfirmPasswordError(confirmPasswordValidate);
    setUserRolesError(userRolesValidate);

    if (
      userIdValidate ||
      profileNameValidate ||
      passwordValidate ||
      confirmPasswordValidate ||
      userRolesValidate
    )
      return;
    setButtonLoading(true);

    const uniqueUsers = new Map();

    allUsersData.forEach((user) => {
      // check top level user
      if (childUsers.includes(user.user_id)) {
        uniqueUsers.set(user.user_id, {
          user_id: user.user_id,
          user_name: user.user_name,
        });
      }

      // check child users
      user.child_users.forEach((child) => {
        if (childUsers.includes(child.user_id)) {
          uniqueUsers.set(child.user_id, {
            user_id: child.user_id,
            user_name: child.user_name,
          });
        }
      });
    });

    const matchedUsers = Array.from(uniqueUsers.values());
    console.log(matchedUsers);

    const uniqueRoles = new Map();

    rolesData.forEach((role) => {
      // Check top level role
      if (userRoles.includes(role.role_id)) {
        uniqueRoles.set(role.role_id, {
          role_id: role.role_id,
          role_name: role.role_name,
        });
      }

      // Check child users if exists
      if (Array.isArray(role.child_users)) {
        role.child_users.forEach((child) => {
          if (childUsers.includes(child.role_id)) {
            uniqueRoles.set(child.role_id, {
              role_id: child.role_id,
              role_name: child.role_name,
            });
          }
        });
      }
    });

    const matchedRoles = Array.from(uniqueRoles.values());
    console.log(matchedRoles);

    const payload = {
      ...(editUserId && { id: editUserId }),
      user_id: userId,
      user_name: profileName,
      password: password,
      users: matchedUsers,
      roles: matchedRoles,
    };

    if (editUserId) {
      try {
        const response = await updateUser(payload);
        console.log(response);
        CommonMessage("success", "User Updated");
        setTimeout(() => {
          getUsersData(searchValue);
          getAllUsersData();
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
          getUsersData(searchValue);
          getAllUsersData();
          formReset();
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
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
          {permissions.includes("Add User") && (
            <button
              className="leadmanager_addleadbutton"
              onClick={() => {
                setIsOpenAddDrawer(true);
              }}
            >
              Add User
            </button>
          )}
        </Col>
      </Row>
      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 1000 }}
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
              disabled={editUserId ? true : false}
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
              errorFontSize="10px"
              helperTextContainerStyle={{
                position: "absolute",
                bottom: "-18px",
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
              errorFontSize="10px"
              helperTextContainerStyle={{
                position: "absolute",
                bottom: "0px",
                width: "100%",
              }}
            />{" "}
          </Col>
        </Row>

        <Row
          gutter={16}
          style={{
            marginTop: passwordError || confirmPasswordError ? "38px" : "20px",
          }}
        >
          <Col span={12}>
            {/* <CommonMultiSelect
              label="Assign Users"
              dontallowFreeSolo={true}
              options={assignUsersData}
              onChange={(e, selectedValues) => {
                setChildUsers(selectedValues);
              }}
              value={childUsers}
              checkBox={true}
              height="46px"
            /> */}
            <CommonAntdMultiSelect
              label="Assign Users"
              options={assignUsersData}
              onChange={(value) => {
                setChildUsers(value);
              }}
              value={childUsers}
              error=""
            />
          </Col>
          <Col span={12}>
            {/* <CommonMultiSelect
              label="Roles"
              dontallowFreeSolo={true}
              options={rolesData}
              onChange={(e, selectedValues) => {
                setUserRoles(selectedValues);
                if (validationTrigger) {
                  setUserRolesError(selectValidator(selectedValues));
                }
              }}
              value={userRoles}
              error={userRolesError}
            /> */}
            <CommonAntdMultiSelect
              label="Roles"
              options={rolesData}
              onChange={(value) => {
                setUserRoles(value);
                if (validationTrigger) {
                  setUserRolesError(selectValidator(value));
                }
              }}
              value={userRoles}
              error={userRolesError}
            />
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

      <Modal
        title="Assign Users and Role"
        open={isOpenRoleModal}
        onCancel={() => setIsOpenRoleModal(false)}
        footer={false}
        width="35%"
      ></Modal>
    </div>
  );
}
