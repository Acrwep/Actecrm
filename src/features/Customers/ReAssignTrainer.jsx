import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Row, Col, Button, Flex, Tooltip, Radio, Collapse, Modal } from "antd";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonTextArea from "../Common/CommonTextArea";
import { LuIndianRupee } from "react-icons/lu";
import { FaRegEye } from "react-icons/fa";
import { FaRegCircleXmark } from "react-icons/fa6";
import { BsPatchCheckFill } from "react-icons/bs";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { IoFilter } from "react-icons/io5";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import { CommonMessage } from "../Common/CommonMessage";
import {
  assignTrainerForCustomer,
  getAssignTrainerHistoryForCustomer,
  getCustomerByTrainerId,
  getTrainerById,
  inserCustomerTrack,
  rejectTrainerForCustomer,
  sendNotification,
  updateCustomerStatus,
  verifyTrainerForCustomer,
} from "../ApiService/action";
import {
  addressValidator,
  formatToBackendIST,
  selectValidator,
} from "../Common/Validation";
import moment from "moment";
import CommonTable from "../Common/CommonTable";
import PrismaZoom from "react-prismazoom";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonCustomerSingleSelectField from "../Common/CommonCustomerSingleSelect";
import { getTrainers } from "../ApiService/action";
import { useMemo } from "react";

