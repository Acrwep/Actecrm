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
  Modal,
} from "antd";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonDoubleDatePicker from "../Common/CommonDoubleDatePicker";
import CommonTable from "../Common/CommonTable";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import "./styles.css";
import {
  assignTrainerForCustomer,
  classScheduleForCustomer,
  getAssignTrainerHistoryForCustomer,
  getCustomerByTrainerId,
  getCustomers,
  getTrainerById,
  getTrainers,
  inserCustomerTrack,
  rejectTrainerForCustomer,
  sendCustomerFormEmail,
  updateClassGoingForCustomer,
  updateCustomerStatus,
  updatefeedbackForCustomer,
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
import { BsGenderMale, BsGenderFemale } from "react-icons/bs";
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
import { FaRegCopy } from "react-icons/fa6";
import { LuCircleUser } from "react-icons/lu";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import PrismaZoom from "react-prismazoom";

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
  const [filterType, setFilterType] = useState(1);
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerStatusCount, setCustomerStatusCount] = useState(null);
  const [isOpenEditDrawer, setIsOpenEditDrawer] = useState(false);
  const [updateDrawerTabKey, setUpdateDrawerTabKey] = useState("1");
  const [customerId, setCustomerId] = useState(null);
  const [updateButtonLoading, setUpdateButtonLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [pendingFeesCount, setPendingFeesCount] = useState(0);

  //form usesates
  //finance usestates
  const [isOpenPaymentScreenshotModal, setIsOpenPaymentScreenshotModal] =
    useState(false);
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
  const [isOpenTrainerDetailModal, setIsOpenTrainerDetailModal] =
    useState(false);
  const [clickedTrainerDetails, setClickedTrainerDetails] = useState([]);
  const [trainerFilterType, setTrainerFilterType] = useState(1);
  //trainer verify usestates
  const [assignTrainerData, setAssignTrainerData] = useState(null);
  const [isShowRejectTrainerCommentBox, setIsShowRejectTrainerCommentBox] =
    useState(false);
  const [rejectTrainerComments, setRejectTrainerComments] = useState("");
  const [rejectTrainerCommentsError, setRejectTrainerCommentsError] =
    useState("");
  const [rejectbuttonLoader, setRejectButtonLoader] = useState(false);
  const [isOpenTrainerCustomersModal, setIsOpenTrainerCustomersModal] =
    useState(false);
  const [customerByTrainerData, setCustomerByTrainerData] = useState([]);
  const [customerByTrainerLoading, setCustomerByTrainerLoading] =
    useState(false);
  //class schedule usestates
  const scheduleOptions = [
    { id: 1, name: "On Going" },
    { id: 3, name: "Hold" },
    { id: 5, name: "Escalated" },
    { id: 6, name: "CGS" },
  ];
  const [scheduleId, setScheduleId] = useState(null);
  const [scheduleIdError, setScheduleIdError] = useState("");
  const [classStartDate, setClassStartDate] = useState(null);
  const [classStartDateError, setClassStartDateError] = useState("");
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
    {
      title: "Fees",
      key: "primary_fees",
      dataIndex: "primary_fees",
      render: (text) => {
        return <p>{"₹" + text}</p>;
      },
    },
    {
      title: "Balance",
      key: "balance_amount",
      dataIndex: "balance_amount",
      render: (text) => {
        return <p>{"₹" + text}</p>;
      },
    },
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
        let classPercent = 0;

        if (
          record.class_percentage !== null &&
          record.class_percentage !== undefined
        ) {
          const parsed = parseFloat(record.class_percentage);
          classPercent = isNaN(parsed) ? 0 : parsed;
        }
        return (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
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
                      {record.status === "Form Pending" ||
                      record.status === "Awaiting Finance" ? (
                        <Checkbox
                          className="customers_statuscheckbox"
                          style={{ marginTop: "6px" }}
                          checked={false}
                          onChange={(e) => {
                            if (record.status === "Form Pending") {
                              CommonMessage(
                                "warning",
                                "Form Not Submitted Yet"
                              );
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
                      ) : (
                        <div
                          className="customers_classcompleted_container"
                          style={{ marginBottom: "6px" }}
                        >
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Finance Verified
                          </p>
                        </div>
                      )}
                    </Col>

                    <Col span={12}>
                      {record.status === "Form Pending" ||
                      record.status === "Awaiting Finance" ||
                      record.status === "Awaiting Verify" ? (
                        <Checkbox
                          className="customers_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (record.status === "Form Pending") {
                              CommonMessage(
                                "warning",
                                "Form Not Submitted Yet"
                              );
                            } else if (record.status === "Awaiting Finance") {
                              CommonMessage(
                                "warning",
                                "Finance not Verified Yet"
                              );
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
                      ) : (
                        <div
                          className="customers_classcompleted_container"
                          style={{ marginBottom: "6px" }}
                        >
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Student Verified
                          </p>
                        </div>
                      )}
                    </Col>
                  </Row>

                  <Row>
                    <Col span={12}>
                      {record.status === "Form Pending" ||
                      record.status === "Awaiting Finance" ||
                      record.status === "Awaiting Verify" ||
                      record.status === "Awaiting Trainer" ? (
                        <Checkbox
                          className="customers_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (record.status === "Form Pending") {
                              CommonMessage(
                                "warning",
                                "Form Not Submitted Yet"
                              );
                            } else if (record.status === "Awaiting Finance") {
                              CommonMessage(
                                "warning",
                                "Finance not Verified Yet"
                              );
                            } else if (record.status === "Awaiting Verify") {
                              CommonMessage(
                                "warning",
                                "Customer not Verified Yet"
                              );
                            } else if (record.status === "Awaiting Trainer") {
                              setCustomerId(record.id);
                              setCustomerDetails(record);
                              setDrawerContentStatus("Assign Trainer");
                              handleTrainerHistory(record.id);
                              setIsStatusUpdateDrawer(true);
                            } else {
                              CommonMessage(
                                "warning",
                                "Trainer Already Assigned"
                              );
                            }
                          }}
                        >
                          Assign Trainer
                        </Checkbox>
                      ) : (
                        <div
                          className="customers_classcompleted_container"
                          style={{ marginBottom: "6px" }}
                        >
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Trainer Assigned
                          </p>
                        </div>
                      )}
                    </Col>

                    <Col span={12}>
                      {record.status === "Form Pending" ||
                      record.status === "Awaiting Finance" ||
                      record.status === "Awaiting Verify" ||
                      record.status === "Awaiting Trainer" ||
                      record.status === "Awaiting Trainer Verify" ? (
                        <Checkbox
                          className="customers_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (record.status === "Form Pending") {
                              CommonMessage(
                                "warning",
                                "Form Not Submitted Yet"
                              );
                            } else if (record.status === "Awaiting Finance") {
                              CommonMessage(
                                "warning",
                                "Finance not Verified Yet"
                              );
                            } else if (record.status === "Awaiting Verify") {
                              CommonMessage(
                                "warning",
                                "Customer not Verified Yet"
                              );
                            } else if (record.status === "Awaiting Trainer") {
                              CommonMessage(
                                "warning",
                                "Trainer not Assigned yet"
                              );
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
                              CommonMessage(
                                "warning",
                                "Trainer Already Verified"
                              );
                            }
                          }}
                        >
                          Verify Trainer
                        </Checkbox>
                      ) : (
                        <div
                          className="customers_classcompleted_container"
                          style={{ marginBottom: "6px" }}
                        >
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Trainer Verified
                          </p>
                        </div>
                      )}
                    </Col>
                  </Row>

                  <Row>
                    <Col span={12}>
                      {record.status === "Form Pending" ||
                      record.status === "Awaiting Finance" ||
                      record.status === "Awaiting Verify" ||
                      record.status === "Awaiting Trainer" ||
                      record.status === "Awaiting Trainer Verify" ||
                      record.status === "Awaiting Class" ? (
                        <Checkbox
                          className="customers_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (record.status === "Form Pending") {
                              CommonMessage(
                                "warning",
                                "Form Not Submitted Yet"
                              );
                            } else if (record.status === "Awaiting Finance") {
                              CommonMessage(
                                "warning",
                                "Finance not Verified Yet"
                              );
                            } else if (record.status === "Awaiting Verify") {
                              CommonMessage(
                                "warning",
                                "Customer not Verified Yet"
                              );
                            } else if (record.status === "Awaiting Trainer") {
                              CommonMessage(
                                "warning",
                                "Trainer not Assigned yet"
                              );
                            } else if (
                              record.status === "Awaiting Trainer Verify"
                            ) {
                              CommonMessage(
                                "warning",
                                "Trainer not Verified yet"
                              );
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
                              CommonMessage(
                                "warning",
                                "Class Already Scheduled"
                              );
                            }
                          }}
                        >
                          Schedule Class
                        </Checkbox>
                      ) : record.status === "Class Scheduled" ? (
                        <button
                          className="customers_updateschedulebutton"
                          onClick={() => {
                            setCustomerId(record.id);
                            setCustomerDetails(record);
                            setScheduleId(record.class_schedule_id);
                            setClassStartDate(record.class_start_date);
                            setDrawerContentStatus("Class Schedule");
                            setIsStatusUpdateDrawer(true);
                          }}
                        >
                          Update Schedule
                        </button>
                      ) : (
                        <div
                          className="customers_classcompleted_container"
                          style={{ marginBottom: "6px" }}
                        >
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Class Scheduled
                          </p>
                        </div>
                      )}
                    </Col>

                    {record.status === "Class Going" ||
                    record.status === "Awaiting G-Review" ||
                    record.status === "Awaiting L-Review" ||
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
                                setScheduleId(record.class_schedule_id);
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

                  {record.status === "Awaiting G-Review" ? (
                    <Row style={{ marginTop: "0px" }}>
                      <Col span={12}>
                        <button
                          className="customers_add_greview_button"
                          onClick={() => {
                            setCustomerId(record.id);
                            setCustomerDetails(record);
                            setDrawerContentStatus("Add G-Review");
                            setIsStatusUpdateDrawer(true);
                          }}
                        >
                          Add G-Review
                        </button>
                      </Col>
                    </Row>
                  ) : record.status === "Awaiting L-Review" ? (
                    <Row style={{ marginTop: "0px" }}>
                      <Col span={12}>
                        <div className="customers_classcompleted_container">
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            G-Review Collected
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <button
                          className="customers_add_linkdinreview_button"
                          onClick={() => {
                            setCustomerId(record.id);
                            setCustomerDetails(record);
                            setDrawerContentStatus("Add L-Review");
                            setIsStatusUpdateDrawer(true);
                          }}
                        >
                          Add L-Review
                        </button>
                      </Col>
                    </Row>
                  ) : (
                    ""
                  )}

                  {record.status === "Completed" ? (
                    <Row style={{ marginBottom: "8px" }}>
                      <Col span={12}>
                        <div className="customers_classcompleted_container">
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            All Review Collected
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
              ) : text === "Form Pending" ? (
                <div>
                  <Button className="customers_status_formpending_button">
                    {text}
                  </Button>
                </div>
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
              ) : text === "Class Scheduled" ? (
                <div>
                  <Button className="customers_status_awaitclassschedule_button">
                    {text}
                  </Button>
                </div>
              ) : text === "Awaiting G-Review" ? (
                <div>
                  <Button className="customers_status_awaitgreview_button">
                    {text}
                  </Button>
                </div>
              ) : text === "Awaiting L-Review" ? (
                <div>
                  <Button className="customers_status_awaitlinkdinreview_button">
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
                    classPercent
                  )}%`}</p>
                </div>
              ) : (
                <p style={{ marginLeft: "6px" }}>-</p>
              )}
            </Tooltip>
            {record.status === "Form Pending" && (
              <Tooltip
                placement="top"
                title="Copy form link"
                trigger={["hover", "click"]}
              >
                <FaRegCopy
                  size={14}
                  className="customers_formlink_copybutton"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${
                        import.meta.env.VITE_EMAIL_URL
                      }/customer-registration/${record.id}`
                    );
                    CommonMessage("success", "Link Copied");
                    console.log("Copied: eeee");
                  }}
                />
              </Tooltip>
            )}
          </div>
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
    {
      title: "Fees",
      key: "primary_fees",
      dataIndex: "primary_fees",
      render: (text) => {
        return <p>{"₹" + text}</p>;
      },
    },
    {
      title: "Balance",
      key: "balance_amount",
      dataIndex: "balance_amount",
      render: (text) => {
        return <p>{"₹" + text}</p>;
      },
    },
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
        let classPercent = 0;

        if (
          record.class_percentage !== null &&
          record.class_percentage !== undefined
        ) {
          const parsed = parseFloat(record.class_percentage);
          classPercent = isNaN(parsed) ? 0 : parsed;
        }
        return (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
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
                      {record.status === "Form Pending" ||
                      record.status === "Awaiting Finance" ? (
                        <Checkbox
                          className="customers_statuscheckbox"
                          style={{ marginTop: "6px" }}
                          checked={false}
                          onChange={(e) => {
                            if (record.status === "Form Pending") {
                              CommonMessage(
                                "warning",
                                "Form Not Submitted Yet"
                              );
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
                      ) : (
                        <div
                          className="customers_classcompleted_container"
                          style={{ marginBottom: "6px" }}
                        >
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Finance Verified
                          </p>
                        </div>
                      )}
                    </Col>

                    <Col span={12}>
                      {record.status === "Form Pending" ||
                      record.status === "Awaiting Finance" ||
                      record.status === "Awaiting Verify" ? (
                        <Checkbox
                          className="customers_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (record.status === "Form Pending") {
                              CommonMessage(
                                "warning",
                                "Form Not Submitted Yet"
                              );
                            } else if (record.status === "Awaiting Finance") {
                              CommonMessage(
                                "warning",
                                "Finance not Verified Yet"
                              );
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
                      ) : (
                        <div
                          className="customers_classcompleted_container"
                          style={{ marginBottom: "6px" }}
                        >
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Student Verified
                          </p>
                        </div>
                      )}
                    </Col>
                  </Row>

                  <Row>
                    <Col span={12}>
                      {record.status === "Form Pending" ||
                      record.status === "Awaiting Finance" ||
                      record.status === "Awaiting Verify" ||
                      record.status === "Awaiting Trainer" ? (
                        <Checkbox
                          className="customers_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (record.status === "Form Pending") {
                              CommonMessage(
                                "warning",
                                "Form Not Submitted Yet"
                              );
                            } else if (record.status === "Awaiting Finance") {
                              CommonMessage(
                                "warning",
                                "Finance not Verified Yet"
                              );
                            } else if (record.status === "Awaiting Verify") {
                              CommonMessage(
                                "warning",
                                "Customer not Verified Yet"
                              );
                            } else if (record.status === "Awaiting Trainer") {
                              setCustomerId(record.id);
                              setCustomerDetails(record);
                              setDrawerContentStatus("Assign Trainer");
                              handleTrainerHistory(record.id);
                              setIsStatusUpdateDrawer(true);
                            } else {
                              CommonMessage(
                                "warning",
                                "Trainer Already Assigned"
                              );
                            }
                          }}
                        >
                          Assign Trainer
                        </Checkbox>
                      ) : (
                        <div
                          className="customers_classcompleted_container"
                          style={{ marginBottom: "6px" }}
                        >
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Trainer Assigned
                          </p>
                        </div>
                      )}
                    </Col>

                    <Col span={12}>
                      {record.status === "Form Pending" ||
                      record.status === "Awaiting Finance" ||
                      record.status === "Awaiting Verify" ||
                      record.status === "Awaiting Trainer" ||
                      record.status === "Awaiting Trainer Verify" ? (
                        <Checkbox
                          className="customers_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (record.status === "Form Pending") {
                              CommonMessage(
                                "warning",
                                "Form Not Submitted Yet"
                              );
                            } else if (record.status === "Awaiting Finance") {
                              CommonMessage(
                                "warning",
                                "Finance not Verified Yet"
                              );
                            } else if (record.status === "Awaiting Verify") {
                              CommonMessage(
                                "warning",
                                "Customer not Verified Yet"
                              );
                            } else if (record.status === "Awaiting Trainer") {
                              CommonMessage(
                                "warning",
                                "Trainer not Assigned yet"
                              );
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
                              CommonMessage(
                                "warning",
                                "Trainer Already Verified"
                              );
                            }
                          }}
                        >
                          Verify Trainer
                        </Checkbox>
                      ) : (
                        <div
                          className="customers_classcompleted_container"
                          style={{ marginBottom: "6px" }}
                        >
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Trainer Verified
                          </p>
                        </div>
                      )}
                    </Col>
                  </Row>

                  <Row>
                    <Col span={12}>
                      {record.status === "Form Pending" ||
                      record.status === "Awaiting Finance" ||
                      record.status === "Awaiting Verify" ||
                      record.status === "Awaiting Trainer" ||
                      record.status === "Awaiting Trainer Verify" ||
                      record.status === "Awaiting Class" ? (
                        <Checkbox
                          className="customers_statuscheckbox"
                          checked={false}
                          onChange={(e) => {
                            if (record.status === "Form Pending") {
                              CommonMessage(
                                "warning",
                                "Form Not Submitted Yet"
                              );
                            } else if (record.status === "Awaiting Finance") {
                              CommonMessage(
                                "warning",
                                "Finance not Verified Yet"
                              );
                            } else if (record.status === "Awaiting Verify") {
                              CommonMessage(
                                "warning",
                                "Customer not Verified Yet"
                              );
                            } else if (record.status === "Awaiting Trainer") {
                              CommonMessage(
                                "warning",
                                "Trainer not Assigned yet"
                              );
                            } else if (
                              record.status === "Awaiting Trainer Verify"
                            ) {
                              CommonMessage(
                                "warning",
                                "Trainer not Verified yet"
                              );
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
                              CommonMessage(
                                "warning",
                                "Class Already Scheduled"
                              );
                            }
                          }}
                        >
                          Schedule Class
                        </Checkbox>
                      ) : record.status === "Class Scheduled" ? (
                        <button
                          className="customers_updateschedulebutton"
                          onClick={() => {
                            setCustomerId(record.id);
                            setCustomerDetails(record);
                            setScheduleId(record.class_schedule_id);
                            setClassStartDate(record.class_start_date);
                            setDrawerContentStatus("Class Schedule");
                            setIsStatusUpdateDrawer(true);
                          }}
                        >
                          Update Schedule
                        </button>
                      ) : (
                        <div
                          className="customers_classcompleted_container"
                          style={{ marginBottom: "6px" }}
                        >
                          <BsPatchCheckFill color="#3c9111" />
                          <p className="customers_classgoing_completedtext">
                            Class Scheduled
                          </p>
                        </div>
                      )}
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
                                setScheduleId(record.class_schedule_id);
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
              ) : text === "Form Pending" ? (
                <div>
                  <Button className="customers_status_formpending_button">
                    {text}
                  </Button>
                </div>
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
              ) : text === "Class Scheduled" ? (
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
                    classPercent
                  )}%`}</p>
                </div>
              ) : (
                <p style={{ marginLeft: "6px" }}>-</p>
              )}
            </Tooltip>
            {record.status === "Form Pending" && (
              <Tooltip
                placement="top"
                title="Copy form link"
                trigger={["hover", "click"]}
              >
                <FaRegCopy
                  size={14}
                  className="customers_formlink_copybutton"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${
                        import.meta.env.VITE_EMAIL_URL
                      }/customer-registration/${record.id}`
                    );
                    CommonMessage("success", "Link Copied");
                  }}
                />
              </Tooltip>
            )}
          </div>
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
  ];

  const [customersData, setCustomersData] = useState([]);

  const customerByTrainerColumn = [
    {
      title: "Customer Name",
      key: "cus_name",
      dataIndex: "cus_name",
      width: 180,
    },
    {
      title: "Customer Email",
      key: "cus_email",
      dataIndex: "cus_email",
      width: 220,
    },
    { title: "Customer Mobile", key: "cus_phone", dataIndex: "cus_phone" },
    {
      title: "Course Name",
      key: "course_name",
      dataIndex: "course_name",
      width: 200,
    },
    {
      title: "Training Mode",
      key: "training_mode",
      dataIndex: "training_mode",
    },
    {
      title: "Region",
      key: "region_name",
      dataIndex: "region_name",
      width: 120,
    },
    { title: "Branch Name", key: "branch_name", dataIndex: "branch_name" },
    {
      title: "Class Going %",
      key: "class_percentage",
      dataIndex: "class_percentage",
      width: 120,
    },
    {
      title: "Course Fees",
      key: "primary_fees",
      dataIndex: "primary_fees",
      width: 120,
      render: (text) => {
        return <p>{"₹" + text}</p>;
      },
    },
    {
      title: "Trainer Commercial",
      key: "commercial",
      dataIndex: "commercial",
      fixed: "right",
      render: (text) => {
        return <p>{"₹" + text}</p>;
      },
    },
  ];

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
      ...(searchvalue && filterType === 1
        ? { name: searchvalue }
        : searchvalue && filterType === 2
        ? { email: searchvalue }
        : searchvalue && filterType === 3
        ? { mobile: searchvalue }
        : searchvalue && filterType === 4
        ? { course: searchvalue }
        : {}),
      from_date: startDate,
      to_date: endDate,
      ...(customerStatus && { status: customerStatus }),
    };

    try {
      const response = await getCustomers(payload);
      console.log("customers response", response);
      const customers = response?.data?.data?.customers;
      setCustomersData(response?.data?.data?.customers || []);
      setCustomerStatusCount(
        response?.data?.data?.customer_status_count || null
      );
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
      handleCustomerTrack(updatestatus);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later"
      );
    }
  };

  const handleCustomerTrack = async (updatestatus) => {
    const today = new Date();

    const payload = {
      customer_id: customerDetails.id,
      status: updatestatus,
      status_date: formatToBackendIST(today),
    };
    try {
      await inserCustomerTrack(payload);
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
      console.log("customer track error", error);
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
                          {"₹" + item.commercial}
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
        console.log("hiiiiiiiiiiiiiii");
        setTimeout(() => {
          setHistoryLoading(false);
        }, 300);
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

  const getCustomerByTrainerIdData = async (trainerid, classtaken) => {
    setCustomerByTrainerLoading(true);
    const payload = {
      trainer_id: trainerid,
      is_class_taken: classtaken,
    };
    try {
      const response = await getCustomerByTrainerId(payload);
      console.log("get customer by trainer id response", response);
      setCustomerByTrainerData(response?.data?.data || []);
      setTimeout(() => {
        setCustomerByTrainerLoading(false);
      }, 300);
    } catch (error) {
      setCustomerByTrainerData([]);
      setCustomerByTrainerLoading(false);
      console.log("get customer by trainer id error", error);
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
    setIsShowRejectTrainerCommentBox(true);
    setTimeout(() => {
      const container = document.getElementById(
        "customer_trainerreject_commentContainer"
      );
      container.scrollIntoView({ behavior: "smooth" });
    }, 200);

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
    let classStartDateValidate;

    if (scheduleId === 6) {
      classStartDateValidate = selectValidator(classStartDate);
    } else {
      classStartDateValidate = "";
    }

    setScheduleIdError(scheduleIdValidate);
    setClassStartDateError(classStartDateValidate);

    if (scheduleIdValidate || classStartDateValidate) return;
    setUpdateButtonLoading(true);

    const today = new Date();

    const payload = {
      customer_id: customerDetails.id,
      schedule_id: scheduleId,
      ...(classStartDate
        ? {
            class_start_date: formatToBackendIST(classStartDate),
          }
        : { class_start_date: null }),
      schedule_at: formatToBackendIST(today),
    };
    console.log("class schedule payload", payload);
    try {
      await classScheduleForCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(() => {
        handleCustomerStatus(
          scheduleId === 1
            ? "Class Going"
            : scheduleId === 3
            ? "Hold"
            : scheduleId === 5
            ? "Escalated"
            : "Class Scheduled"
        );
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
    if (scheduleId != 1) {
      handleClassSchedule();
      return;
    }
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
          handleCustomerStatus("Awaiting G-Review");
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

  const handleGoogleReview = async () => {
    let googleValidate;
    const courseDurationValidate = selectValidator(courseDuration);
    const courseCompleteDateValidate = selectValidator(courseCompleteDate);

    if (googleFeedbackBase64 === "") {
      googleValidate = "Google review screenshot is required";
    } else {
      googleValidate = "";
    }

    setCourseDurationError(courseDurationValidate);
    setCourseCompleteDateError(courseCompleteDateValidate);
    setGoogleFeedbackError(googleValidate);

    if (courseDurationValidate || courseCompleteDateValidate || googleValidate)
      return;
    setUpdateButtonLoading(true);

    const today = new Date();
    const payload = {
      customer_id: customerDetails.id,
      linkedin_review: "",
      google_review: googleFeedbackBase64,
      course_duration: courseDuration,
      course_completed_date: formatToBackendIST(courseCompleteDate),
      review_updated_date: formatToBackendIST(today),
    };
    try {
      await updatefeedbackForCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(() => {
        handleCustomerStatus("Awaiting L-Review");
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

  const handleIssueCert = async () => {
    let linkedinValidate;

    if (linkedinFeedbackBase64 === "") {
      linkedinValidate = "Linkedin review screenshot is required";
    } else {
      linkedinValidate = "";
    }

    setLinkedinFeedbackError(linkedinValidate);

    if (linkedinValidate) return;
    setUpdateButtonLoading(true);

    const today = new Date();
    const payload = {
      customer_id: customerDetails.id,
      linkedin_review: linkedinFeedbackBase64,
      google_review: customerDetails.google_review,
      course_duration: customerDetails.course_duration,
      course_completed_date: formatToBackendIST(
        customerDetails.course_completion_date
      ),
      review_updated_date: formatToBackendIST(today),
    };
    try {
      await updatefeedbackForCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(() => {
        handleCustomerStatus("Completed");
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

  const handleStatusMismatch = () => {
    CommonMessage("error", "Status Mismatch. Contack Support Team");
  };

  const updateStatusDrawerReset = () => {
    setIsStatusUpdateDrawer(false);
    setCustomerDetails(null);
    setDrawerContentStatus("");
    setUpdateButtonLoading(false);
    setRejectButtonLoader(false);
    //finance verify
    setIsOpenPaymentScreenshotModal(false);
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
    setTrainerFilterType(1);
    setTrainerHistory([]);
    //verify trainer
    setAssignTrainerData(null);
    setRejectTrainerComments("");
    setRejectTrainerCommentsError("");
    setIsShowRejectTrainerCommentBox(false);
    //class schedule
    setScheduleId(null);
    setScheduleIdError("");
    setClassStartDate(null);
    setClassStartDateError("");
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
    setCourseDuration("");
    setCourseDurationError("");
    setCourseCompleteDateError("");
    setCourseCompleteDate(null);
    setCourseCompleteDateError("");
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="overallduecustomers_filterContainer">
            {/* Search Input */}
            <CommonOutlinedInput
              label={
                filterType === 1
                  ? "Search By Name"
                  : filterType === 2
                  ? "Search By Email"
                  : filterType === 3
                  ? "Search by Mobile"
                  : filterType === 4
                  ? "Search by Course"
                  : ""
              }
              width="40%"
              height="33px"
              labelFontSize="12px"
              icon={
                searchValue ? (
                  <div
                    className="users_filter_closeIconContainer"
                    onClick={() => {
                      setSearchValue("");
                      getCustomersData(
                        selectedDates[0],
                        selectedDates[1],
                        null,
                        status
                      );
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
                borderTopRightRadius: "0px",
                borderBottomRightRadius: "0px",
              }}
              onChange={handleSearch}
              value={searchValue}
            />
            {/* Filter Button */}
            <div>
              <Flex
                justify="center"
                align="center"
                style={{ whiteSpace: "nowrap" }}
              >
                <Tooltip
                  placement="bottomLeft"
                  color="#fff"
                  title={
                    <Radio.Group
                      value={filterType}
                      onChange={(e) => {
                        setFilterType(e.target.value);
                        if (searchValue === "") {
                          return;
                        } else {
                          setSearchValue("");
                          getCustomersData(
                            selectedDates[0],
                            selectedDates[1],
                            null,
                            status
                          );
                        }
                      }}
                    >
                      <Radio
                        value={1}
                        style={{ marginTop: "6px", marginBottom: "12px" }}
                      >
                        Search by Name
                      </Radio>
                      <Radio value={2} style={{ marginBottom: "12px" }}>
                        Search by Email
                      </Radio>
                      <Radio value={3} style={{ marginBottom: "6px" }}>
                        Search by Mobile
                      </Radio>
                      <Radio
                        value={4}
                        style={{ marginTop: "6px", marginBottom: "6px" }}
                      >
                        Search by Course
                      </Radio>
                    </Radio.Group>
                  }
                >
                  <Button className="users_filterbutton">
                    <IoFilter size={18} />
                  </Button>
                </Tooltip>
              </Flex>
            </div>

            {/* Date Picker on the Right */}
            <div style={{ marginLeft: "16px" }}>
              <CommonDoubleDatePicker
                value={selectedDates}
                onChange={handleDateChange}
              />
            </div>
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
              status == "Form Pending"
                ? "customers_active_formpending_container"
                : "customers_formpending_container"
            }
            onClick={() => {
              if (status == "Form Pending") {
                return;
              }
              setStatus("Form Pending");
              getCustomersData(
                selectedDates[0],
                selectedDates[1],
                searchValue,
                "Form Pending"
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
                  {customerDetails && customerDetails.gender === "Male" ? (
                    <BsGenderMale size={15} color="gray" />
                  ) : (
                    <BsGenderFemale size={15} color="gray" />
                  )}
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

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <LuCircleUser size={15} color="gray" />
                  <p className="customerdetails_rowheading">Lead Owner</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {" "}
                  {customerDetails && customerDetails.lead_by
                    ? customerDetails.lead_by
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
                      <p className="customerdetails_rowheading">Region</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.region_name
                        ? customerDetails.region_name
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
              </Col>

              <Col span={12}>
                <Row>
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
                      <p className="customerdetails_rowheading">
                        Placement Support
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.placement_support
                        ? customerDetails.placement_support
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

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <IoLocationOutline size={15} color="gray" />
                  <p className="customerdetails_rowheading">Location</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.current_location
                    ? customerDetails.current_location
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }} gutter={16}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <LuCircleUser size={15} color="gray" />
                  <p className="customerdetails_rowheading">Lead Owner</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {" "}
                  {customerDetails && customerDetails.lead_by
                    ? customerDetails.lead_by
                    : "-"}
                </p>
              </Col>
            </Row>
          </Col>

          <Col span={12}>
            <Row>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Course</p>
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

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Region</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {customerDetails && customerDetails.region_name
                    ? customerDetails.region_name
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
                  <p className="customerdetails_rowheading">Course Fees</p>
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
                  <p className="customerdetails_rowheading">Balance Amount</p>
                </div>
              </Col>
              <Col span={12}>
                <p
                  className="customerdetails_text"
                  style={{ color: "#d32f2f" }}
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

            <button
              className="customer_paymentscreenshot_viewbutton"
              onClick={() => {
                setIsOpenPaymentScreenshotModal(true);
              }}
            >
              <FaRegEye size={16} /> View payment screenshot
            </button>
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

              <div style={{ marginTop: "8px" }}>
                <Radio.Group
                  value={trainerFilterType}
                  onChange={(e) => {
                    console.log(e.target.value);
                    setTrainerFilterType(e.target.value);
                  }}
                >
                  <Radio value={1} style={{ fontSize: "10px" }}>
                    Search Trainer by Name
                  </Radio>
                  <Radio value={2} style={{ fontSize: "10px" }}>
                    Search Trainer by Email
                  </Radio>
                  <Radio value={3} style={{ fontSize: "10px" }}>
                    Search Trainer by Mobile
                  </Radio>
                </Radio.Group>
              </div>

              <Row gutter={16} style={{ marginTop: "14px" }}>
                <Col span={12}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <CommonSelectField
                        label="Trainer"
                        required={true}
                        options={trainersData}
                        onChange={(e) => {
                          setTrainerId(e.target.value);
                          const clickedTrainer = trainersData.filter(
                            (f) => f.id === e.target.value
                          );
                          console.log("clickedTrainer", clickedTrainer);
                          setClickedTrainerDetails(clickedTrainer);
                          setTrainerIdError(selectValidator(e.target.value));
                        }}
                        value={trainerId}
                        error={trainerIdError}
                        showLabelStatus={
                          trainerFilterType === 1
                            ? "Name"
                            : trainerFilterType === 2
                            ? "Email"
                            : "Mobile"
                        }
                      />
                    </div>

                    {trainerId && (
                      <Tooltip
                        placement="top"
                        title="View Trainer Details"
                        trigger={["hover", "click"]}
                      >
                        <FaRegEye
                          size={17}
                          className="trainers_action_icons"
                          onClick={() => setIsOpenTrainerDetailModal(true)}
                        />
                      </Tooltip>
                    )}
                  </div>
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
                </Col>

                <Col span={11}>
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

                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">Commercial</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">{"₹" + commercial}</p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Commercial%
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p
                        className="customerdetails_text"
                        style={{
                          color:
                            customerDetails &&
                            customerDetails.commercial_percentage !== null &&
                            customerDetails.commercial_percentage > 24
                              ? "#d32f2f"
                              : "#3c9111", // default color
                          fontWeight: 600,
                        }}
                      >
                        {customerDetails &&
                        customerDetails.commercial_percentage
                          ? customerDetails.commercial_percentage + "%"
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Class Taken
                        </p>
                      </div>
                    </Col>
                    <Col
                      span={12}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <p className="customers_classtaken_customerscount">
                        {customerDetails &&
                        customerDetails.completed_student_count
                          ? customerDetails.completed_student_count +
                            " Customers"
                          : "-"}
                      </p>
                      <Tooltip
                        placement="top"
                        title="View Customer Details"
                        trigger={["hover", "click"]}
                      >
                        <FaRegEye
                          size={12}
                          className="trainers_action_icons"
                          onClick={() => {
                            setIsOpenTrainerCustomersModal(true);
                            getCustomerByTrainerIdData(
                              customerDetails && customerDetails.trainer_id
                                ? customerDetails.trainer_id
                                : null,
                              1
                            );
                          }}
                        />
                      </Tooltip>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }} gutter={16}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Class Going
                        </p>
                      </div>
                    </Col>
                    <Col
                      span={12}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <p className="customers_classtaken_customerscount">
                        {customerDetails &&
                        customerDetails.ongoing_student_count
                          ? customerDetails.ongoing_student_count + " Customers"
                          : "-"}
                      </p>
                      <Tooltip
                        placement="top"
                        title="View Customer Details"
                        trigger={["hover", "click"]}
                      >
                        <FaRegEye
                          size={12}
                          className="trainers_action_icons"
                          onClick={() => {
                            setIsOpenTrainerCustomersModal(true);
                            getCustomerByTrainerIdData(
                              customerDetails && customerDetails.trainer_id
                                ? customerDetails.trainer_id
                                : null,
                              0
                            );
                          }}
                        />
                      </Tooltip>
                    </Col>
                  </Row>
                </Col>
              </Row>

              {isShowRejectTrainerCommentBox ? (
                <div
                  style={{ marginTop: "12px", position: "relative" }}
                  id="customer_trainerreject_commentContainer"
                >
                  <CommonTextArea
                    label="Comment"
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
              ) : (
                ""
              )}
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
                    const value = e.target.value;
                    setScheduleId(value);
                    setScheduleIdError(selectValidator(value));
                    if (value === 6) {
                      setClassStartDateError(selectValidator(classStartDate));
                    } else {
                      setClassStartDate(null);
                      setClassStartDateError("");
                    }
                  }}
                  value={scheduleId}
                  error={scheduleIdError}
                />
              </div>
              {scheduleId === 6 ? (
                <div style={{ marginTop: "30px" }}>
                  <CommonMuiDatePicker
                    label="Schedule Status"
                    required={true}
                    onChange={(value) => {
                      setClassStartDate(value);
                      setClassStartDateError(selectValidator(value));
                    }}
                    value={classStartDate}
                    error={classStartDateError}
                    disablePreviousDates={true}
                  />
                </div>
              ) : (
                ""
              )}
            </div>
          </>
        ) : drawerContentStatus === "Class Going" ? (
          <>
            <div className="customer_statusupdate_adddetailsContainer">
              <p className="customer_statusupdate_adddetails_heading">
                Update Class-Going Process
              </p>

              <Row style={{ marginTop: "30px" }}>
                <Col span={24}>
                  <CommonSelectField
                    label="Schedule Status"
                    options={scheduleOptions}
                    required={true}
                    onChange={(e) => {
                      const value = e.target.value;
                      setScheduleId(value);
                      setScheduleIdError(selectValidator(value));
                      if (value === 6) {
                        setClassStartDateError(selectValidator(classStartDate));
                      } else {
                        setClassStartDate(null);
                        setClassStartDateError("");
                      }
                    }}
                    value={scheduleId}
                    error={scheduleIdError}
                  />
                </Col>
              </Row>

              {scheduleId === 6 ? (
                <div style={{ marginTop: "30px" }}>
                  <CommonMuiDatePicker
                    label="Schedule Status"
                    required={true}
                    onChange={(value) => {
                      setClassStartDate(value);
                      setClassStartDateError(selectValidator(value));
                    }}
                    value={classStartDate}
                    error={classStartDateError}
                    disablePreviousDates={true}
                  />
                </div>
              ) : scheduleId === 1 ? (
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
                        setClassGoingPercentageError(
                          percentageValidator(value)
                        );
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
              ) : (
                ""
              )}
            </div>
          </>
        ) : drawerContentStatus === "Add G-Review" ? (
          <>
            <div className="customer_statusupdate_adddetailsContainer">
              <p className="customer_statusupdate_adddetails_heading">
                Add Feedback Details
              </p>

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
                    required={true}
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
        ) : drawerContentStatus === "Add L-Review" ? (
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

            {drawerContentStatus === "Add L-Review" ? (
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
                        : drawerContentStatus === "Add G-Review"
                        ? handleGoogleReview
                        : handleStatusMismatch
                    }
                  >
                    {drawerContentStatus === "Assign Trainer"
                      ? "Assign"
                      : drawerContentStatus === "Class Going" ||
                        drawerContentStatus === "Add G-Review"
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

      <Modal
        title="Trainer Full Details"
        open={isOpenTrainerDetailModal}
        onCancel={() => setIsOpenTrainerDetailModal(false)}
        footer={false}
        width="50%"
      >
        {clickedTrainerDetails.map((item, index) => {
          return (
            <Row gutter={16} style={{ marginTop: "20px" }}>
              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <FaRegCircleUser size={15} color="gray" />
                      <p className="customerdetails_rowheading">Name</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">{item.name}</p>
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
                    <p className="customerdetails_text">{item.email}</p>
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
                    <p className="customerdetails_text">{item.mobile}</p>
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
                    <p className="customerdetails_text">{item.whatsapp}</p>
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
                    <p className="customerdetails_text">{item.location}</p>
                  </Col>
                </Row>
              </Col>

              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Technology</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">{item.technology}</p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Experience</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {item.overall_exp_year + " Years"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Relevent Experience
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {item.relavant_exp_year + " Years"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Avaibility Timing
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {moment(item.availability_time, "HH:mm:ss").format(
                        "hh:mm A"
                      )}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Secondary Timing
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {moment(item.secondary_time, "HH:mm:ss").format(
                        "hh:mm A"
                      )}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Skills</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {item.skills.join(", ")}
                    </p>
                  </Col>
                </Row>
              </Col>
            </Row>
          );
        })}
      </Modal>

      <Modal
        title="Payment Screenshot"
        open={isOpenPaymentScreenshotModal}
        onCancel={() => setIsOpenPaymentScreenshotModal(false)}
        footer={false}
        width="32%"
        className="customer_paymentscreenshot_modal"
      >
        <div style={{ overflow: "hidden", maxHeight: "100vh" }}>
          <PrismaZoom>
            {customerDetails?.payments?.payment_screenshot ? (
              <img
                src={`data:image/png;base64,${customerDetails?.payments?.payment_screenshot}`}
                alt="payment screenshot"
                className="customer_paymentscreenshot_image"
              />
            ) : (
              "-"
            )}
          </PrismaZoom>
        </div>
      </Modal>

      <Modal
        title="Customers Details"
        open={isOpenTrainerCustomersModal}
        onCancel={() => setIsOpenTrainerCustomersModal(false)}
        footer={false}
        width="60%"
      >
        <CommonTable
          scroll={{ x: 1600 }}
          columns={customerByTrainerColumn}
          dataSource={customerByTrainerData}
          dataPerPage={10}
          loading={customerByTrainerLoading}
          checkBox="false"
          size="small"
          className="questionupload_table"
        />
      </Modal>
    </div>
  );
}
