import React, { useState, useRef, useEffect } from "react";
import {
  Row,
  Col,
  Tooltip,
  Drawer,
  Flex,
  Button,
  Radio,
  Divider,
  Upload,
  Checkbox,
  Progress,
  Collapse,
} from "antd";
import { CiSearch } from "react-icons/ci";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonDoubleDatePicker from "../Common/CommonDoubleDatePicker";
import CommonTable from "../Common/CommonTable";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import "./styles.css";
import {
  assignTrainerForCustomer,
  classScheduleForCustomer,
  getAssignTrainerHistoryForCustomer,
  getCustomers,
  getTrainerById,
  getTrainers,
  rejectTrainerForCustomer,
  sendCustomerFormEmail,
  updateClassGoingForCustomer,
  updateCustomerStatus,
  verifyCustomer,
  verifyCustomerPayment,
  verifyTrainerForCustomer,
} from "../ApiService/action";
import {
  addressValidator,
  formatToBackendIST,
  getCurrentandPreviousweekDate,
  percentageValidator,
  selectValidator,
} from "../Common/Validation";
import CommonSpinner from "../Common/CommonSpinner";
import { FaRegEye } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { BsGenderMale } from "react-icons/bs";
import { MdOutlineDateRange } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { RedoOutlined } from "@ant-design/icons";
import { FaRegUser } from "react-icons/fa";
import moment from "moment";
import { AiOutlineEdit } from "react-icons/ai";
import CustomerUpdate from "./CustomerUpdate";
import CommonTextArea from "../Common/CommonTextArea";
import { UploadOutlined } from "@ant-design/icons";
import { CommonMessage } from "../Common/CommonMessage";
import CommonSelectField from "../Common/CommonSelectField";
import CommonInputField from "../Common/CommonInputField";
import { LuIndianRupee } from "react-icons/lu";
import { FiFilter } from "react-icons/fi";
import CommonDnd from "../Common/CommonDnd";
import { BsPatchCheckFill } from "react-icons/bs";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";

