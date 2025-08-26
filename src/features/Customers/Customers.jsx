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
} from "antd";
import { CiSearch } from "react-icons/ci";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonDoubleDatePicker from "../Common/CommonDoubleDatePicker";
import CommonTable from "../Common/CommonTable";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";
import "./styles.css";
import {
  assignTrainerForCustomer,
  getCustomers,
  getTrainerById,
  getTrainers,
  rejectTrainerForCustomer,
  sendCustomerFormEmail,
  updateCustomerStatus,
  verifyCustomer,
  verifyTrainerForCustomer,
} from "../ApiService/action";
import {
  addressValidator,
  formatToBackendIST,
  getCurrentandPreviousweekDate,
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

export default function Customers() {
  const scrollRef = useRef();
  const customerUpdateRef = useRef();

  const scroll = (scrollOffset) => {
    scrollRef.current.scrollBy({
      left: scrollOffset,
      behavior: "smooth",
    });
  };
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

  //trainer verify usestates
  const [assignTrainerData, setAssignTrainerData] = useState(null);
  const [rejectTrainerComments, setRejectTrainerComments] = useState("");
  const [rejectTrainerCommentsError, setRejectTrainerCommentsError] =
    useState("");
  const [rejectbuttonLoader, setRejectButtonLoader] = useState(false);
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
                width: "260px",
                maxWidth: "none",
                whiteSpace: "normal",
              },
            }} // open={true}
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

  useEffect(() => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);

    getCustomersData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      null,
      null
    );
  }, []);

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
        getTrainersData();
      }, 300);
    }
  };

  const getTrainersData = async () => {
    const payload = {
      status: "Verified",
    };
    try {
      const response = await getTrainers(payload);
      setTrainersData(response?.data?.data?.trainers || []);
    } catch (error) {
      setTrainersData([]);
      console.log(error);
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
    handleCustomerStatus("Awaiting Verify");
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
      id: customerDetails.id,
      rejected_date: formatToBackendIST(today),
      comments: "commercial not matched",
    };

    try {
      await rejectTrainerForCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(() => {
        handleCustomerStatus("Awaiting Trainer Verify");
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

  const updateStatusDrawerReset = () => {
    setIsStatusUpdateDrawer(false);
    setCustomerDetails(null);
    setDrawerContentStatus("");
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
    //verify trainer
    setAssignTrainerData(null);
    setRejectTrainerComments("");
    setRejectTrainerCommentsError("");
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
              status === "Form Pending"
                ? "customers_active_formpending_container"
                : "customers_formpending_container"
            }
            onClick={() => {
              if (status === "Form Pending") {
                return;
              }
              setStatus("Form Pending");
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
                      {customerDetails && customerDetails.balance_amount
                        ? "₹" + customerDetails.balance_amount
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
                Assign Trainer
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
                  <CommonInputField
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
                    : handleVerifyTrainer
                }
              >
                Verified
              </button>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
