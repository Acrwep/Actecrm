import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Row,
  Col,
  Modal,
  Divider,
  Collapse,
  Drawer,
  Rate,
  Button,
  Tooltip,
  Skeleton,
} from "antd";
import moment from "moment";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import { FaRegEye } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { IoReceiptOutline } from "react-icons/io5";
import { FaFileInvoiceDollar } from "react-icons/fa";
import { CloseOutlined } from "@ant-design/icons";
import PrismaZoom from "react-prismazoom";
import {
  getCustomerById,
  getTrainerById,
  getTrainerPaymentsById,
  viewCertForCustomer,
  viewTrainerPayslip,
} from "../ApiService/action";
import ParticularCustomerDetails from "../Customers/ParticularCustomerDetails";
import CommonCertificateViewer from "../Common/CommonCertificateViewer";
import CommonSpinner from "../Common/CommonSpinner";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import { TimerPill, calculateDeadlineDate } from "./TrainerPayment";
import { CommonMessage } from "../Common/CommonMessage";
import CommonPayslipViewer from "../Common/CommonPayslipViewer";

export default function ViewTrainerPaymentDetails({
  trainer_payment_id = null,
  allBranchesData,
  isShowPaymentDetails = true,
}) {
  const permissions = useSelector((state) => state.userpermissions || []);
  const hasPermission = permissions.includes("View Financial Details");

  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null);
  //trainer details
  const [isOpenTrainerDetailModal, setIsOpenTrainerDetailModal] =
    React.useState(false);
  const [clickedTrainerDetails, setClickedTrainerDetails] = useState([]);
  const [collapseDefaultKey, setCollapseDefaultKey] = useState(["1"]);
  const [isOpenAttendanceScreenshotModal, setIsOpenAttendanceScreenshotModal] =
    useState(false);
  const [viewAttendanceScreenshot, setViewAttendanceScreenshot] = useState("");
  //customer details
  const [isOpenCustomerDetailsDrawer, setIsOpenCustomerDetailsDrawer] =
    useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  //payment details
  const [isOpenPaymentScreenshotModal, setIsOpenPaymentScreenshotModal] =
    useState(false);
  const [transactionScreenshot, setTransactionScreenshot] = useState("");

  //review  usestates
  const [isOpenReviewModal, setIsOpenReviewModal] = useState(false);
  const [reviewScreenshot, setReviewScreenshot] = useState("");
  const [reviewType, setReviewType] = useState("");
  const [isOpenViewCertModal, setIsOpenViewCertModal] = useState(false);
  const [certHtmlContent, setCertHtmlContent] = useState("");
  const [certificateName, setCertificateName] = useState("");
  const [generateCertLoading, setGenerateCertLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  //payslip usestates
  const [payslipLoading, setPayslipLoading] = useState(false);
  const [currentPayslipName, setCurrentPayslipName] = useState("");
  const [isOpenViewPayslipModal, setIsOpenViewPayslipModal] = useState(false);
  const [payslipHtmlContent, setPayslipHtmlContent] = useState("");

  useEffect(() => {
    if (trainer_payment_id) {
      getTrainerPaymentByIdData();
    }
  }, []);

  const getTrainerPaymentByIdData = async () => {
    setLoading(true);
    try {
      const response = await getTrainerPaymentsById(trainer_payment_id);
      console.log("particular trainer payment response", response);
      setSelectedPaymentDetails(response?.data?.data || null);
    } catch (error) {
      setSelectedPaymentDetails(null);
      console.log("get trainer payment by id error", error);
    } finally {
      setLoading(false);
    }
  };

  const getTrainerByIdData = async (trainerId) => {
    try {
      const response = await getTrainerById(trainerId);
      const trainerDetails = response?.data?.data;
      setClickedTrainerDetails([trainerDetails]);
    } catch (error) {
      setClickedTrainerDetails([]);
      console.log("get trainer by id error", error);
    }
  };

  const getParticularCustomerDetails = async (customer_id) => {
    try {
      const response = await getCustomerById(customer_id);
      const customer_details = response?.data?.data || null;
      console.log("customer full details", customer_details);
      setCustomerDetails(customer_details);
      setIsOpenCustomerDetailsDrawer(true);
    } catch (error) {
      console.log("getcustomer by id error", error);
      setCustomerDetails(null);
    }
  };

  const handleViewCert = async (customer_id) => {
    setGenerateCertLoading(true);
    const payload = {
      customer_id: customer_id ? customer_id : customerDetails.id,
    };
    try {
      const response = await viewCertForCustomer(payload);
      console.log("cert response", response);
      const htmlTemplate = response?.data?.data?.html_template;
      setCertHtmlContent(htmlTemplate);
      setTimeout(() => {
        setGenerateCertLoading(false);
        setIsOpenViewCertModal(true);
      }, 300);
    } catch (error) {
      setGenerateCertLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }
  };

  const getPlaceOfSupplyOrPlaceOfSaleName = (Id) => {
    const item = allBranchesData.find((f) => f.id == Id);
    if (item) {
      return item.name;
    } else {
      return "";
    }
  };

  const totalCommercial =
    selectedPaymentDetails?.students?.reduce(
      (sum, student) => sum + Number(student.commercial || 0),
      0,
    ) || 0;

  const totalHours =
    selectedPaymentDetails?.students?.reduce(
      (sum, student) => sum + Number(student.duration_in_hours || 0),
      0,
    ) || 0;

  const handleViewPayslip = async (item) => {
    setPayslipLoading(true);
    setCurrentPayslipName(selectedPaymentDetails?.trainer_name || "Trainer");
    const payload = {
      trainer_name: selectedPaymentDetails?.trainer_name,
      trainer_id: selectedPaymentDetails?.trainer_code,
      course:
        selectedPaymentDetails?.commercial_type === "Batch"
          ? selectedPaymentDetails?.students[0]?.course_name
          : item?.course_name,
      payment_date: selectedPaymentDetails?.paid_date,
      batch_code: selectedPaymentDetails?.batch_number,
      training_mode:
        selectedPaymentDetails?.commercial_type === "Batch"
          ? selectedPaymentDetails?.students[0]?.mode_of_training
          : item?.mode_of_training,
      total_hours_taken:
        selectedPaymentDetails?.commercial_type === "Batch"
          ? totalHours
          : Number(item?.duration_in_hours),
      payment_mode: selectedPaymentDetails?.payment_mode,
      transaction_id: selectedPaymentDetails?.transaction_id,
      payment_status: selectedPaymentDetails?.payment_status,
      commercial:
        selectedPaymentDetails?.commercial_type === "Batch"
          ? totalCommercial
          : item?.commercial,
      count_of_candidates:
        selectedPaymentDetails?.commercial_type == "Batch"
          ? selectedPaymentDetails?.students?.length
          : "1",
      account_number: selectedPaymentDetails?.account_number,
      commercial_type: selectedPaymentDetails?.commercial_type,
      students:
        selectedPaymentDetails?.commercial_type === "Batch"
          ? `Batch ID: ${selectedPaymentDetails?.batch_number}`
          : selectedPaymentDetails?.students
              ?.map((student) => student.student_id || student.customer_name)
              .join(", ") || "",
    };

    try {
      const response = await viewTrainerPayslip(payload);
      console.log("payslip response", response);
      const htmlTemplate = response?.data?.data || response?.data;
      setPayslipHtmlContent(htmlTemplate);
      setIsOpenViewPayslipModal(true);
    } catch (error) {
      CommonMessage(
        "error",
        error?.response?.data?.message ||
          "Something went wrong. Try again later",
      );
    } finally {
      setPayslipLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <div style={{ padding: "24px", minHeight: "100vh" }}>
          <Skeleton active avatar paragraph={{ rows: 4 }} />
          <Skeleton
            active
            paragraph={{ rows: 6 }}
            style={{ marginTop: "24px" }}
          />
          <Skeleton
            active
            paragraph={{ rows: 6 }}
            style={{ marginTop: "24px" }}
          />
          <Skeleton
            active
            paragraph={{ rows: 6 }}
            style={{ marginTop: "24px" }}
          />
        </div>
      ) : selectedPaymentDetails ? (
        <>
          <Row
            gutter={16}
            style={{ marginTop: "20px", padding: "0px 0px 0px 24px" }}
          >
            <Col span={12}>
              <Row>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">
                      Bill Raise Date
                    </p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {selectedPaymentDetails &&
                    selectedPaymentDetails.bill_raisedate
                      ? moment(selectedPaymentDetails.bill_raisedate).format(
                          "DD/MM/YYYY",
                        )
                      : "-"}
                  </p>
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Trainer Name</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      alignItems: "center",
                    }}
                  >
                    <EllipsisTooltip
                      text={
                        selectedPaymentDetails &&
                        selectedPaymentDetails.trainer_name
                          ? selectedPaymentDetails.trainer_name
                          : "-"
                      }
                      smallText={true}
                    />
                    <FaRegEye
                      size={15}
                      className="trainers_action_icons"
                      onClick={() => {
                        setIsOpenTrainerDetailModal(true);
                        getTrainerByIdData(selectedPaymentDetails.trainer_id);
                      }}
                    />
                  </div>
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Request Amount</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {selectedPaymentDetails &&
                    selectedPaymentDetails.request_amount !== undefined &&
                    selectedPaymentDetails.request_amount !== null
                      ? "₹" + selectedPaymentDetails.request_amount
                      : "-"}
                  </p>
                </Col>
              </Row>
            </Col>

            <Col span={12}>
              <Row>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Balance Amount</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p
                    className="customerdetails_text"
                    style={{ color: "#d32f2f", fontWeight: 700 }}
                  >
                    {selectedPaymentDetails &&
                    selectedPaymentDetails.balance_amount !== undefined &&
                    selectedPaymentDetails.balance_amount !== null
                      ? "₹" + selectedPaymentDetails.balance_amount
                      : "-"}
                  </p>
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">
                      {hasPermission
                        ? "Days Taken To Pay"
                        : "Days Taken To Complete"}
                    </p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {selectedPaymentDetails ? (
                      <TimerPill
                        updatedDate={selectedPaymentDetails?.updated_date}
                        deadlineDate={calculateDeadlineDate(
                          selectedPaymentDetails?.updated_date,
                          selectedPaymentDetails?.students,
                          hasPermission,
                        )}
                        status={selectedPaymentDetails?.status}
                        paidDate={selectedPaymentDetails?.paid_date}
                      />
                    ) : (
                      "-"
                    )}
                  </p>
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Deadline Date</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {selectedPaymentDetails &&
                    selectedPaymentDetails.updated_date
                      ? (() => {
                          const calcDate = calculateDeadlineDate(
                            selectedPaymentDetails.updated_date,
                            selectedPaymentDetails.students,
                            hasPermission,
                          );
                          return calcDate ? calcDate.format("DD/MM/YYYY") : "-";
                        })()
                      : "-"}
                  </p>
                </Col>
              </Row>
            </Col>
          </Row>

          <Divider className="customer_statusupdate_divider" />

          {/* <div
        className="customerdetails_coursecard"
        style={{ margin: "24px 24px" }}
      >
        <div className="customerdetails_coursecard_headercontainer">
          <p>Score Card</p>
        </div>

        <div className="customerdetails_coursecard_contentcontainer">
          <Row>
            <Col span={8}>
              <p className="trainerpaymentrequest_scorecard_headings">
                Total Customers
              </p>
            </Col>
            <Col span={8}>
              <p className="trainerpaymentrequest_scorecard_headings">
                G-Review Collected
              </p>
            </Col>
            <Col span={8}>
              <p className="trainerpaymentrequest_scorecard_headings">
                L-Review Collected
              </p>
            </Col>
          </Row>

          <Row style={{ marginTop: "6px" }}>
            <Col span={8}>
              <p className="trainerpaymentrequest_scorecard_text">
                {selectedPaymentDetails?.scoreCard?.total_students ?? "-"}
              </p>
            </Col>
            <Col span={8}>
              <p className="trainerpaymentrequest_scorecard_text">
                {selectedPaymentDetails?.scoreCard?.total_google ?? "-"}
              </p>
            </Col>
            <Col span={8}>
              <p className="trainerpaymentrequest_scorecard_text">
                {selectedPaymentDetails?.scoreCard?.total_linkedin ?? "-"}
              </p>
            </Col>
          </Row>
        </div>
      </div> */}

          <div className="customer_statusupdate_adddetailsContainer">
            {selectedPaymentDetails?.students?.length >= 1 ? (
              <div>
                <p
                  style={{
                    fontWeight: 600,
                    color: "#333",
                    fontSize: "14px",
                  }}
                >
                  Customer Details
                </p>

                <div>
                  <div style={{ marginTop: "12px", marginBottom: "20px" }}>
                    <Collapse
                      activeKey={collapseDefaultKey}
                      onChange={(keys) => setCollapseDefaultKey(keys)}
                      className="customer_updatepayment_history_collapse"
                    >
                      {selectedPaymentDetails?.students?.map((item, index) => {
                        const panelKey = String(index + 1); // convert to string
                        return (
                          <Collapse.Panel
                            key={panelKey} // unique key
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
                                  Name -{" "}
                                  <span style={{ fontWeight: "500" }}>
                                    {item.customer_name}
                                  </span>
                                </span>
                              </div>
                            }
                          >
                            <div style={{ padding: "9px 0px 0px 0px" }}>
                              <div style={{ padding: "0px 16px" }}>
                                <p
                                  className="trainer_paymentrequestform_headings"
                                  style={{ fontSize: "14px" }}
                                >
                                  Student Details
                                </p>
                                <Row
                                  gutter={12}
                                  style={{
                                    marginTop: "12px",
                                    marginBottom: "22px",
                                  }}
                                >
                                  <Col span={8}>
                                    <Row>
                                      <Col span={12}>
                                        <div className="customerdetails_rowheadingContainer">
                                          <p className="customerdetails_rowheading">
                                            Name
                                          </p>
                                        </div>
                                      </Col>
                                      <Col span={12}>
                                        <EllipsisTooltip
                                          text={
                                            item.customer_name
                                              ? item.customer_name
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
                                            Commercial
                                          </p>
                                        </div>
                                      </Col>
                                      <Col span={12}>
                                        <EllipsisTooltip
                                          text={
                                            item.commercial
                                              ? item.commercial
                                              : "-"
                                          }
                                          smallText={true}
                                        />
                                      </Col>
                                    </Row>
                                  </Col>
                                  <Col span={8}>
                                    <Row>
                                      <Col span={12}>
                                        <div className="customerdetails_rowheadingContainer">
                                          <p className="customerdetails_rowheading">
                                            Mobile
                                          </p>
                                        </div>
                                      </Col>
                                      <Col span={12}>
                                        <EllipsisTooltip
                                          text={
                                            item.customer_phone ??
                                            item.customer_mobile ??
                                            "-"
                                          }
                                          smallText={true}
                                        />
                                      </Col>
                                    </Row>
                                  </Col>
                                  <Col span={8}>
                                    <Row>
                                      <Col span={12}>
                                        <div className="customerdetails_rowheadingContainer">
                                          <p className="customerdetails_rowheading">
                                            Email
                                          </p>
                                        </div>
                                      </Col>
                                      <Col span={12}>
                                        <EllipsisTooltip
                                          text={
                                            item.customer_email
                                              ? item.customer_email
                                              : "-"
                                          }
                                          smallText={true}
                                        />
                                      </Col>
                                    </Row>
                                  </Col>
                                </Row>
                              </div>
                              <Divider className="customer_statusupdate_divider" />

                              <div style={{ padding: "0px 16px" }}>
                                <p
                                  className="trainer_paymentrequestform_headings"
                                  style={{ fontSize: "14px" }}
                                >
                                  Training Details
                                </p>
                                <Row
                                  gutter={12}
                                  style={{
                                    marginTop: "12px",
                                    marginBottom: "22px",
                                  }}
                                >
                                  <Col span={8}>
                                    <Row>
                                      <Col span={12}>
                                        <div className="customerdetails_rowheadingContainer">
                                          <p className="customerdetails_rowheading">
                                            Course
                                          </p>
                                        </div>
                                      </Col>
                                      <Col span={12}>
                                        <EllipsisTooltip
                                          text={
                                            item.course_name
                                              ? item.course_name
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
                                            Branch
                                          </p>
                                        </div>
                                      </Col>
                                      <Col span={12}>
                                        <EllipsisTooltip
                                          text={
                                            item.branch_id
                                              ? allBranchesData?.find(
                                                  (b) =>
                                                    b.id === item.branch_id,
                                                )?.name || item.branch_id
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
                                            Plt Guidance
                                          </p>
                                        </div>
                                      </Col>
                                      <Col span={12}>
                                        <EllipsisTooltip
                                          text={
                                            item.placement_guidance
                                              ? item.placement_guidance
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
                                            Cord Ratings
                                          </p>
                                        </div>
                                      </Col>
                                      <Col
                                        span={12}
                                        style={{ whiteSpace: "nowrap" }}
                                      >
                                        <Rate
                                          value={
                                            item.coordinator_rating
                                              ? parseFloat(
                                                  item.coordinator_rating,
                                                )
                                              : 1
                                          }
                                          disabled={true}
                                          style={{
                                            fontSize: "12px",
                                            color: "#f59e0b",
                                          }}
                                          allowHalf={true}
                                        />
                                      </Col>
                                    </Row>
                                  </Col>

                                  <Col span={8}>
                                    <Row>
                                      <Col span={12}>
                                        <div className="customerdetails_rowheadingContainer">
                                          <p className="customerdetails_rowheading">
                                            Duration Hrs
                                          </p>
                                        </div>
                                      </Col>
                                      <Col span={12}>
                                        <EllipsisTooltip
                                          text={
                                            item.duration_in_hours
                                              ? item.duration_in_hours
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
                                            Study Mtrl.
                                          </p>
                                        </div>
                                      </Col>
                                      <Col span={12}>
                                        <EllipsisTooltip
                                          text={
                                            item.study_material
                                              ? item.study_material
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
                                            Att. Type
                                          </p>
                                        </div>
                                      </Col>
                                      <Col span={12}>
                                        <EllipsisTooltip
                                          text={
                                            item.attendance_type ||
                                            (item.attendance_sheetlink
                                              ? "Link"
                                              : "Screenshot")
                                          }
                                          smallText={true}
                                        />
                                      </Col>
                                    </Row>
                                  </Col>

                                  <Col span={8}>
                                    <Row>
                                      <Col span={12}>
                                        <div className="customerdetails_rowheadingContainer">
                                          <p className="customerdetails_rowheading">
                                            Tr.Mode
                                          </p>
                                        </div>
                                      </Col>
                                      <Col span={12}>
                                        <EllipsisTooltip
                                          text={
                                            item.training_mode
                                              ? item.training_mode
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
                                            Assessment
                                          </p>
                                        </div>
                                      </Col>
                                      <Col span={12}>
                                        <EllipsisTooltip
                                          text={
                                            item.assessment
                                              ? item.assessment
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
                                            HR Ratings
                                          </p>
                                        </div>
                                      </Col>
                                      <Col
                                        span={12}
                                        style={{ whiteSpace: "nowrap" }}
                                      >
                                        <Rate
                                          value={
                                            item.hr_rating
                                              ? parseFloat(item.hr_rating)
                                              : 1
                                          }
                                          disabled={true}
                                          style={{
                                            fontSize: "12px",
                                            color: "#f59e0b",
                                          }}
                                          allowHalf={true}
                                        />
                                      </Col>
                                    </Row>
                                  </Col>
                                </Row>

                                <p
                                  className="trainer_paymentrequestform_headings"
                                  style={{ fontSize: "14px" }}
                                >
                                  Upload Documents
                                </p>
                                <Row
                                  gutter={12}
                                  style={{
                                    marginTop: "12px",
                                    marginBottom: "22px",
                                  }}
                                >
                                  <Col span={14}>
                                    {item.attendance_type === "Link" ||
                                    item.attendance_sheetlink ? (
                                      // <InfoText
                                      //   label="Attendance Sheet Link"
                                      //   value={item.attendance_sheetlink || "-"}
                                      // />
                                      <Row>
                                        <Col span={9}>
                                          <div className="customerdetails_rowheadingContainer">
                                            <p className="customerdetails_rowheading">
                                              Att. Sheet Link
                                            </p>
                                          </div>
                                        </Col>
                                        <Col span={15}>
                                          <EllipsisTooltip
                                            text={
                                              item.attendance_sheetlink
                                                ? item.attendance_sheetlink
                                                : "-"
                                            }
                                            smallText={true}
                                          />
                                        </Col>
                                      </Row>
                                    ) : (
                                      <Row>
                                        <Col span={9}>
                                          <div className="customerdetails_rowheadingContainer">
                                            <p className="customerdetails_rowheading">
                                              Att. Screenshot
                                            </p>
                                          </div>
                                        </Col>
                                        <Col span={15}>
                                          {item.attendance_screenshot ? (
                                            <button
                                              className="pendingcustomer_paymentscreenshot_viewbutton"
                                              onClick={() => {
                                                setIsOpenAttendanceScreenshotModal(
                                                  true,
                                                );
                                                setViewAttendanceScreenshot(
                                                  item.attendance_screenshot,
                                                );
                                              }}
                                            >
                                              <FaRegEye size={16} /> View
                                              screenshot
                                            </button>
                                          ) : (
                                            <span
                                              style={{
                                                fontSize: "14px",
                                                color: "#666",
                                              }}
                                            >
                                              -
                                            </span>
                                          )}
                                        </Col>
                                      </Row>
                                    )}
                                  </Col>
                                </Row>
                              </div>
                            </div>
                          </Collapse.Panel>
                        );
                      })}
                    </Collapse>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>

          {selectedPaymentDetails?.status == "Paid" &&
          permissions.includes("View Financial Details") ? (
            <>
              <Divider className="customer_statusupdate_divider" />
              <div style={{ padding: "0px 0px 0px 24px" }}>
                <p
                  style={{
                    fontWeight: 600,
                    color: "#333",
                    fontSize: "14px",
                  }}
                >
                  Payslip Details
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    marginTop: "20px",
                  }}
                >
                  {selectedPaymentDetails &&
                  selectedPaymentDetails?.students?.length > 0 ? (
                    <>
                      <div className="customer_registrationform_invoice_icon_container">
                        <FaFileInvoiceDollar size={24} />
                      </div>

                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <p className="customer_registrationform_invoice_heading">
                            Available Payslips
                          </p>
                          <span className="customer_registrationform_invoice_count_batch">
                            {selectedPaymentDetails?.commercial_type === "Batch"
                              ? "1 Batch Payslip"
                              : `${selectedPaymentDetails.students.length} ${
                                  selectedPaymentDetails.students.length === 1
                                    ? "Payslip"
                                    : "Payslips"
                                }`}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          {selectedPaymentDetails?.commercial_type ===
                          "Batch" ? (
                            <Tooltip
                              title={
                                <div style={{ padding: "4px" }}>
                                  <p style={{ margin: 0, fontWeight: 600 }}>
                                    Payslip: Batch -{" "}
                                    {selectedPaymentDetails?.batch_number}
                                  </p>
                                  <p
                                    style={{
                                      margin: 0,
                                      opacity: 0.8,
                                      fontSize: "12px",
                                    }}
                                  >
                                    Amount: ₹{totalCommercial}
                                  </p>
                                </div>
                              }
                            >
                              <Button
                                onClick={() =>
                                  handleViewPayslip({
                                    ...selectedPaymentDetails,
                                    commercial:
                                      selectedPaymentDetails.students.reduce(
                                        (sum, student) =>
                                          sum + Number(student.commercial || 0),
                                        0,
                                      ),
                                  })
                                }
                                className="customer_registrationform_invoice_view_button"
                              >
                                <IoReceiptOutline
                                  size={18}
                                  style={{ color: "#5b69ca" }}
                                />
                                ₹{totalCommercial}
                              </Button>
                            </Tooltip>
                          ) : (
                            selectedPaymentDetails.students.map(
                              (item, index) => (
                                <Tooltip
                                  key={index}
                                  title={
                                    <div style={{ padding: "4px" }}>
                                      <p style={{ margin: 0, fontWeight: 600 }}>
                                        Payslip:{" "}
                                        {item.customer_name || "Student"}
                                      </p>
                                      <p
                                        style={{
                                          margin: 0,
                                          opacity: 0.8,
                                          fontSize: "12px",
                                        }}
                                      >
                                        Amount: ₹{item.commercial}
                                      </p>
                                    </div>
                                  }
                                >
                                  <Button
                                    onClick={() => handleViewPayslip(item)}
                                    className="customer_registrationform_invoice_view_button"
                                  >
                                    <IoReceiptOutline
                                      size={18}
                                      style={{ color: "#5b69ca" }}
                                    />
                                    ₹{item.commercial}
                                  </Button>
                                </Tooltip>
                              ),
                            )
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#d1d5db",
                        fontStyle: "italic",
                      }}
                    >
                      No verified invoices found.
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            ""
          )}
        </>
      ) : (
        <div style={{ padding: "24px", textAlign: "center" }}>
          <p>No details found</p>
        </div>
      )}

      {/* trainer fulldetails modal */}
      <Modal
        title={
          <span style={{ padding: "0px 24px" }}>Trainer Full Details</span>
        }
        open={isOpenTrainerDetailModal}
        onCancel={() => setIsOpenTrainerDetailModal(false)}
        footer={false}
        width="50%"
        className="trainerpaymentrequest_trainerfulldetails_modal"
      >
        {clickedTrainerDetails.map((item, index) => {
          return (
            <>
              <Row
                gutter={16}
                style={{ marginTop: "20px" }}
                className="trainerpaymentrequest_addrequestdrawer_rowcontainer"
              >
                <Col span={12}>
                  <Row>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <FaRegCircleUser size={15} color="gray" />
                        <p className="customerdetails_rowheading">HR Name</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <EllipsisTooltip
                        text={item.hr_head ? item.hr_head : "-"}
                        smallText={true}
                      />
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
                      <EllipsisTooltip
                        text={
                          item.name
                            ? `${item.name} (${
                                item.trainer_code ? item.trainer_code : "-"
                              })`
                            : "-"
                        }
                        smallText={true}
                      />
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
                      <EllipsisTooltip text={item.email} smallText={true} />
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
                      <EllipsisTooltip
                        text={item.technology}
                        smallText={true}
                      />
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
                      <EllipsisTooltip
                        text={item.skills.map((item) => item.name).join(", ")}
                        smallText={true}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Divider className="customer_statusupdate_divider" />

              <p className="trainerpaymentrequest_traineraccountdetails_text">
                Account Details
              </p>

              <Row
                gutter={16}
                style={{ marginTop: "20px" }}
                className="trainerpaymentrequest_addrequestdrawer_rowcontainer"
              >
                <Col span={12}>
                  <Row>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Account Holder Name
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <EllipsisTooltip
                        text={
                          item.account_holder_name
                            ? item.account_holder_name
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
                          Account Number
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <EllipsisTooltip
                        text={item.account_number ? item.account_number : "-"}
                        smallText={true}
                      />
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">IFSC Code</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <EllipsisTooltip
                        text={item.ifsc_code ? item.ifsc_code : "-"}
                        smallText={true}
                      />
                    </Col>
                  </Row>
                </Col>

                <Col span={12}>
                  <Row>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">Bank Name</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <EllipsisTooltip
                        text={item.bank_name ? item.bank_name : "-"}
                        smallText={true}
                      />
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Branch Name
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <EllipsisTooltip
                        text={item.branch_name ? item.branch_name : "-"}
                        smallText={true}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </>
          );
        })}
      </Modal>

      {/* attendance screenshot modal */}
      <Modal
        title="Attendance Screenshot"
        open={isOpenAttendanceScreenshotModal}
        onCancel={() => {
          setIsOpenAttendanceScreenshotModal(false);
          setViewAttendanceScreenshot("");
        }}
        footer={false}
        width="32%"
        className="customer_paymentscreenshot_modal"
      >
        <div style={{ overflow: "hidden", maxHeight: "100vh" }}>
          <PrismaZoom>
            {viewAttendanceScreenshot ? (
              <img
                src={`data:image/png;base64,${viewAttendanceScreenshot}`}
                alt="payment screenshot"
                className="customer_paymentscreenshot_image"
              />
            ) : (
              "-"
            )}
          </PrismaZoom>
        </div>
      </Modal>

      {/* customer fulldetails drawer */}
      <Drawer
        title="Customer Details"
        open={isOpenCustomerDetailsDrawer}
        onClose={() => {
          setIsOpenCustomerDetailsDrawer(false);
          setCustomerDetails(null);
        }}
        width="50%"
        style={{ position: "relative" }}
      >
        {isOpenCustomerDetailsDrawer ? (
          <ParticularCustomerDetails
            customerId={customerDetails?.id}
            isCustomerPage={true}
          />
        ) : (
          ""
        )}
      </Drawer>

      {/* payment screenshot modal */}
      <Modal
        title="Payment Screenshot"
        open={isOpenPaymentScreenshotModal}
        onCancel={() => {
          setIsOpenPaymentScreenshotModal(false);
          setTransactionScreenshot("");
        }}
        footer={false}
        width="32%"
        className="customer_paymentscreenshot_modal"
      >
        <div style={{ overflow: "hidden", maxHeight: "100vh" }}>
          <PrismaZoom>
            {transactionScreenshot ? (
              <img
                src={`data:image/png;base64,${transactionScreenshot}`}
                alt="payment screenshot"
                className="customer_paymentscreenshot_image"
              />
            ) : (
              "-"
            )}
          </PrismaZoom>
        </div>
      </Modal>

      {/* review screenshot modal */}
      <Modal
        title={reviewType}
        open={isOpenReviewModal}
        onCancel={() => {
          setIsOpenReviewModal(false);
          setReviewScreenshot("");
          setReviewType("");
        }}
        footer={false}
        width="32%"
        className="customer_paymentscreenshot_modal"
      >
        <div style={{ overflow: "hidden", maxHeight: "100vh" }}>
          <PrismaZoom>
            {reviewScreenshot ? (
              <img
                src={`data:image/png;base64,${reviewScreenshot}`}
                alt="payment screenshot"
                className="customer_paymentscreenshot_image"
              />
            ) : (
              "-"
            )}
          </PrismaZoom>
        </div>
      </Modal>

      {/* view certificate modal */}
      <Modal
        open={isOpenViewCertModal}
        onCancel={() => {
          setIsOpenViewCertModal(false);
          setCertificateName("");
        }}
        footer={false}
        width="64%"
        style={{ marginBottom: "20px", top: 10 }}
        className="customer_certificate_viewmodal"
        zIndex={1100}
        // centered={true}
        closeIcon={
          <span
            style={{
              color: "#ffffff", // white color
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            <CloseOutlined />
          </span>
        }
      >
        <CommonCertificateViewer
          htmlTemplate={certHtmlContent}
          candidateName={
            certificateName
              ? certificateName
              : customerDetails && customerDetails.name
                ? customerDetails.name
                : "-"
          }
        />
      </Modal>

      {/* view payslip modal */}
      <Modal
        open={isOpenViewPayslipModal}
        onCancel={() => {
          setIsOpenViewPayslipModal(false);
          setCurrentPayslipName("");
        }}
        footer={false}
        width="64%"
        style={{ marginBottom: "20px" }}
        zIndex={1100}
        centered
      >
        <CommonPayslipViewer
          htmlTemplate={payslipHtmlContent}
          trainerName={currentPayslipName}
        />
      </Modal>
    </div>
  );
}
