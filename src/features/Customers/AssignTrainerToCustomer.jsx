import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Skeleton,
} from "antd";
import { LuIndianRupee } from "react-icons/lu";
import { FaRegEye } from "react-icons/fa";
import { FaRegCircleXmark } from "react-icons/fa6";
import { BsPatchCheckFill } from "react-icons/bs";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
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
  getTrainerById,
  getTrainers,
  inserCustomerTrack,
  rejectTrainerForCustomer,
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
import TrainerDetailsModal from "./TrainerFullDetailsModal";

const { Step } = Steps;

export default function AssignTrainerToCustomer({
  customer_details,
  setIsStatusUpdateDrawerLoading,
  callgetCustomersApi,
}) {
  const [customerDetails, setCustomerDetails] = useState(null);
  const modeOfClassOptions = [
    { id: "Offline", name: "Offline" },
    { id: "Online", name: "Online" },
  ];

  const [trainersList, setTrainersList] = useState([
    {
      trainer_id: null,
      trainer_object: null,
      commercial: null,
      mode_of_class: null,
      trainer_type: "",
      proof_communication: "",
      comments: "",
      errors: {},
    },
  ]);

  const [trainerHistory, setTrainerHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [collapseDefaultKey, setCollapseDefaultKey] = useState(["1"]);
  const [isOpenTrainerDetailModal, setIsOpenTrainerDetailModal] =
    useState(false);

  const [clickedTrainerDetails, setClickedTrainerDetails] = useState([]);
  const [clickedTrainerId, setClickedTrainerId] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [isProofScreenshotModal, setIsProofScreenshotModal] = useState(false);
  const [proofScreenshot, setProofScreenshot] = useState("");
  /* ---------------- Trainer STATES ---------------- */
  const [trainersData, setTrainersData] = useState([]);
  const [trainerSearchText, setTrainerSearchText] = useState("");
  /* ---------------- PAGINATION ---------------- */
  const [trainerPage, setTrainerPage] = useState(1);
  const [trainerHasMore, setTrainerHasMore] = useState(true);
  const [trainerSelectloading, setTrainerSelectloading] = useState(false);

  useEffect(() => {
    console.log("customer_details", customer_details);
    if (customer_details) {
      if (
        customer_details.trainer_data &&
        customer_details.trainer_data.length > 0
      ) {
        const trainers = customer_details.trainer_data.map((trainer) => ({
          training_map_id: trainer.training_map_id || null,
          trainer_id: trainer.trainer_id || null,
          trainer_object: null,
          commercial: trainer.commercial || null,
          mode_of_class: trainer.trainer_mode_of_class || null,
          trainer_type: trainer.trainer_type || "",
          proof_communication: trainer.proof_communication || "",
          comments: trainer.comments || "",
          errors: {},
        }));
        setTrainersList(trainers);
      } else {
        setTrainersList([
          {
            trainer_id: customer_details.trainer_id || null,
            trainer_object: null,
            commercial: customer_details.commercial || null,
            mode_of_class: customer_details.trainer_mode_of_class || null,
            trainer_type: customer_details.trainer_type || "",
            proof_communication: customer_details.proof_communication || "",
            comments: customer_details.comments || "",
            errors: {},
          },
        ]);
      }
    }
    setCustomerDetails(customer_details);
    handleTrainerHistory();
  }, []);

  const handleTrainerHistory = async () => {
    const payload = {
      customer_id:
        customer_details && customer_details.id ? customer_details.id : null,
    };

    setHistoryLoading(true);

    try {
      const response = await getAssignTrainerHistoryForCustomer(payload);
      console.log("trainer history response", response);
      const historyData = response?.data?.data || [];
      if (historyData.length >= 1) {
        const reverseData = historyData.reverse();
        setTrainerHistory(reverseData);
      } else {
        setTrainerHistory([]);
      }
      setTimeout(() => {
        setHistoryLoading(false);
      }, 300);
    } catch (error) {
      setHistoryLoading(false);
      setTrainerHistory([]);
      console.log("trainer history error", error);
    } finally {
      setTimeout(() => {
        getTrainersData();
      }, 100);
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
  const handleTrainerSelect = (event, index) => {
    const selectedId = event.target.value;
    const selectedObj = event.target.object; // ✅ DIRECT OBJECT

    const newList = [...trainersList];
    newList[index].trainer_id = selectedId;
    newList[index].trainer_object = selectedObj;
    newList[index].trainer_type = selectedObj?.trainer_type || "";
    newList[index].errors.trainer_id = selectValidator(selectedId);
    setTrainersList(newList);
    // 👇 show selected label in input
    setTrainerSearchText(selectedObj?.name || "");
  };

  const handleTrainerFieldChange = (index, field, value) => {
    const newList = [...trainersList];
    newList[index][field] = value;
    if (field === "comments") {
      newList[index].errors[field] = addressValidator(value);
    } else {
      newList[index].errors[field] = selectValidator(value);
    }
    setTrainersList(newList);
  };

  const handleAddTrainer = () => {
    setTrainersList([
      ...trainersList,
      {
        trainer_id: null,
        trainer_object: null,
        commercial: null,
        mode_of_class: null,
        trainer_type: "",
        proof_communication: "",
        comments: "",
        errors: {},
      },
    ]);
  };

  const handleRemoveTrainer = (index) => {
    const newList = trainersList.filter((_, i) => i !== index);
    setTrainersList(newList);
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

    trainersList.forEach((t) => {
      if (t.trainer_object) {
        map.set(t.trainer_object.id, t.trainer_object);
      }
    });

    trainersData.forEach((c) => map.set(c.id, c));

    return Array.from(map.values());
  }, [trainersData, trainersList]);

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

  const handleAssignTrainer = async () => {
    console.log("customer_details", customer_details);

    let hasError = false;
    const newList = trainersList.map((t) => {
      const errs = {
        trainer_id: selectValidator(t.trainer_id),
        commercial: selectValidator(t.commercial),
        mode_of_class: selectValidator(t.mode_of_class),
        comments: addressValidator(t.comments),
        proof_communication: selectValidator(t.proof_communication),
      };
      if (
        errs.trainer_id ||
        errs.commercial ||
        errs.mode_of_class ||
        errs.comments ||
        errs.proof_communication
      ) {
        hasError = true;
      }
      return { ...t, errors: errs };
    });

    setTrainersList(newList);

    if (hasError) return;

    const today = new Date();
    const getloginUserDetails = localStorage.getItem("loginUserDetails");
    const converAsJson = JSON.parse(getloginUserDetails);

    setButtonLoading(true);

    let isTrainerReplaced = false;
    let previousTrainerData = null;

    if (customer_details.status !== "Awaiting Trainer") {
      previousTrainerData =
        trainerHistory && trainerHistory.length > 0 ? trainerHistory[0] : null;

      if (previousTrainerData && trainersList.length === 1) {
        const t = trainersList[0];
        const hasChanges =
          String(previousTrainerData.trainer_id) !== String(t.trainer_id) ||
          String(previousTrainerData.commercial) !== String(t.commercial) ||
          previousTrainerData.mode_of_class !== t.mode_of_class ||
          previousTrainerData.trainer_type !== t.trainer_type ||
          previousTrainerData.comments !== t.comments ||
          previousTrainerData.proof_communication !== t.proof_communication;

        if (!hasChanges) {
          CommonMessage("warning", "No Changes Made");
          setButtonLoading(false);
          return;
        }
      }

      if (previousTrainerData && previousTrainerData.id) {
        const rejectPayload = {
          id: previousTrainerData.id,
          rejected_date: formatToBackendIST(today),
          rejected_reason: "Replaced with new trainer",
          rejected_by: converAsJson?.user_id,
        };
        try {
          await rejectTrainerForCustomer(rejectPayload);
          isTrainerReplaced = true;
        } catch (error) {
          setButtonLoading(false);
          CommonMessage(
            "error",
            error?.response?.data?.details ||
              error?.response?.data?.message ||
              "Something went wrong. Try again later",
          );
          return;
        }
      }
    }

    const getTrainerName = (t) => {
      if (t.trainer_object?.name) return t.trainer_object.name;
      const foundInList = trainersData.find(
        (x) => String(x.id) === String(t.trainer_id)
      );
      if (foundInList?.name) return foundInList.name;
      if (
        previousTrainerData &&
        String(previousTrainerData.trainer_id) === String(t.trainer_id)
      ) {
        return previousTrainerData.trainer_name;
      }
      return t.trainer_id;
    };

    const changedFields = {};
    if (trainersList.length === 1) {
      changedFields.trainer_name = {
        previous_value:
          isTrainerReplaced && previousTrainerData
            ? previousTrainerData.trainer_name ||
              previousTrainerData.trainer_id ||
              "-"
            : "Empty",
        new_value: getTrainerName(trainersList[0]),
      };
      changedFields.commercial = {
        previous_value:
          isTrainerReplaced && previousTrainerData
            ? previousTrainerData.commercial || "-"
            : "Empty",
        new_value: trainersList[0].commercial,
      };
      changedFields.mode_of_training = {
        previous_value:
          isTrainerReplaced && previousTrainerData
            ? previousTrainerData.mode_of_class || "-"
            : "Empty",
        new_value: trainersList[0].mode_of_class,
      };
      changedFields.trainer_type = {
        previous_value:
          isTrainerReplaced && previousTrainerData
            ? previousTrainerData.trainer_type || "-"
            : "Empty",
        new_value: trainersList[0].trainer_type,
      };
      changedFields.comments = {
        previous_value:
          isTrainerReplaced && previousTrainerData
            ? previousTrainerData.comments || "-"
            : "Empty",
        new_value: trainersList[0].comments,
      };
      changedFields.proof_communication = {
        previous_value:
          isTrainerReplaced && previousTrainerData
            ? previousTrainerData.proof_communication || "-"
            : "",
        new_value: trainersList[0].proof_communication,
      };
    } else {
      trainersList.forEach((t, i) => {
        const prefix = `trainer_${i + 1}_`;
        changedFields[`${prefix}name`] = {
          previous_value:
            isTrainerReplaced && previousTrainerData
              ? previousTrainerData.trainer_name ||
                previousTrainerData.trainer_id ||
                "-"
              : "Empty",
          new_value: getTrainerName(t),
        };
        changedFields[`${prefix}commercial`] = {
          previous_value:
            isTrainerReplaced && previousTrainerData
              ? previousTrainerData.commercial || "-"
              : "Empty",
          new_value: t.commercial,
        };
        changedFields[`${prefix}mode_of_training`] = {
          previous_value:
            isTrainerReplaced && previousTrainerData
              ? previousTrainerData.mode_of_class || "-"
              : "Empty",
          new_value: t.mode_of_class,
        };
        changedFields[`${prefix}type`] = {
          previous_value:
            isTrainerReplaced && previousTrainerData
              ? previousTrainerData.trainer_type || "-"
              : "Empty",
          new_value: t.trainer_type,
        };
        changedFields[`${prefix}comments`] = {
          previous_value:
            isTrainerReplaced && previousTrainerData
              ? previousTrainerData.comments || "-"
              : "Empty",
          new_value: t.comments,
        };
        changedFields[`${prefix}proof_communication`] = {
          previous_value:
            isTrainerReplaced && previousTrainerData
              ? previousTrainerData.proof_communication || "-"
              : "",
          new_value: t.proof_communication,
        };
      });
    }

    const payload = {
      customer_id: customer_details.id,
      trainers: trainersList.map((t) => ({
        trainer_id: t.trainer_id,
        commercial: t.commercial,
        mode_of_class: t.mode_of_class,
        trainer_type: t.trainer_type,
        proof_communication: t.proof_communication,
        comments: t.comments,
        created_date: formatToBackendIST(today),
      })),
    };

    try {
      await assignTrainerForCustomer(payload);
      CommonMessage("success", "Trainer Assigned Successfully");
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
            error?.response?.data?.details ||
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
          error?.response?.data?.message ||
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

  const renderField = (label, value) => (
    <div style={{ marginBottom: "8px" }}>
      <span
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "12px",
          display: "block",
          marginBottom: "2px",
          color: "#64748b",
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      {typeof value === "string" || typeof value === "number" ? (
        <EllipsisTooltip text={value} isViewLeadDetailsText={true} />
      ) : (
        value
      )}
    </div>
  );

  if (historyLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "16px",
        }}
      >
        <div className="customer_assign_trainer_skeleton_container">
          <Skeleton active paragraph={{ rows: 2 }} />
        </div>
        <div className="customer_assign_trainer_skeleton_container">
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="customer_statusupdate_adddetailsContainer">
        <p className="customer_statusupdate_adddetails_heading">
          Previous Assigned Trainer History
        </p>

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
                return (
                  <Collapse.Panel
                    key={index + 1}
                    header={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          width: "100%",
                          fontSize: "12px",
                          alignItems: "center",
                        }}
                      >
                        <span>
                          Trainer Id -{" "}
                          <span className="customer_trainerverify_accordion_heading">
                            {item.trainer_code ? item.trainer_code : "-"}

                            {item.is_escalated == 1 && (
                              <span className="customer_trainerverify_accordion_heading_batch">
                                {`( Trainer is Escalated )`}
                              </span>
                            )}
                          </span>
                        </span>

                        {item.is_rejected == 1 ? (
                          <div className="customer_trans_statustext_container">
                            <FaRegCircleXmark size={12} color="#d32f2f" />
                            <p
                              style={{
                                color: "#d32f2f",
                                fontWeight: 500,
                                fontSize: "12px",
                              }}
                            >
                              Rejected
                            </p>
                          </div>
                        ) : item.is_verified == 1 ? (
                          <div className="customer_trans_statustext_container">
                            <BsPatchCheckFill size={12} color="#3c9111" />
                            <p
                              style={{
                                color: "#3c9111",
                                fontWeight: 500,
                                fontSize: "12px",
                              }}
                            >
                              Verified
                            </p>
                          </div>
                        ) : (
                          <div className="customer_trans_statustext_container">
                            <PiClockCounterClockwiseBold
                              size={14}
                              color="gray"
                            />
                            <p
                              style={{
                                color: "gray",
                                fontWeight: 500,
                                fontSize: "12px",
                              }}
                            >
                              Waiting for Verify
                            </p>
                          </div>
                        )}
                      </div>
                    }
                  >
                    <div style={{ padding: "0 0px" }}>
                      <Row
                        gutter={24}
                        style={{
                          marginTop: "12px",
                          marginBottom: "12px",
                        }}
                      >
                        <Col span={6}>
                          {renderField(
                            "HR Name",
                            item.trainer_hr_name ? item.trainer_hr_name : "-",
                          )}
                        </Col>
                        <Col span={6}>
                          {renderField(
                            "Trainer Name",
                            item.trainer_name ? item.trainer_name : "-",
                          )}
                        </Col>
                        <Col span={6}>
                          {renderField(
                            "Trainer Type",
                            item.trainer_type || "-",
                          )}
                        </Col>
                        <Col span={6}>
                          {renderField(
                            "Mode Of Class",
                            item.mode_of_class || "-",
                          )}
                        </Col>
                        <Col span={6}>
                          {renderField(
                            "Commercial",
                            item.commercial ? "₹" + item.commercial : "-",
                          )}
                        </Col>
                        <Col span={6}>
                          {renderField(
                            "Commercial%",
                            <span
                              style={{
                                fontWeight: 700,
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "13px",
                                color:
                                  item.commercial_percentage !== null &&
                                  item.commercial_percentage !== undefined
                                    ? item.commercial_percentage < 18
                                      ? "#3c9111" // green
                                      : item.commercial_percentage <= 22
                                        ? "#ffa502" // orange
                                        : "#d32f2f" // red
                                    : "inherit",
                              }}
                            >
                              {item.commercial_percentage
                                ? item.commercial_percentage + "%"
                                : "-"}
                            </span>,
                          )}
                        </Col>
                        <Col span={6}>
                          {renderField(
                            "Proof Screenshot",
                            <button
                              className="pendingcustomer_paymentscreenshot_viewbutton"
                              style={{ gap: "4px" }}
                              onClick={() => {
                                setIsProofScreenshotModal(true);
                                setProofScreenshot(
                                  item && item.proof_communication !== null
                                    ? item.proof_communication
                                    : "-",
                                );
                              }}
                            >
                              <FaRegEye size={16} /> View screenshot
                            </button>,
                          )}
                        </Col>
                        <Col span={6}>
                          {renderField(
                            "Comments",
                            item.comments ? item.comments : "-",
                          )}
                        </Col>

                        {/* rejected/verified comment section */}
                        {item.is_rejected == 1 ? (
                          <>
                            <Col span={6}>
                              {renderField(
                                "Rejected Date",
                                moment(item.rejected_date).format("DD/MM/YYYY"),
                              )}
                            </Col>
                            <Col span={6}>
                              {renderField(
                                "Reason for Rejection",
                                item.comments ? item.comments : "-",
                              )}
                            </Col>
                          </>
                        ) : item.verified_date && item.is_rejected == 0 ? (
                          <Col span={6}>
                            {renderField(
                              "Verified Date",
                              moment(item.verified_date).format("DD/MM/YYYY"),
                            )}
                          </Col>
                        ) : null}
                      </Row>
                    </div>
                  </Collapse.Panel>
                );
              })}
            </Collapse>
          </div>
        ) : (
          <p className="customer_trainerhistory_nodatatext">No Data found</p>
        )}
      </div>

      <Divider className="customer_statusupdate_divider" />

      <div className="customer_statusupdate_adddetailsContainer">
        {/* <Steps current={stepIndex} size="small">
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
        </Steps> */}

        <>
          <p className="customer_assign_newtrainer_heading">
            {trainerHistory.length >= 1
              ? "Assigned Trainer Details"
              : "Assign New Trainer"}
          </p>

          {trainersList.map((trainer, index) => {
            return (
              <div
                key={index}
                style={{
                  marginBottom: "24px",
                  border: "1px solid #e8e8e8",
                  borderRadius: "8px",
                  background: "#fcfcfc",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 16px",
                    borderBottom: "1px solid #e8e8e8",
                    background: "#f5f5f5",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "4px",
                        height: "16px",
                        backgroundColor: "#5b69ca",
                        borderRadius: "2px",
                      }}
                    />
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "#001529",
                      }}
                    >
                      Trainer {index + 1}
                    </span>
                  </div>
                  {trainersList.length > 1 && (
                    <Button
                      danger
                      type="text"
                      size="small"
                      onClick={() => handleRemoveTrainer(index)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: "12px",
                        gap: "6px",
                      }}
                    >
                      <RiDeleteBinLine size={14} />
                      Remove
                    </Button>
                  )}
                </div>

                <div style={{ padding: "16px" }}>
                  <Row gutter={16}>
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
                            value={trainer.trainer_id}
                            onChange={(e) => handleTrainerSelect(e, index)}
                            onInputChange={handleTrainerSearch}
                            onDropdownOpen={handleTrainerDropdownOpen}
                            onDropdownScroll={handleTrainerScroll}
                            loading={trainerSelectloading}
                            renderOption={renderTrainerOption}
                            error={trainer.errors.trainer_id}
                            disableClearable={false}
                            showLabelStatus="Name"
                            height={"34px"}
                            labelMarginTop={"0px"}
                            labelFontSize={"11px"}
                            errorFontSize={"9px"}
                          />
                        </div>

                        {trainer.trainer_id && (
                          <Tooltip
                            placement="top"
                            title="View Trainer Details"
                            trigger={["hover", "click"]}
                          >
                            <FaRegEye
                              size={14}
                              className="trainers_action_icons"
                              onClick={() => {
                                setClickedTrainerId(trainer.trainer_id);
                                setIsOpenTrainerDetailModal(true);
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
                        onChange={(e) =>
                          handleTrainerFieldChange(
                            index,
                            "commercial",
                            e.target.value,
                          )
                        }
                        value={trainer.commercial}
                        error={trainer.errors.commercial}
                        onInput={(e) => {
                          if (e.target.value.length > 10) {
                            e.target.value = e.target.value.slice(0, 10);
                          }
                        }}
                        icon={<LuIndianRupee size={16} />}
                        height={"34px"}
                        labelFontSize={"11px"}
                        errorFontSize={"9px"}
                      />
                    </Col>
                  </Row>

                  <Row gutter={16} style={{ marginTop: "24px" }}>
                    <Col span={12}>
                      <CommonSelectField
                        label="Mode Of Class"
                        required={true}
                        options={modeOfClassOptions}
                        onChange={(e) =>
                          handleTrainerFieldChange(
                            index,
                            "mode_of_class",
                            e.target.value,
                          )
                        }
                        value={trainer.mode_of_class}
                        error={trainer.errors.mode_of_class}
                        height={"34px"}
                        labelFontSize={"11px"}
                        errorFontSize={"9px"}
                      />
                    </Col>
                    <Col span={12}>
                      <CommonInputField
                        label="Trainer Type"
                        required={true}
                        value={trainer.trainer_type}
                        disabled={true}
                        height={"34px"}
                        labelFontSize={"11px"}
                        errorFontSize={"9px"}
                      />
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "20px" }}>
                    <Col span={24}>
                      <div>
                        <CommonTextArea
                          label="Comments"
                          required={true}
                          onChange={(e) =>
                            handleTrainerFieldChange(
                              index,
                              "comments",
                              e.target.value,
                            )
                          }
                          value={trainer.comments}
                          error={trainer.errors.comments}
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
                          value={trainer.proof_communication}
                          onChange={(base64) =>
                            handleTrainerFieldChange(
                              index,
                              "proof_communication",
                              base64,
                            )
                          }
                          onErrorChange={(err) => {
                            const newList = [...trainersList];
                            newList[index].errors.proof_communication = err;
                            setTrainersList(newList);
                          }}
                        />
                        {trainer.errors.proof_communication && (
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#d32f2f",
                              marginTop: 4,
                            }}
                          >
                            {`Proof Screenshot ${trainer.errors.proof_communication}`}
                          </p>
                        )}
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            );
          })}

          {/* <Button
            type="dashed"
            onClick={handleAddTrainer}
            className="customer_assigntrainer_addanother_trainer_button"
            style={{ width: "100%", marginBottom: "20px" }}
          >
            + Add Another Trainer
          </Button> */}
        </>
      </div>

      <div className="leadmanager_tablefiler_footer">
        <div
          className="leadmanager_submitlead_buttoncontainer"
          style={{ gap: "12px" }}
        >
          <>
            {buttonLoading ? (
              <button
                className={"users_adddrawer_loadingcreatebutton"}
                // style={{
                //   ...(stepIndex === 0 ? { width: "120px" } : {}),
                // }}
                style={{ width: "120px" }}
              >
                <CommonSpinner />
              </button>
            ) : (
              <button
                className={"users_adddrawer_createbutton"}
                onClick={handleAssignTrainer}
                style={{ width: "120px" }}
              >
                Assign Trainer
              </button>
            )}
          </>
        </div>
      </div>

      {/* trainer fulldetails modal */}
      <TrainerDetailsModal
        open={isOpenTrainerDetailModal}
        onCancel={() => setIsOpenTrainerDetailModal(false)}
        trainerId={clickedTrainerId}
      />

      {/* proof screenshot modal */}
      <Modal
        title="Proof Screenshot"
        open={isProofScreenshotModal}
        onCancel={() => {
          setIsProofScreenshotModal(false);
          setProofScreenshot("");
        }}
        footer={false}
        width="32%"
        className="customer_paymentscreenshot_modal"
      >
        <div style={{ overflow: "hidden", maxHeight: "100vh" }}>
          <PrismaZoom>
            {proofScreenshot ? (
              <img
                src={`data:image/png;base64,${proofScreenshot}`}
                alt="payment screenshot"
                className="customer_paymentscreenshot_image"
              />
            ) : (
              "-"
            )}
          </PrismaZoom>
        </div>
      </Modal>
    </>
  );
}
