import React, { useState, useRef, useEffect } from "react";
import { Row, Col, Drawer, Progress, Modal } from "antd";
import { CiSearch } from "react-icons/ci";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonDoubleDatePicker from "../Common/CommonDoubleDatePicker";
import CommonInputField from "../Common/CommonInputField";
import {
  addressValidator,
  nameValidator,
  selectValidator,
} from "../Common/Validation";
import CommonDatePicker from "../Common/CommonDatePicker";
import CommonSelectField from "../Common/CommonSelectField";
import CommonTextArea from "../Common/CommonTextArea";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import { getBranches, getRegions } from "../ApiService/action";

export default function Batches() {
  const inputRef = useRef();
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [isOpenUserModal, setIsOpenUserModal] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [branchNameError, setBranchNameError] = useState("");
  const [regionOptions, setRegionOptions] = useState([]);
  const [regionId, setRegionId] = useState(null);
  const [regionError, setRegionError] = useState("");
  const [branchOptions, setBranchOptions] = useState([]);
  const [branch, setBranch] = useState("");
  const [branchError, setBranchError] = useState("");

  const columns = [
    { title: "Class Start", key: "classstart", dataIndex: "classstart" },
    { title: "Batch Id", key: "batchId", dataIndex: "batchId" },
    { title: "Trainer Id", key: "trainerId", dataIndex: "trainerId" },
    {
      title: "Trainer Name",
      key: "trainerName",
      dataIndex: "trainerName",
      width: 170,
    },
    { title: "Course ", key: "course", dataIndex: "course", width: 200 },
    { title: "Commercial ", key: "commercial", dataIndex: "commercial" },
    { title: "Duration ", key: "duration", dataIndex: "duration" },
    { title: "Mode ", key: "mode", dataIndex: "mode" },
    {
      title: "No of Users ",
      key: "userCount",
      dataIndex: "userCount",
      render: (text) => {
        return (
          <div
            className="batches_usercountContainer"
            onClick={() => setIsOpenUserModal(true)}
          >
            <p>{text + " " + "Users"}</p>
          </div>
        );
      },
    },
    { title: "Status", key: "status", dataIndex: "status" },
    {
      title: "Progress",
      key: "progress",
      dataIndex: "progress",
      render: (text) => {
        return <Progress percent={text} />;
      },
    },
  ];

  const batchData = [
    {
      classstart: "28/07/2025",
      batchId: "ONL260725003",
      trainerId: "TR359896",
      trainerName: "Test Trainer",
      course: "Fullstack Developer",
      branch: "Velachery",
      commercial: "5000",
      duration: "45",
      mode: "Online",
      userCount: 4,
      status: "Intiated",
      progress: 50,
    },
  ];

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

  useEffect(() => {
    getRegionData();
  }, []);

  const getRegionData = async () => {
    try {
      const response = await getRegions();
      setRegionOptions(response?.data?.data || []);
    } catch (error) {
      setRegionOptions([]);
      console.log("response status error", error);
    }
  };

  const getBranchesData = async (regionid) => {
    const payload = {
      region_id: regionid,
    };
    try {
      const response = await getBranches(payload);
      const branch_data = response?.data?.result || [];

      if (branch_data.length >= 1) {
        if (regionid == 1 || regionid == 2) {
          const reordered = [
            ...branch_data.filter((item) => item.name !== "Online"),
            ...branch_data.filter((item) => item.name === "Online"),
          ];
          setBranchOptions(reordered);
        } else {
          setBranchOptions([]);
          setBranch(branch_data[0]?.id);
        }
      } else {
        setBranchOptions([]);
      }
    } catch (error) {
      setBranchOptions([]);
      console.log("response status error", error);
    }
  };

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
              width="36%"
              height="33px"
              labelFontSize="12px"
              icon={<CiSearch size={16} />}
              labelMarginTop="-1px"
            />
            <CommonDoubleDatePicker />
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
              setTimeout(() => {
                inputRef.current?.focus();
              }, 0);
            }}
          >
            Add Batch
          </button>
        </Col>
      </Row>

      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 1600 }}
          columns={columns}
          dataSource={batchData}
          dataPerPage={10}
          // loading={tableLoading}
          checkBox="false"
          size="small"
          className="questionupload_table"
        />
      </div>

      {/* add batch drawer */}
      <Drawer
        title="Add Batch"
        open={isOpenAddDrawer}
        onClose={formReset}
        width="40%"
        style={{ position: "relative" }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <CommonInputField
              label="Batch Name"
              value={branchName}
              onChange={(e) => {
                setBranchName(e.target.value);
                setBranchNameError(addressValidator(e.target.value));
              }}
              error={branchNameError}
              required={true}
              ref={inputRef}
            />
          </Col>
          <Col span={12}>
            <CommonSelectField
              label="Region"
              required={true}
              options={regionOptions}
              onChange={(e) => {
                setRegionId(e.target.value);
                setBranch("");
                getBranchesData(e.target.value);
                setRegionError(selectValidator(e.target.value));
              }}
              value={regionId}
            />
          </Col>

          {regionId == 3 ? (
            ""
          ) : (
            <Col span={12} style={{ marginTop: "30px" }}>
              <CommonSelectField
                label="Branch"
                required={true}
                options={branchOptions}
                onChange={(e) => {
                  setBranch(e.target.value);
                  setBranchError(selectValidator(e.target.value));
                }}
                value={branch}
              />
            </Col>
          )}

          <Col span={12} style={{ marginTop: "30px" }}></Col>
        </Row>

        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            <button className="leadmanager_tablefilter_applybutton">
              Save
            </button>
          </div>
        </div>
      </Drawer>

      {/* user modal */}

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
            // loading={tableLoading}
            checkBox="false"
            size="small"
            paginationStatus={false}
            className="questionupload_table"
          />{" "}
        </div>

        <p className="batch_usermodal_addcandidate">Add Candidate</p>

        <Row>
          <Col span={12}>
            <div className="batch_usermodal_addcandidate_buttonContainer">
              <CommonInputField label="Candidate Name" />
              <button className="batch_usermodal_addcandidate_button">
                + Add
              </button>
            </div>
          </Col>
        </Row>
      </Modal>
    </div>
  );
}