export default function Customers() {
  const scrollRef = useRef();
  const customerUpdateRef = useRef();

  const scroll = (scrollOffset) => {
    scrollRef.current.scrollBy({
      left: scrollOffset,
      behavior: "smooth",
    });
  };
  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerStatusCount, setCustomerStatusCount] = useState(null);
  const [isOpenEditDrawer, setIsOpenEditDrawer] = useState(false);
  const [updateDrawerTabKey, setUpdateDrawerTabKey] = useState("1");
  const [customerId, setCustomerId] = useState(null);
  const [updateButtonLoading, setUpdateButtonLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [pendingFeesCount, setPendingFeesCount] = useState(0);
  const [pendingFeesCustomers, setPendingFeesCustomers] = useState([]);

  //finance usestates
  //student verify usestates
  const [isStatusUpdateDrawer, setIsStatusUpdateDrawer] = useState(false);
  const [drawerContentStatus, setDrawerContentStatus] = useState("");
  const [studentVerifyProofArray, setStudentVerifyProofArray] = useState([]);
  const [studentVerifyProofBase64, setStudentVerifyProofBase64] = useState("");
  const [studentVerifyProofError, setStudentVerifyProofError] = useState("");
  const [studentVerifyComments, setStudentVerifyComments] = useState("");
  const [studentVerifyCommentsError, setStudentVerifyCommentsError] =
    useState("");
  const [isSatisfied, setIsSatisfied] = useState(true);

  //assign trainer usestates
  const [trainersData, setTrainersData] = useState([]);
  const [trainerId, setTrainerId] = useState(null);
  const [trainerIdError, setTrainerIdError] = useState("");
  const [commercial, setCommercial] = useState(null);
  const [commercialError, setCommercialError] = useState("");
  const modeOfClassOptions = [
    { id: "Offline", name: "Offline" },
    { id: "Online", name: "Online" },
  ];
  const [modeOfClass, setModeOfClass] = useState(null);
  const [modeOfClassError, setModeOfClassError] = useState("");
  const trainerTypeOptions = [
    { id: "New", name: "New" },
    { id: "Exist", name: "Exist" },
    { id: "Permanent", name: "Permanent" },
  ];
  const [trainerType, setTrainerType] = useState(null);
  const [trainerTypeError, setTrainerTypeError] = useState("");

  const [assignTrainerProofArray, setAssignTrainerProofArray] = useState([]);
  const [assignTrainerProofBase64, setAssignTrainerProofBase64] = useState("");
  const [assignTrainerProofError, setAssignTrainerProofError] = useState("");
  const [assignTrainerComments, setAssignTrainerComments] = useState("");
  const [assignTrainerCommentsError, setAssignTrainerCommentsError] =
    useState("");
  const [trainerHistory, setTrainerHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [collapseDefaultKey, setCollapseDefaultKey] = useState(["1"]);
  //trainer verify usestates
  const [assignTrainerData, setAssignTrainerData] = useState(null);
  const [rejectTrainerComments, setRejectTrainerComments] = useState("");
  const [rejectTrainerCommentsError, setRejectTrainerCommentsError] =
    useState("");
  const [rejectbuttonLoader, setRejectButtonLoader] = useState(false);
  //class schedule usestates
  const scheduleOptions = [
    { id: 1, name: "On Going" },
    { id: 2, name: "Discontinue" },
    { id: 3, name: "Hold" },
    { id: 4, name: "Refund" },
    { id: 5, name: "Escalated" },
    { id: 6, name: "CGS" },
  ];
  const [scheduleId, setScheduleId] = useState(null);
  const [scheduleIdError, setScheduleIdError] = useState("");
  //class going usestates
  const [classGoingPercentage, setClassGoingPercentage] = useState(0);
  const [classGoingPercentageError, setClassGoingPercentageError] = useState(0);
  const [classGoingComments, setClassGoingComments] = useState("");
  //feedback usestates
  const [linkedinFeedbackArray, setLinkedinFeedbackArray] = useState([]);
  const [linkedinFeedbackBase64, setLinkedinFeedbackBase64] = useState("");
  const [linkedinFeedbackError, setLinkedinFeedbackError] = useState("");

  const [googleFeedbackArray, setGoogleFeedbackArray] = useState([]);
  const [googleFeedbackBase64, setGoogleFeedbackBase64] = useState("");
  const [googleFeedbackError, setGoogleFeedbackError] = useState("");
  const [courseDuration, setCourseDuration] = useState("");
  const [courseDurationError, setCourseDurationError] = useState("");
  const [courseCompleteDate, setCourseCompleteDate] = useState("");
  const [courseCompleteDateError, setCourseCompleteDateError] = useState("");

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
    { title: "Form Status", isChecked: true },
    { title: "Status", isChecked: true },
    { title: "Action", isChecked: true },
  ]);

  const [columns, setColumns] = useState([
    { title: "Candidate Name", key: "name", dataIndex: "name", width: 200 },
    { title: "Email", key: "email", dataIndex: "email", width: 220 },
    { title: "Mobile", key: "phone", dataIndex: "phone" },
    { title: "Course ", key: "course_name", dataIndex: "course_name" },
    { title: "Joined ", key: "date_of_joining", dataIndex: "date_of_joining" },
    { title: "Fees", key: "primary_fees", dataIndex: "primary_fees" },
    { title: "Balance", key: "balance_amount", dataIndex: "balance_amount" },
    { title: "Lead By", key: "lead_by", dataIndex: "lead_by" },
    {
      title: "Trainer",
      key: "trainer_name",
      dataIndex: "trainer_name",
      render: (text, record) => {
        if (record.is_trainer_verified === 1) {
          return <p>{text}</p>;
        } else {
          return <p>-</p>;
        }
      },
    },
    {
      title: "TR Number",
      key: "trainer_mobile",
      dataIndex: "trainer_mobile",
      render: (text, record) => {
        if (record.is_trainer_verified === 1) {
          return <p>{text}</p>;
        } else {
          return <p>-</p>;
        }
      },
    },
    {
      title: "Form Status",
      key: "form_status",
      dataIndex: "form_status",
      width: 120,
      fixed: "right",
      render: (text, record) => {
        return (
          <>
            {record.is_customer_updated === 1 ? (
              <p>Completed</p>
            ) : (
              <p>Pending</p>
            )}
          </>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      fixed: "right",
      render: (text, record) => {
        const classPercent = parseFloat(record.class_percentage);
        return (
          <Tooltip
            placement="bottomLeft"
            className="customers_statustooltip"
            color="#fff"
            styles={{
              body: {
                width: "300px",
                maxWidth: "none",
                whiteSpace: "normal",
              },
            }}
            // open={true}
            title={
              <>
                <Row>
                  <Col span={12}>
                    <Checkbox
                      className="customers_statuscheckbox"
                      style={{ marginTop: "6px" }}
                      checked={
                        record.status === "Awaiting Finance" ? false : true
                      }
                      onChange={(e) => {
                        if (record.status != "Awaiting Finance") {
                          CommonMessage("warning", "Already Verified");
                        } else {
                          setCustomerId(record.id);
                          setCustomerDetails(record);
                          setDrawerContentStatus("Finance Verify");
                          setIsStatusUpdateDrawer(true);
                        }
                      }}
                    >
                      Finance Verify
                    </Checkbox>
                  </Col>

                  <Col span={12}>
                    <Checkbox
                      className="customers_statuscheckbox"
                      checked={
                        record.status === "Awaiting Finance" ||
                        record.status === "Awaiting Verify"
                          ? false
                          : true
                      }
                      onChange={(e) => {
                        if (record.status === "Awaiting Finance") {
                          CommonMessage("warning", "Finance not Verified Yet");
                        } else if (record.status != "Awaiting Verify") {
                          CommonMessage("warning", "Already Verified");
                        } else if (record.status === "Awaiting Verify") {
                          setCustomerId(record.id);
                          setCustomerDetails(record);
                          setDrawerContentStatus("Student Verify");
                          setIsStatusUpdateDrawer(true);
                        }
                      }}
                    >
                      Student Verify
                    </Checkbox>
                  </Col>
                </Row>

                <Row>
                  <Col span={12}>
                    <Checkbox
                      className="customers_statuscheckbox"
                      checked={
                        record.status === "Awaiting Finance" ||
                        record.status === "Awaiting Verify" ||
                        record.status === "Awaiting Trainer"
                          ? false
                          : true
                      }
                      onChange={(e) => {
                        if (record.status === "Awaiting Finance") {
                          CommonMessage("warning", "Finance not Verified Yet");
                        } else if (record.status === "Awaiting Verify") {
                          CommonMessage("warning", "Customer not Verified Yet");
                        } else if (record.status === "Awaiting Trainer") {
                          setCustomerId(record.id);
                          setCustomerDetails(record);
                          setDrawerContentStatus("Assign Trainer");
                          handleTrainerHistory(record.id);
                          setIsStatusUpdateDrawer(true);
                        } else {
                          CommonMessage("warning", "Trainer Already Assigned");
                        }
                      }}
                    >
                      Assign Trainer
                    </Checkbox>
                  </Col>

                  <Col span={12}>
                    <Checkbox
                      className="customers_statuscheckbox"
                      checked={
                        record.status === "Awaiting Finance" ||
                        record.status === "Awaiting Verify" ||
                        record.status === "Awaiting Trainer" ||
                        record.status === "Awaiting Trainer Verify"
                          ? false
                          : true
                      }
                      onChange={(e) => {
                        if (record.status === "Awaiting Finance") {
                          CommonMessage("warning", "Finance not Verified Yet");
                        } else if (record.status === "Awaiting Verify") {
                          CommonMessage("warning", "Customer not Verified Yet");
                        } else if (record.status === "Awaiting Trainer") {
                          CommonMessage("warning", "Trainer not Assigned yet");
                        } else if (
                          record.status === "Awaiting Trainer Verify"
                        ) {
                          setCustomerId(record.id);
                          setCustomerDetails(record);
                          setDrawerContentStatus("Trainer Verify");
                          setIsStatusUpdateDrawer(true);
                          getAssignTrainerData(record.trainer_id);
                          setCommercial(record.commercial);
                          setModeOfClass(record.mode_of_class);
                          setTrainerType(record.trainer_type);
                        } else {
                          CommonMessage("warning", "Trainer Already Verified");
                        }
                      }}
                    >
                      Verify Trainer
                    </Checkbox>
                  </Col>
                </Row>

                <Row>
                  <Col span={12}>
                    <Checkbox
                      className="customers_statuscheckbox"
                      checked={
                        record.status === "Awaiting Finance" ||
                        record.status === "Awaiting Verify" ||
                        record.status === "Awaiting Trainer" ||
                        record.status === "Awaiting Trainer Verify" ||
                        record.status === "Awaiting Class"
                          ? false
                          : true
                      }
                      onChange={(e) => {
                        if (record.status === "Awaiting Finance") {
                          CommonMessage("warning", "Finance not Verified Yet");
                        } else if (record.status === "Awaiting Verify") {
                          CommonMessage("warning", "Customer not Verified Yet");
                        } else if (record.status === "Awaiting Trainer") {
                          CommonMessage("warning", "Trainer not Assigned yet");
                        } else if (
                          record.status === "Awaiting Trainer Verify"
                        ) {
                          CommonMessage("warning", "Trainer not Verified yet");
                        } else if (record.status === "Awaiting Class") {
                          setCustomerId(record.id);
                          setCustomerDetails(record);
                          setDrawerContentStatus("Class Schedule");
                          setIsStatusUpdateDrawer(true);
                          getAssignTrainerData(record.trainer_id);
                          setCommercial(record.commercial);
                          setModeOfClass(record.mode_of_class);
                          setTrainerType(record.trainer_type);
                        } else {
                          CommonMessage("warning", "Class Already Scheduled");
                        }
                      }}
                    >
                      Schedule Class
                    </Checkbox>
                  </Col>

                  {record.status === "Class Going" ||
                  record.status === "Awaiting Feedback" ||
                  record.status === "Completed" ? (
                    <Col span={12}>
                      {classPercent < 100 ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <button
                            className="customers_classgoing_updatebutton"
                            onClick={() => {
                              setCustomerId(record.id);
                              setCustomerDetails(record);
                              setDrawerContentStatus("Class Going");
                              setIsStatusUpdateDrawer(true);
                              setClassGoingPercentage(
                                parseFloat(record.class_percentage)
                              );
                            }}
                          >
                            Update Class Going
                          </button>
                        </div>
                      ) : (
                        <div className="customers_classcompleted_container">
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            100% Class Completed
                          </p>
                        </div>
                      )}
                    </Col>
                  ) : (
                    ""
                  )}
                </Row>

                {record.status === "Awaiting Feedback" ? (
                  <Row style={{ marginTop: "4px" }}>
                    <Col span={12}>
                      <button
                        className="customers_addfeedbackbutton"
                        onClick={() => {
                          setCustomerId(record.id);
                          setCustomerDetails(record);
                          setDrawerContentStatus("Add Feedback");
                          setIsStatusUpdateDrawer(true);
                        }}
                      >
                        Add Feedback
                      </button>
                    </Col>
                    <Col span={12}></Col>
                  </Row>
                ) : record.status === "Completed" ? (
                  <Row style={{ marginBottom: "8px" }}>
                    <Col span={12}>
                      <div className="customers_classcompleted_container">
                        <BsPatchCheckFill color="#3c9111" />
                        <p className="customers_classgoing_completedtext">
                          Feedback Collected
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="customers_classcompleted_container">
                        <BsPatchCheckFill color="#3c9111" />
                        <p className="customers_classgoing_completedtext">
                          Certificate Issued
                        </p>
                      </div>
                    </Col>
                  </Row>
                ) : (
                  ""
                )}
              </>
            }
          >
            {text === "Pending" ||
            text === "PENDING" ||
            text === "Verify Pending" ? (
              <Button className="trainers_pending_button">Pending</Button>
            ) : text === "Awaiting Finance" ? (
              <div>
                <Button className="customers_status_awaitfinance_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Verify" ? (
              <div>
                <Button className="customers_status_awaitverify_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Trainer" ? (
              <div>
                <Button className="customers_status_awaittrainer_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Trainer Verify" ? (
              <div>
                <Button className="customers_status_awaittrainerverify_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Class" ? (
              <div>
                <Button className="customers_status_awaitclassschedule_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Feedback" ? (
              <div>
                <Button className="customers_status_awaitfeedback_button">
                  {text}
                </Button>
              </div>
            ) : text === "Completed" ? (
              <div>
                <Button className="customers_status_completed_button">
                  {text}
                </Button>
              </div>
            ) : text === "Rejected" || text === "REJECTED" ? (
              <Button className="trainers_rejected_button">Rejected</Button>
            ) : text === "Class Going" ? (
              <div style={{ display: "flex", gap: "12px" }}>
                <Button className="customers_status_classgoing_button">
                  {text}
                </Button>

                <p className="customer_classgoing_percentage">{`${parseFloat(
                  record.class_percentage
                )}%`}</p>
              </div>
            ) : (
              <p style={{ marginLeft: "6px" }}>-</p>
            )}
          </Tooltip>
        );
      },
    },
    {
      title: "Action",
      key: "update",
      dataIndex: "update",
      width: 140,
      fixed: "right",
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            {/* <Tooltip
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
            </Tooltip> */}
            <AiOutlineEdit
              size={20}
              className="trainers_action_icons"
              onClick={() => handleEdit(record)}
            />
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
  ]);

  const nonChangeColumns = [
    { title: "Candidate Name", key: "name", dataIndex: "name", width: 200 },
    { title: "Email", key: "email", dataIndex: "email", width: 220 },
    { title: "Mobile", key: "phone", dataIndex: "phone" },
    { title: "Course ", key: "course_name", dataIndex: "course_name" },
    { title: "Joined ", key: "date_of_joining", dataIndex: "date_of_joining" },
    { title: "Fees", key: "primary_fees", dataIndex: "primary_fees" },
    { title: "Balance", key: "balance_amount", dataIndex: "balance_amount" },
    { title: "Lead By", key: "lead_by", dataIndex: "lead_by" },
    {
      title: "Trainer",
      key: "trainer_name",
      dataIndex: "trainer_name",
      render: (text, record) => {
        if (record.is_trainer_verified === 1) {
          return <p>{text}</p>;
        } else {
          return <p>-</p>;
        }
      },
    },
    {
      title: "TR Number",
      key: "trainer_mobile",
      dataIndex: "trainer_mobile",
      render: (text, record) => {
        if (record.is_trainer_verified === 1) {
          return <p>{text}</p>;
        } else {
          return <p>-</p>;
        }
      },
    },
    {
      title: "Form Status",
      key: "form_status",
      dataIndex: "form_status",
      width: 120,
      fixed: "right",
      render: (text, record) => {
        return (
          <>
            {record.is_customer_updated === 1 ? (
              <p>Completed</p>
            ) : (
              <p>Pending</p>
            )}
          </>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      fixed: "right",
      render: (text, record) => {
        return (
          <Tooltip
            placement="bottomLeft"
            className="customers_statustooltip"
            color="#fff"
            styles={{
              body: {
                width: "300px",
                maxWidth: "none",
                whiteSpace: "normal",
              },
            }}
            // open={true}
            title={
              <>
                <Row>
                  <Col span={12}>
                    <Checkbox
                      className="customers_statuscheckbox"
                      style={{ marginTop: "6px" }}
                      checked={
                        record.status === "Awaiting Finance" ? false : true
                      }
                      onChange={(e) => {
                        if (record.status != "Awaiting Finance") {
                          CommonMessage("warning", "Already Verified");
                        } else {
                          setCustomerId(record.id);
                          setCustomerDetails(record);
                          setDrawerContentStatus("Finance Verify");
                          setIsStatusUpdateDrawer(true);
                        }
                      }}
                    >
                      Finance Verify
                    </Checkbox>
                  </Col>

                  <Col span={12}>
                    <Checkbox
                      className="customers_statuscheckbox"
                      checked={
                        record.status === "Awaiting Finance" ||
                        record.status === "Awaiting Verify"
                          ? false
                          : true
                      }
                      onChange={(e) => {
                        if (record.status === "Awaiting Finance") {
                          CommonMessage("warning", "Finance not Verified Yet");
                        } else if (record.status != "Awaiting Verify") {
                          CommonMessage("warning", "Already Verified");
                        } else if (record.status === "Awaiting Verify") {
                          setCustomerId(record.id);
                          setCustomerDetails(record);
                          setDrawerContentStatus("Student Verify");
                          setIsStatusUpdateDrawer(true);
                        }
                      }}
                    >
                      Student Verify
                    </Checkbox>
                  </Col>
                </Row>

                <Row>
                  <Col span={12}>
                    <Checkbox
                      className="customers_statuscheckbox"
                      checked={
                        record.status === "Awaiting Finance" ||
                        record.status === "Awaiting Verify" ||
                        record.status === "Awaiting Trainer"
                          ? false
                          : true
                      }
                      onChange={(e) => {
                        if (record.status === "Awaiting Finance") {
                          CommonMessage("warning", "Finance not Verified Yet");
                        } else if (record.status === "Awaiting Verify") {
                          CommonMessage("warning", "Customer not Verified Yet");
                        } else if (record.status === "Awaiting Trainer") {
                          setCustomerId(record.id);
                          setCustomerDetails(record);
                          setDrawerContentStatus("Assign Trainer");
                          setIsStatusUpdateDrawer(true);
                        } else {
                          CommonMessage("warning", "Trainer Already Assigned");
                        }
                      }}
                    >
                      Assign Trainer
                    </Checkbox>
                  </Col>

                  <Col span={12}>
                    <Checkbox
                      className="customers_statuscheckbox"
                      checked={
                        record.status === "Awaiting Finance" ||
                        record.status === "Awaiting Verify" ||
                        record.status === "Awaiting Trainer" ||
                        record.status === "Awaiting Trainer Verify"
                          ? false
                          : true
                      }
                      onChange={(e) => {
                        if (record.status === "Awaiting Finance") {
                          CommonMessage("warning", "Finance not Verified Yet");
                        } else if (record.status === "Awaiting Verify") {
                          CommonMessage("warning", "Customer not Verified Yet");
                        } else if (record.status === "Awaiting Trainer") {
                          CommonMessage("warning", "Trainer not Assigned yet");
                        } else if (
                          record.status === "Awaiting Trainer Verify"
                        ) {
                          setCustomerId(record.id);
                          setCustomerDetails(record);
                          setDrawerContentStatus("Trainer Verify");
                          setIsStatusUpdateDrawer(true);
                          getAssignTrainerData(record.trainer_id);
                          setCommercial(record.commercial);
                          setModeOfClass(record.mode_of_class);
                          setTrainerType(record.trainer_type);
                        } else {
                          CommonMessage("warning", "Trainer Already Verified");
                        }
                      }}
                    >
                      Verify Trainer
                    </Checkbox>
                  </Col>
                </Row>

                <Row>
                  <Col span={12}>
                    <Checkbox
                      className="customers_statuscheckbox"
                      checked={
                        record.status === "Awaiting Finance" ||
                        record.status === "Awaiting Verify" ||
                        record.status === "Awaiting Trainer" ||
                        record.status === "Awaiting Trainer Verify" ||
                        record.status === "Awaiting Class"
                          ? false
                          : true
                      }
                      onChange={(e) => {
                        if (record.status === "Awaiting Finance") {
                          CommonMessage("warning", "Finance not Verified Yet");
                        } else if (record.status === "Awaiting Verify") {
                          CommonMessage("warning", "Customer not Verified Yet");
                        } else if (record.status === "Awaiting Trainer") {
                          CommonMessage("warning", "Trainer not Assigned yet");
                        } else if (
                          record.status === "Awaiting Trainer Verify"
                        ) {
                          CommonMessage("warning", "Trainer not Verified yet");
                        } else if (record.status === "Awaiting Class") {
                          setCustomerId(record.id);
                          setCustomerDetails(record);
                          setDrawerContentStatus("Class Schedule");
                          setIsStatusUpdateDrawer(true);
                          getAssignTrainerData(record.trainer_id);
                          setCommercial(record.commercial);
                          setModeOfClass(record.mode_of_class);
                          setTrainerType(record.trainer_type);
                        } else {
                          CommonMessage("warning", "Class Already Scheduled");
                        }
                      }}
                    >
                      Schedule Class
                    </Checkbox>
                  </Col>

                  {record.status === "Class Going" ? (
                    <Col span={12}>
                      {/* <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <button
                          className="customers_classgoing_updatebutton"
                          onClick={() => {
                            setCustomerId(record.id);
                            setCustomerDetails(record);
                            setDrawerContentStatus("Class Going");
                            setIsStatusUpdateDrawer(true);
                            getAssignTrainerData(record.trainer_id);
                            setCommercial(record.commercial);
                            setModeOfClass(record.mode_of_class);
                            setTrainerType(record.trainer_type);
                          }}
                        >
                          Update Class Going
                        </button>
                      </div> */}

                      <BsPatchCheckFill />
                      <p className="customers_classgoing_completedtext">
                        100% Class Completed
                      </p>
                    </Col>
                  ) : (
                    ""
                  )}
                </Row>
              </>
            }
          >
            {text === "Pending" ||
            text === "PENDING" ||
            text === "Verify Pending" ? (
              <Button className="trainers_pending_button">Pending</Button>
            ) : text === "Awaiting Finance" ? (
              <div>
                <Button className="customers_status_awaitfinance_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Verify" ? (
              <div>
                <Button className="customers_status_awaitverify_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Trainer" ? (
              <div>
                <Button className="customers_status_awaittrainer_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Trainer Verify" ? (
              <div>
                <Button className="customers_status_awaittrainerverify_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Class" ? (
              <div>
                <Button className="customers_status_awaitclassschedule_button">
                  {text}
                </Button>
              </div>
            ) : text === "Rejected" || text === "REJECTED" ? (
              <Button className="trainers_rejected_button">Rejected</Button>
            ) : text === "Class Going" ? (
              <div style={{ display: "flex", gap: "12px" }}>
                <Button className="customers_status_classgoing_button">
                  {text}
                </Button>
                <p className="customer_classgoing_percentage">{`${parseFloat(
                  record.class_percentage
                )}%`}</p>{" "}
              </div>
            ) : (
              <p style={{ marginLeft: "6px" }}>-</p>
            )}
          </Tooltip>
        );
      },
    },
    {
      title: "Action",
      key: "update",
      dataIndex: "update",
      width: 140,
      fixed: "right",
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            <AiOutlineEdit
              size={20}
              className="trainers_action_icons"
              onClick={() => handleEdit(record)}
            />
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

  const [customersData, setCustomersData] = useState([]);

  useEffect(() => {
    getTrainersData();
  }, []);

  const getTrainersData = async () => {
    setLoading(true);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);

    const payload = {
      status: "Verified",
    };
    try {
      const response = await getTrainers(payload);
      setTrainersData(response?.data?.data?.trainers || []);
    } catch (error) {
      setTrainersData([]);
      console.log(error);
    } finally {
      setTimeout(() => {
        getCustomersData(
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          null,
          null
        );
      }, 300);
    }
  };

  const getCustomersData = async (
    startDate,
    endDate,
    searchvalue,
    customerStatus
  ) => {
    setLoading(true);
    const payload = {
      ...(searchvalue ? { name: searchvalue } : {}),
      from_date: startDate,
      to_date: endDate,
      ...(customerStatus && customerStatus == 1
        ? { is_form_sent: customerStatus }
        : customerStatus && { status: customerStatus }),
    };

    try {
      const response = await getCustomers(payload);
      console.log("customers response", response);
      const customers = response?.data?.data?.customers;
      setCustomersData(response?.data?.data?.customers || []);
      setCustomerStatusCount(
        response?.data?.data?.customer_status_count || null
      );
      if (customers.length >= 1) {
        const pending_fees_customers = customers.filter(
          (f) => f.balance_amount >= 1
        );

        setPendingFeesCount(pending_fees_customers.length);
        setPendingFeesCustomers(pending_fees_customers);
      } else {
        setPendingFeesCount(0);
        setPendingFeesCustomers([]);
      }
    } catch (error) {
      setCustomerStatusCount(null);
      setCustomersData([]);
      console.log("get customers error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const getAssignTrainerData = async (trainerId) => {
    try {
      const response = await getTrainerById(trainerId);
      const trainerDetails = response?.data?.data;
      setAssignTrainerData(trainerDetails);
    } catch (error) {
      setAssignTrainerData(null);
      console.log("get trainer by id error", error);
    }
  };

  const handleDateChange = (dates, dateStrings) => {
    setSelectedDates(dateStrings);
    const startDate = dateStrings[0];
    const endDate = dateStrings[1];
    if (startDate != "" && endDate != "") {
      console.log("call function");
      getCustomersData(startDate, endDate, searchValue, status);
    }
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    setTimeout(() => {
      getCustomersData(
        selectedDates[0],
        selectedDates[1],
        e.target.value,
        status
      );
    }, 300);
  };

  const handleEdit = (item) => {
    setCustomerId(item.id);
    setIsOpenEditDrawer(true);
  };

  const formReset = () => {
    setIsOpenDetailsDrawer(false);
    setIsOpenFilterDrawer(false);
    setCustomerDetails(null);
  };

  const handleRefresh = () => {
    setStatus("");
    setSearchValue("");
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    getCustomersData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      null,
      null
    );
  };

  const handleStudentVerifyProof = ({ file }) => {
    // allowed MIME types
    const isValidType =
      file.type === "image/png" ||
      file.type === "image/jpeg" ||
      file.type === "image/jpg";

    if (file.status === "uploading" || file.status === "removed") {
      setStudentVerifyProofArray([]);
      setStudentVerifyProofBase64("");
      setStudentVerifyProofError("Proof is required");
      return;
    }
    const isValidSize = file.size <= 1024 * 1024;

    if (isValidType && isValidSize) {
      console.log("fileeeee", file);
      setStudentVerifyProofArray([file]);
      CommonMessage("success", "Proof uploaded");
      setStudentVerifyProofError("");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1]; // Extract Base64 content
        setStudentVerifyProofBase64(base64String); // Store in state
      };
    } else {
      if (!isValidType) {
        CommonMessage("error", "Accept only .png, .jpg and .jpeg");
      } else if (!isValidSize) {
        CommonMessage("error", "File size must be 1MB or less");
      }
      setStudentVerifyProofArray([]);
      setStudentVerifyProofBase64("");
    }
  };

  const handleLinedinFeedback = ({ file }) => {
    // allowed MIME types
    const isValidType =
      file.type === "image/png" ||
      file.type === "image/jpeg" ||
      file.type === "image/jpg";

    if (file.status === "uploading" || file.status === "removed") {
      setLinkedinFeedbackArray([]);
      setLinkedinFeedbackBase64("");
      setLinkedinFeedbackError("Linkedin review screenshot is required");
      return;
    }
    const isValidSize = file.size <= 1024 * 1024;

    if (isValidType && isValidSize) {
      console.log("fileeeee", file);
      setLinkedinFeedbackArray([file]);
      CommonMessage("success", "Linkedin review screenshot uploaded");
      setLinkedinFeedbackError("");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1]; // Extract Base64 content
        setLinkedinFeedbackBase64(base64String); // Store in state
      };
    } else {
      if (!isValidType) {
        CommonMessage("error", "Accept only .png, .jpg and .jpeg");
      } else if (!isValidSize) {
        CommonMessage("error", "File size must be 1MB or less");
      }
      setLinkedinFeedbackArray([]);
      setLinkedinFeedbackBase64("");
    }
  };

  const handleGoogleFeedback = ({ file }) => {
    // allowed MIME types
    const isValidType =
      file.type === "image/png" ||
      file.type === "image/jpeg" ||
      file.type === "image/jpg";

    if (file.status === "uploading" || file.status === "removed") {
      setGoogleFeedbackArray([]);
      setGoogleFeedbackBase64("");
      setGoogleFeedbackError("Google review screenshot is required");
      return;
    }
    const isValidSize = file.size <= 1024 * 1024;

    if (isValidType && isValidSize) {
      console.log("fileeeee", file);
      setGoogleFeedbackArray([file]);
      CommonMessage("success", "Google review screenshot uploaded");
      setGoogleFeedbackError("");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1]; // Extract Base64 content
        setGoogleFeedbackBase64(base64String); // Store in state
      };
    } else {
      if (!isValidType) {
        CommonMessage("error", "Accept only .png, .jpg and .jpeg");
      } else if (!isValidSize) {
        CommonMessage("error", "File size must be 1MB or less");
      }
      setGoogleFeedbackArray([]);
      setGoogleFeedbackBase64("");
    }
  };

  const handleAssignTrainerProof = ({ file }) => {
    // allowed MIME types
    const isValidType =
      file.type === "image/png" ||
      file.type === "image/jpeg" ||
      file.type === "image/jpg";

    if (file.status === "uploading" || file.status === "removed") {
      setAssignTrainerProofArray([]);
      setAssignTrainerProofBase64("");
      setAssignTrainerProofError("Proof is required");
      return;
    }
    const isValidSize = file.size <= 1024 * 1024;

    if (isValidType && isValidSize) {
      console.log("fileeeee", file);
      setAssignTrainerProofArray([file]);
      CommonMessage("success", "Proof uploaded");
      setAssignTrainerProofError("");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(",")[1]; // Extract Base64 content
        setAssignTrainerProofBase64(base64String); // Store in state
      };
    } else {
      if (!isValidType) {
        CommonMessage("error", "Accept only .png, .jpg and .jpeg");
      } else if (!isValidSize) {
        CommonMessage("error", "File size must be 1MB or less");
      }
      setAssignTrainerProofArray([]);
      setAssignTrainerProofBase64("");
    }
  };

  const handleCustomerStatus = async (updatestatus) => {
    const payload = {
      customer_id: customerDetails.id,
      status: updatestatus,
    };
    try {
      await updateCustomerStatus(payload);
      setTimeout(() => {
        updateStatusDrawerReset();
        getCustomersData(
          selectedDates[0],
          selectedDates[1],
          searchValue,
          status
        );
      }, 300);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleFinaceVerify = async () => {
    setUpdateButtonLoading(true);
    const today = new Date();
    const payload = {
      payment_trans_id: customerDetails.payments.payment_trans_id,
      verified_date: formatToBackendIST(today),
    };
    try {
      await verifyCustomerPayment(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(() => {
        handleCustomerStatus("Awaiting Verify");
        setUpdateButtonLoading(false);
      }, 300);
    } catch (error) {
      setUpdateButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleStudentVerify = async () => {
    const commentValidate = addressValidator(studentVerifyComments);

    let studentVerifyProofValidate;

    if (studentVerifyProofBase64 === "") {
      studentVerifyProofValidate = "Proof is required";
    } else {
      studentVerifyProofValidate = "";
    }

    setStudentVerifyProofError(studentVerifyProofValidate);
    setStudentVerifyCommentsError(commentValidate);

    if (studentVerifyProofValidate || commentValidate) return;
    setUpdateButtonLoading(true);

    const payload = {
      customer_id: customerDetails.id,
      proof_communication: studentVerifyProofBase64,
      comments: studentVerifyComments,
      is_satisfied: isSatisfied,
    };

    try {
      await verifyCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(() => {
        handleCustomerStatus("Awaiting Trainer");
        setUpdateButtonLoading(false);
      }, 300);
    } catch (error) {
      setUpdateButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleTrainerHistory = async (customer_id) => {
    const payload = {
      customer_id: customer_id,
    };

    try {
      const response = await getAssignTrainerHistoryForCustomer(payload);
      console.log("trainer history response", response);
      const historyData = response?.data?.data || [];
      setHistoryLoading(true);
      if (historyData.length >= 1) {
        const reverseData = historyData.reverse();
        const addChildren = reverseData.map((item, index) => {
          return {
            ...item,
            key: index + 1,
            label: (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  fontSize: "13px",
                  alignItems: "center",
                }}
              >
                <span>
                  Trainer Name -{" "}
                  <span style={{ fontWeight: "500" }}>{item.trainer_name}</span>
                </span>
                <p style={{ color: "gray" }}>
                  Status: <span style={{ color: "#d32f2f" }}>Rejected</span>
                </p>{" "}
              </div>
            ),
            children: (
              <div>
                <Row gutter={16} style={{ marginTop: "6px" }}>
                  <Col span={12}>
                    <Row>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Trainer Name
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">
                          {item.trainer_name}
                        </p>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={12}>
                    <Row>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Commercial
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">
                          {item.commercial}
                        </p>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                <Row gutter={16} style={{ marginTop: "16px" }}>
                  <Col span={12}>
                    <Row>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Mode Of Class
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">
                          {item.mode_of_class}
                        </p>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={12}>
                    <Row>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Trainer Type
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">
                          {item.trainer_type}
                        </p>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                <Row
                  gutter={16}
                  style={{ marginTop: "16px", marginBottom: "12px" }}
                >
                  <Col span={12}>
                    <Row>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Rejected Date
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">
                          {moment(item.rejected_date).format("DD/MM/YYYY")}
                        </p>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={12}>
                    <Row>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Reason for Rejection
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">{item.comments}</p>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            ),
          };
        });

        setTrainerHistory(addChildren);
        setTimeout(() => {
          setHistoryLoading(false);
        }, 300);
      } else {
        setTrainerHistory([]);
      }
    } catch (error) {
      setTrainerHistory([]);
      console.log("trainer history error", error);
    }
  };

  const handleAssignTrainer = async () => {
    const trainerIdValidate = selectValidator(trainerId);
    const commercialValidate = selectValidator(commercial);
    const modeOfClassValidate = selectValidator(modeOfClass);
    const trainerTypeValidate = selectValidator(trainerType);
    const commentValidate = addressValidator(assignTrainerComments);

    let assignTrainerProofValidate;

    if (assignTrainerProofBase64 === "") {
      assignTrainerProofValidate = "Proof is required";
    } else {
      assignTrainerProofValidate = "";
    }

    setTrainerIdError(trainerIdValidate);
    setCommercialError(commercialValidate);
    setModeOfClassError(modeOfClassValidate);
    setTrainerTypeError(trainerTypeValidate);
    setAssignTrainerProofError(assignTrainerProofValidate);
    setAssignTrainerCommentsError(commentValidate);

    if (
      trainerIdValidate ||
      commercialValidate ||
      modeOfClassValidate ||
      trainerTypeValidate ||
      assignTrainerProofValidate ||
      commentValidate
    )
      return;

    const today = new Date();

    setUpdateButtonLoading(true);

    const payload = {
      customer_id: customerDetails.id,
      proof_communication: assignTrainerProofBase64,
      comments: assignTrainerComments,
      trainer_id: trainerId,
      commercial: commercial,
      mode_of_class: modeOfClass,
      trainer_type: trainerType,
      created_date: formatToBackendIST(today),
    };

    try {
      await assignTrainerForCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(() => {
        handleCustomerStatus("Awaiting Trainer Verify");
        setUpdateButtonLoading(false);
      }, 300);
    } catch (error) {
      setUpdateButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleVerifyTrainer = async () => {
    const today = new Date();

    setUpdateButtonLoading(true);

    const payload = {
      id: customerDetails.training_map_id,
      verified_date: formatToBackendIST(today),
    };

    try {
      await verifyTrainerForCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(() => {
        handleCustomerStatus("Awaiting Class");
        setUpdateButtonLoading(false);
      }, 300);
    } catch (error) {
      setUpdateButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleRejectTrainer = async () => {
    const commentValidate = addressValidator(rejectTrainerComments);

    setRejectTrainerCommentsError(commentValidate);

    if (commentValidate) return;

    const today = new Date();

    setRejectButtonLoader(true);

    const payload = {
      id: customerDetails.training_map_id,
      rejected_date: formatToBackendIST(today),
      comments: rejectTrainerComments,
    };

    try {
      await rejectTrainerForCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(() => {
        handleCustomerStatus("Awaiting Trainer");
        setRejectButtonLoader(false);
      }, 300);
    } catch (error) {
      setRejectButtonLoader(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleClassSchedule = async () => {
    const scheduleIdValidate = selectValidator(scheduleId);

    setScheduleIdError(scheduleIdValidate);

    if (scheduleIdValidate) return;
    setUpdateButtonLoading(true);

    const today = new Date();

    const payload = {
      customer_id: customerDetails.id,
      schedule_id: scheduleId,
      schedule_at: formatToBackendIST(today),
    };
    try {
      await classScheduleForCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(() => {
        handleCustomerStatus(scheduleId === 1 ? "Class Going" : "Escalated");
        setUpdateButtonLoading(false);
      }, 300);
    } catch (error) {
      setUpdateButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleUpdateClassGoing = async () => {
    const classGoingPercentageValidate =
      percentageValidator(classGoingPercentage);

    setClassGoingPercentageError(classGoingPercentageValidate);

    if (classGoingPercentageValidate) return;

    setUpdateButtonLoading(true);
    const payload = {
      customer_id: customerDetails.id,
      schedule_id: 1,
      class_percentage: classGoingPercentage,
      class_comments: classGoingComments,
    };
    try {
      await updateClassGoingForCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      if (classGoingPercentage < 100) {
        setTimeout(() => {
          getCustomersData(
            selectedDates[0],
            selectedDates[1],
            searchValue,
            status
          );
          setUpdateButtonLoading(false);
          updateStatusDrawerReset();
        }, 300);
      } else {
        setTimeout(() => {
          handleCustomerStatus("Awaiting Feedback");
          setUpdateButtonLoading(false);
        }, 300);
      }
    } catch (error) {
      setUpdateButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleIssueCert = async () => {
    const courseDurationValidate = selectValidator(courseDuration);
    const courseCompleteDateValidate = selectValidator(courseCompleteDate);
    let linkedinValidate;
    let googleValidate;

    if (linkedinFeedbackBase64 === "") {
      linkedinValidate = "Linkedin review screenshot is required";
    } else {
      linkedinValidate = "";
    }

    if (googleFeedbackBase64 === "") {
      googleValidate = "Google review screenshot is required";
    } else {
      googleValidate = "";
    }

    setCourseDurationError(courseDurationValidate);
    setCourseCompleteDateError(courseCompleteDateValidate);
    setLinkedinFeedbackError(linkedinValidate);
    setGoogleFeedbackError(googleValidate);

    if (
      courseDurationValidate ||
      courseCompleteDateValidate ||
      linkedinValidate ||
      googleValidate
    )
      return;

    alert("success");
  };

  const updateStatusDrawerReset = () => {
    setIsStatusUpdateDrawer(false);
    setCustomerDetails(null);
    setDrawerContentStatus("");
    setUpdateButtonLoading(false);
    //student verify
    setStudentVerifyProofArray([]);
    setStudentVerifyProofBase64("");
    setStudentVerifyProofError("");
    setStudentVerifyComments("");
    setStudentVerifyCommentsError("");
    setIsSatisfied(true);
    //assign trainer
    setTrainerId(null);
    setTrainerIdError("");
    setCommercial("");
    setCommercialError("");
    setModeOfClass(null);
    setModeOfClassError("");
    setTrainerType(null);
    setTrainerTypeError("");
    setAssignTrainerProofArray([]);
    setAssignTrainerProofBase64("");
    setAssignTrainerProofError("");
    setAssignTrainerComments("");
    setAssignTrainerCommentsError("");
    setTrainerHistory([]);
    //verify trainer
    setAssignTrainerData(null);
    setRejectTrainerComments("");
    setRejectTrainerCommentsError("");
    //class schedule
    setScheduleId(null);
    setScheduleIdError("");
    //class going
    setClassGoingPercentage(0);
    setClassGoingPercentageError("");
    setClassGoingComments("");
    //feedback
    setLinkedinFeedbackArray([]);
    setLinkedinFeedbackBase64("");
    setLinkedinFeedbackError("");
    setGoogleFeedbackArray([]);
    setGoogleFeedbackBase64("");
    setGoogleFeedbackError("");
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="leadmanager_filterContainer">
            <CommonOutlinedInput
              label="Search by Name"
              width="36%"
              height="33px"
              labelFontSize="12px"
              icon={<CiSearch size={16} />}
              labelMarginTop="-1px"
              onChange={handleSearch}
              value={searchValue}
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
          <FiFilter
            size={20}
            color="#5b69ca"
            style={{ marginRight: "16px", cursor: "pointer" }}
            onClick={() => setIsOpenFilterDrawer(true)}
          />

          <Tooltip placement="top" title="Refresh">
            <Button
              className="leadmanager_refresh_button"
              onClick={handleRefresh}
            >
              <RedoOutlined className="refresh_icon" />
            </Button>
          </Tooltip>
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
          <div
            className={
              status == 1
                ? "customers_active_formpending_container"
                : "customers_formpending_container"
            }
            onClick={() => {
              if (status == 1) {
                return;
              }
              setStatus(1);
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                1
              );
            }}
          >
            <p>
              Form Pending{" "}
              {`( ${
                customerStatusCount &&
                customerStatusCount.form_pending !== undefined &&
                customerStatusCount.form_pending !== null
                  ? customerStatusCount.form_pending
                  : "-"
              } )`}
            </p>
          </div>
          <div
            className={
              status === "Awaiting Finance"
                ? "customers_active_awaitfinance_container"
                : "customers_awaitfinance_container"
            }
            onClick={() => {
              if (status === "Awaiting Finance") {
                return;
              }
              setStatus("Awaiting Finance");
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Awaiting Finance"
              );
            }}
          >
            <p>
              Awaiting Finance{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.awaiting_finance !== undefined &&
                customerStatusCount.awaiting_finance !== null
                  ? customerStatusCount.awaiting_finance
                  : "-"
              }
 )`}
            </p>
          </div>
          <div
            className={
              status === "Awaiting Verify"
                ? "customers_active_studentvefity_container"
                : "customers_studentvefity_container"
            }
            onClick={() => {
              if (status === "Awaiting Verify") {
                return;
              }
              setStatus("Awaiting Verify");
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Awaiting Verify"
              );
            }}
          >
            <p>
              Student Verify{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.awaiting_verify !== undefined &&
                customerStatusCount.awaiting_verify !== null
                  ? customerStatusCount.awaiting_verify
                  : "-"
              }
 )`}
            </p>
          </div>
          <div
            className={
              status === "Awaiting Trainer"
                ? "customers_active_assigntrainers_container"
                : "customers_assigntrainers_container"
            }
            onClick={() => {
              if (status === "Awaiting Trainer") {
                return;
              }
              setStatus("Awaiting Trainer");
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Awaiting Trainer"
              );
            }}
          >
            <p>
              Assign Trainer{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.awaiting_trainer !== undefined &&
                customerStatusCount.awaiting_trainer !== null
                  ? customerStatusCount.awaiting_trainer
                  : "-"
              }
 )`}
            </p>
          </div>
          <div
            className={
              status === "Awaiting Trainer Verify"
                ? "customers_active_verifytrainers_container"
                : "customers_verifytrainers_container"
            }
            onClick={() => {
              if (status === "Awaiting Trainer Verify") {
                return;
              }
              setStatus("Awaiting Trainer Verify");
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Awaiting Trainer Verify"
              );
            }}
          >
            <p>
              Verify Trainer{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.awaiting_trainer_verify !== undefined &&
                customerStatusCount.awaiting_trainer_verify !== null
                  ? customerStatusCount.awaiting_trainer_verify
                  : "-"
              }
 )`}
            </p>
          </div>
          <div
            className={
              status === "Awaiting Class"
                ? "customers_active_classschedule_container"
                : "customers_classschedule_container"
            }
            onClick={() => {
              if (status === "Awaiting Class") {
                return;
              }
              setStatus("Awaiting Class");
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Awaiting Class"
              );
            }}
          >
            <p>
              Class Schedule{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.awaiting_class !== undefined &&
                customerStatusCount.awaiting_class !== null
                  ? customerStatusCount.awaiting_class
                  : "-"
              }
 )`}
            </p>
          </div>
          <div
            className={
              status === "Class Going"
                ? "customers_active_classgoing_container"
                : "customers_classgoing_container"
            }
            onClick={() => {
              if (status === "Class Going") {
                return;
              }
              setStatus("Class Going");
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Class Going"
              );
            }}
          >
            <p>
              Class Going{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.class_going !== undefined &&
                customerStatusCount.class_going !== null
                  ? customerStatusCount.class_going
                  : "-"
              }
 )`}
            </p>
          </div>
          <div
            className={
              status === "Pending Fees"
                ? "customers_active_pendingfees_container"
                : "customers_pendingfees_container"
            }
            onClick={() => {
              if (status === "Pending Fees") {
                return;
              }
              setStatus("Pending Fees");
              setCustomersData(pendingFeesCustomers);
            }}
          >
            <p>
              Pending Fees{" "}
              {`(  ${pendingFeesCount}
 )`}
            </p>
          </div>
          <div
            className={
              status === "Escalated"
                ? "customers_active_escalated_container"
                : "customers_escalated_container"
            }
            onClick={() => {
              if (status === "Escalated") {
                return;
              }
              setStatus("Escalated");
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Escalated"
              );
            }}
          >
            <p>
              Escalated{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.escalated !== undefined &&
                customerStatusCount.escalated !== null
                  ? customerStatusCount.escalated
                  : "-"
              }
 )`}
            </p>
          </div>
          <div
            className={
              status === "Awaiting Feedback"
                ? "customers_active_feedback_container"
                : "customers_feedback_container"
            }
            onClick={() => {
              if (status === "Awaiting Feedback") {
                return;
              }
              setStatus("Awaiting Feedback");
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Awaiting Feedback"
              );
            }}
          >
            <p>
              Feedback{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.awaiting_feedback !== undefined &&
                customerStatusCount.awaiting_feedback !== null
                  ? customerStatusCount.awaiting_feedback
                  : "-"
              }
 )`}
            </p>
          </div>
          <div
            className={
              status === "Completed"
                ? "customers_active_completed_container"
                : "customers_completed_container"
            }
            onClick={() => {
              if (status === "Completed") {
                return;
              }
              setStatus("Completed");
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Completed"
              );
            }}
          >
            <p>
              Completed{" "}
              {`(  ${
                customerStatusCount &&
                customerStatusCount.completed !== undefined &&
                customerStatusCount.completed !== null
                  ? customerStatusCount.completed
                  : "-"
              }
 )`}
            </p>
          </div>
          <div className="customers_others_container">
            <p>Others {`( 0 )`}</p>
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
          {/* <img src={ProfileImage} className="cutomer_profileimage" /> */}
          <FaRegUser size={50} color="#333" />

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
                        ? "₹" + customerDetails.primary_fees
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
                      {customerDetails &&
                      customerDetails.balance_amount !== undefined &&
                      customerDetails.balance_amount !== null
                        ? "₹" + customerDetails.balance_amount
                        : "-"}
                    </p>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </div>

        {customerDetails && customerDetails.signature_image ? (
          <div className="customerdetails_signatureContainer">
            <p style={{ fontWeight: "500", marginRight: "40px" }}>Signature</p>
            <img
              src={`data:image/png;base64,${customerDetails.signature_image}`}
              alt="Trainer Signature"
              className="customer_signature_image"
            />
          </div>
        ) : (
          ""
        )}
      </Drawer>

      <Drawer
        title="Update Customer"
        open={isOpenEditDrawer}
        onClose={() => {
          setIsOpenEditDrawer(false);
          setCustomerId(null);
          customerUpdateRef.current?.formReset();
        }}
        width="50%"
        className="customerupdate_drawer"
        style={{ position: "relative" }}
      >
        <CustomerUpdate
          ref={customerUpdateRef}
          customerId={customerId}
          setUpdateDrawerTabKey={setUpdateDrawerTabKey}
          setUpdateButtonLoading={setUpdateButtonLoading}
          setIsOpenEditDrawer={setIsOpenEditDrawer}
          callgetCustomersApi={() =>
            getCustomersData(
              selectedDates[0],
              selectedDates[1],
              searchValue,
              status
            )
          } // pass function as prop
        />

        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            {updateButtonLoading ? (
              <button className="users_adddrawer_loadingcreatebutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="users_adddrawer_createbutton"
                // onClick={handleSubmit}
                onClick={() => {
                  if (updateDrawerTabKey === "1") {
                    customerUpdateRef.current?.handlePersonalDetails();
                  } else {
                    customerUpdateRef.current?.handleSubmit();
                  }
                }}
              >
                {updateDrawerTabKey === "1" ? "Next" : "Update"}
              </button>
            )}
          </div>
        </div>
      </Drawer>

      <Drawer
        title="Update Status"
        open={isStatusUpdateDrawer}
        onClose={updateStatusDrawerReset}
        width="40%"
        style={{ position: "relative", paddingBottom: "65px" }}
        className="customer_statusupdate_drawer"
      >
        <div className="customer_statusupdate_drawer_profileContainer">
          {/* <img src={ProfileImage} className="cutomer_profileimage" /> */}
          <FaRegUser size={50} color="#333" />

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

        <Row
          gutter={16}
          style={{ marginTop: "20px", padding: "0px 0px 0px 24px" }}
        >
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

            <Row style={{ marginTop: "12px" }}>
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
                  <p className="customerdetails_rowheading">Training Mode</p>
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
          </Col>
        </Row>

        <Divider className="customer_statusupdate_divider" />

        {drawerContentStatus === "Finance Verify" ? (
          <div className="customer_statusupdate_adddetailsContainer">
            <p className="customer_statusupdate_adddetails_heading">
              Payment Details
            </p>

            <Row>
              <Col span={12}>
                <Row style={{ marginTop: "12px" }} gutter={16}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Invoice Number
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails &&
                      customerDetails.payments.invoice_number
                        ? customerDetails.payments.invoice_number
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }} gutter={16}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Invoice Date</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.payments.invoice_date
                        ? customerDetails.payments.invoice_date
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }} gutter={16}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Total Fees</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.primary_fees
                        ? "₹" + customerDetails.primary_fees
                        : "-"}
                    </p>
                  </Col>
                </Row>
              </Col>

              <Col span={12}>
                <Row style={{ marginTop: "12px" }} gutter={16}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Paid Amount</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails &&
                      customerDetails.payments.amount !== undefined &&
                      customerDetails.payments.amount !== null
                        ? "₹" + customerDetails.payments.amount
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }} gutter={16}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Balance Amount
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p
                      className="customerdetails_text"
                      style={{ color: "#d32f2f", fontWeight: "500" }}
                    >
                      {customerDetails &&
                      customerDetails.balance_amount !== undefined &&
                      customerDetails.balance_amount !== null
                        ? "₹" + customerDetails.balance_amount
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }} gutter={16}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Payment Mode</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.payments.payment_mode
                        ? customerDetails.payments.payment_mode
                        : "-"}
                    </p>
                  </Col>
                </Row>
              </Col>
            </Row>

            <p className="customer_paymentscreenshot_heading">
              Payment Screenshot
            </p>

            {customerDetails?.payments?.payment_screenshot ? (
              <img
                src={`data:image/png;base64,${customerDetails?.payments?.payment_screenshot}`}
                alt="Trainer Signature"
                className="customer_paymentscreenshot_image"
              />
            ) : (
              "-"
            )}
          </div>
        ) : drawerContentStatus === "Student Verify" ? (
          <>
            <div className="customer_statusupdate_adddetailsContainer">
              <p className="customer_statusupdate_adddetails_heading">
                Add Details
              </p>

              <Row style={{ marginTop: "22px" }}>
                <Col span={24}>
                  <p className="trainer_registration_signaturelabel">
                    Proof Communication{" "}
                    <span style={{ color: "#d32f2f" }}>*</span>
                  </p>
                  <div style={{ position: "relative" }}>
                    <Upload
                      style={{ width: "100%", marginTop: "6px" }}
                      beforeUpload={(file) => {
                        return false; // Prevent auto-upload
                      }}
                      accept=".png,.jpg,.jpeg"
                      onChange={handleStudentVerifyProof}
                      fileList={studentVerifyProofArray}
                      multiple={false}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        className="leadmanager_payment_screenshotbutton"
                        style={{ borderRadius: "4px" }}
                      >
                        Choose file
                        <span style={{ fontSize: "10px" }}>
                          (PNG, JPEG, & PNG)
                        </span>
                      </Button>
                    </Upload>{" "}
                    {studentVerifyProofError && (
                      <p className="trainer_registration_signatureerror">
                        {studentVerifyProofError}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      marginTop: "20px",
                    }}
                  >
                    <CommonTextArea
                      label="Comments"
                      required={true}
                      onChange={(e) => {
                        setStudentVerifyComments(e.target.value);
                        setStudentVerifyCommentsError(
                          addressValidator(e.target.value)
                        );
                      }}
                      value={studentVerifyComments}
                      error={studentVerifyCommentsError}
                    />
                  </div>

                  <div
                    style={{
                      marginTop: studentVerifyCommentsError ? "20px" : "12px",
                      // marginBottom:
                      //   studentVerifyProofArray.length >= 1 ? "80px" : "0px",
                    }}
                  >
                    <Checkbox
                      onChange={(e) => setIsSatisfied(e.target.checked)}
                      checked={isSatisfied}
                    >
                      Satisfied
                    </Checkbox>
                  </div>
                </Col>
              </Row>
            </div>
          </>
        ) : drawerContentStatus === "Assign Trainer" ? (
          <>
            <div className="customer_statusupdate_adddetailsContainer">
              <p className="customer_statusupdate_adddetails_heading">
                Previous Assigned Trainer History
              </p>

              {/* <table
                border="1"
                cellpadding="8"
                cellspacing="0"
                className="customer_trainerassign_historytable"
              >
                <thead>
                  <tr>
                    <th>Trainer Name</th>
                    <th>Assigned Date</th>
                    <th>Rejected Reason</th>
                    <th>Rejected Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                  </tr>
                </tbody>
              </table> */}

              {historyLoading === false ? (
                <>
                  {trainerHistory.length >= 1 ? (
                    <div style={{ marginTop: "12px", marginBottom: "20px" }}>
                      <Collapse
                        className="assesmntresult_collapse"
                        items={trainerHistory}
                        activeKey={collapseDefaultKey}
                        onChange={(keys) => {
                          setCollapseDefaultKey(keys);
                          console.log("keyyyy", keys);
                        }}
                      ></Collapse>
                    </div>
                  ) : (
                    <p className="customer_trainerhistory_nodatatext">
                      No Data found
                    </p>
                  )}
                </>
              ) : (
                ""
              )}
              <p className="customer_statusupdate_adddetails_heading">
                Assign New Trainer
              </p>

              <Row gutter={16} style={{ marginTop: "16px" }}>
                <Col span={12}>
                  <CommonSelectField
                    label="Trainer"
                    required={true}
                    options={trainersData}
                    onChange={(e) => {
                      setTrainerId(e.target.value);
                      setTrainerIdError(selectValidator(e.target.value));
                    }}
                    value={trainerId}
                    error={trainerIdError}
                  />
                </Col>
                <Col span={12}>
                  <CommonOutlinedInput
                    label="Commercial"
                    type="number"
                    required={true}
                    onChange={(e) => {
                      setCommercial(e.target.value);
                      setCommercialError(selectValidator(e.target.value));
                    }}
                    value={commercial}
                    error={commercialError}
                    onInput={(e) => {
                      if (e.target.value.length > 10) {
                        e.target.value = e.target.value.slice(0, 10);
                      }
                    }}
                    icon={<LuIndianRupee size={16} />}
                  />
                </Col>
              </Row>

              <Row gutter={16} style={{ marginTop: "30px" }}>
                <Col span={12}>
                  <CommonSelectField
                    label="Mode Of Class"
                    required={true}
                    options={modeOfClassOptions}
                    onChange={(e) => {
                      setModeOfClass(e.target.value);
                      setModeOfClassError(selectValidator(e.target.value));
                    }}
                    value={modeOfClass}
                    error={modeOfClassError}
                  />
                </Col>
                <Col span={12}>
                  <CommonSelectField
                    label="Trainer Type"
                    required={true}
                    options={trainerTypeOptions}
                    onChange={(e) => {
                      setTrainerType(e.target.value);
                      setTrainerTypeError(selectValidator(e.target.value));
                    }}
                    value={trainerType}
                    error={trainerTypeError}
                  />
                </Col>
              </Row>

              <Row style={{ marginTop: "34px" }}>
                <Col span={24}>
                  <p className="trainer_registration_signaturelabel">
                    Proof Communication{" "}
                    <span style={{ color: "#d32f2f" }}>*</span>
                  </p>
                  <div style={{ position: "relative" }}>
                    <Upload
                      style={{ width: "100%", marginTop: "6px" }}
                      beforeUpload={(file) => {
                        return false; // Prevent auto-upload
                      }}
                      accept=".png,.jpg,.jpeg"
                      onChange={handleAssignTrainerProof}
                      fileList={assignTrainerProofArray}
                      multiple={false}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        className="leadmanager_payment_screenshotbutton"
                        style={{ borderRadius: "4px" }}
                      >
                        Choose file
                        <span style={{ fontSize: "10px" }}>
                          (PNG, JPEG, & PNG)
                        </span>
                      </Button>
                    </Upload>{" "}
                    {assignTrainerProofError && (
                      <p className="trainer_registration_signatureerror">
                        {assignTrainerProofError}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      marginTop: "20px",
                    }}
                  >
                    <CommonTextArea
                      label="Comments"
                      required={true}
                      onChange={(e) => {
                        setAssignTrainerComments(e.target.value);
                        setAssignTrainerCommentsError(
                          addressValidator(e.target.value)
                        );
                      }}
                      value={assignTrainerComments}
                      error={assignTrainerCommentsError}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </>
        ) : drawerContentStatus === "Trainer Verify" ? (
          <>
            <div className="customer_statusupdate_adddetailsContainer">
              <p className="customer_statusupdate_adddetails_heading">
                Trainer Details
              </p>

              <Row gutter={16}>
                <Col span={13}>
                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Trainer Name
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {assignTrainerData && assignTrainerData.name
                          ? assignTrainerData.name
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Trainer Email
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {assignTrainerData && assignTrainerData.email
                          ? assignTrainerData.email
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Trainer Mobile
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {assignTrainerData && assignTrainerData.mobile
                          ? assignTrainerData.mobile
                          : "-"}
                      </p>
                    </Col>
                  </Row>
                </Col>

                <Col span={11}>
                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">Commercial</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">{commercial}</p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Mode Of Class
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">{modeOfClass}</p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Trainer Type
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">{trainerType}</p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Trainer Skills
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {" "}
                        {assignTrainerData && assignTrainerData.skills
                          ? assignTrainerData.skills.join(", ")
                          : "-"}
                      </p>
                    </Col>
                  </Row>
                </Col>
              </Row>

              <div style={{ marginTop: "12px", position: "relative" }}>
                <CommonTextArea
                  label="Comments"
                  required={true}
                  onChange={(e) => {
                    setRejectTrainerComments(e.target.value);
                    setRejectTrainerCommentsError(
                      addressValidator(e.target.value)
                    );
                  }}
                  value={rejectTrainerComments}
                  error={rejectTrainerCommentsError}
                />
              </div>
            </div>
          </>
        ) : drawerContentStatus === "Class Schedule" ? (
          <>
            <div className="customer_statusupdate_adddetailsContainer">
              <p className="customer_statusupdate_adddetails_heading">
                Add Details
              </p>

              <div style={{ marginTop: "16px" }}>
                <CommonSelectField
                  label="Schedule Status"
                  options={scheduleOptions}
                  required={true}
                  onChange={(e) => {
                    setScheduleId(e.target.value);
                    setScheduleIdError(selectValidator(e.target.value));
                  }}
                  value={scheduleId}
                  error={scheduleIdError}
                />
              </div>
            </div>
          </>
        ) : drawerContentStatus === "Class Going" ? (
          <>
            <div className="customer_statusupdate_adddetailsContainer">
              <p className="customer_statusupdate_adddetails_heading">
                Update Class-Going Process
              </p>

              <Row gutter={16} style={{ marginTop: "30px" }}>
                <Col span={12}>
                  <CommonInputField
                    label="Class Going Percentage"
                    required={true}
                    type="number"
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value < 0) {
                        setClassGoingPercentage(0);
                        return;
                      }
                      setClassGoingPercentage(value);
                      setClassGoingPercentageError(percentageValidator(value));
                    }}
                    value={classGoingPercentage}
                    error={classGoingPercentageError}
                    onInput={(e) => {
                      if (e.target.value.length > 3) {
                        e.target.value = e.target.value.slice(0, 3);
                      }
                    }}
                    errorFontSize="9px"
                  />
                </Col>
                <Col span={12}>
                  <div style={{ marginTop: "-25px" }}>
                    <CommonTextArea
                      label="Comments"
                      required={false}
                      onChange={(e) => {
                        setClassGoingComments(e.target.value);
                      }}
                      value={classGoingComments}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </>
        ) : drawerContentStatus === "Add Feedback" ? (
          <>
            <div className="customer_statusupdate_adddetailsContainer">
              <p className="customer_statusupdate_adddetails_heading">
                Add Feedback Details
              </p>

              <div style={{ marginTop: "12px" }}>
                <p className="customers_feedback_imagelabels">
                  Linkedin Review Screenshot{" "}
                  <span style={{ color: "#d32f2f" }}>*</span>
                </p>
                <div style={{ position: "relative" }}>
                  <Upload
                    style={{ width: "100%", marginTop: "6px" }}
                    beforeUpload={(file) => {
                      return false; // Prevent auto-upload
                    }}
                    accept=".png,.jpg,.jpeg"
                    onChange={handleLinedinFeedback}
                    fileList={linkedinFeedbackArray}
                    multiple={false}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      className="leadmanager_payment_screenshotbutton"
                      style={{ borderRadius: "4px" }}
                    >
                      Choose file
                      <span style={{ fontSize: "10px" }}>
                        (PNG, JPEG, & PNG)
                      </span>
                    </Button>
                  </Upload>{" "}
                  {linkedinFeedbackError && (
                    <p className="trainer_registration_signatureerror">
                      {linkedinFeedbackError}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ marginTop: "22px" }}>
                <p className="customers_feedback_imagelabels">
                  Google Review Screenshot{" "}
                  <span style={{ color: "#d32f2f" }}>*</span>
                </p>
                <div style={{ position: "relative" }}>
                  <Upload
                    style={{ width: "100%", marginTop: "6px" }}
                    beforeUpload={(file) => {
                      return false; // Prevent auto-upload
                    }}
                    accept=".png,.jpg,.jpeg"
                    onChange={handleGoogleFeedback}
                    fileList={googleFeedbackArray}
                    multiple={false}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      className="leadmanager_payment_screenshotbutton"
                      style={{ borderRadius: "4px" }}
                    >
                      Choose file
                      <span style={{ fontSize: "10px" }}>
                        (PNG, JPEG, & PNG)
                      </span>
                    </Button>
                  </Upload>{" "}
                  {googleFeedbackError && (
                    <p className="trainer_registration_signatureerror">
                      {googleFeedbackError}
                    </p>
                  )}
                </div>
              </div>

              <Row gutter={16} style={{ marginTop: "30px" }}>
                <Col span={12}>
                  <CommonOutlinedInput
                    label="Course Duration"
                    type="number"
                    required={true}
                    onChange={(e) => {
                      setCourseDuration(e.target.value);
                      setCourseDurationError(selectValidator(e.target.value));
                    }}
                    value={courseDuration}
                    error={courseDurationError}
                    onInput={(e) => {
                      if (e.target.value.length > 3) {
                        e.target.value = e.target.value.slice(0, 3);
                      }
                    }}
                    icon={<p style={{ fontSize: "11px" }}>Months</p>}
                  />
                </Col>
                <Col span={12}>
                  <CommonMuiDatePicker
                    label="Course Completion Date"
                    onChange={(value) => {
                      setCourseCompleteDate(value);
                      setCourseCompleteDateError(selectValidator(value));
                    }}
                    value={courseCompleteDate}
                    disablePreviousDates={false}
                    error={courseCompleteDateError}
                  />
                </Col>
              </Row>
            </div>
          </>
        ) : (
          ""
        )}

        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            {drawerContentStatus === "Trainer Verify" ? (
              <>
                {rejectbuttonLoader ? (
                  <button className="customer_trainerreject_loadingbutton">
                    <CommonSpinner />
                  </button>
                ) : (
                  <button
                    className="customer_trainerreject_button"
                    onClick={handleRejectTrainer}
                  >
                    Rejected
                  </button>
                )}
              </>
            ) : (
              ""
            )}

            {drawerContentStatus === "Add Feedback" ? (
              <>
                {updateButtonLoading ? (
                  <button className="customer_issuecert_loadingbutton">
                    <CommonSpinner />
                  </button>
                ) : (
                  <button
                    className="customer_issuecert_button"
                    onClick={handleIssueCert}
                  >
                    Update And Issue Certificate
                  </button>
                )}
              </>
            ) : (
              <>
                {updateButtonLoading ? (
                  <button className="users_adddrawer_loadingcreatebutton">
                    <CommonSpinner />
                  </button>
                ) : (
                  <button
                    className="users_adddrawer_createbutton"
                    onClick={
                      drawerContentStatus === "Finance Verify"
                        ? handleFinaceVerify
                        : drawerContentStatus === "Student Verify"
                        ? handleStudentVerify
                        : drawerContentStatus === "Assign Trainer"
                        ? handleAssignTrainer
                        : drawerContentStatus === "Trainer Verify"
                        ? handleVerifyTrainer
                        : drawerContentStatus === "Class Schedule"
                        ? handleClassSchedule
                        : drawerContentStatus === "Class Going"
                        ? handleUpdateClassGoing
                        : ""
                    }
                  >
                    {drawerContentStatus === "Assign Trainer"
                      ? "Assign"
                      : drawerContentStatus === "Class Going"
                      ? "Update"
                      : "Verified"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </Drawer>

      {/* table filter drawer */}

      <Drawer
        title="Manage Table"
        open={isOpenFilterDrawer}
        onClose={formReset}
        width="35%"
        className="leadmanager_tablefilterdrawer"
        style={{ position: "relative", paddingBottom: "60px" }}
      >
        <Row>
          <Col span={24}>
            <div className="leadmanager_tablefiler_container">
              <CommonDnd
                data={defaultColumns}
                setDefaultColumns={setDefaultColumns}
              />
            </div>
          </Col>
        </Row>
        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            <button
              className="leadmanager_tablefilter_applybutton"
              onClick={() => {
                const reorderedColumns = defaultColumns
                  .filter((item) => item.isChecked) // only include checked items
                  .map((defaultItem) =>
                    nonChangeColumns.find(
                      (col) => col.title.trim() === defaultItem.title.trim()
                    )
                  )
                  .filter(Boolean); // remove unmatched/null entries

                console.log("Reordered Columns:", reorderedColumns);

                setColumns(reorderedColumns);
                setIsOpenFilterDrawer(false);
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
