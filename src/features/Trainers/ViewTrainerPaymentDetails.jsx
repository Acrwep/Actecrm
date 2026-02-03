import React, { useState } from "react";
import { Row, Col, Modal, Divider, Collapse, Drawer } from "antd";
import moment from "moment";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import { FaRegEye } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegCircleXmark } from "react-icons/fa6";
import { BsPatchCheckFill } from "react-icons/bs";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import { CloseOutlined } from "@ant-design/icons";
import PrismaZoom from "react-prismazoom";
import { getCustomers, viewCertForCustomer } from "../ApiService/action";
import ParticularCustomerDetails from "../Customers/ParticularCustomerDetails";
import CommonCertificateViewer from "../Common/CommonCertificateViewer";
import CommonSpinner from "../Common/CommonSpinner";

export default function ViewTrainerPaymentDetails({
  selectedPaymentDetails,
  trainersData,
  allBranchesData,
  isShowPaymentDetails = true,
}) {
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

  const getParticularCustomerDetails = async (customer_email) => {
    const payload = {
      email: customer_email,
    };
    try {
      const response = await getCustomers(payload);
      const customer_details = response?.data?.data?.customers[0];
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
  return (
    <div>
      <Row
        gutter={16}
        style={{ marginTop: "20px", padding: "0px 0px 0px 24px" }}
      >
        <Col span={12}>
          <Row>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                <p className="customerdetails_rowheading">Bill Raise Date</p>
              </div>
            </Col>
            <Col span={12}>
              <p className="customerdetails_text">
                {moment(selectedPaymentDetails.bill_raisedate).format(
                  "DD/MM/YYYY",
                )}
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
                style={{ display: "flex", gap: "6px", alignItems: "center" }}
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
                    const clickedTrainer = trainersData.filter(
                      (f) => f.id == selectedPaymentDetails.trainer_id,
                    );
                    console.log("clickedTrainer", clickedTrainer);
                    setClickedTrainerDetails(clickedTrainer);
                    setIsOpenTrainerDetailModal(true);
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
                <p className="customerdetails_rowheading">Days Taken To Pay</p>
              </div>
            </Col>
            <Col span={12}>
              <p className="customerdetails_text">
                {selectedPaymentDetails &&
                selectedPaymentDetails.days_taken_topay !== undefined &&
                selectedPaymentDetails.days_taken_topay !== null
                  ? selectedPaymentDetails.days_taken_topay
                  : "-"}
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
                {selectedPaymentDetails && selectedPaymentDetails.deadline_date
                  ? moment(selectedPaymentDetails.deadline_date).format(
                      "DD/MM/YYYY",
                    )
                  : "-"}
              </p>
            </Col>
          </Row>
        </Col>
      </Row>

      <Divider className="customer_statusupdate_divider" />

      <div
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
      </div>

      <div className="customer_statusupdate_adddetailsContainer">
        {selectedPaymentDetails.students.length >= 1 ? (
          <div>
            <p
              style={{
                fontWeight: 600,
                color: "#333",
                fontSize: "16px",
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
                  {selectedPaymentDetails.students.map((item, index) => {
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
                        <div style={{ padding: "4px 12px 6px 12px" }}>
                          <Row>
                            <Col span={12}>
                              <Row>
                                <Col span={12}>
                                  <div className="customerdetails_rowheadingContainer">
                                    <p className="customerdetails_rowheading">
                                      Name
                                    </p>
                                  </div>
                                </Col>
                                <Col span={12}>
                                  {/* <EllipsisTooltip
                                    text={item.customer_name}
                                    smallText={true}
                                  /> */}
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "6px",
                                      alignItems: "center",
                                    }}
                                  >
                                    <EllipsisTooltip
                                      text={item.customer_name}
                                      smallText={true}
                                    />
                                    <FaRegEye
                                      size={15}
                                      className="trainers_action_icons"
                                      onClick={() => {
                                        getParticularCustomerDetails(
                                          item.customer_email,
                                        );
                                      }}
                                    />
                                  </div>
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
                                    {item.commercial_percentage + "%"}
                                  </p>
                                </Col>
                              </Row>

                              <Row style={{ marginTop: "12px" }}>
                                <Col span={12}>
                                  <div className="customerdetails_rowheadingContainer">
                                    <p className="customerdetails_rowheading">
                                      Place Of Supply
                                    </p>
                                  </div>
                                </Col>
                                <Col span={12}>
                                  <EllipsisTooltip
                                    text={getPlaceOfSupplyOrPlaceOfSaleName(
                                      item.place_of_supply
                                        ? item.place_of_supply
                                        : 0,
                                    )}
                                    smallText={true}
                                  />
                                </Col>
                              </Row>
                            </Col>

                            {/* ------------right------------ */}
                            <Col span={12}>
                              <Row>
                                <Col span={12}>
                                  <div className="customerdetails_rowheadingContainer">
                                    <p className="customerdetails_rowheading">
                                      {item.attendance_sheetlink
                                        ? "Attendance Sheet"
                                        : "Attendance SS"}
                                    </p>
                                  </div>
                                </Col>
                                <Col span={12}>
                                  {/* <p className="customerdetails_text">
                                    {item.customer_name}
                                  </p> */}
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
                                      <FaRegEye size={16} /> View screenshot
                                    </button>
                                  ) : (
                                    ""
                                  )}
                                </Col>
                              </Row>

                              <Row style={{ marginTop: "12px" }}>
                                <Col span={12}>
                                  <div className="customerdetails_rowheadingContainer">
                                    <p className="customerdetails_rowheading">
                                      Attendance Status
                                    </p>
                                  </div>
                                </Col>
                                <Col span={12}>
                                  <p className="customerdetails_text">
                                    {item.attendance_status}
                                  </p>
                                </Col>
                              </Row>

                              <Row style={{ marginTop: "12px" }}>
                                <Col span={12}>
                                  <div className="customerdetails_rowheadingContainer">
                                    <p className="customerdetails_rowheading">
                                      Place Of Sale
                                    </p>
                                  </div>
                                </Col>
                                <Col span={12}>
                                  <EllipsisTooltip
                                    text={getPlaceOfSupplyOrPlaceOfSaleName(
                                      item.place_of_sale
                                        ? item.place_of_sale
                                        : 0,
                                    )}
                                    smallText={true}
                                  />
                                </Col>
                              </Row>

                              <Row style={{ marginTop: "12px" }}>
                                <Col span={12}>
                                  <div className="customerdetails_rowheadingContainer">
                                    <p className="customerdetails_rowheading">
                                      Screenshot
                                    </p>
                                  </div>
                                </Col>
                                <Col span={12}>
                                  <button
                                    className="pendingcustomer_paymentscreenshot_viewbutton"
                                    onClick={() => {
                                      setIsOpenReviewModal(true);
                                      setReviewType("Verification Screenshot");
                                      setReviewScreenshot(item.screenshot);
                                    }}
                                  >
                                    <FaRegEye size={16} /> View screenshot
                                  </button>
                                </Col>
                              </Row>
                            </Col>
                          </Row>

                          <div className="trainerpaymentrequest_viewdrawer_customerbadge_container">
                            <Row gutter={12}>
                              <Col flex="20%">
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    flex: 1,
                                  }}
                                >
                                  <div className="trainerpaymentrequest_balanceamount_badge" />
                                  <p className="customer_trainer_onboardcount_badgecount">
                                    Balance Amount{" "}
                                  </p>
                                </div>
                              </Col>
                              <Col flex="20%">
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    flex: 1,
                                  }}
                                >
                                  <div className="trainerpaymentrequest_classpercentage_badge" />
                                  <p className="customer_trainer_onboardcount_badgecount">
                                    Class Pct
                                  </p>
                                </div>
                              </Col>
                              <Col flex="20%">
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    flex: 1,
                                  }}
                                >
                                  <div className="trainerpaymentrequest_linkedin_badge" />
                                  <p className="customer_trainer_onboardcount_badgecount">
                                    L-Review{" "}
                                  </p>
                                </div>
                              </Col>
                              <Col flex="20%">
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    flex: 1,
                                  }}
                                >
                                  <div className="trainerpaymentrequest_google_badge" />
                                  <p className="customer_trainer_onboardcount_badgecount">
                                    G-Review
                                  </p>
                                </div>
                              </Col>
                              <Col flex="20%">
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    flex: 1,
                                  }}
                                >
                                  <div className="trainerpaymentrequest_certificate_badge" />
                                  <p className="customer_trainer_onboardcount_badgecount">
                                    Certificate
                                  </p>
                                </div>
                              </Col>
                            </Row>

                            <Row gutter={12} style={{ marginTop: "2px" }}>
                              <Col flex="20%">
                                <p
                                  style={{
                                    fontWeight: 600,
                                    fontSize: "11px",
                                    padding: "2px 9px",
                                  }}
                                >
                                  {"₹" + item.balance_amount}
                                </p>{" "}
                              </Col>
                              <Col flex="20%">
                                <p
                                  style={{
                                    fontWeight: 600,
                                    fontSize: "11px",
                                    padding: "2px 9px",
                                  }}
                                >
                                  {item.class_percentage
                                    ? parseFloat(item.class_percentage) + "%"
                                    : "0" + "%"}
                                </p>{" "}
                              </Col>
                              <Col flex="20%">
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "0px",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontWeight: 600,
                                      fontSize: "11px",
                                      padding: "2px 9px",
                                    }}
                                  >
                                    {item.linkedin_review
                                      ? "Collected"
                                      : "Not Collected"}
                                  </p>{" "}
                                  {item.linkedin_review ? (
                                    <FaRegEye
                                      size={12}
                                      style={{
                                        cursor: "pointer",
                                        marginTop: "4px",
                                      }}
                                      onClick={() => {
                                        setIsOpenReviewModal(true);
                                        setReviewType("Linkedin Review");
                                        setReviewScreenshot(
                                          item.linkedin_review,
                                        );
                                      }}
                                    />
                                  ) : (
                                    ""
                                  )}
                                </div>
                              </Col>
                              <Col flex="20%">
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "0px",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontWeight: 600,
                                      fontSize: "11px",
                                      padding: "2px 9px",
                                    }}
                                  >
                                    {item.google_review
                                      ? "Collected"
                                      : "Not Collected"}
                                  </p>{" "}
                                  {item.google_review ? (
                                    <FaRegEye
                                      size={12}
                                      style={{
                                        cursor: "pointer",
                                        marginTop: "4px",
                                      }}
                                      onClick={() => {
                                        setIsOpenReviewModal(true);
                                        setReviewType("Google Review");
                                        setReviewScreenshot(item.google_review);
                                      }}
                                    />
                                  ) : (
                                    ""
                                  )}
                                </div>
                              </Col>

                              <Col flex="20%">
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "0px",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontWeight: 600,
                                      fontSize: "11px",
                                      padding: "2px 9px",
                                    }}
                                  >
                                    {item.is_certificate_generated == 1
                                      ? "Generated"
                                      : "Not Generated"}
                                  </p>{" "}
                                  {item.is_certificate_generated == 1 ? (
                                    <>
                                      {generateCertLoading ? (
                                        <CommonSpinner color="#333" />
                                      ) : (
                                        <FaRegEye
                                          size={12}
                                          style={{
                                            cursor: "pointer",
                                            marginTop: "4px",
                                          }}
                                          onClick={() => {
                                            handleViewCert(item.customer_id);
                                            setCertificateName(
                                              item.customer_name,
                                            );
                                          }}
                                        />
                                      )}
                                    </>
                                  ) : (
                                    ""
                                  )}
                                </div>
                              </Col>
                            </Row>
                          </div>
                        </div>
                      </Collapse.Panel>
                    );
                  })}
                </Collapse>
              </div>

              {isShowPaymentDetails && (
                <>
                  {selectedPaymentDetails.payments.length >= 1 ? (
                    <div>
                      <p
                        style={{
                          fontWeight: 600,
                          color: "#333",
                          fontSize: "16px",
                        }}
                      >
                        Payment History
                      </p>

                      <div>
                        <div
                          style={{ marginTop: "12px", marginBottom: "20px" }}
                        >
                          <Collapse
                            activeKey={collapseDefaultKey}
                            onChange={(keys) => setCollapseDefaultKey(keys)}
                            className="customer_updatepayment_history_collapse"
                          >
                            {selectedPaymentDetails.payments.map(
                              (item, index) => {
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
                                          Bill Raise Date -{" "}
                                          <span style={{ fontWeight: "500" }}>
                                            {moment(
                                              selectedPaymentDetails.bill_raisedate,
                                            ).format("DD/MM/YYYY")}
                                          </span>
                                        </span>

                                        {item.status === "Rejected" ? (
                                          <div className="customer_trans_statustext_container">
                                            <FaRegCircleXmark color="#d32f2f" />
                                            <p
                                              style={{
                                                color: "#d32f2f",
                                              }}
                                            >
                                              Rejected
                                            </p>
                                          </div>
                                        ) : (
                                          <div className="customer_trans_statustext_container">
                                            <BsPatchCheckFill color="#3c9111" />
                                            <p
                                              style={{
                                                color: "#3c9111",
                                              }}
                                            >
                                              Verified
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    }
                                  >
                                    <div style={{ padding: "0px 12px" }}>
                                      <Row
                                        gutter={16}
                                        style={{
                                          marginTop: "6px",
                                          marginBottom: "8px",
                                        }}
                                      >
                                        <Col span={12}>
                                          <Row>
                                            <Col span={12}>
                                              <div className="customerdetails_rowheadingContainer">
                                                <p className="customerdetails_rowheading">
                                                  Paid Amount
                                                </p>
                                              </div>
                                            </Col>
                                            <Col span={12}>
                                              <p className="customerdetails_text">
                                                {"₹" + item.paid_amount}
                                              </p>
                                            </Col>
                                          </Row>
                                        </Col>

                                        <Col span={12}>
                                          <Row>
                                            <Col span={12}>
                                              <div className="customerdetails_rowheadingContainer">
                                                <p className="customerdetails_rowheading">
                                                  Payment Type
                                                </p>
                                              </div>
                                            </Col>
                                            <Col span={12}>
                                              <p className="customerdetails_text">
                                                {item.payment_type}
                                              </p>
                                            </Col>
                                          </Row>
                                        </Col>
                                      </Row>

                                      {item.status == "Rejected" ? (
                                        <>
                                          <Divider className="customer_statusupdate_divider" />
                                          <div
                                            style={{
                                              padding: "0px 12px 6px 0px",
                                            }}
                                          >
                                            <Row>
                                              <Col span={24}>
                                                <Row>
                                                  <Col span={6}>
                                                    <div className="customerdetails_rowheadingContainer">
                                                      <p
                                                        className="customerdetails_rowheading"
                                                        style={{
                                                          color: "#d32f2f",
                                                        }}
                                                      >
                                                        Rejection Reason:
                                                      </p>
                                                    </div>
                                                  </Col>
                                                  <Col span={18}>
                                                    <p className="customerdetails_text">
                                                      {item.reason}
                                                    </p>
                                                  </Col>
                                                </Row>
                                              </Col>
                                            </Row>
                                          </div>
                                        </>
                                      ) : (
                                        <>
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
                                                      Paid Date
                                                    </p>
                                                  </div>
                                                </Col>
                                                <Col span={12}>
                                                  <p className="customerdetails_text">
                                                    {item.paid_date
                                                      ? moment(
                                                          item.paid_date,
                                                        ).format("DD/MM/YYYY")
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
                                                      Bulk Payment SS
                                                    </p>
                                                  </div>
                                                </Col>
                                                <Col span={12}>
                                                  <button
                                                    className="pendingcustomer_paymentscreenshot_viewbutton"
                                                    onClick={() => {
                                                      setIsOpenPaymentScreenshotModal(
                                                        true,
                                                      );
                                                      setTransactionScreenshot(
                                                        item.payment_screenshot,
                                                      );
                                                    }}
                                                  >
                                                    <FaRegEye size={16} /> View
                                                    screenshot
                                                  </button>
                                                </Col>
                                              </Row>
                                            </Col>
                                          </Row>

                                          {/* ----------individual screenshot---------------- */}
                                          {item.approved_screenshot && (
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
                                                        Ind. Payment SS
                                                      </p>
                                                    </div>
                                                  </Col>
                                                  <Col span={12}>
                                                    <button
                                                      className="pendingcustomer_paymentscreenshot_viewbutton"
                                                      onClick={() => {
                                                        setIsOpenPaymentScreenshotModal(
                                                          true,
                                                        );
                                                        setTransactionScreenshot(
                                                          item.approved_screenshot,
                                                        );
                                                      }}
                                                    >
                                                      <FaRegEye size={16} />{" "}
                                                      View screenshot
                                                    </button>
                                                  </Col>
                                                </Row>
                                              </Col>
                                            </Row>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </Collapse.Panel>
                                );
                              },
                            )}
                          </Collapse>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          ""
        )}
      </div>

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
            customerDetails={customerDetails}
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
    </div>
  );
}