const ReAssignTrainer = forwardRef(
  (
    {
      customerDetails,
      drawerContentStatus,
      setUpdateButtonLoading,
      callgetCustomersApi,
    },
    ref,
  ) => {
    const [commercial, setCommercial] = useState(null);
    const [commercialError, setCommercialError] = useState("");
    const modeOfClassOptions = [
      { id: "Offline", name: "Offline" },
      { id: "Online", name: "Online" },
    ];
    const [modeOfClass, setModeOfClass] = useState(null);
    const [modeOfClassError, setModeOfClassError] = useState("");
    const [trainerType, setTrainerType] = useState("");

    /* ---------------- Trainer STATES ---------------- */
    const [trainersDataList, setTrainersDataList] = useState([]);
    // ✅ IMPORTANT: keep IDs & Objects separately
    const [selectedTrainerId, setSelectedTrainerId] = useState(null);
    const [selectedTrainerIdError, setSelectedTrainerIdError] = useState(null);
    const [selectedTrainerObject, setSelectedTrainerObject] = useState(null);
    const [trainerSearchText, setTrainerSearchText] = useState("");
    /* ---------------- PAGINATION ---------------- */
    const [trainerPage, setTrainerPage] = useState(1);
    const [trainerHasMore, setTrainerHasMore] = useState(true);
    const [trainerSelectloading, setTrainerSelectloading] = useState(false);

    const [assignTrainerProofBase64, setAssignTrainerProofBase64] =
      useState("");
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
    const [trainerClassTakenCount, setTrainerClassTakenCount] = useState(0);
    const [trainerClassGoingCount, setTrainerClassGoingCount] = useState(0);
    //trainer verify usestates
    const [assignTrainerData, setAssignTrainerData] = useState(null);
    const [isProofScreenshotModal, setIsProofScreenshotModal] = useState(false);
    const [proofScreenshot, setProofScreenshot] = useState("");

    const [isOpenTrainerCustomersModal, setIsOpenTrainerCustomersModal] =
      useState(false);
    const [customerByTrainerData, setCustomerByTrainerData] = useState([]);
    const [customerByTrainerLoading, setCustomerByTrainerLoading] =
      useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);

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
      handleTrainerHistory();
    }, []);

    const handleTrainerHistory = async () => {
      const payload = {
        customer_id:
          customerDetails && customerDetails.id ? customerDetails.id : null,
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
      }
    };

    /* ---------------- FETCH TRAINERS ---------------- */
    const buildCustomerSearchPayload = (value) => {
      if (!value) return {};
      const trimmed = value.trim();

      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return { email: trimmed };
      }

      if (/^\d{6,15}$/.test(trimmed)) {
        return { mobile: trimmed };
      }

      return { name: trimmed };
    };

    const getTrainersDataApi = async (searchvalue, pageNumber = 1) => {
      setTrainerSelectloading(true);

      const payload = {
        ...buildCustomerSearchPayload(searchvalue),
        page: pageNumber,
        limit: 10,
      };

      try {
        const response = await getTrainers(payload);

        const trainers = response?.data?.data?.trainers || [];
        const pagination = response?.data?.data?.pagination;

        setTrainersDataList((prev) =>
          pageNumber === 1 ? trainers : [...prev, ...trainers],
        );

        setTrainerHasMore(pageNumber < (pagination?.totalPages || 1));
        setTrainerPage(pageNumber);
      } catch (error) {
        console.log("get trainers error", error);
      } finally {
        setTrainerSelectloading(false);
      }
    };

    /* ---------------- SEARCH HANDLER ---------------- */
    const handleTrainerSearch = (value) => {
      setTrainerSearchText(value);
      setTrainerPage(1);
      setTrainerHasMore(true);
      setTrainersDataList([]);
      getTrainersDataApi(value, 1);
    };

    /* ---------------- SELECT HANDLER ---------------- */
    const handleTrainerSelect = (event) => {
      const selectedId = event.target.value;
      const selectedObj = event.target.object;
      setSelectedTrainerId(selectedId);
      setSelectedTrainerObject(selectedObj);
      setTrainerType(selectedObj?.trainer_type || "");

      setSelectedTrainerIdError(selectValidator(selectedId));
      getCustomerByTrainerIdData(selectedId, 0);
      setTrainerSearchText(selectedObj?.name || "");
    };

    /* ---------------- MERGED OPTIONS ---------------- */
    const mergedTrainersList = useMemo(() => {
      const map = new Map();
      if (selectedTrainerObject) {
        map.set(selectedTrainerObject.id, selectedTrainerObject);
      }
      trainersDataList.forEach((c) => map.set(c.id, c));
      return Array.from(map.values());
    }, [trainersDataList, selectedTrainerObject]);

    /* ---------------- DROPDOWN OPEN ---------------- */
    const handleTrainerDropdownOpen = () => {
      if (trainersDataList.length === 0) {
        getTrainersDataApi(null, 1);
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
        getTrainersDataApi(trainerSearchText, trainerPage + 1);
      }
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

    useImperativeHandle(ref, () => ({
      handleReAssignTrainer,
    }));

    const handleReAssignTrainer = async () => {
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

      setUpdateButtonLoading(true);
      const today = new Date();

      const payload = {
        id: customerDetails.training_map_id,
        rejected_date: formatToBackendIST(today),
        comments: "",
      };

      try {
        await rejectTrainerForCustomer(payload);
        setTimeout(async () => {
          handleAssignTrainer();
        }, 300);
      } catch (error) {
        setUpdateButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleAssignTrainer = async () => {
      const today = new Date();

      setUpdateButtonLoading(true);

      const payload = {
        customer_id: customerDetails.id,
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
                customer_id: customerDetails.id,
                status: "Awaiting Trainer Verify",
              },
            ],
          };
          try {
            await updateCustomerStatus(payload);
            handleCustomerTrack("Trainer Re-Assigned");
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
        setUpdateButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleCustomerTrack = async (updatestatus) => {
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);
      console.log("getloginUserDetails", converAsJson);

      let trainerName = selectedTrainerObject?.name || "";

      const assignTrainerDetails = {
        trainer_id: selectedTrainerId,
        trainer_name: trainerName,
        commercial: commercial,
        mode_of_class: modeOfClass,
        trainer_type: trainerType,
        comments: assignTrainerComments,
        proof_communication: assignTrainerProofBase64,
      };

      const payload = {
        customers: [
          {
            customer_id: customerDetails.id,
            status: updatestatus,
            updated_by:
              converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
            status_date: formatToBackendIST(today),
            ...(updatestatus && { details: assignTrainerDetails }),
          },
        ],
      };

      try {
        await inserCustomerTrack(payload);
        setTimeout(() => {
          callgetCustomersApi();
          if (updatestatus.includes("Trainer Rejected")) {
          }
        }, 300);
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
            customer_id: customerDetails.id,
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
                    {trainerHistory.map((item, index) => (
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
                              <span style={{ fontWeight: "500" }}>
                                {item.trainer_code ? item.trainer_code : "-"}
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
                                  <p className="customerdetails_text">
                                    {item.trainer_hr_name
                                      ? item.trainer_hr_name
                                      : "-"}
                                  </p>
                                </Col>
                              </Row>
                            </Col>
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
                                  <EllipsisTooltip
                                    text={item.trainer_name}
                                    smallText={true}
                                  />
                                </Col>
                              </Row>
                            </Col>
                            {/* <Col span={12}>
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
                              </Col> */}
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

                          <Row gutter={16} style={{ marginTop: "16px" }}>
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
                            <Col span={12}>
                              <Row>
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
                            </Col>
                          </Row>

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
                                          {item.rejected_date
                                            ? "Reason for Rejection"
                                            : "Comments"}
                                        </p>
                                      </div>
                                    </Col>
                                    <Col span={12}>
                                      <EllipsisTooltip
                                        text={item.comments}
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
                    ))}
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
          <p className="customer_statusupdate_adddetails_heading">
            Assign New Trainer
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
                    options={mergedTrainersList}
                    value={selectedTrainerId}
                    inputValue={trainerSearchText}
                    onChange={handleTrainerSelect}
                    onInputChange={handleTrainerSearch}
                    onDropdownOpen={handleTrainerDropdownOpen}
                    onDropdownScroll={handleTrainerScroll}
                    loading={trainerSelectloading}
                    renderOption={renderTrainerOption}
                    error={selectedTrainerIdError}
                    disableClearable={false}
                    showLabelStatus="Name"
                  />
                </div>

                {selectedTrainerId && (
                  <Tooltip
                    placement="top"
                    title="View Trainer Details"
                    trigger={["hover", "click"]}
                  >
                    <FaRegEye
                      size={17}
                      className="trainers_action_icons"
                      onClick={() => {
                        setIsOpenTrainerDetailModal(true);
                        // Fetching details for the selected trainer
                        // Note: clickedTrainerDetails is used in the modal
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
              <CommonInputField
                label="Trainer Type"
                required={true}
                value={trainerType}
                disabled={true}
              />
            </Col>
          </Row>

          <Row style={{ marginTop: "28px" }}>
            <Col span={24}>
              <div
                style={{
                  marginBottom: "20px",
                }}
              >
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
                />
              </div>

              <div
                style={{
                  position: "relative",
                  marginTop: "40px",
                  marginBottom: "20px",
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
                        <p className="customerdetails_rowheading">
                          Trainer Name
                        </p>
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
                        {item.skills.map((item) => item.name).join(", ")}
                      </p>
                    </Col>
                  </Row>
                </Col>
              </Row>
            );
          })}

          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="customer_trainer_badge_mainconatiner">
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <div className="customer_trainer_onboardcount_badge" />
                <p className="customer_trainer_onboardcount_badgecount">
                  Class Taken{" "}
                  <span style={{ fontWeight: 600 }}>
                    {trainerClassTakenCount}
                  </span>{" "}
                  Customers
                </p>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <div className="customer_trainer_goingcount_badge" />
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
              scroll={{ x: 1600 }}
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
  },
);
export default ReAssignTrainer;
