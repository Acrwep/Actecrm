import React, { useState, useEffect, useMemo } from "react";
import {
  Row,
  Col,
  Collapse,
  Divider,
  Modal,
  Button,
  Steps,
  Flex,
  Tooltip,
} from "antd";
import { LuIndianRupee } from "react-icons/lu";
import { FaRegEye } from "react-icons/fa";
import { FaRegCircleXmark } from "react-icons/fa6";
import { BsPatchCheckFill } from "react-icons/bs";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineAssignmentInd } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { IoFilter } from "react-icons/io5";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonTextArea from "../Common/CommonTextArea";
import {
  addressValidator,
  formatToBackendIST,
  selectValidator,
} from "../Common/Validation";
import {
  assignTrainerForCustomer,
  getAssignTrainerHistoryForCustomer,
  getCustomerById,
  getCustomerByTrainerId,
  getTrainerById,
  getTrainers,
  inserCustomerTrack,
  updateCustomerStatus,
  updateTrainerCoordination,
} from "../ApiService/action";
import moment from "moment";
import CommonSpinner from "../Common/CommonSpinner";
import PrismaZoom from "react-prismazoom";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonCustomerSingleSelectField from "../Common/CommonCustomerSingleSelect";
import CommonTable from "../Common/CommonTable";
import { CommonMessage } from "../Common/CommonMessage";

const { Step } = Steps;

