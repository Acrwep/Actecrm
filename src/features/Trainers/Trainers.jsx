import React, { useState } from "react";
import { Row, Col, Modal, Drawer } from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CiSearch } from "react-icons/ci";
import CommonTable from "../Common/CommonTable";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import { SiWhatsapp } from "react-icons/si";
import "./styles.css";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import CommonMultiSelect from "../Common/CommonMultiSelect";

export default function Trainers() {
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const columns = [
    { title: "Trainer ID", key: "trainerId", dataIndex: "trainerId" },
    { title: "Trainer Name", key: "trainerName", dataIndex: "trainerName" },
    { title: "Mobile", key: "mobile", dataIndex: "mobile" },
    { title: "Technology", key: "technology", dataIndex: "technology" },
    { title: "Experience", key: "experience", dataIndex: "experience" },
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

  const trainerData = [
    {
      trainerId: "TR251535",
      trainerName: "Santhosh",
      mobile: "9676543452",
      technology: "Full stack",
      experience: "3 years",
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
            Add Trainer
          </button>
        </Col>
      </Row>

      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 800 }}
          columns={columns}
          dataSource={trainerData}
          dataPerPage={10}
          // loading={tableLoading}
          checkBox="false"
          size="small"
          className="questionupload_table"
        />
      </div>

      <Drawer
        title="Add Trainer"
        open={isOpenAddDrawer}
        onClose={formReset}
        width="38%"
        style={{ position: "relative" }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <CommonInputField
              label="Trainer Name"
              //   value={name}
              //   onChange={(e) => {
              //     setName(e.target.value);
              //     setNameError(nameValidator(e.target.value));
              //   }}
              //   error={nameError}
              required={true}
            />
          </Col>
          <Col span={12}>
            <CommonInputField label="Profile Name" required={true} />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={12}>
            <CommonInputField label="Mobile Number" required={true} />
          </Col>
          <Col span={12}>
            <CommonOutlinedInput
              label="Whatsapp Number"
              icon={<SiWhatsapp color="#39AE41" />}
              required={true}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={12}>
            <CommonInputField label="Email" required={true} />
          </Col>
          <Col span={12}>
            <CommonSelectField label="Experience" required={true} />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={12}>
            <CommonSelectField label="Trainer Type" required={true} />
          </Col>
          <Col span={12}>
            <CommonMultiSelect
              label="Skills"
              required={true}
              options={[{ id: 1, title: "Name" }]}
            />
          </Col>
        </Row>

        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            <button className="leadmanager_tablefilter_applybutton">
              Save
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
