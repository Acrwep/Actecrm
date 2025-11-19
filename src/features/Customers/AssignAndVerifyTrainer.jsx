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
import CommonSpinner from "../Common/CommonSpinner";
import PrismaZoom from "react-prismazoom";

const AssignAndVerifyTrainer = forwardRef(
  (
    {
      customerDetails,
      drawerContentStatus,
      trainersData,
      setUpdateButtonLoading,
      setRejectButtonLoader,
      callgetCustomersApi,
    },
    ref
  ) => {
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
    const [trainerType, setTrainerType] = useState("");

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
    const [trainerFilterType, setTrainerFilterType] = useState(1);
    const [trainerClassTakenCount, setTrainerClassTakenCount] = useState(0);
    const [trainerClassGoingCount, setTrainerClassGoingCount] = useState(0);
    //trainer verify usestates
    const [assignTrainerData, setAssignTrainerData] = useState(null);
    const [isProofScreenshotModal, setIsProofScreenshotModal] = useState(false);
    const [proofScreenshot, setProofScreenshot] = useState("");
    const [isShowRejectTrainerCommentBox, setIsShowRejectTrainerCommentBox] =
      useState(false);
    const [rejectTrainerComments, setRejectTrainerComments] = useState("");
    const [rejectTrainerCommentsError, setRejectTrainerCommentsError] =
      useState("");
    const [isOpenTrainerVerifyModal, setIsOpenTrainerVerifyModal] =
      useState(false);
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
        title: "Region",
        key: "region_name",
        dataIndex: "region_name",
        width: 120,
      },
      { title: "Branch Name", key: "branch_name", dataIndex: "branch_name" },
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
        width: 120,
        fixed: "right",
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
      if (drawerContentStatus == "Trainer Verify") {
        getAssignTrainerData();
      } else {
        handleTrainerHistory();
      }
    }, []);

    const getAssignTrainerData = async () => {
      try {
        const response = await getTrainerById(
          customerDetails && customerDetails.trainer_id
            ? customerDetails.trainer_id
            : null
        );
        const trainerDetails = response?.data?.data;
        setAssignTrainerData(trainerDetails);
      } catch (error) {
        setAssignTrainerData(null);
        console.log("get trainer by id error", error);
      }
    };

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
      handleAssignTrainer,
      openTrainerVerifyModal,
      handleRejectTrainer,
    }));

    const handleAssignTrainer = async () => {
      const trainerIdValidate = selectValidator(trainerId);
      const commercialValidate = selectValidator(commercial);
      const modeOfClassValidate = selectValidator(modeOfClass);
      const commentValidate = addressValidator(assignTrainerComments);
      const assignTrainerProofValidate = selectValidator(
        assignTrainerProofBase64
      );

      setTrainerIdError(trainerIdValidate);
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
        setTimeout(async () => {
          const payload = {
            customer_id: customerDetails.id,
            status: "Awaiting Trainer Verify",
          };
          try {
            await updateCustomerStatus(payload);
            handleCustomerTrack("Trainer Assigned");
            setTimeout(() => {
              handleSecondCustomerTrack("Awaiting Trainer Verify");
            }, 300);
          } catch (error) {
            CommonMessage(
              "error",
              error?.response?.data?.message ||
                "Something went wrong. Try again later"
            );
          }
        }, 300);
      } catch (error) {
        setUpdateButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    };

    const openTrainerVerifyModal = () => {
      setIsOpenTrainerVerifyModal(true);
    };

    const handleVerifyTrainer = async () => {
      const today = new Date();

      setButtonLoading(true);

      const payload = {
        id: customerDetails.training_map_id,
        verified_date: formatToBackendIST(today),
      };

      try {
        await verifyTrainerForCustomer(payload);
        CommonMessage("success", "Updated Successfully");
        setTimeout(async () => {
          setButtonLoading(false);
          const payload = {
            customer_id: customerDetails.id,
            status: "Awaiting Class",
          };
          try {
            await updateCustomerStatus(payload);
            handleCustomerTrack("Trainer Verified");
            setTimeout(() => {
              handleSecondCustomerTrack("Awaiting Class");
            }, 300);
          } catch (error) {
            CommonMessage(
              "error",
              error?.response?.data?.message ||
                "Something went wrong. Try again later"
            );
          }
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
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
        setTimeout(async () => {
          const payload = {
            customer_id: customerDetails.id,
            status: "Trainer Rejected",
          };
          try {
            await updateCustomerStatus(payload);
            handleCustomerTrack("Trainer Rejected");
            setTimeout(() => {
              handleSecondCustomerTrack("Awaiting Trainer");
            }, 300);
          } catch (error) {
            CommonMessage(
              "error",
              error?.response?.data?.message ||
                "Something went wrong. Try again later"
            );
          }
        }, 300);
      } catch (error) {
        setRejectButtonLoader(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    };

    const handleCustomerTrack = async (updatestatus) => {
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);
      console.log("getloginUserDetails", converAsJson);

      let trainerName = "";
      if (updatestatus === "Trainer Assigned") {
        const findTrainer = trainersData.find((f) => f.id == trainerId);
        trainerName = findTrainer ? findTrainer.name : "";
      }

      const assignTrainerDetails = {
        trainer_id: trainerId,
        trainer_name: trainerName,
        commercial: commercial,
        mode_of_class: modeOfClass,
        trainer_type: trainerType,
        comments: assignTrainerComments,
        proof_communication: assignTrainerProofBase64,
      };

      const verifyOrRejectTrainerDetails = {
        trainer_name:
          customerDetails && customerDetails.trainer_name
            ? customerDetails.trainer_name
            : "-",
        trainer_email:
          customerDetails && customerDetails.trainer_email
            ? customerDetails.trainer_email
            : "-",
        trainer_mobile:
          customerDetails && customerDetails.trainer_mobile
            ? customerDetails.trainer_mobile
            : "-",
        mode_of_class:
          customerDetails && customerDetails.mode_of_class
            ? customerDetails.mode_of_class
            : "-",
        trainer_type:
          customerDetails && customerDetails.trainer_type
            ? customerDetails.trainer_type
            : "-",
        trainer_commercial:
          customerDetails && customerDetails.commercial != null
            ? customerDetails.commercial
            : "-",
        trainer_commercial_percentage:
          customerDetails && customerDetails.commercial_percentage != null
            ? customerDetails.commercial_percentage
            : "-",
        ...(updatestatus && updatestatus === "Trainer Rejected"
          ? { rejected_reason: rejectTrainerComments }
          : {}),
      };

      const payload = {
        customer_id: customerDetails.id,
        status: updatestatus,
        updated_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
        status_date: formatToBackendIST(today),
        // details: assignTrainerDetails,
        ...(updatestatus && updatestatus === "Trainer Assigned"
          ? { details: assignTrainerDetails }
          : { details: verifyOrRejectTrainerDetails }),
      };

      try {
        await inserCustomerTrack(payload);
        setTimeout(() => {
          callgetCustomersApi();
          if (updatestatus.includes("Trainer Rejected")) {
            handleSendNotification();
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
        customer_id: customerDetails.id,
        status: updatestatus,
        updated_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
        status_date: formatToBackendIST(today),
      };
      try {
        await inserCustomerTrack(payload);
      } catch (error) {
        console.log("customer track error", error);
      }
    };

    const handleSendNotification = async () => {
      const today = new Date();
      const payload = {
        user_ids: [
          customerDetails && customerDetails.trainer_hr_id
            ? customerDetails.trainer_hr_id
            : "-",
        ],
        title: "Trainer Rejected",
        message: {
          customer_name:
            customerDetails && customerDetails.name
              ? customerDetails.name
              : "-",
          customer_phonecode:
            customerDetails && customerDetails.phonecode
              ? customerDetails.phonecode
              : "-",
          customer_phone:
            customerDetails && customerDetails.phone
              ? customerDetails.phone
              : "-",
          customer_course:
            customerDetails && customerDetails.course_name
              ? customerDetails.course_name
              : "-",
          customer_created_date:
            customerDetails && customerDetails.created_date
              ? moment(customerDetails.created_date).format("YYYY-MM-DD")
              : "-",
          customer_status:
            customerDetails && customerDetails.status
              ? customerDetails.status
              : "-",
        },
        created_at: formatToBackendIST(today),
      };
      try {
        await sendNotification(payload);
      } catch (error) {
        console.log("send notification error", error);
      }
    };

    return (
      <>
        {drawerContentStatus == "Assign Trainer" ? (
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
                                    <p className="customerdetails_text">
                                      {item.trainer_name}
                                    </p>
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
                                        "DD/MM/YYYY"
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
                                    <p className="customerdetails_text">
                                      {item.comments}
                                    </p>
                                  </Col>
                                </Row>
                              </Col>
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
                    <CommonSelectField
                      label="Trainer"
                      required={true}
                      options={trainersData}
                      onChange={(e) => {
                        setTrainerId(e.target.value);
                        const clickedTrainer = trainersData.filter(
                          (f) => f.id == e.target.value
                        );
                        console.log("clickedTrainer", clickedTrainer);
                        setTrainerType(
                          clickedTrainer.length >= 1 &&
                            clickedTrainer[0].trainer_type
                            ? clickedTrainer[0].trainer_type
                            : ""
                        );
                        setClickedTrainerDetails(clickedTrainer);
                        setTrainerIdError(selectValidator(e.target.value));
                        getCustomerByTrainerIdData(e.target.value, 0);
                      }}
                      value={trainerId}
                      error={trainerIdError}
                      borderRightNone={true}
                      showLabelStatus={
                        trainerFilterType == 1
                          ? "Name"
                          : trainerFilterType == 2
                          ? "Trainer Id"
                          : trainerFilterType == 3
                          ? "Email"
                          : "Mobile"
                      }
                    />
                  </div>

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
                            value={trainerFilterType}
                            onChange={(e) => {
                              console.log(e.target.value);
                              setTrainerFilterType(e.target.value);
                            }}
                          >
                            <Radio
                              value={1}
                              style={{
                                marginTop: "6px",
                                marginBottom: "12px",
                              }}
                            >
                              Search by Name
                            </Radio>
                            <Radio value={2} style={{ marginBottom: "12px" }}>
                              Search by Trainer Id
                            </Radio>
                            <Radio value={3} style={{ marginBottom: "12px" }}>
                              Search by Email
                            </Radio>
                            <Radio value={4} style={{ marginBottom: "12px" }}>
                              Search by Mobile
                            </Radio>
                          </Radio.Group>
                        }
                      >
                        <Button className="customer_trainermappingfilter_container">
                          <IoFilter size={16} />
                        </Button>
                      </Tooltip>
                    </Flex>
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
                        addressValidator(e.target.value)
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
        ) : (
          <div
            className="customer_statusupdate_adddetailsContainer"
            style={{ marginBottom: "30px" }}
          >
            <p className="customer_statusupdate_adddetails_heading">
              Trainer Details
            </p>

            <Row gutter={16}>
              <Col span={13}>
                <Row style={{ marginTop: "12px" }} gutter={16}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">HR Name</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {assignTrainerData && assignTrainerData.hr_head
                        ? assignTrainerData.hr_head
                        : "-"}
                    </p>
                  </Col>
                </Row>
                <Row style={{ marginTop: "12px" }} gutter={16}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Trainer Name</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {assignTrainerData && assignTrainerData.name
                        ? `${assignTrainerData.name} (${
                            assignTrainerData.trainer_code
                              ? assignTrainerData.trainer_code
                              : "-"
                          })`
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
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.mode_of_class !== null
                        ? customerDetails.mode_of_class
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }} gutter={16}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Trainer Type</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.trainer_type !== null
                        ? customerDetails.trainer_type
                        : "-"}
                    </p>
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
                        ? assignTrainerData.skills
                            .map((item) => item.name)
                            .join(", ")
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
                    <p className="customerdetails_text">
                      {"₹" + customerDetails &&
                      customerDetails.commercial !== null
                        ? customerDetails.commercial
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }} gutter={16}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Commercial%</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p
                      className="customerdetails_text"
                      style={{
                        fontWeight: 700,
                        color:
                          customerDetails &&
                          customerDetails.commercial_percentage !== null
                            ? customerDetails.commercial_percentage < 18
                              ? "#3c9111" // green
                              : customerDetails.commercial_percentage > 18 &&
                                customerDetails.commercial_percentage <= 22
                              ? "#ffa502" // orange
                              : customerDetails.commercial_percentage > 22
                              ? "#d32f2f" // red
                              : "inherit"
                            : "inherit", // fallback color if null
                      }}
                    >
                      {customerDetails && customerDetails.commercial_percentage
                        ? customerDetails.commercial_percentage + "%"
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }} gutter={16}>
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
                          customerDetails &&
                            customerDetails.proof_communication !== null
                            ? customerDetails.proof_communication
                            : "-"
                        );
                      }}
                    >
                      <FaRegEye size={16} /> View screenshot
                    </button>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }} gutter={16}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Class Taken</p>
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
                        ? customerDetails.completed_student_count + " Customers"
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
                      <p className="customerdetails_rowheading">Class Going</p>
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
                      {customerDetails && customerDetails.ongoing_student_count
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
        )}

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
                              "hh:mm A"
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
                              "hh:mm A"
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

        {/* trainer verify modal */}
        {/* payment verify modal */}
        <Modal
          open={isOpenTrainerVerifyModal}
          onCancel={() => {
            setIsOpenTrainerVerifyModal(false);
          }}
          footer={false}
          width="30%"
          zIndex={1100}
        >
          <p className="customer_classcompletemodal_heading">Are you sure?</p>

          <p className="customer_classcompletemodal_text">
            You Want To Verify The Trainer{" "}
            <span style={{ fontWeight: 700, color: "#333", fontSize: "14px" }}>
              {assignTrainerData && assignTrainerData.name
                ? `${assignTrainerData.name} (${
                    assignTrainerData.trainer_code
                      ? assignTrainerData.trainer_code
                      : "-"
                  })`
                : "-"}
            </span>{" "}
            for{" "}
            <span style={{ color: "#333", fontWeight: 700, fontSize: "14px" }}>
              {customerDetails && customerDetails.name
                ? customerDetails.name
                : ""}
            </span>{" "}
          </p>
          <div className="customer_classcompletemodal_button_container">
            <Button
              className="customer_classcompletemodal_cancelbutton"
              onClick={() => {
                setIsOpenTrainerVerifyModal(false);
              }}
            >
              No
            </Button>
            {buttonLoading ? (
              <Button
                type="primary"
                className="customer_classcompletemodal_loading_okbutton"
              >
                <CommonSpinner />
              </Button>
            ) : (
              <Button
                type="primary"
                className="customer_classcompletemodal_okbutton"
                onClick={handleVerifyTrainer}
              >
                Yes
              </Button>
            )}
          </div>
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
  }
);
export default AssignAndVerifyTrainer;
