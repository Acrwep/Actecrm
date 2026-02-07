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
import { IoIosClose } from "react-icons/io";
import CommonInputField from "../Common/CommonInputField";
import "./styles.css";
import { addressValidator, selectValidator } from "../Common/Validation";
import CommonTextArea from "../Common/CommonTextArea";
import CommonSpinner from "../Common/CommonSpinner";
import {
  assignUsersToGroup,
  deleteGroup,
  deleteRole,
  getGroups,
  getRolePermissionsByRoleId,
  getRoles,
  getUserDownline,
  getUserPermissions,
  getUsersByGroupId,
  insertGroup,
  insertRole,
  insertRolePermissions,
  updateGroup,
  updateRole,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import {
  storeBulkSearchModulePermissionList,
  storeChildUsers,
  storeCustomersModulePermissionList,
  storeDashboardModulePermissionList,
  storeEmailTemplateModulePermissionList,
  storeFeesPendingModulePermissionList,
  storeGroupList,
  storeLeadFollowupModulePermissionList,
  storeLeadsModulePermissionList,
  storeReportsModulePermissionList,
  storeRoleList,
  storeRoleSearchValue,
  storeServerModulePermissionList,
  storeSettingsModulePermissionList,
  storeTicketsModulePermissionList,
  storeTrainerPaymentModulePermissionList,
  storeTrainersModulePermissionList,
  storeUserPermissions,
} from "../Redux/Slice";
import CommonDeleteModal from "../Common/CommonDeleteModal";
import CommonSelectField from "../Common/CommonSelectField";

export default function PageAccess({
  groupLoading,
  setGroupLoading,
  roleLoading,
  setRoleLoading,
}) {
  const dispatch = useDispatch();
  //permissions
  const permissions = useSelector((state) => state.userpermissions);

  const rolesData = useSelector((state) => state.rolelist);
  const roleSearchValue = useSelector((state) => state.rolesearchvalue);
  const usersData = useSelector((state) => state.userslist);
  const dashboardModulePermissionData = useSelector(
    (state) => state.dashboardmodulepermissionlist,
  );
  const leadsModulePermissionData = useSelector(
    (state) => state.leadsmodulepermissionlist,
  );
  const leadFollowupModulePermissionData = useSelector(
    (state) => state.leadfollowupmodulepermissionlist,
  );
  const customersModulePermissionData = useSelector(
    (state) => state.customersmodulepermissionlist,
  );
  const feesPendingModulePermissionData = useSelector(
    (state) => state.feespendingmodulepermissionlist,
  );
  const bulkSearchModulePermissionData = useSelector(
    (state) => state.bulksearchmodulepermissionlist,
  );
  const serverModulePermissionData = useSelector(
    (state) => state.servermodulepermissionlist,
  );
  const trainersModulePermissionData = useSelector(
    (state) => state.trainersmodulepermissionlist,
  );
  const trainerPaymentModulePermissionData = useSelector(
    (state) => state.trainerpaymentmodulepermissionlist,
  );
  const emailTemplateModulePermissionData = useSelector(
    (state) => state.emailtemplatemodulepermissionlist,
  );
  const reportsModulePermissionData = useSelector(
    (state) => state.reportsmodulepermissionlist,
  );
  const ticketsModulePermissionData = useSelector(
    (state) => state.ticketsmodulepermissionlist,
  );
  const settingsModulePermissionData = useSelector(
    (state) => state.settingsmodulepermissionlist,
  );

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
  const [formFields, setFormFields] = useState([
    { user_id: null, roles: [], user_id_error: "", roles_error: "" },
  ]);
  //roles usestates
  const [isOpenAddRoleModal, setIsOpenAddRoleModal] = useState(false);
  const [roleId, setRoleId] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [roleName, setRoleName] = useState("");
  const [roleNameError, setRoleNameError] = useState("");
  const [roleFormLoading, setRoleFormLoading] = useState(false);
  const [isOpenRoleDeleteModal, setIsOpenRoleDeleteModal] = useState(false);
  //permission usestates
  const [isOpenPermissionDrawer, setIsOpenPermissionDrawer] = useState(false);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [permissionButtonLoading, setPermissionButtonLoading] = useState(false);

  useEffect(() => {
    if (roleSearchValue) {
      setSearchValue(roleSearchValue);
    } else {
      setSearchValue("");
    }
  }, []);

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

  const getRolesData = async (searchvalue) => {
    setRoleLoading(true);
    const payload = {
      ...(searchvalue && { name: searchvalue }),
    };
    try {
      const response = await getRoles(payload);
      console.log("roles response", response);
      dispatch(storeRoleList(response?.data?.data || []));
    } catch (error) {
      setRoleLoading(false);
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
            "Something went wrong. Try again later",
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
            "Something went wrong. Try again later",
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
          "Something went wrong. Try again later",
      );
    }
  };
  //role functions
  const handleCreateRole = async () => {
    const roleNameValidate = selectValidator(roleName);

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
            "Something went wrong. Try again later",
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
            "Something went wrong. Try again later",
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
          "Something went wrong. Try again later",
      );
    }
  };

  const getRolePermissionsData = async (role_id) => {
    try {
      const response = await getRolePermissionsByRoleId(role_id);
      const role_permissions = response?.data?.data?.permissions || [];

      // Update state
      setRolePermissions(role_permissions);

      console.log("role permissions", role_permissions);

      //dashboard module
      const updatedDashboardPermissions = (
        dashboardModulePermissionData || []
      ).map((lp) => ({
        ...lp,
        checked: role_permissions.some(
          (rp) => rp.permission_id === lp.permission_id,
        ),
      }));
      dispatch(storeDashboardModulePermissionList(updatedDashboardPermissions));

      //leads module
      const updatedLeadsPermissions = (leadsModulePermissionData || []).map(
        (lp) => ({
          ...lp,
          checked: role_permissions.some(
            (rp) => rp.permission_id === lp.permission_id,
          ),
        }),
      );
      dispatch(storeLeadsModulePermissionList(updatedLeadsPermissions));

      //leads module
      const updatedLeadFollowupPermissions = (
        leadFollowupModulePermissionData || []
      ).map((lp) => ({
        ...lp,
        checked: role_permissions.some(
          (rp) => rp.permission_id === lp.permission_id,
        ),
      }));
      dispatch(
        storeLeadFollowupModulePermissionList(updatedLeadFollowupPermissions),
      );

      //customers module
      const updatedCustomersPermissions = (
        customersModulePermissionData || []
      ).map((lp) => ({
        ...lp,
        checked: role_permissions.some(
          (rp) => rp.permission_id === lp.permission_id,
        ),
      }));
      dispatch(storeCustomersModulePermissionList(updatedCustomersPermissions));

      //fees pending module
      const updatedFeesPendingPermissions = (
        feesPendingModulePermissionData || []
      ).map((lp) => ({
        ...lp,
        checked: role_permissions.some(
          (rp) => rp.permission_id === lp.permission_id,
        ),
      }));
      dispatch(
        storeFeesPendingModulePermissionList(updatedFeesPendingPermissions),
      );

      //fees pending module
      const updatedBulkSearchPermissions = (
        bulkSearchModulePermissionData || []
      ).map((lp) => ({
        ...lp,
        checked: role_permissions.some(
          (rp) => rp.permission_id === lp.permission_id,
        ),
      }));
      dispatch(
        storeBulkSearchModulePermissionList(updatedBulkSearchPermissions),
      );

      //server module
      const updatedServerPermissions = (serverModulePermissionData || []).map(
        (lp) => ({
          ...lp,
          checked: role_permissions.some(
            (rp) => rp.permission_id === lp.permission_id,
          ),
        }),
      );
      dispatch(storeServerModulePermissionList(updatedServerPermissions));

      //trainers module
      const updatedTrainersPermissions = (
        trainersModulePermissionData || []
      ).map((lp) => ({
        ...lp,
        checked: role_permissions.some(
          (rp) => rp.permission_id === lp.permission_id,
        ),
      }));
      dispatch(storeTrainersModulePermissionList(updatedTrainersPermissions));

      //trainer payment module
      const updatedTrainerPaymentPermissions = (
        trainerPaymentModulePermissionData || []
      ).map((lp) => ({
        ...lp,
        checked: role_permissions.some(
          (rp) => rp.permission_id === lp.permission_id,
        ),
      }));
      dispatch(
        storeTrainerPaymentModulePermissionList(
          updatedTrainerPaymentPermissions,
        ),
      );

      //email template module
      const updatedEmailTemplatePermissions = (
        emailTemplateModulePermissionData || []
      ).map((lp) => ({
        ...lp,
        checked: role_permissions.some(
          (rp) => rp.permission_id === lp.permission_id,
        ),
      }));
      dispatch(
        storeEmailTemplateModulePermissionList(updatedEmailTemplatePermissions),
      );

      //reports module
      const updatedReportsPermissions = (reportsModulePermissionData || []).map(
        (lp) => ({
          ...lp,
          checked: role_permissions.some(
            (rp) => rp.permission_id === lp.permission_id,
          ),
        }),
      );
      dispatch(storeReportsModulePermissionList(updatedReportsPermissions));

      //tickets module
      const updatedTicketsPermissions = (ticketsModulePermissionData || []).map(
        (lp) => ({
          ...lp,
          checked: role_permissions.some(
            (rp) => rp.permission_id === lp.permission_id,
          ),
        }),
      );
      dispatch(storeTicketsModulePermissionList(updatedTicketsPermissions));

      //settings module
      const updatedSettingsPermissions = (
        settingsModulePermissionData || []
      ).map((lp) => ({
        ...lp,
        checked: role_permissions.some(
          (rp) => rp.permission_id === lp.permission_id,
        ),
      }));
      dispatch(storeSettingsModulePermissionList(updatedSettingsPermissions));
      setTimeout(() => {
        setIsOpenPermissionDrawer(true);
      }, 300);
    } catch (error) {
      setRolePermissions([]);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handleInsertRolePermissions = async () => {
    const merged = [
      ...dashboardModulePermissionData,
      ...leadsModulePermissionData,
      ...leadFollowupModulePermissionData,
      ...customersModulePermissionData,
      ...feesPendingModulePermissionData,
      ...bulkSearchModulePermissionData,
      ...serverModulePermissionData,
      ...trainersModulePermissionData,
      ...trainerPaymentModulePermissionData,
      ...emailTemplateModulePermissionData,
      ...reportsModulePermissionData,
      ...ticketsModulePermissionData,
      ...settingsModulePermissionData,
    ];
    console.log("merged", merged);

    const checkedItems = merged.filter((f) => f.checked === true);

    const ids = checkedItems.map((item) => {
      return item.permission_id;
    });

    console.log(ids);
    const payload = {
      role_id: roleId,
      permission_ids: ids,
    };
    console.log("payload", payload);

    setPermissionButtonLoading(true);
    try {
      await insertRolePermissions(payload);
      setTimeout(() => {
        CommonMessage("success", "Permissions Updated");
        getUserDownlineData();
      }, 300);
    } catch (error) {
      setPermissionButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const getUserDownlineData = async () => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    let child_users;
    let user_roles;
    try {
      const response = await getUserDownline(convertAsJson?.user_id);
      console.log("user downline response", response);
      child_users = response?.data?.data?.child_users || [];
      user_roles = response?.data?.data?.roles || [];
      dispatch(storeChildUsers(child_users));
    } catch (error) {
      user_roles = [];
      child_users = [];
      console.log("user downline error", error);
    } finally {
      setTimeout(() => {
        getPermissionsData(user_roles);
      }, 300);
    }
  };

  const getPermissionsData = async (user_roles) => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      role_ids: user_roles,
    };
    try {
      const response = await getUserPermissions(payload);
      console.log("user permissions response", response);
      const permission = response?.data?.data;
      if (permission.length >= 1) {
        const updateData = permission.map((item) => {
          return item.permission_name;
        });
        console.log("permissions", updateData);
        dispatch(storeUserPermissions(updateData));
        setTimeout(() => {
          formReset();
        }, 300);
      }
    } catch (error) {
      console.log("user permissions error", error);
    } finally {
      setTimeout(() => {
        setPermissionButtonLoading(false);
      }, 300);
    }
  };

  const handleGetUsersByGroupId = async (group_id) => {
    const payload = {
      group_id: group_id,
    };
    try {
      const response = await getUsersByGroupId(payload);
      console.log("getusersbygroupid response", response);
      const users_list = response?.data?.data?.users || [];
      if (users_list.length >= 1) {
        setFormFields(users_list);
      } else {
        setFormFields([
          { user_id: null, roles: null, user_id_error: "", roles_error: "" },
        ]);
      }
      setIsOpenUserModal(true);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const addFormfields = () => {
    const obj = {
      user_id: null,
      roles: [],
      user_id_error: "",
      roles_error: "",
    };
    setFormFields([...formFields, obj]);
  };

  // const handleFormFields = (index, field, value) => {
  //   const updatedDetails = [...formFields];
  //   if (field === "user_id") {
  //     updatedDetails[index].user_id_error = selectValidator(value);
  //   }
  //   if (field === "roles") {
  //     updatedDetails[index].roles_error = selectValidator(value);
  //   }
  //   updatedDetails[index][field] = value;
  //   console.log("updatedDetails", updatedDetails);
  //   setFormFields(updatedDetails);
  // };

  const handleFormFields = (index, field, value) => {
    const updatedDetails = [...formFields];

    // update value
    updatedDetails[index][field] = value;

    // run field-specific validation
    if (field === "user_id") {
      updatedDetails[index].user_id_error = selectValidator(value);
    }
    if (field === "roles") {
      updatedDetails[index].roles_error = selectValidator(value);
    }

    // check for duplicate users
    const userCounts = updatedDetails.reduce((acc, curr) => {
      if (curr.user_id) {
        acc[curr.user_id] = (acc[curr.user_id] || 0) + 1;
      }
      return acc;
    }, {});

    updatedDetails.forEach((item) => {
      if (item.user_id && userCounts[item.user_id] > 1) {
        item.user_id_error = " is already mapped";
      } else {
        // keep existing error only if it's not duplicate-related
        if (item.user_id_error === " is already mapped") {
          item.user_id_error = "";
        }
      }
    });

    setFormFields(updatedDetails);
  };

  const deleteFormFields = (index) => {
    if (formFields.length <= 1) {
      return;
    }
    let data = [...formFields];
    data.splice(index, 1);
    setFormFields(data);
  };

  const handleAssignUsers = async () => {
    console.log(formFields);

    // First run normal field validation
    let validateFormFields = formFields.map((item) => ({
      ...item,
      user_id_error: selectValidator(item.user_id),
      roles_error: selectValidator(item.roles),
    }));

    // Check for duplicate users
    const userCounts = validateFormFields.reduce((acc, curr) => {
      if (curr.user_id) {
        acc[curr.user_id] = (acc[curr.user_id] || 0) + 1;
      }
      return acc;
    }, {});

    validateFormFields = validateFormFields.map((item) => {
      if (item.user_id && userCounts[item.user_id] > 1) {
        return {
          ...item,
          user_id_error: " is already mapped",
        };
      }
      return item;
    });

    setFormFields(validateFormFields);

    // If any row has error, stop
    const isError = validateFormFields.filter(
      (f) => f.user_id_error !== "" || f.roles_error !== "",
    );

    console.log("isError", isError);

    if (isError.length >= 1) return;

    const payload = {
      group_id: groupId,
      users: formFields,
    };
    console.log("payyyyyyy", payload);
    setGroupFormLoading(true);
    try {
      await assignUsersToGroup(payload);
      setTimeout(() => {
        CommonMessage("success", "User Assigned");
        formReset();
      }, 300);
    } catch (error) {
      setTimeout(() => {
        setGroupFormLoading(false);
      }, 300);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handleSearch = (e) => {
    const input = e.target.value;
    setSearchValue(input);
    dispatch(storeRoleSearchValue(input));
    setRoleLoading(true);
    setTimeout(() => {
      getRolesData(input);
    }, 300);
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
    //permission usestates
    setIsOpenPermissionDrawer(false);
    setPermissionButtonLoading(false);
    //user assign usestates
    setIsOpenUserModal(false);
    setFormFields([
      { user_id: null, roles: null, user_id_error: "", roles_error: "" },
    ]);
  };

  return (
    <>
      <div>
        <Row>
          <Col xs={24} sm={24} md={24} lg={12}>
            <div className="leadmanager_filterContainer">
              <CommonOutlinedInput
                label="Search By Name"
                width="40%"
                height="33px"
                labelFontSize="12px"
                icon={
                  searchValue ? (
                    <div
                      className="users_filter_closeIconContainer"
                      onClick={() => {
                        setSearchValue("");
                        dispatch(storeRoleSearchValue(null));
                        getRolesData(null);
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
                  padding: searchValue ? "0px 26px 0px 0px" : "0px 8px 0px 0px",
                }}
                onChange={handleSearch}
                value={searchValue}
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
            {/* <button
              className="leadmanager_addleadbutton"
              onClick={() => {
                setIsOpenAddGroupModal(true);
              }}
            >
              Add Group
            </button> */}
            {permissions.includes("Add Role") && (
              <button
                className="leadmanager_addleadbutton"
                onClick={() => {
                  setIsOpenAddRoleModal(true);
                }}
              >
                Add Role
              </button>
            )}
          </Col>
        </Row>

        {/* <p className="settings_group_haeding">Groups</p>
        <Row gutter={24} style={{ marginTop: "14px" }}>
          {groupsData.length >= 1 ? (
            <>
              {groupsData.map((item, index) => {
                return (
                  <React.Fragment key={index}>
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
                                onClick={() => {
                                  setGroupId(item.group_id);
                                  handleGetUsersByGroupId(item.group_id);
                                }}
                              >
                                Add Users
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
        </Row> */}

        <div className="settings_roles_container">
          <p className="settings_roles_heading">Roles</p>

          <Row gutter={24} style={{ marginTop: "14px" }}>
            {rolesData.length >= 1 ? (
              <>
                {rolesData.map((item, index) => {
                  return (
                    <React.Fragment key={index}>
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
                                  {permissions.includes("Update Role") && (
                                    <AiOutlineEdit
                                      size={19}
                                      className="trainers_action_icons"
                                      onClick={() => {
                                        setRoleName(item.role_name);
                                        setRoleId(item.role_id);
                                        setIsOpenAddRoleModal(true);
                                      }}
                                    />
                                  )}

                                  {permissions.includes("Delete Role") && (
                                    <RiDeleteBinLine
                                      size={18}
                                      color="#d32f2f"
                                      className="trainers_action_icons"
                                      onClick={() => {
                                        setRoleId(item.role_id);
                                        setIsOpenRoleDeleteModal(true);
                                      }}
                                    />
                                  )}
                                </div>
                                {permissions.includes("Add Permissions") && (
                                  <button
                                    className="settings_addpermission_button"
                                    onClick={() => {
                                      setRoleId(item.role_id);
                                      setRoleName(item.role_name);
                                      getRolePermissionsData(item.role_id);
                                    }}
                                  >
                                    Permissions
                                  </button>
                                )}
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
              label="Role Name"
              required={true}
              onChange={(e) => {
                setRoleName(e.target.value);
                setRoleNameError(selectValidator(e.target.value));
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
          title="Add User"
          open={isOpenUserModal}
          onCancel={formReset}
          footer={false}
          width="50%"
        >
          {formFields.map((item, index) => {
            return (
              <React.Fragment key={index}>
                <Row
                  gutter={16}
                  style={{
                    marginTop: "12px",
                    marginBottom:
                      formFields.length - 1 === index ? "0px" : "22px",
                  }}
                >
                  <Col span={8}>
                    <CommonSelectField
                      label="User"
                      required={true}
                      options={usersData}
                      onChange={(e) => {
                        const u_id = e.target.value;
                        handleFormFields(index, "user_id", u_id);
                      }}
                      value={item.user_id}
                      error={item.user_id_error}
                    />
                  </Col>
                  <Col span={8}>
                    <Button
                      className="settings_formfields_deletebutton"
                      onClick={() => {
                        deleteFormFields(index);
                      }}
                    >
                      Delete{" "}
                    </Button>
                  </Col>
                </Row>
              </React.Fragment>
            );
          })}
          {/* <Button
            type="primary"
            className="settings_formfields_addbutton"
            onClick={addFormfields}
          >
            Add
          </Button> */}

          <div className="settings_formfields_submitbutton_container">
            <Button type="primary" onClick={addFormfields}>
              Add
            </Button>
            {groupFormLoading ? (
              <Button
                type="primary"
                className="settings_formfields_submitbutton"
              >
                <CommonSpinner />
              </Button>
            ) : (
              <Button
                type="primary"
                className="settings_formfields_submitbutton"
                onClick={handleAssignUsers}
              >
                Submit
              </Button>
            )}
          </div>
        </Modal>

        {/* permission drawer */}
        <Drawer
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Manage Permission</span>
              <div
                style={{ fontSize: "13.5px", paddingTop: "3px", color: "#333" }}
              >
                <span style={{ fontWeight: 600, color: "#333" }}>
                  Role: {roleName}
                </span>
              </div>
            </div>
          }
          open={isOpenPermissionDrawer}
          onClose={formReset}
          width="48%"
          className="settings_addgroup_drawer"
          style={{ position: "relative", paddingBottom: 65 }}
        >
          <p className="settings_permission_subheading">Dashboard Page</p>
          <div className="settings_permission_rowcontainer">
            <Row>
              {dashboardModulePermissionData.map((item) => {
                return (
                  <Col
                    span={8}
                    style={{
                      marginTop: "16px",
                    }}
                  >
                    <Checkbox
                      className="settings_pageaccess_checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        const { checked } = e.target;
                        const updateItem = dashboardModulePermissionData.map(
                          (i) => {
                            if (i.permission_id === item.permission_id) {
                              return { ...i, checked: checked };
                            } else {
                              return { ...i };
                            }
                          },
                        );
                        console.log("updateItem", updateItem);
                        dispatch(
                          storeDashboardModulePermissionList(updateItem),
                        );
                      }}
                    >
                      {item.permission_name}
                    </Checkbox>{" "}
                  </Col>
                );
              })}
            </Row>
          </div>
          <Divider className="settings_addgroupdrawer_divider" />
          <p className="settings_permission_subheading">Leads Page</p>
          <div className="settings_permission_rowcontainer">
            <Row>
              {leadsModulePermissionData.map((item) => {
                return (
                  <Col
                    span={8}
                    style={{
                      marginTop: "16px",
                    }}
                  >
                    <Checkbox
                      className="settings_pageaccess_checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        const { checked } = e.target;
                        const updateItem = leadsModulePermissionData.map(
                          (i) => {
                            if (i.permission_id === item.permission_id) {
                              return { ...i, checked: checked };
                            } else {
                              return { ...i };
                            }
                          },
                        );
                        console.log("updateItem", updateItem);
                        dispatch(storeLeadsModulePermissionList(updateItem));
                      }}
                    >
                      {item.permission_name}
                    </Checkbox>{" "}
                  </Col>
                );
              })}
            </Row>
          </div>

          <Divider className="settings_addgroupdrawer_divider" />
          <p className="settings_permission_subheading">Lead Followup Page</p>
          <div className="settings_permission_rowcontainer">
            <Row>
              {leadFollowupModulePermissionData.map((item) => {
                return (
                  <Col
                    span={8}
                    style={{
                      marginTop: "16px",
                    }}
                  >
                    <Checkbox
                      className="settings_pageaccess_checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        const { checked } = e.target;
                        const updateItem = leadFollowupModulePermissionData.map(
                          (i) => {
                            if (i.permission_id === item.permission_id) {
                              return { ...i, checked: checked };
                            } else {
                              return { ...i };
                            }
                          },
                        );
                        console.log("updateItem", updateItem);
                        dispatch(
                          storeLeadFollowupModulePermissionList(updateItem),
                        );
                      }}
                    >
                      {item.permission_name}
                    </Checkbox>{" "}
                  </Col>
                );
              })}
            </Row>
          </div>

          <Divider className="settings_addgroupdrawer_divider" />
          <p className="settings_permission_subheading">Bulk Search Page</p>
          <div className="settings_permission_rowcontainer">
            <Row>
              {bulkSearchModulePermissionData.map((item) => {
                return (
                  <Col
                    span={8}
                    style={{
                      marginTop: "16px",
                    }}
                  >
                    <Checkbox
                      className="settings_pageaccess_checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        const { checked } = e.target;
                        const updateItem = bulkSearchModulePermissionData.map(
                          (i) => {
                            if (i.permission_id === item.permission_id) {
                              return { ...i, checked: checked };
                            } else {
                              return { ...i };
                            }
                          },
                        );
                        console.log("updateItem", updateItem);
                        dispatch(
                          storeBulkSearchModulePermissionList(updateItem),
                        );
                      }}
                    >
                      {item.permission_name}
                    </Checkbox>{" "}
                  </Col>
                );
              })}
            </Row>
          </div>

          <Divider className="settings_addgroupdrawer_divider" />
          <p className="settings_permission_subheading">Customers Page</p>
          <div className="settings_permission_rowcontainer">
            <Row>
              {customersModulePermissionData.map((item, index) => {
                return (
                  <Col
                    span={8}
                    style={{
                      marginTop: "16px",
                    }}
                  >
                    <Checkbox
                      className="settings_pageaccess_checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        const { checked } = e.target;
                        const updateItem = customersModulePermissionData.map(
                          (i) => {
                            if (i.permission_id === item.permission_id) {
                              return { ...i, checked: checked };
                            } else {
                              return { ...i };
                            }
                          },
                        );
                        console.log("updateItem", updateItem);
                        dispatch(
                          storeCustomersModulePermissionList(updateItem),
                        );
                      }}
                    >
                      {item.permission_name}
                    </Checkbox>{" "}
                  </Col>
                );
              })}
            </Row>
          </div>

          <Divider className="settings_addgroupdrawer_divider" />
          <p className="settings_permission_subheading">Fee Pending Page</p>
          <div className="settings_permission_rowcontainer">
            <Row>
              {feesPendingModulePermissionData.map((item, index) => {
                return (
                  <Col
                    span={8}
                    style={{
                      marginTop: "16px",
                    }}
                  >
                    <Checkbox
                      className="settings_pageaccess_checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        const { checked } = e.target;
                        const updateItem = feesPendingModulePermissionData.map(
                          (i) => {
                            if (i.permission_id === item.permission_id) {
                              return { ...i, checked: checked };
                            } else {
                              return { ...i };
                            }
                          },
                        );
                        console.log("updateItem", updateItem);
                        dispatch(
                          storeFeesPendingModulePermissionList(updateItem),
                        );
                      }}
                    >
                      {item.permission_name}
                    </Checkbox>{" "}
                  </Col>
                );
              })}
            </Row>
          </div>

          <Divider className="settings_addgroupdrawer_divider" />
          <p className="settings_permission_subheading">Server Page</p>
          <div className="settings_permission_rowcontainer">
            <Row>
              {serverModulePermissionData.map((item, index) => {
                return (
                  <Col
                    span={8}
                    style={{
                      marginTop: "16px",
                    }}
                  >
                    <Checkbox
                      className="settings_pageaccess_checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        const { checked } = e.target;
                        const updateItem = serverModulePermissionData.map(
                          (i) => {
                            if (i.permission_id === item.permission_id) {
                              return { ...i, checked: checked };
                            } else {
                              return { ...i };
                            }
                          },
                        );
                        console.log("updateItem", updateItem);
                        dispatch(storeServerModulePermissionList(updateItem));
                      }}
                    >
                      {item.permission_name}
                    </Checkbox>{" "}
                  </Col>
                );
              })}
            </Row>
          </div>

          <Divider className="settings_addgroupdrawer_divider" />
          <p className="settings_permission_subheading">Trainers Page</p>
          <div className="settings_permission_rowcontainer">
            <Row>
              {trainersModulePermissionData.map((item) => {
                return (
                  <Col span={8} style={{ marginTop: "16px" }}>
                    <Checkbox
                      className="settings_pageaccess_checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        const { checked } = e.target;
                        const updateItem = trainersModulePermissionData.map(
                          (i) => {
                            if (i.permission_id === item.permission_id) {
                              return { ...i, checked: checked };
                            } else {
                              return { ...i };
                            }
                          },
                        );
                        console.log("updateItem", updateItem);
                        dispatch(storeTrainersModulePermissionList(updateItem));
                      }}
                    >
                      {item.permission_name}
                    </Checkbox>{" "}
                  </Col>
                );
              })}
            </Row>
          </div>

          <Divider className="settings_addgroupdrawer_divider" />
          <p className="settings_permission_subheading">Trainer Payment Page</p>
          <div className="settings_permission_rowcontainer">
            <Row>
              {trainerPaymentModulePermissionData.map((item) => {
                return (
                  <Col span={8} style={{ marginTop: "16px" }}>
                    <Checkbox
                      className="settings_pageaccess_checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        const { checked } = e.target;
                        const updateItem =
                          trainerPaymentModulePermissionData.map((i) => {
                            if (i.permission_id === item.permission_id) {
                              return { ...i, checked: checked };
                            } else {
                              return { ...i };
                            }
                          });
                        console.log("updateItem", updateItem);
                        dispatch(
                          storeTrainerPaymentModulePermissionList(updateItem),
                        );
                      }}
                    >
                      {item.permission_name}
                    </Checkbox>{" "}
                  </Col>
                );
              })}
            </Row>
          </div>

          <Divider className="settings_addgroupdrawer_divider" />
          <p className="settings_permission_subheading">Email Template</p>
          <div className="settings_permission_rowcontainer">
            <Row>
              {emailTemplateModulePermissionData.map((item) => {
                return (
                  <Col span={8} style={{ marginTop: "16px" }}>
                    <Checkbox
                      className="settings_pageaccess_checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        const { checked } = e.target;
                        const updateItem =
                          emailTemplateModulePermissionData.map((i) => {
                            if (i.permission_id === item.permission_id) {
                              return { ...i, checked: checked };
                            } else {
                              return { ...i };
                            }
                          });
                        console.log("updateItem", updateItem);
                        dispatch(
                          storeEmailTemplateModulePermissionList(updateItem),
                        );
                      }}
                    >
                      {item.permission_name}
                    </Checkbox>{" "}
                  </Col>
                );
              })}
            </Row>
          </div>

          <Divider className="settings_addgroupdrawer_divider" />
          <p className="settings_permission_subheading">Reports Page</p>
          <div className="settings_permission_rowcontainer">
            <Row>
              {reportsModulePermissionData.map((item) => {
                return (
                  <Col span={8} style={{ marginTop: "16px" }}>
                    <Checkbox
                      className="settings_pageaccess_checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        const { checked } = e.target;
                        const updateItem = reportsModulePermissionData.map(
                          (i) => {
                            if (i.permission_id === item.permission_id) {
                              return { ...i, checked: checked };
                            } else {
                              return { ...i };
                            }
                          },
                        );
                        console.log("updateItem", updateItem);
                        dispatch(storeReportsModulePermissionList(updateItem));
                      }}
                    >
                      {item.permission_name}
                    </Checkbox>{" "}
                  </Col>
                );
              })}
            </Row>
          </div>

          <Divider className="settings_addgroupdrawer_divider" />
          <p className="settings_permission_subheading">Tickets Page</p>
          <div className="settings_permission_rowcontainer">
            <Row>
              {ticketsModulePermissionData.map((item) => {
                return (
                  <Col span={8} style={{ marginTop: "16px" }}>
                    <Checkbox
                      className="settings_pageaccess_checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        const { checked } = e.target;
                        const updateItem = ticketsModulePermissionData.map(
                          (i) => {
                            if (i.permission_id === item.permission_id) {
                              return { ...i, checked: checked };
                            } else {
                              return { ...i };
                            }
                          },
                        );
                        console.log("updateItem", updateItem);
                        dispatch(storeTicketsModulePermissionList(updateItem));
                      }}
                    >
                      {item.permission_name}
                    </Checkbox>{" "}
                  </Col>
                );
              })}
            </Row>
          </div>

          <Divider className="settings_addgroupdrawer_divider" />
          <p className="settings_permission_subheading">Settings Page</p>
          <div className="settings_permission_rowcontainer">
            <Row>
              {settingsModulePermissionData.map((item) => {
                return (
                  <Col span={8} style={{ marginTop: "16px" }}>
                    <Checkbox
                      className="settings_pageaccess_checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        const { checked } = e.target;
                        const updateItem = settingsModulePermissionData.map(
                          (i) => {
                            if (i.permission_id === item.permission_id) {
                              return { ...i, checked: checked };
                            } else {
                              return { ...i };
                            }
                          },
                        );
                        console.log("updateItem", updateItem);
                        dispatch(storeSettingsModulePermissionList(updateItem));
                      }}
                    >
                      {item.permission_name}
                    </Checkbox>{" "}
                  </Col>
                );
              })}
            </Row>
          </div>
          <div className="leadmanager_tablefiler_footer">
            <div className="leadmanager_submitlead_buttoncontainer">
              {permissionButtonLoading ? (
                <Button
                  type="primary"
                  className="settings_permissions_loading_savebutton"
                >
                  <CommonSpinner />
                </Button>
              ) : (
                <Button
                  type="primary"
                  className="settings_permissions_savebutton"
                  onClick={handleInsertRolePermissions}
                >
                  Save
                </Button>
              )}
            </div>
          </div>
        </Drawer>
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
