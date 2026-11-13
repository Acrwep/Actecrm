import React, { useEffect, useState } from "react";
import CommonTable from "../Common/CommonTable";
import CommonSelectField from "../Common/CommonSelectField";
import { useDispatch, useSelector } from "react-redux";
import { Col, Modal, Row, Button, Tooltip } from "antd";
import { AiOutlineEdit } from "react-icons/ai";
import {
  getBranchManagers,
  updateBranchManager,
  assignBranchManager,
  getUsers,
  createRegion,
  createBranch,
  getRegions,
  updateRegion,
  updateBranch,
} from "../ApiService/action";
import "./styles.css";
import CommonSpinner from "../Common/CommonSpinner";
import CommonInputField from "../Common/CommonInputField";
import { addressValidator, selectValidator } from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import { storeGlobalRegionsList } from "../Redux/Slice";

export default function RegionAndBranches() {
  const dispatch = useDispatch();
  const globalRegionsList = useSelector((state) => state.globalregionslist);
  const allUsersData = useSelector((state) => state.alluserslist);

  const [allUsersList, setAllUsersList] = useState(allUsersData);
  //region modal usestates
  const [isOpenRegionModal, setIsOpenRegionModal] = useState(false);
  const [regionName, setRegionName] = useState("");
  const [regionNameError, setRegionNameError] = useState("");
  //branch modal usestates
  const [isOpenBranchModal, setIsOpenBranchModal] = useState(false);
  const [regionId, setRegionId] = useState(null);
  const [regionIdError, setRegionIdError] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchNameError, setBranchNameError] = useState("");

  //edit region modal usestates
  const [isOpenEditRegionModal, setIsOpenEditRegionModal] = useState(false);
  const [editRegionId, setEditRegionId] = useState(null);
  const [editRegionName, setEditRegionName] = useState("");
  const [editRegionNameError, setEditRegionNameError] = useState("");

  //edit branch modal usestates
  const [isOpenEditBranchModal, setIsOpenEditBranchModal] = useState(false);
  const [editBranchId, setEditBranchId] = useState(null);
  const [editBranchRegionId, setEditBranchRegionId] = useState(null);
  const [editBranchRegionIdError, setEditBranchRegionIdError] = useState("");
  const [editBranchName, setEditBranchName] = useState("");
  const [editBranchNameError, setEditBranchNameError] = useState("");

  //other usestates
  const [buttonLoading, setButtonLoading] = useState(false);
  const [editButtonLoading, setEditButtonLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [data, setData] = useState([]);

  useEffect(() => {
    fetchBranchManagers();
  }, []);

  useEffect(() => {
    setAllUsersList(allUsersData);
  }, [allUsersData]);

  const fetchBranchManagers = async () => {
    try {
      setLoading(true);
      const res = await getBranchManagers();
      if (res.data && res.data.data) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getUsersData = async () => {
    const payload = {
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getUsers(payload);
      console.log("users response", response);
      setAllUsersList(response?.data?.data?.data || []);
    } catch (error) {
      setAllUsersList([]);
      console.log("get all users error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManagerUpdate = (
    branch_id,
    regional_manager_id,
    branch_manager_id,
    record,
    columnName,
  ) => {
    Modal.confirm({
      title: "Confirm Assignment",
      okText: "Yes",
      cancelText: "No",
      content: (
        <span style={{ fontSize: "13px" }}>
          Are you sure you want to change the{" "}
          <span style={{ fontWeight: 600 }}>{columnName}</span> for{" "}
          <span style={{ fontWeight: 600 }}>{record.branch_name}</span>?
        </span>
      ),
      onOk: async () => {
        try {
          setLoading(true);
          if (!record.id) {
            await assignBranchManager({
              branch_id,
              regional_manager_id,
              branch_manager_id,
            });
          } else {
            await updateBranchManager({
              branch_id,
              regional_manager_id,
              branch_manager_id,
            });
          }
          await fetchBranchManagers();
        } catch (error) {
          console.error(error);
          setLoading(false);
        }
      },
      onCancel: () => {
        // Refresh data to reset the dropdown's visual state if canceled
        // fetchBranchManagers();
      },
    });
  };

  const openEditRegion = (record) => {
    const regId = record?.region_id || null;

    setEditRegionId(regId);
    setEditRegionName(record?.region_name || "");
    setEditRegionNameError("");
    setIsOpenEditRegionModal(true);
  };

  const openEditBranch = (record) => {
    const regId = record?.region_id || null;

    setEditBranchId(record?.branch_id || null);
    setEditBranchRegionId(regId);
    setEditBranchRegionIdError("");
    setEditBranchName(record?.branch_name || "");
    setEditBranchNameError("");
    setIsOpenEditBranchModal(true);
  };

  const handleRegionUpdate = async () => {
    const regionNameValidate = addressValidator(editRegionName);
    setEditRegionNameError(regionNameValidate);

    if (regionNameValidate) return;

    setEditButtonLoading(true);

    const payload = {
      region_id: editRegionId,
      region_name: editRegionName,
    };

    try {
      await updateRegion(payload);
      CommonMessage("success", "Region Name Updated Successfully");
      formReset();
      getRegionsData();
    } catch (error) {
      setEditButtonLoading(false);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.details ||
        "Failed to update region";
      CommonMessage("error", errorMessage);
    }
  };

  const handleBranchUpdate = async () => {
    const regionIdValidate = selectValidator(editBranchRegionId);
    const branchNameValidate = addressValidator(editBranchName);

    setEditBranchRegionIdError(regionIdValidate);
    setEditBranchNameError(branchNameValidate);

    if (regionIdValidate || branchNameValidate) return;

    setEditButtonLoading(true);

    const payload = {
      branch_id: editBranchId,
      region_id: editBranchRegionId,
      branch_name: editBranchName,
    };
    console.log("Update Branch Payload (Ready for API):", payload);

    try {
      await updateBranch(payload);
      CommonMessage("success", "Branch Updated Successfully");
      formReset();
      fetchBranchManagers();
    } catch (error) {
      setEditButtonLoading(false);
      const errorMessage =
        error?.response?.data?.details ||
        error?.response?.data?.message ||
        "Failed to update branch";
      CommonMessage("error", errorMessage);
    }
  };

  const columns = [
    {
      title: "Region Name",
      key: "region_name",
      dataIndex: "region_name",
      render: (text, record) => (
        <div className="region_branch_cell_wrapper">
          <span style={{ fontWeight: 500, color: "#1e293b" }}>
            {text || "-"}
          </span>
          <Tooltip title="Edit Region">
            <button
              type="button"
              className="region_branch_inline_edit_btn"
              onClick={() => openEditRegion(record)}
              aria-label="Edit Region"
            >
              <AiOutlineEdit size={16} />
            </button>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Branch Name",
      key: "branch_name",
      dataIndex: "branch_name",
      render: (text, record) => (
        <div className="region_branch_cell_wrapper">
          <span style={{ color: "#334155" }}>{text || "-"}</span>
          <Tooltip title="Edit Branch">
            <button
              type="button"
              className="region_branch_inline_edit_btn"
              onClick={() => openEditBranch(record)}
              aria-label="Edit Branch"
            >
              <AiOutlineEdit size={16} />
            </button>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Regional Manager",
      key: "regional_manager_name",
      dataIndex: "regional_manager_name",
      render: (_, record) => {
        return (
          <CommonSelectField
            label={""}
            height="33px"
            labelMarginTop="0px"
            labelFontSize="11px"
            options={allUsersList}
            value={record.regional_manager_id}
            onChange={(e) =>
              handleManagerUpdate(
                record.branch_id,
                e.target.value,
                record.branch_manager_id,
                record,
                "Regional Manager",
              )
            }
          />
        );
      },
    },
    {
      title: "Branch Manager",
      key: "branch_manager_name",
      dataIndex: "branch_manager_name",
      render: (_, record) => {
        return (
          <CommonSelectField
            label={""}
            height="33px"
            labelMarginTop="0px"
            labelFontSize="11px"
            options={allUsersList}
            value={record.branch_manager_id}
            onChange={(e) =>
              handleManagerUpdate(
                record.branch_id,
                record.regional_manager_id,
                e.target.value,
                record,
                "Branch Manager",
              )
            }
          />
        );
      },
    },
  ];

  const handlePaginationChange = ({ page, limit }) => {
    setPagination({
      page: page,
      limit: limit,
    });
  };

  const handleRegionCreate = async () => {
    const regionNameValidate = addressValidator(regionName);

    setRegionNameError(regionNameValidate);

    if (regionNameValidate) return;
    setButtonLoading(true);

    const payload = {
      region_name: regionName,
    };
    try {
      await createRegion(payload);
      setTimeout(() => {
        CommonMessage("success", "Region Created Sucessfully");
        formReset();
        getRegionsData();
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.details ||
        "Failed to create region";
      CommonMessage("error", errorMessage);
    }
  };

  const getRegionsData = async () => {
    try {
      const response = await getRegions();
      dispatch(storeGlobalRegionsList(response?.data?.data || []));
    } catch (error) {
      dispatch(storeGlobalRegionsList([]));
      console.log("get regions error", error);
    } finally {
      fetchBranchManagers();
    }
  };

  const handleBranchCreate = async () => {
    const regionIdValidate = selectValidator(regionId);
    const branchNameValidate = addressValidator(branchName);

    setRegionIdError(regionIdValidate);
    setBranchNameError(branchNameValidate);

    if (regionIdValidate || branchNameValidate) return;

    setButtonLoading(true);
    const payload = {
      region_id: regionId,
      branch_name: branchName,
    };
    try {
      await createBranch(payload);
      setTimeout(() => {
        CommonMessage("success", "Branch Created Sucessfully");
        formReset();
        fetchBranchManagers();
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      const errorMessage =
        error?.response?.data?.details ||
        error?.response?.data?.message ||
        "Failed to create branch";
      CommonMessage("error", errorMessage);
    }
  };

  const formReset = () => {
    setButtonLoading(false);
    setEditButtonLoading(false);
    setIsOpenRegionModal(false);
    setIsOpenBranchModal(false);
    setIsOpenEditRegionModal(false);
    setIsOpenEditBranchModal(false);
    setRegionName("");
    setRegionNameError("");
    setRegionId(null);
    setRegionIdError("");
    setBranchName("");
    setBranchNameError("");
    setEditRegionId(null);
    setEditRegionName("");
    setEditRegionNameError("");
    setEditBranchId(null);
    setEditBranchRegionId(null);
    setEditBranchRegionIdError("");
    setEditBranchName("");
    setEditBranchNameError("");
  };

  return (
    <div>
      <Row>
        <Col
          span={24}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <button
            className="leadmanager_addleadbutton"
            onClick={() => {
              setIsOpenRegionModal(true);
            }}
          >
            Add Region
          </button>
          <button
            className="leadmanager_addleadbutton"
            onClick={() => {
              setIsOpenBranchModal(true);
            }}
          >
            Add Branch
          </button>
        </Col>
      </Row>
      <div
        style={{ marginTop: "20px" }}
        className="regions_minimalist_dropdowns"
      >
        <CommonTable
          scroll={{ x: 600 }}
          columns={columns}
          dataSource={data}
          dataPerPage={10}
          loading={loading}
          checkBox="false"
          size="small"
          className="questionupload_table"
          onPaginationChange={handlePaginationChange} // callback to fetch new data
          limit={pagination.limit} // page size
          page_number={pagination.page} // current page
          totalPageNumber={pagination.total} // total rows
        />
      </div>

      {/* region modal */}
      <Modal
        title="Add Region"
        open={isOpenRegionModal}
        onCancel={formReset}
        footer={[
          <Button
            key="cancel"
            onClick={formReset}
            className="leads_coursemodal_cancelbutton"
          >
            Cancel
          </Button>,

          buttonLoading ? (
            <Button
              key="create"
              type="primary"
              className="leads_coursemodal_loading_createbutton"
            >
              <CommonSpinner />
            </Button>
          ) : (
            <Button
              key="create"
              type="primary"
              onClick={handleRegionCreate}
              className="leads_coursemodal_createbutton"
            >
              Create
            </Button>
          ),
        ]}
        width="32%"
      >
        <div style={{ marginTop: "20px", marginBottom: "30px" }}>
          <CommonInputField
            label="Region Name"
            onChange={(e) => {
              setRegionName(e.target.value);
              setRegionNameError(addressValidator(e.target.value));
            }}
            value={regionName}
            error={regionNameError}
            errorFontSize={"10px"}
          />
        </div>
      </Modal>

      {/* branch modal */}
      <Modal
        title="Add Branch"
        open={isOpenBranchModal}
        onCancel={formReset}
        footer={[
          <Button
            key="cancel"
            onClick={formReset}
            className="leads_coursemodal_cancelbutton"
          >
            Cancel
          </Button>,

          buttonLoading ? (
            <Button
              key="create"
              type="primary"
              className="leads_coursemodal_loading_createbutton"
            >
              <CommonSpinner />
            </Button>
          ) : (
            <Button
              key="create"
              type="primary"
              onClick={handleBranchCreate}
              className="leads_coursemodal_createbutton"
            >
              Create
            </Button>
          ),
        ]}
        width="32%"
      >
        <div style={{ marginTop: "20px", marginBottom: "24px" }}>
          <CommonSelectField
            label="Select Region"
            options={globalRegionsList}
            onChange={(e) => {
              setRegionId(e.target.value);
              setRegionIdError(selectValidator(e.target.value));
            }}
            value={regionId}
            error={regionIdError}
            errorFontSize={"10px"}
          />
        </div>

        <div style={{ marginTop: "20px", marginBottom: "30px" }}>
          <CommonInputField
            label="Branch Name"
            onChange={(e) => {
              setBranchName(e.target.value);
              setBranchNameError(addressValidator(e.target.value));
            }}
            value={branchName}
            error={branchNameError}
            errorFontSize={"10px"}
          />
        </div>
      </Modal>

      {/* edit region modal */}
      <Modal
        title="Edit Region"
        open={isOpenEditRegionModal}
        onCancel={formReset}
        footer={[
          <Button
            key="cancel"
            onClick={formReset}
            className="leads_coursemodal_cancelbutton"
          >
            Cancel
          </Button>,

          editButtonLoading ? (
            <Button
              key="update"
              type="primary"
              className="leads_coursemodal_loading_createbutton"
            >
              <CommonSpinner />
            </Button>
          ) : (
            <Button
              key="update"
              type="primary"
              onClick={handleRegionUpdate}
              className="leads_coursemodal_createbutton"
            >
              Update
            </Button>
          ),
        ]}
        width="32%"
      >
        <div style={{ marginTop: "20px", marginBottom: "30px" }}>
          <CommonInputField
            label="Region Name"
            onChange={(e) => {
              setEditRegionName(e.target.value);
              setEditRegionNameError(addressValidator(e.target.value));
            }}
            value={editRegionName}
            error={editRegionNameError}
            errorFontSize={"10px"}
          />
        </div>
      </Modal>

      {/* edit branch modal */}
      <Modal
        title="Edit Branch"
        open={isOpenEditBranchModal}
        onCancel={formReset}
        footer={[
          <Button
            key="cancel"
            onClick={formReset}
            className="leads_coursemodal_cancelbutton"
          >
            Cancel
          </Button>,

          editButtonLoading ? (
            <Button
              key="update"
              type="primary"
              className="leads_coursemodal_loading_createbutton"
            >
              <CommonSpinner />
            </Button>
          ) : (
            <Button
              key="update"
              type="primary"
              onClick={handleBranchUpdate}
              className="leads_coursemodal_createbutton"
            >
              Update
            </Button>
          ),
        ]}
        width="32%"
      >
        <div style={{ marginTop: "20px", marginBottom: "24px" }}>
          <CommonSelectField
            label="Select Region"
            options={globalRegionsList}
            onChange={(e) => {
              setEditBranchRegionId(e.target.value);
              setEditBranchRegionIdError(selectValidator(e.target.value));
            }}
            value={editBranchRegionId}
            error={editBranchRegionIdError}
            errorFontSize={"10px"}
          />
        </div>

        <div style={{ marginTop: "20px", marginBottom: "30px" }}>
          <CommonInputField
            label="Branch Name"
            onChange={(e) => {
              setEditBranchName(e.target.value);
              setEditBranchNameError(addressValidator(e.target.value));
            }}
            value={editBranchName}
            error={editBranchNameError}
            errorFontSize={"10px"}
          />
        </div>
      </Modal>
    </div>
  );
}
