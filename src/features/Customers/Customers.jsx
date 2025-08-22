import React, { useState, useRef, useEffect } from "react";
import { Row, Col, Tooltip, Drawer } from "antd";
import { CiSearch } from "react-icons/ci";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonDatePicker from "../Common/CommonDatePicker";
import CommonDoubleDatePicker from "../Common/CommonDoubleDatePicker";
import CommonTable from "../Common/CommonTable";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import "./styles.css";
import { getCustomers, sendCustomerFormEmail } from "../ApiService/action";
import { getCurrentandPreviousweekDate } from "../Common/Validation";
import { LuSend } from "react-icons/lu";
import CommonSpinner from "../Common/CommonSpinner";
import { CommonMessage } from "../Common/CommonMessage";
import { FaRegEye } from "react-icons/fa";
import ProfileImage from "../../assets/profile_image.jpg";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { BsGenderMale } from "react-icons/bs";
import { MdOutlineDateRange } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import moment from "moment";

export default function Customers() {
  const scrollRef = useRef();

  const scroll = (scrollOffset) => {
    scrollRef.current.scrollBy({
      left: scrollOffset,
      behavior: "smooth",
    });
  };
  const [selectedDates, setSelectedDates] = useState([]);
  const [loadingRowId, setLoadingRowId] = useState(null); // track only one row's loader
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loading, setLoading] = useState(true);

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
    { title: "Update", isChecked: true },
  ]);

  const columns = [
    { title: "Candidate Name", key: "name", dataIndex: "name", width: 200 },
    { title: "Email", key: "email", dataIndex: "email", width: 220 },
    { title: "Mobile", key: "phone", dataIndex: "phone" },
    { title: "Course ", key: "course_name", dataIndex: "course_name" },
    { title: "Joined ", key: "date_of_joining", dataIndex: "date_of_joining" },
    { title: "Fees", key: "primary_fees", dataIndex: "primary_fees" },
    { title: "Balance", key: "balance_amount", dataIndex: "balance_amount" },
    { title: "Lead By", key: "lead_by", dataIndex: "lead_by" },
    { title: "Trainer", key: "trainer", dataIndex: "trainer" },
    { title: "TR Number", key: "trnumber", dataIndex: "trnumber" },
    { title: "Status", key: "status", dataIndex: "status", fixed: "right" },
    {
      title: "Action",
      key: "update",
      dataIndex: "update",
      width: 140,
      fixed: "right",
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            <Tooltip
              placement="top"
              title="Send Form Link"
              trigger={["hover", "click"]}
            >
              {loadingRowId === record.id ? (
                <CommonSpinner color="#333" />
              ) : (
                <LuSend
                  size={17}
                  className="trainers_action_icons"
                  onClick={() => handleSendFormLink(record.email, record.id)}
                />
              )}
            </Tooltip>

            <Tooltip
              placement="top"
              title="View Details"
              trigger={["hover", "click"]}
            >
              <FaRegEye
                size={17}
                className="trainers_action_icons"
                onClick={() => {
                  setIsOpenDetailsDrawer(true);
                  setCustomerDetails(record);
                }}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

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
    { title: "Update", key: "update", dataIndex: "update" },
  ];

  const [customersData, setCustomersData] = useState([]);
  // const customersData = [
  //   {
  //     id: 1,
  //     name: "Balaji",
  //     email: "balaji@gmail.com",
  //     mobile: "9786564561",
  //     course: "Full Statck",
  //     joined: "22/07/2025",
  //     fees: "22000",
  //     balance: "12000",
  //     leadby: "8009",
  //     trainer: "Vijay",
  //     trnumber: "+91 7795460653",
  //     status: "Not Assign",
  //     update: "Awaiting Student",
  //   },
  // ];

  useEffect(() => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);

    getCustomersData(PreviousAndCurrentDate[0], PreviousAndCurrentDate[1]);
  }, []);

  const getCustomersData = async (startDate, endDate) => {
    setLoading(true);
    const payload = {
      from_date: startDate,
      to_date: endDate,
    };

    try {
      const response = await getCustomers(payload);
      console.log("customers response", response);
      setCustomersData(response?.data?.data || []);
    } catch (error) {
      setCustomersData([]);
      console.log("get customers error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleDateChange = (dates, dateStrings) => {
    setSelectedDates(dateStrings);
    const startDate = dateStrings[0];
    const endDate = dateStrings[1];
    if (startDate != "" && endDate != "") {
      console.log("call function");
      getCustomersData(startDate, endDate);
    }
  };

  const handleSendFormLink = async (customerEmail, customerId) => {
    setLoadingRowId(customerId);
    console.log(customerEmail, customerId);
    const payload = {
      email: customerEmail,
      link: `${
        import.meta.env.VITE_EMAIL_URL
      }/customer-registration/${customerId}`,
      customer_id: customerId,
    };

    try {
      await sendCustomerFormEmail(payload);
      CommonMessage("success", "Form Link Send To Trainer");
      // setLoading(true);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    } finally {
      setTimeout(() => {
        setLoadingRowId(null);
      }, 300);
    }
  };

  const formReset = () => {
    setIsOpenDetailsDrawer(false);
    setCustomerDetails(null);
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
            <CommonDoubleDatePicker
              value={selectedDates}
              onChange={handleDateChange}
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
          scroll={{ x: 2000 }}
          columns={columns}
          dataSource={customersData}
          dataPerPage={10}
          loading={loading}
          checkBox="false"
          size="small"
          className="questionupload_table"
        />
      </div>

      <Drawer
        title="Customer Details"
        open={isOpenDetailsDrawer}
        onClose={formReset}
        width="45%"
        style={{ position: "relative" }}
      >
        <div className="customer_profileContainer">
          <img src={ProfileImage} className="cutomer_profileimage" />

          <div>
            <p className="customer_nametext">
              {" "}
              {customerDetails && customerDetails.name
                ? customerDetails.name
                : "-"}
            </p>
            <p className="customer_coursenametext">
              {" "}
              {customerDetails && customerDetails.course_name
                ? customerDetails.course_name
                : "-"}
            </p>
          </div>
        </div>

        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={12}>
            <Row>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <FaRegCircleUser size={15} color="gray" />
                  <p className="customerdetails_rowheading">Name</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.name
                    ? customerDetails.name
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <MdOutlineEmail size={15} color="gray" />
                  <p className="customerdetails_rowheading">Email</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.email
                    ? customerDetails.email
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <IoCallOutline size={15} color="gray" />
                  <p className="customerdetails_rowheading">Mobile</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.phone
                    ? customerDetails.phone
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <FaWhatsapp size={15} color="gray" />
                  <p className="customerdetails_rowheading">Whatsapp</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.whatsapp
                    ? customerDetails.whatsapp
                    : "-"}
                </p>
              </Col>
            </Row>
          </Col>

          <Col span={12}>
            <Row>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <MdOutlineDateRange size={15} color="gray" />
                  <p className="customerdetails_rowheading">Date Of Birth</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.date_of_birth
                    ? moment(customerDetails.date_of_birth).format("DD/MM/YYYY")
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <BsGenderMale size={15} color="gray" />
                  <p className="customerdetails_rowheading">Gender</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.gender
                    ? customerDetails.gender
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <IoLocationOutline size={15} color="gray" />
                  <p className="customerdetails_rowheading">Location</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {" "}
                  {customerDetails && customerDetails.current_location
                    ? customerDetails.current_location
                    : "-"}
                </p>
              </Col>
            </Row>
          </Col>
        </Row>

        <div className="customerdetails_coursecard">
          <div className="customerdetails_coursecard_headercontainer">
            <p>Course Details</p>
          </div>

          <div className="customerdetails_coursecard_contentcontainer">
            <Row>
              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Course Name</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.course_name
                        ? customerDetails.course_name
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Joining Date</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {" "}
                      {customerDetails && customerDetails.date_of_joining
                        ? moment(customerDetails.date_of_joining).format(
                            "DD/MM/YYYY"
                          )
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Branch</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.branch_name
                        ? customerDetails.branch_name
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Batch Timing</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.batch_timing
                        ? customerDetails.batch_timing
                        : "-"}
                    </p>
                  </Col>
                </Row>
              </Col>

              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Batch Track</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.batch_tracking
                        ? customerDetails.batch_tracking
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Training Mode
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.training_mode
                        ? customerDetails.training_mode
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Fees</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.primary_fees
                        ? customerDetails.primary_fees
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Balance</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p
                      className="customerdetails_text"
                      style={{ color: "#d32f2f", fontWeight: "500" }}
                    >
                      {customerDetails && customerDetails.balance_amount
                        ? customerDetails.balance_amount
                        : "-"}
                    </p>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </div>

        {customerDetails ? (
          <div className="customerdetails_signatureContainer">
            <p style={{ fontWeight: "500", marginRight: "40px" }}>Signature</p>
            <img
              src={`data:image/png;base64,${customerDetails.signature_image}`}
              alt="Trainer Signature"
              className="customer_signature_image"
            />
          </div>
        ) : (
          "-"
        )}
      </Drawer>
    </div>
  );
}
