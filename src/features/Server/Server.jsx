import React from "react";
import { Row, Col } from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CiSearch } from "react-icons/ci";
import CommonTable from "../Common/CommonTable";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";

export default function Server() {
  const columns = [
    { title: "Requested On", key: "requestedon", dataIndex: "requestedon" },
    { title: "BDE Status", key: "bdestatus", dataIndex: "bdestatus" },
    { title: "Created By", key: "createdby", dataIndex: "createdby" },
    { title: "Name", key: "name", dataIndex: "name", width: 200 },
    { title: "Mobile", key: "mobile", dataIndex: "mobile" },
    { title: "Email", key: "email", dataIndex: "email", width: 240 },
    { title: "Fees", key: "fees", dataIndex: "fees" },
    { title: "Technical", key: "technical", dataIndex: "technical" },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      fixed: "right",
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

  const serverData = [
    {
      requestedon: "29/07/2025",
      bdestatus: "Pending",
      createdby: "Suruthi",
      name: "Ajay Santhosh",
      mobile: "+91 9843892764",
      email: "ajaysanthoshkarthi@gmail.com",
      fees: "32000",
      technical: "Oracle",
    },
  ];

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
        ></Col>
      </Row>

      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 1400 }}
          columns={columns}
          dataSource={serverData}
          dataPerPage={10}
          // loading={tableLoading}
          checkBox="false"
          size="small"
          className="questionupload_table"
        />
      </div>
    </div>
  );
}
