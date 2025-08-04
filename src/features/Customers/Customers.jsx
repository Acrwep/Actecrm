import React, { useState, useRef } from "react";
import { Row, Col } from "antd";
import { CiSearch } from "react-icons/ci";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonDatePicker from "../Common/CommonDatePicker";
import CommonDoubleDatePicker from "../Common/CommonDoubleDatePicker";
import CommonTable from "../Common/CommonTable";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import "./styles.css";

export default function Customers() {
  const scrollRef = useRef();

  const scroll = (scrollOffset) => {
    scrollRef.current.scrollBy({
      left: scrollOffset,
      behavior: "smooth",
    });
  };

  const [defaultColumns, setDefaultColumns] = useState([
    { title: "Candidate Name", isChecked: true },
    { title: "Email", isChecked: true },
    { title: "Mobile", isChecked: true },
    { title: "Course ", isChecked: true },
    { title: "Joined ", isChecked: true },
    { title: "Fees", isChecked: true },
    { title: "Balance", isChecked: true },
    { title: "Lead By ", isChecked: true },
    { title: "Trainer", isChecked: true },
    { title: "TR Number", isChecked: true },
    { title: "Status", isChecked: true },
    { title: "TR Number", isChecked: true },
    { title: "Update", isChecked: true },
  ]);

  const [columns, setColumns] = useState([
    { title: "Candidate Name", key: "name", dataIndex: "name", width: 200 },
    { title: "Email", key: "email", dataIndex: "email", width: 220 },
    { title: "Mobile", key: "mobile", dataIndex: "mobile" },
    { title: "Course ", key: "course", dataIndex: "course" },
    { title: "Joined ", key: "joined", dataIndex: "joined" },
    { title: "Fees", key: "fees", dataIndex: "fees" },
    { title: "Balance", key: "balance", dataIndex: "balance" },
    { title: "Lead By", key: "leadby", dataIndex: "leadby" },
    { title: "Trainer", key: "trainer", dataIndex: "trainer" },
    { title: "TR Number", key: "trnumber", dataIndex: "trnumber" },
    { title: "Status", key: "status", dataIndex: "status" },
    { title: "TR Number", key: "trnumber", dataIndex: "trnumber" },
    { title: "Update", key: "update", dataIndex: "update", width: 220 },
  ]);

  const nonChangeColumns = [
    { title: "Candidate Name", key: "name", dataIndex: "name" },
    { title: "Email", key: "email", dataIndex: "email" },
    { title: "Mobile", key: "mobile", dataIndex: "mobile" },
    { title: "Course ", key: "course", dataIndex: "course" },
    { title: "Joined ", key: "joined", dataIndex: "joined" },
    { title: "Fees", key: "fees", dataIndex: "fees" },
    { title: "Balance", key: "balance", dataIndex: "balance" },
    { title: "Lead By", key: "leadby", dataIndex: "leadby" },
    { title: "Trainer", key: "trainer", dataIndex: "trainer" },
    { title: "TR Number", key: "trnumber", dataIndex: "trnumber" },
    { title: "Status", key: "status", dataIndex: "status" },
    { title: "TR Number", key: "trnumber", dataIndex: "trnumber" },
    { title: "Update", key: "update", dataIndex: "update" },
  ];

  const customersData = [
    {
      id: 1,
      name: "Balaji",
      email: "balaji@gmail.com",
      mobile: "9786564561",
      course: "Full Statck",
      joined: "22/07/2025",
      fees: "22000",
      balance: "12000",
      leadby: "8009",
      trainer: "Vijay",
      trnumber: "+91 7795460653",
      status: "Not Assign",
      update: "Awaiting Student",
    },
  ];

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
          {/* <FiFilter
            size={20}
            color="#5b69ca"
            style={{ marginLeft: "12px", cursor: "pointer" }}
            onClick={() => setIsOpenFilterDrawer(true)}
          /> */}
        </Col>
      </Row>

      <div className="customers_scroll_wrapper">
        <button
          onClick={() => scroll(-600)}
          className="customer_statusscroll_button"
        >
          <IoMdArrowDropleft size={25} />
        </button>
        <div className="customers_status_mainContainer" ref={scrollRef}>
          <div className="customers_awaitregister_container">
            <p>Awaiting Register {`( 1 )`}</p>
          </div>
          <div className="customers_awaitfinance_container">
            <p>Awaiting Finance {`( 12 )`}</p>
          </div>
          <div className="customers_studentvefity_container">
            <p>Student Verify {`( 20 )`}</p>
          </div>
          <div className="customers_assigntrainers_container">
            <p>Assign Trainer {`( 34 )`}</p>
          </div>
          <div className="customers_verifytrainers_container">
            <p>Verify Trainer {`( 31 )`}</p>
          </div>
          <div className="customers_classschedule_container">
            <p>Class Schedule {`( 31 )`}</p>
          </div>
          <div className="customers_classgoing_container">
            <p>Class Going {`( 31 )`}</p>
          </div>
          <div className="customers_pendingfees_container">
            <p>Pending Fees {`( 31 )`}</p>
          </div>
          <div className="customers_escalated_container">
            <p>Escalated {`( 31 )`}</p>
          </div>
          <div className="customers_feedback_container">
            <p>Feedback {`( 31 )`}</p>
          </div>
          <div className="customers_completed_container">
            <p>Completed {`( 31 )`}</p>
          </div>
          <div className="customers_others_container">
            <p>Others {`( 31 )`}</p>
          </div>
        </div>
        <button
          onClick={() => scroll(600)}
          className="customer_statusscroll_button"
        >
          <IoMdArrowDropright size={25} />
        </button>
      </div>

      <div>
        <CommonTable
          scroll={{ x: 2200 }}
          columns={columns}
          dataSource={customersData}
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