export default function AssignTrainerToCustomer({
  customer_details,
  setIsStatusUpdateDrawerLoading,
  callgetCustomersApi,
}) {
  const [customerDetails, setCustomerDetails] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [commercial, setCommercial] = useState(null);
  const [commercialError, setCommercialError] = useState("");
  const modeOfClassOptions = [
    { id: "Offline", name: "Offline" },
    { id: "Online", name: "Online" },
  ];
  const [modeOfClass, setModeOfClass] = useState(null);
  const [modeOfClassError, setModeOfClassError] = useState("");
  const [trainerType, setTrainerType] = useState("");

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
  const [customerByTrainerData, setCustomerByTrainerData] = useState([]);
  const [customerByTrainerLoading, setCustomerByTrainerLoading] =
    useState(false);
  const [clickedTrainerDetails, setClickedTrainerDetails] = useState([]);
  const [trainerClassTakenCount, setTrainerClassTakenCount] = useState(0);
  const [trainerClassGoingCount, setTrainerClassGoingCount] = useState(0);
  const [buttonLoading, setButtonLoading] = useState(false);
  /* ---------------- Trainer STATES ---------------- */
  const [trainersData, setTrainersData] = useState([]);
  // ✅ IMPORTANT: keep IDs & Objects separately
  const [selectedTrainerId, setSelectedTrainerId] = useState(null);
  const [selectedTrainerIdError, setSelectedTrainerIdError] = useState(null);
  const [selectedTrainerObject, setSelectedTrainerObject] = useState(null);
  const [trainerSearchText, setTrainerSearchText] = useState("");
  /* ---------------- PAGINATION ---------------- */
  const [trainerPage, setTrainerPage] = useState(1);
  const [trainerHasMore, setTrainerHasMore] = useState(true);
  const [trainerSelectloading, setTrainerSelectloading] = useState(false);

  //trainer coordination usestates
  const [whatsappGroupStatus, setWhatsappGroupStatus] = useState(null);
  const [welcomeMessageStatus, setWelcomeMessageStatus] = useState(null);
  const [linkStatus, setLinkStatus] = useState(null);
  const [classMonitorStatus, setClassMonitorStatus] = useState(null);
  const [trainerConfirmation, setTrainerConfirmation] = useState(null);

  const prev = () => setStepIndex(stepIndex - 1);

  const customerByTrainerColumn = [
    {
      title: "Customer Name",
      key: "cus_name",
      dataIndex: "cus_name",
      width: 140,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Customer Email",
      key: "cus_email",
      dataIndex: "cus_email",
      width: 140,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Customer Mobile",
      key: "cus_phone",
      dataIndex: "cus_phone",
      width: 140,
    },
    {
      title: "Course Name",
      key: "course_name",
      dataIndex: "course_name",
      width: 160,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Region",
      key: "region_name",
      dataIndex: "region_name",
      width: 120,
    },
    {
      title: "Branch Name",
      key: "branch_name",
      dataIndex: "branch_name",
      width: 140,
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
      title: "Class Going %",
      key: "class_percentage",
      dataIndex: "class_percentage",
      width: 115,
      fixed: "right",
      render: (text) => {
        return <p>{text ? `${parseInt(text)}%` : `0%`}</p>;
      },
    },
    {
      title: "Trainer Commercial",
      key: "commercial",
      dataIndex: "commercial",
      fixed: "right",
      width: 160,
      render: (text) => {
        return <p>{"₹" + text}</p>;
      },
    },
  ];

  useEffect(() => {
    console.log("customer_details", customer_details);
    setSelectedTrainerId(customer_details?.trainer_id);
    setCommercial(customer_details?.commercial);
    setModeOfClass(customer_details?.trainer_mode_of_class);
    setTrainerType(customer_details?.trainer_type);
    setAssignTrainerComments(customer_details?.comments);
    setAssignTrainerProofBase64(customer_details?.proof_communication);
    //trainer coordination
    setWhatsappGroupStatus(
      customer_details?.whatsapp_group_creation === 1 ? 1 : 2,
    );
    setWelcomeMessageStatus(customer_details?.hr_welcome_message === 1 ? 1 : 2);
    setLinkStatus(customer_details?.shared_attendance_link === 1 ? 1 : 2);
    setClassMonitorStatus(
      customer_details?.first_class_monitoring === 1 ? 1 : 2,
    );
    setTrainerConfirmation(
      customer_details?.trainer_confirmation === 1 ? 1 : 2,
    );
    //---------------------------------------------------------
    if (customer_details?.trainer_id) {
      getCustomerByTrainerIdData(customer_details.trainer_id, 0);
    }
    setCustomerDetails(customer_details);
    handleTrainerHistory();
  }, []);

  const handleTrainerHistory = async () => {
    const payload = {
      customer_id:
        customer_details && customer_details.id ? customer_details.id : null,
    };

    try {
      const response = await getAssignTrainerHistoryForCustomer(payload);
      console.log("trainer history response", response);
      const historyData = response?.data?.data || [];
      setHistoryLoading(true);
      if (historyData.length >= 1) {
        const reverseData = historyData.reverse();
        setTrainerHistory(reverseData);

        setTimeout(() => {
          setHistoryLoading(false);
        }, 300);
      } else {
        setTrainerHistory([]);
        setTimeout(() => {
          setHistoryLoading(false);
        }, 300);
      }
    } catch (error) {
      setTrainerHistory([]);
      console.log("trainer history error", error);
    } finally {
      setTimeout(() => {
        getAssignTrainerData();
      }, 100);
    }
  };

  const getAssignTrainerData = async () => {
    if (!customer_details?.trainer_id) {
      getTrainersData();
      return;
    }
    try {
      const response = await getTrainerById(customer_details.trainer_id);
      const trainerDetails = response?.data?.data;
      console.log("trainerDetailssssssssssssss", trainerDetails);
      if (trainerDetails) {
        setSelectedTrainerObject(trainerDetails);
      }
    } catch (error) {
      console.log("get trainer by id error", error);
    } finally {
      getTrainersData();
    }
  };

  const getParticularCustomerDetails = async () => {
    // setIsStatusUpdateDrawerLoading(true);
    try {
      const response = await getCustomerById(customer_details?.id);
      console.log("particular customer response", response);
      const particular_customer_details = response?.data?.data;
      setCustomerDetails(particular_customer_details);
    } catch (error) {
      console.log("getcustomer by id error", error);
      setCustomerDetails(null);
    } finally {
      setButtonLoading(false);
    }
  };

  /* ---------------- FETCH TRAINERS ---------------- */
  const getTrainersData = async (searchvalue, pageNumber = 1) => {
    setTrainerSelectloading(true);

    const payload = {
      keyword: searchvalue,
      status: "Verified",
      page: pageNumber,
      limit: 10,
    };

    try {
      const response = await getTrainers(payload);

      const trainers = response?.data?.data?.trainers || [];
      const pagination = response?.data?.data?.pagination;

      setTrainersData((prev) =>
        pageNumber === 1 ? trainers : [...prev, ...trainers],
      );

      setTrainerHasMore(pageNumber < pagination.totalPages);
      setTrainerPage(pageNumber);
    } catch (error) {
      console.log("get trainers error", error);
    } finally {
      setTrainerSelectloading(false);
      // const test_customers = [{ id: 12, name: "Speed" }];
      // setSelectedTrainerId(test_customers.map((c) => String(c.id)));
      // setSelectedTrainerObject(test_customers);
    }
  };

  /* ---------------- SEARCH HANDLER ---------------- */
  const handleTrainerSearch = (value) => {
    setTrainerSearchText(value);
    setTrainerPage(1);
    setTrainerHasMore(true);
    setTrainersData([]);
    getTrainersData(value, 1);
  };

  /* ---------------- SELECT HANDLER (KEY FIX) ---------------- */
  const handleTrainerSelect = (event) => {
    const selectedId = event.target.value;
    const selectedObj = event.target.object; // ✅ DIRECT OBJECT
    setSelectedTrainerId(selectedId);
    setSelectedTrainerObject(selectedObj);
    setTrainerType(selectedObj?.trainer_type || "");

    setSelectedTrainerIdError(selectValidator(selectedId));
    getCustomerByTrainerIdData(selectedId, 0);
    // 👇 show selected label in input
    setTrainerSearchText(selectedObj?.name || "");
  };

  const renderTrainerOption = (props, option) => {
    const { key, ...optionProps } = props;
    return (
      <li
        key={key}
        {...optionProps}
        style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}
      >
        <Flex vertical gap={4} style={{ width: "100%" }}>
          <Flex
            align="center"
            justify="space-between"
            style={{ width: "100%" }}
          >
            <Flex align="center" gap={8}>
              <FaRegCircleUser size={15} style={{ color: "#5b69ca" }} />
              <span
                style={{ fontWeight: 600, fontSize: "14px", color: "#333" }}
              >
                {option.name}
              </span>
            </Flex>
            {option.trainer_type && (
              <span
                style={{
                  fontSize: "10px",
                  background: "#e6f7ff",
                  color: "#1890ff",
                  padding: "1px 8px",
                  borderRadius: "10px",
                  border: "1px solid #91d5ff",
                  fontWeight: 500,
                }}
              >
                {option.trainer_type}
              </span>
            )}
          </Flex>
          <Flex gap={12} wrap="wrap">
            {option.trainer_code && (
              <span
                style={{
                  fontSize: "12px",
                  color: "#8c8c8c",
                  fontWeight: 500,
                }}
              >
                ID: {option.trainer_code}
              </span>
            )}
            {option.email && (
              <Flex
                align="center"
                gap={4}
                style={{ fontSize: "12px", color: "#666" }}
              >
                <MdOutlineEmail size={13} style={{ color: "#8c8c8c" }} />
                <span>{option.email}</span>
              </Flex>
            )}
            {option.mobile && (
              <Flex
                align="center"
                gap={4}
                style={{ fontSize: "12px", color: "#666" }}
              >
                <IoCallOutline size={13} style={{ color: "#8c8c8c" }} />
                <span>{option.mobile}</span>
              </Flex>
            )}
          </Flex>
        </Flex>
      </li>
    );
  };

  /* ---------------- MERGED OPTIONS (CRITICAL) ---------------- */
  const mergedTrainers = useMemo(() => {
    const map = new Map();

    if (selectedTrainerObject) {
      map.set(selectedTrainerObject.id, selectedTrainerObject);
    }

    trainersData.forEach((c) => map.set(c.id, c));

    return Array.from(map.values());
  }, [trainersData, selectedTrainerObject]);

  /* ---------------- DROPDOWN OPEN ---------------- */
  const handleTrainerDropdownOpen = () => {
    if (trainersData.length === 0) {
      getTrainersData(null, 1);
    }
  };

  /* ---------------- INFINITE SCROLL ---------------- */
  const handleTrainerScroll = (e) => {
    const listbox = e.target;

    if (
      listbox.scrollTop + listbox.clientHeight >= listbox.scrollHeight - 5 &&
      trainerHasMore &&
      !trainerSelectloading
    ) {
      getTrainersData(trainerSearchText, trainerPage + 1);
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

      setTrainerClassTakenCount(response?.data?.data?.on_boarding_count || 0);
      setTrainerClassGoingCount(response?.data?.data?.on_going_count || 0);

      setCustomerByTrainerData(response?.data?.data?.students || []);
      setTimeout(() => {
        setCustomerByTrainerLoading(false);
      }, 300);
    } catch (error) {
      setCustomerByTrainerData([]);
      setCustomerByTrainerLoading(false);
      console.log("get customer by trainer id error", error);
    }
  };

  const handleAssignTrainer = async () => {
    console.log("customer_details", customer_details);

    const trainerIdValidate = selectValidator(selectedTrainerId);
    const commercialValidate = selectValidator(commercial);
    const modeOfClassValidate = selectValidator(modeOfClass);
    const commentValidate = addressValidator(assignTrainerComments);
    const assignTrainerProofValidate = selectValidator(
      assignTrainerProofBase64,
    );

    setSelectedTrainerIdError(trainerIdValidate);
    setCommercialError(commercialValidate);
    setModeOfClassError(modeOfClassValidate);
    setAssignTrainerProofError(assignTrainerProofValidate);
    setAssignTrainerCommentsError(commentValidate);

    if (
      trainerIdValidate ||
      commercialValidate ||
      modeOfClassValidate ||
      assignTrainerProofValidate ||
      commentValidate
    )
      return;

    const initialTrainerId = customer_details?.trainer_id;
    const initialCommercial = customer_details?.commercial;
    const initialModeOfClass = customer_details?.trainer_mode_of_class;
    const initialTrainerType = customer_details?.trainer_type;
    const initialComments = customer_details?.comments;
    const initialProof = customer_details?.proof_communication;

    if (
      selectedTrainerId == initialTrainerId &&
      commercial == initialCommercial &&
      modeOfClass == initialModeOfClass &&
      trainerType == initialTrainerType &&
      assignTrainerComments == initialComments &&
      assignTrainerProofBase64 == initialProof
    ) {
      CommonMessage("warning", "No changes made to update");
      return;
    }

    const changedFields = {};

    if (selectedTrainerId != initialTrainerId) {
      changedFields["trainer_name"] = {
        previous_value: customer_details?.trainer_name || "Empty",
        new_value: selectedTrainerObject?.name || "Empty",
      };
    }
    if (commercial != initialCommercial) {
      changedFields["commercial"] = {
        previous_value: initialCommercial || "Empty",
        new_value: commercial || "Empty",
      };
    }
    if (modeOfClass != initialModeOfClass) {
      changedFields["mode_of_training"] = {
        previous_value: initialModeOfClass || "Empty",
        new_value: modeOfClass || "Empty",
      };
    }
    if (trainerType != initialTrainerType) {
      changedFields["trainer_type"] = {
        previous_value: initialTrainerType || "Empty",
        new_value: trainerType || "Empty",
      };
    }
    if (assignTrainerComments != initialComments) {
      changedFields["comments"] = {
        previous_value: initialComments || "Empty",
        new_value: assignTrainerComments || "Empty",
      };
    }
    if (assignTrainerProofBase64 !== initialProof) {
      changedFields["proof_communication"] = {
        previous_value: initialProof || "",
        new_value: assignTrainerProofBase64 || "",
      };
    }

    const today = new Date();
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    setButtonLoading(true);

    const payload = {
      customer_id: customer_details.id,
      proof_communication: assignTrainerProofBase64,
      comments: assignTrainerComments,
      trainer_id: selectedTrainerId,
      commercial: commercial,
      mode_of_class: modeOfClass,
      trainer_type: trainerType,
      created_date: formatToBackendIST(today),
    };

    try {
      await assignTrainerForCustomer(payload);
      CommonMessage("success", "Updated Successfully");
      setTimeout(async () => {
        const payload = {
          customer_ids: [
            {
              customer_id: customer_details.id,
              status: "Awaiting Trainer Verify",
              updated_at: formatToBackendIST(new Date()),
              updated_by: converAsJson?.user_id || "",
            },
          ],
        };
        try {
          await updateCustomerStatus(payload);
          setButtonLoading(false);
          callgetCustomersApi();
          handleCustomerTrack("Trainer Assigned", changedFields);
          setTimeout(() => {
            handleSecondCustomerTrack("Awaiting Trainer Verify");
          }, 300);
        } catch (error) {
          CommonMessage(
            "error",
            error?.response?.data?.message ||
              "Something went wrong. Try again later",
          );
        }
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handleTrainerCoordination = async () => {
    const initialWhatsappGroupStatus =
      customerDetails?.whatsapp_group_creation === 1 ? 1 : 2;
    const initialWelcomeMessageStatus =
      customerDetails?.hr_welcome_message === 1 ? 1 : 2;
    const initialLinkStatus =
      customerDetails?.shared_attendance_link === 1 ? 1 : 2;
    const initialsMonitorStatus =
      customerDetails?.first_class_monitoring === 1 ? 1 : 2;
    const initialsTrainerConfirmation =
      customerDetails?.trainer_confirmation === 1 ? 1 : 2;

    if (
      whatsappGroupStatus == initialWhatsappGroupStatus &&
      welcomeMessageStatus == initialWelcomeMessageStatus &&
      linkStatus == initialLinkStatus &&
      classMonitorStatus == initialsMonitorStatus &&
      trainerConfirmation == initialsTrainerConfirmation
    ) {
      CommonMessage("warning", "No changes made to update");
      return;
    }

    setButtonLoading(true);
    const payload = {
      whatsapp_group_creation: whatsappGroupStatus == 1 ? 1 : 0,
      hr_welcome_message: welcomeMessageStatus == 1 ? 1 : 0,
      shared_attendance_link: linkStatus == 1 ? 1 : 0,
      first_class_monitoring: classMonitorStatus == 1 ? 1 : 0,
      trainer_confirmation: trainerConfirmation == 1 ? 1 : 0,
      trainer_mapping_id: customer_details?.training_map_id,
    };

    const changedFields = {};
    const whatsappOptions = [
      { id: 1, name: "Created" },
      { id: 2, name: "Not Yet" },
    ];
    const welcomeMessageOptions = [
      { id: 1, name: "Completed" },
      { id: 2, name: "Pending" },
    ];
    const linkOptions = [
      { id: 1, name: "Shared" },
      { id: 2, name: "Not Yet" },
    ];
    const classMonitorOptions = [
      { id: 1, name: "Monitored" },
      { id: 2, name: "Not Yet" },
    ];
    const trainerConfirmOptions = [
      { id: 1, name: "Completed" },
      { id: 2, name: "Pending" },
    ];

    const getName = (options, val) => {
      const found = options.find((o) => String(o.id) === String(val));
      return found ? found.name : val;
    };

    if (whatsappGroupStatus != initialWhatsappGroupStatus) {
      changedFields["whatsapp_group_creation"] = {
        previous_value: getName(whatsappOptions, initialWhatsappGroupStatus),
        new_value: getName(whatsappOptions, whatsappGroupStatus),
      };
    }
    if (welcomeMessageStatus != initialWelcomeMessageStatus) {
      changedFields["hr_welcome_message"] = {
        previous_value: getName(
          welcomeMessageOptions,
          initialWelcomeMessageStatus,
        ),
        new_value: getName(welcomeMessageOptions, welcomeMessageStatus),
      };
    }
    if (linkStatus != initialLinkStatus) {
      changedFields["shared_attendance_link"] = {
        previous_value: getName(linkOptions, initialLinkStatus),
        new_value: getName(linkOptions, linkStatus),
      };
    }
    if (classMonitorStatus != initialsMonitorStatus) {
      changedFields["first_class_monitoring"] = {
        previous_value: getName(classMonitorOptions, initialsMonitorStatus),
        new_value: getName(classMonitorOptions, classMonitorStatus),
      };
    }
    if (trainerConfirmation != initialsTrainerConfirmation) {
      changedFields["trainer_confirmation"] = {
        previous_value: getName(
          trainerConfirmOptions,
          initialsTrainerConfirmation,
        ),
        new_value: getName(trainerConfirmOptions, trainerConfirmation),
      };
    }

    try {
      await updateTrainerCoordination(payload);

      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = getloginUserDetails
        ? JSON.parse(getloginUserDetails)
        : null;

      const trackPayload = {
        customers: [
          {
            customer_id: customerDetails?.id,
            status: "Trainer Coordination Details Updated",
            details: changedFields,
            status_date: formatToBackendIST(new Date()),
            updated_by: converAsJson?.user_id || "",
          },
        ],
      };
      await inserCustomerTrack(trackPayload);

      CommonMessage(
        "success",
        "Trainer Coordination Details Updated Successfully",
      );
      getParticularCustomerDetails();
    } catch (error) {
      setButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const handleCustomerTrack = async (updatestatus, changedFields) => {
    const today = new Date();
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    console.log("getloginUserDetails", converAsJson);

    const payload = {
      customers: [
        {
          customer_id: customer_details.id,
          status: updatestatus,
          updated_by:
            converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
          status_date: formatToBackendIST(today),
          details: changedFields,
        },
      ],
    };

    try {
      await inserCustomerTrack(payload);
    } catch (error) {
      console.log("customer track error", error);
    }
  };

  const handleSecondCustomerTrack = async (updatestatus) => {
    const today = new Date();
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);
    console.log("getloginUserDetails", converAsJson);

    const payload = {
      customers: [
        {
          customer_id: customer_details.id,
          status: updatestatus,
          updated_by:
            converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
          status_date: formatToBackendIST(today),
        },
      ],
    };
    try {
      await inserCustomerTrack(payload);
    } catch (error) {
      console.log("customer track error", error);
    }
  };
  return (
    <>
      <div className="customer_statusupdate_adddetailsContainer">
        <p className="customer_statusupdate_adddetails_heading">
          Previous Assigned Trainer History
        </p>

        {historyLoading === false ? (
          <>
            {trainerHistory.length >= 1 ? (
              <div style={{ marginTop: "12px", marginBottom: "20px" }}>
                <Collapse
                  className="assesmntresult_collapse"
                  // items={trainerHistory}
                  activeKey={collapseDefaultKey}
                  onChange={(keys) => {
                    setCollapseDefaultKey(keys);
                  }}
                >
                  {trainerHistory.map((item, index) => {
                    const firstIndexItem =
                      trainerHistory.length >= 2 ? trainerHistory[1] : null;
                    return (
                      <Collapse.Panel
                        key={index + 1}
                        header={
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
                              Trainer Id -{" "}
                              <span className="customer_trainerverify_accordion_heading">
                                {item.trainer_code ? item.trainer_code : "-"}

                                {index == 0 &&
                                firstIndexItem &&
                                firstIndexItem.is_verified == 1 ? (
                                  <span className="customer_trainerverify_accordion_heading_batch">
                                    {`( Previous Trainer is Escalated )`}
                                  </span>
                                ) : (
                                  ""
                                )}
                              </span>
                            </span>

                            {item.is_verified == 1 ? (
                              <div className="customer_trans_statustext_container">
                                <BsPatchCheckFill color="#3c9111" />
                                <p
                                  style={{
                                    color: "#3c9111",
                                    fontWeight: 500,
                                  }}
                                >
                                  Verified
                                </p>
                              </div>
                            ) : item.is_rejected == 1 &&
                              item.is_verified == 0 ? (
                              <div className="customer_trans_statustext_container">
                                <FaRegCircleXmark color="#d32f2f" />
                                <p
                                  style={{
                                    color: "#d32f2f",
                                    fontWeight: 500,
                                  }}
                                >
                                  Rejected
                                </p>
                              </div>
                            ) : (
                              <div className="customer_trans_statustext_container">
                                <PiClockCounterClockwiseBold
                                  size={16}
                                  color="gray"
                                />
                                <p
                                  style={{
                                    color: "gray",
                                    fontWeight: 500,
                                  }}
                                >
                                  Waiting for Verify
                                </p>
                              </div>
                            )}
                          </div>
                        }
                      >
                        <div>
                          <Row gutter={16} style={{ marginTop: "6px" }}>
                            <Col span={12}>
                              <Row>
                                <Col span={12}>
                                  <div className="customerdetails_rowheadingContainer">
                                    <p className="customerdetails_rowheading">
                                      HR Name
                                    </p>
                                  </div>
                                </Col>
                                <Col span={12}>
                                  <EllipsisTooltip
                                    text={
                                      item.trainer_hr_name
                                        ? item.trainer_hr_name
                                        : "-"
                                    }
                                    smallText={true}
                                  />
                                </Col>
                              </Row>

                              <Row style={{ marginTop: "12px" }}>
                                <Col span={12}>
                                  <div className="customerdetails_rowheadingContainer">
                                    <p className="customerdetails_rowheading">
                                      Trainer Name
                                    </p>
                                  </div>
                                </Col>
                                <Col span={12}>
                                  <EllipsisTooltip
                                    text={
                                      item.trainer_name
                                        ? item.trainer_name
                                        : "-"
                                    }
                                    smallText={true}
                                  />
                                </Col>
                              </Row>

                              <Row style={{ marginTop: "12px" }}>
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

                              <Row style={{ marginTop: "12px" }}>
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

                              <Row style={{ marginTop: "12px" }}>
                                <Col span={12}>
                                  <div className="customerdetails_rowheadingContainer">
                                    <p className="customerdetails_rowheading">
                                      Commercial%
                                    </p>
                                  </div>
                                </Col>
                                <Col span={12}>
                                  <p className="customerdetails_text">
                                    {item.commercial_percentage
                                      ? item.commercial_percentage + "%"
                                      : ""}
                                  </p>
                                </Col>
                              </Row>

                              <Row style={{ marginTop: "12px" }}>
                                <Col span={12}>
                                  <div className="customerdetails_rowheadingContainer">
                                    <p className="customerdetails_rowheading">
                                      Proof Screenshot
                                    </p>
                                  </div>
                                </Col>
                                <Col span={12}>
                                  <button
                                    className="pendingcustomer_paymentscreenshot_viewbutton"
                                    style={{ gap: "4px" }}
                                    onClick={() => {
                                      setIsProofScreenshotModal(true);
                                      setProofScreenshot(
                                        item &&
                                          item.proof_communication !== null
                                          ? item.proof_communication
                                          : "-",
                                      );
                                    }}
                                  >
                                    <FaRegEye size={16} /> View screenshot
                                  </button>
                                </Col>
                              </Row>

                              <Row style={{ marginTop: "12px" }}>
                                <Col span={12}>
                                  <div className="customerdetails_rowheadingContainer">
                                    <p className="customerdetails_rowheading">
                                      Comments
                                    </p>
                                  </div>
                                </Col>
                                <Col span={12}>
                                  <EllipsisTooltip
                                    text={item.comments ? item.comments : "-"}
                                    smallText={true}
                                  />
                                </Col>
                              </Row>
                            </Col>
                          </Row>

                          {/* rejected comment section */}
                          <Row
                            gutter={16}
                            style={{
                              marginTop: "16px",
                              marginBottom: "12px",
                            }}
                          >
                            {item.is_rejected == 1 && item.is_verified == 0 ? (
                              <>
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
                                        {moment(item.rejected_date).format(
                                          "DD/MM/YYYY",
                                        )}
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
                                      <EllipsisTooltip
                                        text={
                                          item.comments ? item.comments : "-"
                                        }
                                        smallText={true}
                                      />
                                    </Col>
                                  </Row>
                                </Col>
                              </>
                            ) : item.verified_date ? (
                              <Col span={12}>
                                <Row>
                                  <Col span={12}>
                                    <div className="customerdetails_rowheadingContainer">
                                      <p className="customerdetails_rowheading">
                                        Verified Date
                                      </p>
                                    </div>
                                  </Col>
                                  <Col span={12}>
                                    <p className="customerdetails_text">
                                      {moment(item.verified_date).format(
                                        "DD/MM/YYYY",
                                      )}
                                    </p>
                                  </Col>
                                </Row>
                              </Col>
                            ) : (
                              ""
                            )}
                          </Row>
                        </div>
                      </Collapse.Panel>
                    );
                  })}
                </Collapse>
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
      </div>

      <Divider className="customer_statusupdate_divider" />

      <div className="customer_statusupdate_adddetailsContainer">
        <Steps current={stepIndex} size="small">
          <Step
            title={
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "13px",
                }}
              >
                Assign Trainer
                <MdOutlineAssignmentInd
                  size={18}
                  style={{ marginLeft: 6 }}
                  color="#2d4191"
                />
              </span>
            }
          />
          {/* <Step title="Certificate Details" /> */}
          <Step
            title={
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "13px",
                }}
              >
                Trainer Coordination
                <FaPhoneAlt
                  color="#2d4191"
                  size={16}
                  style={{ marginLeft: 6 }}
                />
              </span>
            }
          />
        </Steps>

        {stepIndex == 0 && (
          <>
            <p
              className="customer_statusupdate_adddetails_heading"
              style={{ marginTop: "20px" }}
            >
              {trainerHistory.length >= 1
                ? "Assigned Trainer Details"
                : "Assign New Trainer"}
            </p>

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
                    <CommonCustomerSingleSelectField
                      label="Trainer"
                      required={true}
                      options={mergedTrainers}
                      value={selectedTrainerId}
                      onChange={handleTrainerSelect}
                      onInputChange={handleTrainerSearch}
                      onDropdownOpen={handleTrainerDropdownOpen}
                      onDropdownScroll={handleTrainerScroll}
                      loading={trainerSelectloading}
                      renderOption={renderTrainerOption}
                      error={selectedTrainerIdError}
                      disableClearable={false}
                      showLabelStatus="Name"
                      disabled={trainerHistory.length >= 1}
                    />
                  </div>

                  {selectedTrainerId && (
                    <Tooltip
                      placement="top"
                      title="View Trainer Details"
                      trigger={["hover", "click"]}
                    >
                      <FaRegEye
                        size={14.5}
                        className="trainers_action_icons"
                        onClick={() => {
                          setIsOpenTrainerDetailModal(true);
                          setClickedTrainerDetails([selectedTrainerObject]);
                        }}
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
                  disabled={trainerHistory.length >= 1}
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
                  disabled={trainerHistory.length >= 1}
                />
              </Col>
              <Col span={12}>
                <CommonInputField
                  label="Trainer Type"
                  required={true}
                  value={trainerType}
                  disabled={true}
                />
              </Col>
            </Row>

            <Row style={{ marginTop: "28px", marginBottom: "30px" }}>
              <Col span={24}>
                <div>
                  <CommonTextArea
                    label="Comments"
                    required={true}
                    onChange={(e) => {
                      setAssignTrainerComments(e.target.value);
                      setAssignTrainerCommentsError(
                        addressValidator(e.target.value),
                      );
                    }}
                    value={assignTrainerComments}
                    error={assignTrainerCommentsError}
                    disabled={trainerHistory.length >= 1}
                  />
                </div>

                <div
                  style={{
                    position: "relative",
                    marginTop: "40px",
                  }}
                >
                  <ImageUploadCrop
                    label="Proof Communication"
                    aspect={1}
                    maxSizeMB={1}
                    required={true}
                    value={assignTrainerProofBase64}
                    onChange={(base64) => setAssignTrainerProofBase64(base64)}
                    onErrorChange={setAssignTrainerProofError}
                    disabled={trainerHistory.length >= 1}
                  />
                  {assignTrainerProofError && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#d32f2f",
                        marginTop: 4,
                      }}
                    >
                      {`Proof Screenshot ${assignTrainerProofError}`}
                    </p>
                  )}
                </div>
              </Col>
            </Row>
          </>
        )}

        {stepIndex == 1 && (
          <Row
            gutter={[12, 24]}
            style={{ marginTop: "20px", marginBottom: "30px" }}
          >
            <Col span={8}>
              <CommonSelectField
                label={"Whatsapp Group Status"}
                required={true}
                options={[
                  { id: 1, name: "Created" },
                  { id: 2, name: "Not Yet" },
                ]}
                onChange={(e) => {
                  setWhatsappGroupStatus(e.target.value);
                }}
                value={whatsappGroupStatus}
                error={""}
                height={"33px"}
                labelFontSize={"11px"}
                labelMarginTop={"0px"}
                errorFontSize="9px"
              />
            </Col>
            <Col span={8}>
              <CommonSelectField
                label={"Welcome Message Status"}
                required={true}
                options={[
                  { id: 1, name: "Completed" },
                  { id: 2, name: "Pending" },
                ]}
                onChange={(e) => {
                  setWelcomeMessageStatus(e.target.value);
                }}
                value={welcomeMessageStatus}
                error={""}
                height={"33px"}
                labelFontSize={"11px"}
                labelMarginTop={"0px"}
                errorFontSize="9px"
              />
            </Col>
            <Col span={8}>
              <CommonSelectField
                label={"Shared Teams & Attendance Link"}
                required={true}
                options={[
                  { id: 1, name: "Shared" },
                  { id: 2, name: "Not Yet" },
                ]}
                onChange={(e) => {
                  setLinkStatus(e.target.value);
                }}
                value={linkStatus}
                error={""}
                height={"33px"}
                labelFontSize={"11px"}
                labelMarginTop={"0px"}
                errorFontSize="9px"
              />
            </Col>
            <Col span={8}>
              <CommonSelectField
                label={"First Class Monitoring"}
                required={true}
                options={[
                  { id: 1, name: "Monitored" },
                  { id: 2, name: "Not Yet" },
                ]}
                onChange={(e) => {
                  setClassMonitorStatus(e.target.value);
                }}
                value={classMonitorStatus}
                error={""}
                height={"33px"}
                labelFontSize={"11px"}
                labelMarginTop={"0px"}
                errorFontSize="9px"
              />
            </Col>
            <Col span={8}>
              <CommonSelectField
                label={"Trainer Confirmation"}
                required={true}
                options={[
                  { id: 1, name: "Completed" },
                  { id: 2, name: "Pending" },
                ]}
                onChange={(e) => {
                  setTrainerConfirmation(e.target.value);
                }}
                value={trainerConfirmation}
                error={""}
                height={"33px"}
                labelFontSize={"11px"}
                labelMarginTop={"0px"}
                errorFontSize="9px"
              />
            </Col>
          </Row>
        )}
      </div>

      <div className="leadmanager_tablefiler_footer">
        <div
          className="leadmanager_submitlead_buttoncontainer"
          style={{ gap: "12px" }}
        >
          {stepIndex > 0 && (
            <Button onClick={prev} className="customer_stepperbuttons">
              Previous
            </Button>
          )}

          {stepIndex == 0 && trainerHistory.length >= 1 ? (
            ""
          ) : (
            <>
              {buttonLoading ? (
                <button
                  className={"users_adddrawer_loadingcreatebutton"}
                  style={{
                    ...(stepIndex === 0 ? { width: "120px" } : {}),
                  }}
                >
                  <CommonSpinner />
                </button>
              ) : (
                <button
                  className={"users_adddrawer_createbutton"}
                  onClick={
                    stepIndex === 0
                      ? handleAssignTrainer
                      : handleTrainerCoordination
                  }
                  style={{
                    ...(stepIndex === 0 ? { width: "120px" } : {}),
                  }}
                >
                  {stepIndex === 0 ? "Assign Trainer" : "Update"}
                </button>
              )}
            </>
          )}

          {stepIndex < 1 && (
            <Button
              onClick={() => {
                setStepIndex(stepIndex + 1);
              }}
              className={"customer_stepperbuttons"}
            >
              Next
            </Button>
          )}
        </div>
      </div>

      {/* trainer fulldetails modal */}
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
                      <p className="customerdetails_rowheading">HR Name</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {item.hr_head ? item.hr_head : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <FaRegCircleUser size={15} color="gray" />
                      <p className="customerdetails_rowheading">Trainer Name</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {item.name
                        ? `${item.name} (${
                            item.trainer_code ? item.trainer_code : "-"
                          })`
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
                      {item.availability_time
                        ? moment(item.availability_time, "HH:mm:ss").format(
                            "hh:mm A",
                          )
                        : "-"}
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
                      {item.secondary_time
                        ? moment(item.secondary_time, "HH:mm:ss").format(
                            "hh:mm A",
                          )
                        : "-"}
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
                      {item.skills && Array.isArray(item.skills)
                        ? item.skills.map((skill) => skill.name).join(", ")
                        : "-"}
                    </p>
                  </Col>
                </Row>
              </Col>
            </Row>
          );
        })}

        <div style={{ display: "flex", justifyContent: "center" }}>
          <div className="customer_trainer_badge_mainconatiner">
            <div className="customer_trainer_onboardcount_badgecount_container">
              {/* <div className="customer_trainer_onboardcount_badge" /> */}
              <p className="customer_trainer_onboardcount_badgecount">
                Class Taken{" "}
                <span style={{ fontWeight: 600 }}>
                  {trainerClassTakenCount}
                </span>{" "}
                Customers
              </p>
            </div>

            <div className="customer_trainer_ongoingcount_badgecount_container">
              {/* <div className="customer_trainer_goingcount_badge" /> */}
              <p className="customer_trainer_onboardcount_badgecount">
                Class Going{" "}
                <span style={{ fontWeight: 600 }}>
                  {trainerClassGoingCount}
                </span>{" "}
                Customers
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <p className="customer_trainer_cusomer_heading">
            Class Going Customers List{" "}
          </p>
          <CommonTable
            scroll={{ x: 1200 }}
            columns={customerByTrainerColumn}
            dataSource={customerByTrainerData}
            dataPerPage={10}
            loading={customerByTrainerLoading}
            checkBox="false"
            size="small"
            className="questionupload_table"
          />
        </div>
      </Modal>
    </>
  );
}
