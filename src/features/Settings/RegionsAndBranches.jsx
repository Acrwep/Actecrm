import React, { useEffect, useState } from "react";
import CommonTable from "../Common/CommonTable";
import CommonSelectField from "../Common/CommonSelectField";
import { useDispatch, useSelector } from "react-redux";
import { Col, Modal, Row, Button } from "antd";
import {
  getBranchManagers,
  updateBranchManager,
  assignBranchManager,
  getUsers,
  createRegion,
  createBranch,
  getRegions,
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
  //other usestates
  const [buttonLoading, setButtonLoading] = useState(false);
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

  const columns = [
    { title: "Region Name", key: "region_name", dataIndex: "region_name" },
    { title: "Branch Name", key: "branch_name", dataIndex: "branch_name" },
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
        error?.response?.data?.message ||
        error?.response?.data?.details ||
        "Failed to create branch";
      CommonMessage("error", errorMessage);
    }
  };

  const formReset = () => {
    setButtonLoading(false);
    setIsOpenRegionModal(false);
    setIsOpenBranchModal(false);
    setRegionName("");
    setRegionNameError("");
    setRegionId(null);
    setRegionIdError("");
    setBranchName("");
    setBranchNameError("");
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
    </div>
  );
}
