import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Drawer,
  Checkbox,
  Modal,
  Divider,
  Button,
  Skeleton,
} from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CiSearch } from "react-icons/ci";
import CommonInputField from "../Common/CommonInputField";
import CommonOptionsMultiSelect from "../Common/CommonOptionsMultiSelect";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import { addressValidator } from "../Common/Validation";
import CommonTextArea from "../Common/CommonTextArea";
import CommonSpinner from "../Common/CommonSpinner";
import {
  deleteGroup,
  deleteRole,
  getGroups,
  getRoles,
  insertGroup,
  insertRole,
  updateGroup,
  updateRole,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { storeGroupList, storeRoleList } from "../Redux/Slice";
import CommonDeleteModal from "../Common/CommonDeleteModal";

export default function PageAccess({
  groupLoading,
  setGroupLoading,
  roleLoading,
  setRoleLoading,
}) {
  const dispatch = useDispatch();
  const groupsData = useSelector((state) => state.grouplist);
  const rolesData = useSelector((state) => state.rolelist);

  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [isOpenUserModal, setIsOpenUserModal] = useState(false);
  //group usestates
  const [isOpenAddGroupModal, setIsOpenAddGroupModal] = useState(false);
  const [groupId, setGroupId] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [groupNameError, setGroupNameError] = useState("");
  const [description, setDescription] = useState("");
  const [groupFormLoading, setGroupFormLoading] = useState(false);
  const [isOpenGroupDeleteModal, setIsOpenGroupDeleteModal] = useState(false);
  //roles usestates
  const [isOpenAddRoleModal, setIsOpenAddRoleModal] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [roleName, setRoleName] = useState("");
  const [roleNameError, setRoleNameError] = useState("");
  const [roleFormLoading, setRoleFormLoading] = useState(false);
  const [isOpenRoleDeleteModal, setIsOpenRoleDeleteModal] = useState(false);
  //
  const usertableColumns = [
    { title: "Name", key: "name", dataIndex: "name" },
    { title: "Email", key: "email", dataIndex: "email", width: 190 },
    { title: "Mobile", key: "mobile", dataIndex: "mobile" },
    { title: "Fees", key: "fees", dataIndex: "fees" },
    { title: "Balance", key: "balance", dataIndex: "balance" },
  ];

  const usersData = [
    {
      id: 1,
      name: "Balaji",
      email: "balaji@gmail.com",
      mobile: "9787564545",
      fees: "12000",
      balance: "3000",
    },
  ];

  //group color functions
  const getInitials = (fullName) => {
    const nameArray = fullName.split(" ");
    if (nameArray.length >= 2) {
      const firstLetter = nameArray[0].charAt(0);
      const secondLetter = nameArray[1].charAt(0);
      return `${firstLetter}${secondLetter}`;
    } else {
      return `${fullName.charAt(0)}${fullName.charAt(fullName.length - 1)}`; // Use the first letter if no space is found
    }
  };

  const getColorForName = (name) => {
    const colors = [
      "#DBA6D1",
      "#A6DBC1",
      "#A6AADB",
      "#D6DBA6",
      "#8ED1FC",
      "#EEB39C",
      "#CDB2FD",
      "#DBA6AA",
      "#B0DBA6",
      "#DBCCA6",
      "#D7DBA6",
      "#AADBA6",
      "#AFECE7",
      "#E6B4A4",
      "#E0A1B1",
      "#B8D5E2",
    ];
    const nameHash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[nameHash % colors.length];
  };

  const getVeryDarkTextColor = (backgroundColor) => {
    const subtractionValue = 120; // Adjust as needed
    const HEX_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    const match = backgroundColor.match(HEX_REGEX);
    if (match) {
      const r = Math.max(0, parseInt(match[1], 16) - subtractionValue); //increase color of background color
      const g = Math.max(0, parseInt(match[2], 16) - subtractionValue);
      const b = Math.max(0, parseInt(match[3], 16) - subtractionValue);
      return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
    }
    return backgroundColor;
  };

  const getGroupsData = async () => {
    setGroupLoading(true);
    try {
      const response = await getGroups();
      console.log("groups response", response);
      dispatch(storeGroupList(response?.data?.data || []));
    } catch (error) {
      dispatch(storeGroupList([]));
      console.log("group error", error);
    } finally {
      setTimeout(() => {
        setGroupLoading(false);
      }, 300);
    }
  };

  const getRolesData = async () => {
    setRoleLoading(true);
    try {
      const response = await getRoles();
      console.log("roles response", response);
      dispatch(storeRoleList(response?.data?.data || []));
    } catch (error) {
      dispatch(storeRoleList([]));
      console.log("roles error", error);
    } finally {
      setTimeout(() => {
        setRoleLoading(false);
      }, 300);
    }
  };

  //group functions
  const handleCreateGroup = async () => {
    const groupNameValidate = addressValidator(groupName);

    setGroupNameError(groupNameValidate);

    if (groupNameValidate) return;

    const backgroundColor = getColorForName(groupName);
    const textColor = getVeryDarkTextColor(backgroundColor);

    setGroupFormLoading(true);

    const payload = {
      ...(groupId && { group_id: groupId }),
      group_name: groupName,
      description: description,
      background_color: backgroundColor,
      text_color: textColor,
    };

    if (groupId) {
      try {
        await updateGroup(payload);
        setTimeout(() => {
          CommonMessage("success", "Group Updated");
          getGroupsData();
          formReset();
        }, 300);
      } catch (error) {
        setGroupFormLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    } else {
      try {
        await insertGroup(payload);
        setTimeout(() => {
          CommonMessage("success", "Group Created");
          getGroupsData();
          formReset();
        }, 300);
      } catch (error) {
        setGroupFormLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    }
  };

  const handleGroupDelete = async () => {
    setGroupFormLoading(true);
    try {
      await deleteGroup(groupId);
      setTimeout(() => {
        CommonMessage("success", "Group Deleted");
        getGroupsData();
        formReset();
      }, 300);
    } catch (error) {
      setGroupFormLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };
  //role functions
  const handleCreateRole = async () => {
    const roleNameValidate = addressValidator(roleName);

    setRoleNameError(roleNameValidate);

    if (roleNameValidate) return;

    const backgroundColor = getColorForName(roleName);
    const textColor = getVeryDarkTextColor(backgroundColor);

    setRoleFormLoading(true);
    const payload = {
      ...(roleId && { role_id: roleId }),
      role_name: roleName,
      background_color: backgroundColor,
      text_color: textColor,
    };

    if (roleId) {
      try {
        await updateRole(payload);
        setTimeout(() => {
          getRolesData();
          formReset();
        }, 300);
      } catch (error) {
        setRoleFormLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    } else {
      try {
        await insertRole(payload);
        setTimeout(() => {
          getRolesData();
          formReset();
        }, 300);
      } catch (error) {
        setRoleFormLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    }
  };

  const handleRoleDelete = async () => {
    setRoleFormLoading(true);
    try {
      await deleteRole(roleId);
      setTimeout(() => {
        CommonMessage("success", "Role Deleted");
        getRolesData();
        formReset();
      }, 300);
    } catch (error) {
      setRoleFormLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  //reset function
  const formReset = () => {
    setIsOpenAddDrawer(false);
    //group usestates
    setIsOpenAddGroupModal(false);
    setGroupName("");
    setGroupNameError("");
    setDescription("");
    setGroupFormLoading(false);
    setGroupId(null);
    setIsOpenGroupDeleteModal(false);
    //role usestates
    setIsOpenAddRoleModal(false);
    setRoleName("");
    setRoleNameError("");
    setRoleFormLoading(false);
    setRoleId(null);
    setIsOpenRoleDeleteModal(false);
  };

  return (
    <>
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
              gap: "16px",
            }}
          >
            <button
              className="leadmanager_addleadbutton"
              onClick={() => {
                setIsOpenAddGroupModal(true);
              }}
            >
              Add Group
            </button>
            <button
              className="leadmanager_addleadbutton"
              onClick={() => {
                setIsOpenAddRoleModal(true);
              }}
            >
              Add Role
            </button>
          </Col>
        </Row>

        <p className="settings_group_haeding">Groups</p>
        <Row gutter={24} style={{ marginTop: "14px" }}>
          {groupsData.length >= 1 ? (
            <>
              {groupsData.map((item, index) => {
                return (
                  <React.Fragment>
                    <Col span={8} style={{ marginBottom: "20px" }}>
                      <div
                        className="settings_groupcard"
                        style={{
                          borderLeft: `3px solid ${item.text_color}`,
                        }}
                      >
                        {groupLoading ? (
                          <div style={{ height: "120px" }}>
                            <Skeleton
                              avatar
                              active
                              paragraph={{
                                rows: 0,
                              }}
                            />
                          </div>
                        ) : (
                          <>
                            <div style={{ display: "flex", gap: "16px" }}>
                              <div
                                className="groupname_container"
                                style={{
                                  backgroundColor: item.background_color,
                                  color: item.text_color,
                                }}
                              >
                                <p>{getInitials(item.group_name)}</p>
                              </div>

                              <div className="settings_group_contentContainer">
                                <p>
                                  Group Name:{" "}
                                  <span style={{ fontWeight: 600 }}>
                                    {item.group_name}
                                  </span>
                                </p>
                                <p>
                                  Description:{" "}
                                  <span style={{ fontWeight: 600 }}>
                                    {item.description ? item.description : "-"}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="settings_groupcard_footer_container">
                              <div className="settings_groupcard_editbutton_conatiner">
                                <AiOutlineEdit
                                  size={19}
                                  className="trainers_action_icons"
                                  onClick={() => {
                                    setGroupName(item.group_name);
                                    setDescription(item.description);
                                    setGroupId(item.group_id);
                                    setIsOpenAddGroupModal(true);
                                  }}
                                />
                                <RiDeleteBinLine
                                  size={18}
                                  color="#d32f2f"
                                  className="trainers_action_icons"
                                  onClick={() => {
                                    setGroupId(item.group_id);
                                    setIsOpenGroupDeleteModal(true);
                                  }}
                                />
                              </div>
                              <button
                                className="settings_group_footer_buttons"
                                onClick={() => setIsOpenUserModal(true)}
                              >
                                View Users
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </Col>
                  </React.Fragment>
                );
              })}
            </>
          ) : (
            <div className="settings_nogroups_container">
              <p>No Groups Found</p>
            </div>
          )}
        </Row>

        <div className="settings_roles_container">
          <p className="settings_roles_heading">Roles</p>

          <Row gutter={24} style={{ marginTop: "14px" }}>
            {rolesData.length >= 1 ? (
              <>
                {rolesData.map((item, index) => {
                  return (
                    <React.Fragment>
                      <Col span={8} style={{ marginBottom: "20px" }}>
                        <div
                          className="settings_groupcard"
                          style={{
                            borderLeft: `3px solid ${item.text_color}`,
                          }}
                        >
                          {roleLoading ? (
                            <div style={{ height: "120px" }}>
                              <Skeleton
                                avatar
                                active
                                paragraph={{
                                  rows: 0,
                                }}
                              />
                            </div>
                          ) : (
                            <>
                              <div style={{ display: "flex", gap: "16px" }}>
                                <div
                                  className="groupname_container"
                                  style={{
                                    backgroundColor: item.background_color,
                                    color: item.text_color,
                                  }}
                                >
                                  <p>{getInitials(item.role_name)}</p>
                                </div>

                                <div className="settings_group_contentContainer">
                                  <p>
                                    Role Name:{" "}
                                    <span style={{ fontWeight: 600 }}>
                                      {item.role_name}
                                    </span>
                                  </p>
                                  <p>
                                    Description:{" "}
                                    <span style={{ fontWeight: 600 }}>
                                      {item.description
                                        ? item.description
                                        : "-"}
                                    </span>
                                  </p>
                                </div>
                              </div>

                              <div className="settings_groupcard_footer_container">
                                <div className="settings_groupcard_editbutton_conatiner">
                                  <AiOutlineEdit
                                    size={19}
                                    className="trainers_action_icons"
                                    onClick={() => {
                                      setRoleName(item.role_name);
                                      setRoleId(item.role_id);
                                      setIsOpenAddRoleModal(true);
                                    }}
                                  />
                                  <RiDeleteBinLine
                                    size={18}
                                    color="#d32f2f"
                                    className="trainers_action_icons"
                                    onClick={() => {
                                      setRoleId(item.role_id);
                                      setIsOpenRoleDeleteModal(true);
                                    }}
                                  />
                                </div>
                                <button
                                  className="settings_group_footer_buttons"
                                  onClick={() => setIsOpenUserModal(true)}
                                >
                                  View Permissions
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </Col>
                    </React.Fragment>
                  );
                })}
              </>
            ) : (
              <div className="settings_nogroups_container">
                <p>No Roles Found</p>
              </div>
            )}
          </Row>
        </div>

        {/* add group drawer */}
        <Drawer
          title="Add Group"
          open={isOpenAddDrawer}
          onClose={formReset}
          width="48%"
          className="settings_addgroup_drawer"
          style={{ position: "relative", paddingBottom: 65 }}
        >
          <Row gutter={16} style={{ padding: "24px 24px 0px 24px" }}>
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

          <p className="settings_permission_heading">Permissions</p>

          <p className="settings_permission_subheading">Dashboard Access</p>
          <div style={{ padding: "0px 24px 0px 24px" }}>
            <Row style={{ marginTop: "16px" }}>
              <Col span={8}>
                <Checkbox className="settings_pageaccess_checkbox">
                  Dashboard
                </Checkbox>{" "}
              </Col>
              <Col span={8}>
                <Checkbox className="settings_pageaccess_checkbox">
                  Academic Dashboard
                </Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox className="settings_pageaccess_checkbox">
                  SALES Report Dashboard
                </Checkbox>
              </Col>
            </Row>

            <Row style={{ marginTop: "20px" }}>
              <Col span={8}>
                <Checkbox className="settings_pageaccess_checkbox">
                  BDE Report Dashboard
                </Checkbox>{" "}
              </Col>
              <Col span={8}>
                <Checkbox className="settings_pageaccess_checkbox">
                  HR Report Dashboard
                </Checkbox>
              </Col>
            </Row>
          </div>

          <Divider className="settings_addgroupdrawer_divider" />
          <p className="settings_permission_subheading">Target Access</p>
          <div style={{ padding: "0px 24px 0px 24px" }}>
            <Row style={{ marginTop: "16px" }}>
              <Col span={8}>
                <Checkbox className="settings_pageaccess_checkbox">
                  Ledger Board
                </Checkbox>{" "}
              </Col>
              <Col span={8}>
                <Checkbox className="settings_pageaccess_checkbox">
                  Monthly
                </Checkbox>
              </Col>
              <Col span={8}>
                <Checkbox className="settings_pageaccess_checkbox">
                  Weekly
                </Checkbox>
              </Col>
            </Row>
          </div>

          <div className="leadmanager_tablefiler_footer">
            <div className="leadmanager_submitlead_buttoncontainer">
              <button className="leadmanager_tablefilter_applybutton">
                Add
              </button>
            </div>
          </div>
        </Drawer>

        {/* add group modal */}
        <Modal
          title={groupId ? "Update Group" : "Create Group"}
          open={isOpenAddGroupModal}
          onCancel={formReset}
          footer={false}
          width="35%"
        >
          <div style={{ marginTop: "20px" }}>
            <CommonInputField
              label="Name"
              required={true}
              onChange={(e) => {
                setGroupName(e.target.value);
                setGroupNameError(addressValidator(e.target.value));
              }}
              value={groupName}
              error={groupNameError}
            />
          </div>

          <div style={{ marginTop: "30px" }}>
            <CommonTextArea
              label="Description"
              required={false}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              value={description}
            />
          </div>

          <div className="settings_group_createbutton_container">
            {groupFormLoading ? (
              <Button
                type="primary"
                className="settings_group_loading_createbutton"
              >
                <CommonSpinner />
              </Button>
            ) : (
              <Button
                type="primary"
                className="settings_group_createbutton"
                onClick={handleCreateGroup}
              >
                {groupId ? "Update" : "Submit"}
              </Button>
            )}
          </div>
        </Modal>

        {/* add role modal */}
        <Modal
          title={roleId ? "Update Role" : "Create Role"}
          open={isOpenAddRoleModal}
          onCancel={formReset}
          footer={false}
          width="32%"
        >
          <div style={{ marginTop: "20px" }}>
            <CommonInputField
              label="Name"
              required={true}
              onChange={(e) => {
                setRoleName(e.target.value);
                setRoleNameError(addressValidator(e.target.value));
              }}
              value={roleName}
              error={roleNameError}
            />
          </div>

          <div className="settings_group_createbutton_container">
            {roleFormLoading ? (
              <Button
                type="primary"
                className="settings_group_loading_createbutton"
              >
                <CommonSpinner />
              </Button>
            ) : (
              <Button
                type="primary"
                className="settings_group_createbutton"
                onClick={handleCreateRole}
              >
                {roleId ? "Update" : "Submit"}
              </Button>
            )}
          </div>
        </Modal>

        {/* add users modal */}
        <Modal
          title="Users"
          open={isOpenUserModal}
          onCancel={() => setIsOpenUserModal(false)}
          footer={false}
          width="60%"
        >
          <div style={{ marginTop: "20px" }}>
            <CommonTable
              scroll={{ x: 700 }}
              columns={usertableColumns}
              dataSource={usersData}
              dataPerPage={10}
              checkBox="false"
              size="small"
              paginationStatus={false}
              className="questionupload_table"
            />{" "}
          </div>

          <p className="batch_usermodal_addcandidate">Add User</p>

          <Row>
            <Col span={12}>
              <div className="batch_usermodal_addcandidate_buttonContainer">
                <CommonInputField label="User Name" />
                <button className="batch_usermodal_addcandidate_button">
                  + Add
                </button>
              </div>
            </Col>
          </Row>
        </Modal>

        {/* delete group modal */}
        <CommonDeleteModal
          open={isOpenGroupDeleteModal}
          onCancel={formReset}
          content="Are you sure want to delete the Group?"
          loading={groupFormLoading}
          onClick={handleGroupDelete}
        />

        {/* delete role modal */}
        <CommonDeleteModal
          open={isOpenRoleDeleteModal}
          onCancel={formReset}
          content="Are you sure want to delete the Role?"
          loading={roleFormLoading}
          onClick={handleRoleDelete}
        />
      </div>
    </>
  );
}
