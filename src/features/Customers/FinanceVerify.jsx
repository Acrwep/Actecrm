import React, { useState, useEffect, forwardRef } from "react";
import { Row, Col, Button, Collapse, Modal, Divider, message } from "antd";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import CommonSpinner from "../Common/CommonSpinner";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import { CommonMessage } from "../Common/CommonMessage";
import {
  getCustomersPaymentHistory,
  inserCustomerTrack,
  rejectCustomerPayment,
  sendLoginLink,
  sendNotification,
  sendPaymentInvoiceByEmail,
  updateCustomerPaymentTransaction,
  updateCustomerStatus,
  verifyCustomerPayment,
  getBanks,
} from "../ApiService/action";
import {
  addressValidator,
  calculateAmount,
  formatToBackendIST,
  getBalanceAmount,
  getConvenienceFees,
  priceValidator,
  selectValidator,
} from "../Common/Validation";
import { FaRegEye } from "react-icons/fa";
import { FaRegCircleXmark } from "react-icons/fa6";
import PrismaZoom from "react-prismazoom";
import { BsPatchCheckFill } from "react-icons/bs";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import moment from "moment";
import CommonTextArea from "../Common/CommonTextArea";
import CommonGroupedSelectField from "../Common/CommonGroupedSelectField";
import axios from "axios";

const FinanceVerify = forwardRef(
  ({ customerDetails, drawerContentStatus, callgetCustomersApi }, ref) => {
    const [isOpenPaymentScreenshotModal, setIsOpenPaymentScreenshotModal] =
      useState(false);
    const [paymentFullDetails, setPaymentFullDetails] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [collapseDefaultKey, setCollapseDefaultKey] = useState(["1"]);
    const [transactionScreenshot, setTransactionScreenshot] = useState("");
    const [rejectTransItem, setRejectTransItem] = useState(null);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [isShowFinanceRejectComment, setIsShowFinanceRejectComment] =
      useState(false);
    const [financeRejectComment, setFinanceRejectComment] = useState("");
    const [financeRejectCommentError, setFinanceRejectCommentError] =
      useState("");
    const [isOpenFinanceVerifyModal, setIsOpenFinanceVerifyModal] =
      useState(false);
    const [transactionDetails, setTransactionDetails] = useState(null);
    //update payment usestates
    const [updatePaymentTransId, setUpdatePaymentTransId] = useState(null);
    const [subTotal, setSubTotal] = useState("");
    const [pendingAmount, setPendingAmount] = useState();
    const [paymentDate, setPaymentDate] = useState(null);
    const [paymentDateError, setPaymentDateError] = useState("");
    const [paymentMode, setPaymentMode] = useState(null);
    const [paymentModeError, setPaymentModeError] = useState(null);
    const [convenienceFees, setConvenienceFees] = useState("");
    const [transactionToOptions, setTransactionToOptions] = useState([]);
    const [transactionTo, setTransactionTo] = useState(null);
    const [transactionToError, setTransactionToError] = useState(null);
    const [taxType, setTaxType] = useState(null);
    const [totalAmount, setTotalAmount] = useState("");
    const [paidNow, setPaidNow] = useState("");
    const [paidNowError, setPaidNowError] = useState("");
    const [paymentScreenShotBase64, setPaymentScreenShotBase64] = useState("");
    const [paymentScreenShotError, setPaymentScreenShotError] = useState("");
    const [paymentValidationTrigger, setPaymentValidationTrigger] =
      useState(false);
    const [balanceAmount, setBalanceAmount] = useState("");
    const [isShowDueDate, setIsShowDueDate] = useState(true);
    const [dueDate, setDueDate] = useState(null);
    const [dueDateError, setDueDateError] = useState("");
    const [buttonLoading, setButtonLoading] = useState(false);

    useEffect(() => {
      getPaymentHistoryData();
    }, []);

    const getPaymentHistoryData = async () => {
      try {
        const response = await getCustomersPaymentHistory(
          customerDetails?.lead_id,
        );
        console.log("particular customer payment history", response);
        const payment_full_details = response?.data?.data || null;
        const payment_history = response?.data?.data?.payment_trans || [];

        setPaymentFullDetails(payment_full_details);
        setPaymentHistory(payment_history);

        //fetch payment details
        if (drawerContentStatus == "Update Payment") {
          console.log(
            "totalllllllllll",
            parseFloat(payment_full_details?.total_amount || 0).toFixed(2),
          );

          setSubTotal(parseFloat(payment_full_details.primary_fees).toFixed(2));
          setPendingAmount(parseFloat(customerDetails.balance_amount));
          setTaxType(
            payment_full_details && payment_full_details.tax_type
              ? payment_full_details.tax_type == "GST (18%)"
                ? 1
                : payment_full_details.tax_type == "SGST (18%)"
                  ? 2
                  : payment_full_details.tax_type == "IGST (18%)"
                    ? 3
                    : payment_full_details.tax_type == "VAT (18%)"
                      ? 4
                      : payment_full_details.tax_type == "No Tax"
                        ? 5
                        : 0
              : 0,
          );
          setTotalAmount(
            parseFloat(payment_full_details?.total_amount || 0).toFixed(2),
          );
          //transaction handling
          const rejectedItem = payment_history.find(
            (f) => f?.payment_status === "Rejected",
          );
          console.log("rejectedItem", rejectedItem);
          setUpdatePaymentTransId(
            rejectedItem && rejectedItem.id ? rejectedItem.id : null,
          );
          setPaidNow(
            parseFloat(
              rejectedItem && rejectedItem.amount ? rejectedItem.amount : 0,
            ).toFixed(2),
          );
          setPaymentMode(
            rejectedItem && rejectedItem.paymode_id
              ? rejectedItem.paymode_id
              : 0,
          );
          setConvenienceFees(
            parseFloat(
              rejectedItem && rejectedItem.convenience_fees
                ? rejectedItem.convenience_fees
                : 0,
            ).toFixed(2),
          );
          setPaymentDate(
            rejectedItem && rejectedItem.paid_date
              ? rejectedItem.paid_date
              : null,
          );
          setPaymentScreenShotBase64(
            rejectedItem && rejectedItem.payment_screenshot
              ? rejectedItem.payment_screenshot
              : "",
          );
          if (rejectedItem && rejectedItem.paymode_id) {
            getBanksData(rejectedItem.paymode_id);
          }
          setTransactionTo(
            rejectedItem && rejectedItem.bank_id ? rejectedItem.bank_id : null,
          );
          const rej_balance_amount =
            rejectedItem && rejectedItem.balance_amount
              ? rejectedItem.balance_amount
              : 0;
          setBalanceAmount(rej_balance_amount);
          if (rej_balance_amount == 0 || rej_balance_amount == "0.00") {
            setIsShowDueDate(false);
          } else {
            setIsShowDueDate(true);
          }
          setDueDate(
            rejectedItem && rejectedItem.next_due_date
              ? rejectedItem.next_due_date
              : null,
          );
        }
      } catch (error) {
        setPaymentFullDetails(null);
        setPaymentHistory([]);
        console.log("particular customer payment history error", error);
      }
    };

    // onchange functions
    const handlePaidNow = (e) => {
      const input = e.target.value;

      // Allow numbers, decimal point, or empty string
      if (!/^\d*\.?\d*$/.test(input)) return;

      setPaidNow(input); // store as string for user input

      const value = parseFloat(input); // parse for calculations
      const amt = parseFloat(pendingAmount);

      const selectedBank = transactionToOptions?.find(
        (item) => item.id == transactionTo,
      );
      let conve_fees = 0;
      if (selectedBank && selectedBank.is_convenience) {
        conve_fees = ((isNaN(value) ? 0 : value) * 3) / 100;
        setConvenienceFees(conve_fees.toFixed(2));
      } else {
        setConvenienceFees(0);
      }

      const actualPaid = (isNaN(value) ? 0 : value) - conve_fees;

      if (actualPaid < amt || isNaN(value) || input === "" || input === null) {
        setIsShowDueDate(true);
      } else {
        setIsShowDueDate(false);
        setDueDate(null);
        setDueDateError("");
      }

      setBalanceAmount(getBalanceAmount(isNaN(amt) ? 0 : amt, actualPaid));

      if (paymentValidationTrigger) {
        setPaidNowError(
          priceValidator(isNaN(value) ? 0 : value, parseFloat(amt)),
        );
      }
    };

    const handlePaymentMode = (e) => {
      const value = e.target.value;
      setPaymentMode(value);
      getBanksData(value);
      setConvenienceFees(0);

      if (paymentValidationTrigger) {
        setPaymentModeError(selectValidator(value));
      }

      //handle balance amount
      if (
        paidNow < pendingAmount ||
        isNaN(paidNow) ||
        paidNow == "" ||
        paidNow == null
      ) {
        setIsShowDueDate(true);
      } else {
        setIsShowDueDate(false);
        setDueDate(null);
        setDueDateError("");
      }
      setBalanceAmount(
        getBalanceAmount(
          isNaN(pendingAmount) ? 0 : pendingAmount,
          isNaN(paidNow) ? 0 : paidNow,
        ),
      );
    };

    const getBanksData = async (paymentmode_id) => {
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);
      const user_id = converAsJson?.user_id;
      const regionId =
        user_id?.startsWith("HUB") || user_id?.startsWith("CHN") ? 2 : 3;

      try {
        const response = await getBanks(regionId, paymentmode_id);
        setTransactionToOptions(response?.data?.data || []);
      } catch (error) {
        setTransactionToOptions([]);
        console.log("get banks error", error);
      }
    };

    //onclick functions
    const handleFinanceVerify = async () => {
      setButtonLoading(true);
      const today = new Date();
      const payment_payload = {
        payment_trans_id: transactionDetails?.id || "",
        verified_date: formatToBackendIST(today),
      };
      try {
        const verifyResponse = await verifyCustomerPayment(payment_payload);
        CommonMessage("success", "Updated Successfully");
        console.log("verifyResponse", verifyResponse);
        const isFullyPaid = verifyResponse?.data?.data?.is_fully_paid === true;
        if (isFullyPaid) {
          console.log("success");
          addUserInLMS();
        }
        setTimeout(async () => {
          const getloginUserDetails = localStorage.getItem("loginUserDetails");
          const converAsJson = JSON.parse(getloginUserDetails);
          const payload = {
            customer_ids: [
              {
                customer_id: customerDetails.id,
                status:
                  customerDetails?.is_second_due === 1
                    ? (customerDetails?.status ?? "Unknown")
                    : "Awaiting Verify",
                updated_at: formatToBackendIST(new Date()),
                updated_by: converAsJson?.user_id || "",
              },
            ],
          };
          console.log("payloaddd", payload);
          try {
            await updateCustomerStatus(payload);
            handleCustomerTrack(
              customerDetails?.is_second_due === 1
                ? ("Part Payment Verified" ?? "Unknown")
                : "Payment Verified",
              transactionDetails?.id || "",
            );
            setTimeout(() => {
              if (customerDetails?.is_second_due === 1) {
                return;
              }
              handleSecondCustomerTrack("Awaiting Verify");
            }, 300);
          } catch (error) {
            console.log("finance verify error", error);
            CommonMessage(
              "error",
              error?.response?.data?.message ||
                "Something went wrong. Try again later",
            );
          }
          sendInvoiceEmail(transactionDetails);
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.message ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleFinaceReject = async () => {
      const commentValidate = addressValidator(financeRejectComment);

      setFinanceRejectCommentError(commentValidate);

      if (commentValidate) return;

      setRejectLoading(true);
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);

      const payload = {
        payment_trans_id: rejectTransItem?.id || "",
        reason: financeRejectComment,
        rejected_date: formatToBackendIST(today),
        updated_by: converAsJson?.user_id || "",
      };
      const statusPayload = {
        customer_ids: [
          {
            customer_id: customerDetails.id,
            status: "Payment Rejected",
            updated_at: formatToBackendIST(new Date()),
            updated_by: converAsJson?.user_id || "",
          },
        ],
      };
      try {
        await rejectCustomerPayment(payload);
        CommonMessage("success", "Updated Successfully");
        setTimeout(async () => {
          setRejectLoading(false);
          if (customerDetails?.is_second_due == 0) {
            try {
              await updateCustomerStatus(statusPayload);
            } catch (error) {
              console.log("status update error", error);
            }
          }
          handleCustomerTrack(
            customerDetails?.is_second_due === 1
              ? ("Part Payment Rejected" ?? "Unknown")
              : "Payment Rejected",
          );
        }, 300);
      } catch (error) {
        setRejectLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.message ||
            "Something went wrong. Try again later",
        );
      }
    };

    const sendInvoiceEmail = async (transactiondetails) => {
      const payload = {
        email:
          customerDetails && customerDetails.email ? customerDetails.email : "",
        name:
          customerDetails && customerDetails.name ? customerDetails.name : "",
        mobile:
          customerDetails && customerDetails.phone ? customerDetails.phone : "",
        convenience_fees: transactiondetails?.convenience_fees || "",
        gst_amount: paymentFullDetails?.gst_amount ?? "",
        gst_percentage: paymentFullDetails?.gst_percentage
          ? parseFloat(paymentFullDetails.gst_percentage)
          : "",
        invoice_date: transactiondetails?.invoice_date
          ? moment(transactiondetails.invoice_date).format("DD-MM-YYYY")
          : "",
        invoice_number: transactiondetails?.invoice_number || "",
        paid_amount: transactiondetails?.amount || "",
        payment_mode: transactiondetails?.payment_mode || "",
        total_amount: paymentFullDetails?.total_amount
          ? paymentFullDetails.total_amount
          : "",
        balance_amount:
          transactiondetails.balance_amount != undefined ||
          transactiondetails.balance_amount != null
            ? parseFloat(transactiondetails?.balance_amount).toFixed(2)
            : "",
        course_name:
          customerDetails && customerDetails.course_name
            ? customerDetails.course_name
            : "",
        sub_total:
          customerDetails && customerDetails.primary_fees
            ? customerDetails.primary_fees
            : "",
      };

      try {
        await sendPaymentInvoiceByEmail(payload);
      } catch (error) {
        console.log("invoice error", error);
      }
    };

    const handleUpdatePaymentTransaction = async () => {
      setPaymentValidationTrigger(true);
      const paymentTypeValidate = selectValidator(paymentMode);
      const paymentDateValidate = selectValidator(paymentDate);
      const transactionToValidate = selectValidator(transactionTo);

      const paidNowValidate = priceValidator(
        parseInt(paidNow),
        parseInt(pendingAmount),
      );

      const screenshotValidate = selectValidator(paymentScreenShotBase64);
      let dueDateValidate;

      if (isShowDueDate) {
        dueDateValidate = selectValidator(dueDate);
      } else {
        dueDateValidate = "";
      }

      setPaymentModeError(paymentTypeValidate);
      setPaidNowError(paidNowValidate);
      setPaymentDateError(paymentDateValidate);
      setTransactionToError(transactionToValidate);
      setPaymentScreenShotError(screenshotValidate);
      setDueDateError(dueDateValidate);

      if (
        paymentTypeValidate ||
        paidNowValidate ||
        paymentDateValidate ||
        transactionToValidate ||
        screenshotValidate ||
        dueDateValidate
      )
        return;

      setButtonLoading(true);
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);

      const payload = {
        invoice_date: formatToBackendIST(paymentDate),
        amount: paidNow,
        convenience_fees: convenienceFees,
        paymode_id: paymentMode,
        bank_id: transactionTo,
        payment_screenshot: paymentScreenShotBase64,
        paid_date: paymentDate ? formatToBackendIST(paymentDate) : null,
        next_due_date: dueDate ? formatToBackendIST(dueDate) : null,
        payment_trans_id: updatePaymentTransId,
      };
      try {
        await updateCustomerPaymentTransaction(payload);
        CommonMessage("success", "Updated Successfully");
        setTimeout(async () => {
          const payload = {
            // status:
            //   customerDetails?.is_second_due == 0
            //     ? "Awaiting Finance"
            //     : customerDetails.status,
            customer_ids: [
              {
                customer_id: customerDetails.id,
                status:
                  customerDetails.status == "Payment Rejected"
                    ? "Awaiting Finance"
                    : customerDetails.status,
                updated_at: formatToBackendIST(new Date()),
                updated_by: converAsJson?.user_id || "",
              },
            ],
          };
          try {
            await updateCustomerStatus(payload);
            handleCustomerTrack("Payment Updated");
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
          error?.response?.data?.message ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleCustomerTrack = async (updatestatus, transactionId) => {
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);
      console.log("getloginUserDetails", converAsJson);

      const paymentVerifyDetails = {
        transaction_id: transactionId ?? "0",
      };

      const payload = {
        customers: [
          {
            customer_id: customerDetails.id,
            status: updatestatus,
            updated_by:
              converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
            status_date: formatToBackendIST(today),
            ...(updatestatus && updatestatus === "Payment Verified"
              ? { details: paymentVerifyDetails }
              : updatestatus === "Part Payment Verified"
                ? { details: paymentVerifyDetails }
                : {}),
          },
        ],
      };

      try {
        await inserCustomerTrack(payload);
        setTimeout(() => {
          callgetCustomersApi();
          if (updatestatus.includes("Payment Rejected")) {
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

    const handleSendNotification = async () => {
      const today = new Date();
      const payload = {
        user_ids: [
          customerDetails && customerDetails.lead_assigned_to_id
            ? customerDetails.lead_assigned_to_id
            : "-",
        ],
        title: "Payment Rejected",
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
          customer_last_payment_date:
            customerDetails && customerDetails.last_payment_date
              ? moment(customerDetails.last_payment_date).format("YYYY-MM-DD")
              : "-",
          customer_created_date:
            customerDetails && customerDetails.created_date
              ? moment(customerDetails.created_date).format("YYYY-MM-DD")
              : "-",
          customer_status:
            customerDetails && customerDetails.status
              ? customerDetails.status
              : "-",
          is_second_due:
            customerDetails && customerDetails.is_second_due != undefined
              ? customerDetails.is_second_due
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

    //lms
    const addUserInLMS = async () => {
      if (!customerDetails) {
        console.error("Customer details missing");
        return;
      }

      const payload = {
        branch_id: customerDetails?.branch_id,
        user_name: customerDetails?.name,
        email: customerDetails?.email,
      };

      try {
        await axios.post(
          `${import.meta.env.VITE_LMS_API_URL}/api/addUser`,
          payload,
        );
      } catch (err) {
        console.error("API Error:", err?.response?.data || err.message);
      } finally {
        sendLmsDetailsMail();
      }
    };

    const sendLmsDetailsMail = async () => {
      const payload = {
        email: customerDetails?.email,
        name: customerDetails?.name,
      };
      try {
        await sendLoginLink(payload);
      } catch (error) {
        console.log("sendLmsDetailsMail error", error);
      }
    };

    return (
      <div>
        {drawerContentStatus === "Finance Verify" ? (
          <div className="customer_statusupdate_adddetailsContainer">
            <div
              className="customerdetails_coursecard"
              style={{ marginBottom: "16px" }}
            >
              <div className="customerdetails_coursecard_headercontainer">
                <p>Fees Details</p>
              </div>

              <div className="customerdetails_coursecard_contentcontainer">
                <Row>
                  <Col span={12}>
                    <Row>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">Fees</p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p
                          className="customerdetails_text"
                          style={{ fontWeight: 700 }}
                        >
                          {customerDetails && customerDetails.primary_fees
                            ? "₹" + customerDetails.primary_fees
                            : "-"}
                        </p>
                      </Col>
                    </Row>

                    <Row style={{ marginTop: "12px" }}>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Gst Amount
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p
                          className="customerdetails_text"
                          style={{ fontWeight: 700 }}
                        >
                          {paymentFullDetails?.gst_amount ? (
                            <>
                              ₹{paymentFullDetails.gst_amount}{" "}
                              <span style={{ fontSize: "11px" }}>
                                ({paymentFullDetails.tax_type || "-"})
                              </span>
                            </>
                          ) : (
                            "-"
                          )}
                        </p>
                      </Col>
                    </Row>

                    <Row style={{ marginTop: "12px" }}>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Total Fees
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p
                          className="customerdetails_text"
                          style={{ fontWeight: 700 }}
                        >
                          {paymentFullDetails && paymentFullDetails.total_amount
                            ? "₹" + paymentFullDetails.total_amount
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
                            Total Paid Amount
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p
                          className="customerdetails_text"
                          style={{
                            fontWeight: 700,
                            color: "#3c9111",
                          }}
                        >
                          {customerDetails &&
                          customerDetails.paid_amount !== undefined &&
                          customerDetails.paid_amount !== null
                            ? "₹" + customerDetails.paid_amount
                            : "-"}
                        </p>
                      </Col>
                    </Row>

                    <Row style={{ marginTop: "12px" }}>
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
                          style={{ color: "#d32f2f", fontWeight: 700 }}
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

            <p style={{ fontWeight: 600, color: "#333", fontSize: "14px" }}>
              Transaction History
            </p>

            <div style={{ marginBottom: "30px" }}>
              {paymentHistory.length >= 1 ? (
                <div style={{ marginTop: "12px", marginBottom: "20px" }}>
                  <Collapse
                    activeKey={collapseDefaultKey}
                    onChange={(keys) => setCollapseDefaultKey(keys)}
                    className="assesmntresult_collapse"
                  >
                    {paymentHistory.map((item, index) => (
                      <Collapse.Panel
                        key={index + 1} // unique key
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
                              Transaction Details -{" "}
                              <span style={{ fontWeight: "500" }}>
                                {moment(item.invoice_date).format("DD/MM/YYYY")}
                              </span>
                            </span>

                            {item.payment_status === "Verify Pending" ? (
                              <div className="customer_trans_statustext_container">
                                <PiClockCounterClockwiseBold
                                  size={16}
                                  color="gray"
                                />
                                <p style={{ color: "gray", fontWeight: 500 }}>
                                  Waiting for Verify
                                </p>
                              </div>
                            ) : item.payment_status === "Rejected" ? (
                              <div className="customer_trans_statustext_container">
                                <FaRegCircleXmark color="#d32f2f" />
                                <p
                                  style={{ color: "#d32f2f", fontWeight: 500 }}
                                >
                                  Rejected
                                </p>
                              </div>
                            ) : (
                              <div className="customer_trans_statustext_container">
                                <BsPatchCheckFill color="#3c9111" />
                                <p
                                  style={{ color: "#3c9111", fontWeight: 500 }}
                                >
                                  Verified
                                </p>
                              </div>
                            )}
                          </div>
                        }
                      >
                        <div>
                          <div style={{ padding: "0px 12px" }}>
                            <table className="transaction-details-table">
                              <tbody>
                                <tr>
                                  <td>Paid Date</td>
                                  <td className="text-right">
                                    {moment(item.invoice_date).format(
                                      "DD/MM/YYYY",
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Transaction Mode</td>
                                  <td className="text-right">
                                    {item.payment_mode}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Transaction To</td>
                                  <td className="text-right">
                                    {item?.bank_name || "-"}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Fees</td>
                                  <td className="text-right">
                                    {item.fees ? `₹${item?.fees}` : "-"}
                                  </td>
                                </tr>
                                <tr>
                                  <td>GST(18%)</td>
                                  <td className="text-right">
                                    {item.gst_amount
                                      ? `₹${item?.gst_amount}`
                                      : "-"}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Total Fee Paid</td>
                                  <td className="text-right">
                                    {item.amount ? `₹${item?.amount}` : "-"}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Convenience Fees</td>
                                  <td className="text-right">
                                    {item.convenience_fees
                                      ? `₹${item?.convenience_fees}`
                                      : "-"}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="font-bold">Received Amount</td>
                                  <td className="text-right text-success font-bold">
                                    {"₹" + item.paid_amount}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Nxt Due Date</td>
                                  <td className="text-right">
                                    {item.next_due_date
                                      ? moment(item.next_due_date).format(
                                          "DD/MM/YYYY",
                                        )
                                      : "-"}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Payment Proof</td>
                                  <td className="text-right">
                                    <button
                                      className="pendingcustomer_paymentscreenshot_viewbutton btn-icon text-primary"
                                      onClick={() => {
                                        setIsOpenPaymentScreenshotModal(true);
                                        setTransactionScreenshot(
                                          item.payment_screenshot,
                                        );
                                      }}
                                    >
                                      <FaRegEye
                                        size={14}
                                        style={{
                                          marginRight: "4px",
                                          verticalAlign: "middle",
                                        }}
                                      />{" "}
                                      <span style={{ verticalAlign: "middle" }}>
                                        View
                                      </span>
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {item.payment_status === "Verify Pending" &&
                          item.reason ? (
                            <>
                              <Divider className="customer_statusupdate_divider" />
                              <div style={{ padding: "0px 52px" }}>
                                <Row>
                                  <Col span={24}>
                                    <Row>
                                      <Col span={9}>
                                        <div className="customerdetails_rowheadingContainer">
                                          <p
                                            className="customerdetails_rowheading"
                                            style={{ color: "#d32f2f" }}
                                          >
                                            Previous Rejection Reason:
                                          </p>
                                        </div>
                                      </Col>
                                      <Col span={15}>
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
                            ""
                          )}

                          {item.payment_status === "Verify Pending" && (
                            <div className="customer_finance_verify_buttons_container">
                              <Button
                                className="customer_finance_rejectbutton"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsShowFinanceRejectComment(true);
                                  setFinanceRejectCommentError(
                                    addressValidator(financeRejectComment),
                                  );
                                  setRejectTransItem(item);
                                  setTimeout(() => {
                                    const container = document.getElementById(
                                      "customer_financereject_comment_container",
                                    );

                                    container.scrollIntoView({
                                      behavior: "smooth",
                                    });
                                  }, 200);
                                }}
                              >
                                Reject
                              </Button>

                              <Button
                                className="customer_finance_verifybutton"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  setIsOpenFinanceVerifyModal(true);

                                  setTransactionDetails(item);
                                }}
                              >
                                Received
                              </Button>
                            </div>
                          )}
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

              {isShowFinanceRejectComment && (
                <div
                  className="customer_financereject_comment_container"
                  id="customer_financereject_comment_container"
                >
                  <CommonTextArea
                    label="Comments"
                    required={true}
                    onChange={(e) => {
                      setFinanceRejectComment(e.target.value);
                      setFinanceRejectCommentError(
                        addressValidator(e.target.value),
                      );
                    }}
                    value={financeRejectComment}
                    error={financeRejectCommentError}
                  />

                  <div className="customer_financereject_submitbutton_container">
                    {rejectLoading ? (
                      <Button
                        type="primary"
                        className="customer_financereject_loadingsubmitbutton"
                      >
                        <CommonSpinner />
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        className="customer_financereject_submitbutton"
                        onClick={handleFinaceReject}
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : drawerContentStatus === "Update Payment" ? (
          <>
            <div className="customer_statusupdate_adddetailsContainer">
              <p style={{ fontWeight: 600, color: "#333", fontSize: "16px" }}>
                Transaction History
              </p>

              <div>
                {paymentHistory.length >= 1 ? (
                  <div style={{ marginTop: "12px", marginBottom: "20px" }}>
                    <Collapse
                      activeKey={collapseDefaultKey}
                      onChange={(keys) => setCollapseDefaultKey(keys)}
                      className="customer_updatepayment_history_collapse"
                    >
                      {paymentHistory.map((item, index) => (
                        <Collapse.Panel
                          key={index + 1} // unique key
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
                                Transaction Details -{" "}
                                <span style={{ fontWeight: "500" }}>
                                  {moment(item.invoice_date).format(
                                    "DD/MM/YYYY",
                                  )}
                                </span>
                              </span>
                              {item.payment_status === "Verify Pending" ? (
                                <div className="customer_trans_statustext_container">
                                  <PiClockCounterClockwiseBold
                                    size={16}
                                    color="gray"
                                  />
                                  <p style={{ color: "gray", fontWeight: 500 }}>
                                    Waiting for Verify
                                  </p>
                                </div>
                              ) : item.payment_status === "Rejected" ? (
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
                              )}
                            </div>
                          }
                        >
                          <div style={{ padding: "0px 12px" }}>
                            <table className="transaction-details-table">
                              <tbody>
                                <tr>
                                  <td>Paid Date</td>
                                  <td className="text-right">
                                    {moment(item.invoice_date).format(
                                      "DD/MM/YYYY",
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Transaction Mode</td>
                                  <td className="text-right">
                                    {item.payment_mode}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Transaction To</td>
                                  <td className="text-right">
                                    {item?.bank_name || "-"}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Fees</td>
                                  <td className="text-right">
                                    {item.fees ? `₹${item?.fees}` : "-"}
                                  </td>
                                </tr>
                                <tr>
                                  <td>GST(18%)</td>
                                  <td className="text-right">
                                    {item.gst_amount
                                      ? `₹${item?.gst_amount}`
                                      : "-"}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Total Fee Paid</td>
                                  <td className="text-right">
                                    {item.amount ? `₹${item?.amount}` : "-"}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Convenience Fees</td>
                                  <td className="text-right">
                                    {item.convenience_fees
                                      ? `₹${item?.convenience_fees}`
                                      : "-"}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="font-bold">Received Amount</td>
                                  <td className="text-right text-success font-bold">
                                    {"₹" + item.paid_amount}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Nxt Due Date</td>
                                  <td className="text-right">
                                    {item.next_due_date
                                      ? moment(item.next_due_date).format(
                                          "DD/MM/YYYY",
                                        )
                                      : "-"}
                                  </td>
                                </tr>
                                <tr>
                                  <td>Payment Screenshot</td>
                                  <td className="text-right">
                                    <button
                                      className="pendingcustomer_paymentscreenshot_viewbutton btn-icon text-primary"
                                      onClick={() => {
                                        setIsOpenPaymentScreenshotModal(true);
                                        setTransactionScreenshot(
                                          item.payment_screenshot,
                                        );
                                      }}
                                    >
                                      <FaRegEye
                                        size={14}
                                        style={{
                                          marginRight: "4px",
                                          verticalAlign: "middle",
                                        }}
                                      />{" "}
                                      <span style={{ verticalAlign: "middle" }}>
                                        View screenshot
                                      </span>
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {item.payment_status == "Rejected" && (
                            <>
                              <Divider className="customer_statusupdate_divider" />
                              <div style={{ padding: "0px 52px 12px 52px" }}>
                                <Row>
                                  <Col span={24}>
                                    <Row>
                                      <Col span={6}>
                                        <div className="customerdetails_rowheadingContainer">
                                          <p
                                            className="customerdetails_rowheading"
                                            style={{ color: "#d32f2f" }}
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
                          )}
                        </Collapse.Panel>
                      ))}
                    </Collapse>
                  </div>
                ) : (
                  <p className="customer_trainerhistory_nodatatext">
                    No Data found
                  </p>
                )}
              </div>
            </div>

            <Divider className="customer_statusupdate_divider" />

            <div className="customer_statusupdate_adddetailsContainer">
              <p className="customer_statusupdate_adddetails_heading">
                Fees Details
              </p>
              <Row
                gutter={16}
                style={{ marginTop: "20px", marginBottom: "30px" }}
              >
                <Col span={8}>
                  <CommonInputField
                    label="Fees"
                    required={true}
                    type="number"
                    value={subTotal}
                    disabled={true}
                  />
                </Col>
                <Col span={8}>
                  <CommonSelectField
                    label="Tax Type"
                    labelFontSize={"11px"}
                    labelMarginTop={"1px"}
                    required={true}
                    // options={[
                    //   { id: 1, name: "GST (18%)" },
                    //   { id: 2, name: "SGST (18%)" },
                    //   { id: 3, name: "IGST (18%)" },
                    //   { id: 4, name: "VAT (18%)" },
                    //   { id: 5, name: "No Tax" },
                    // ]}
                    options={[
                      { id: "18%", name: "18%" },
                      { id: "0%", name: "0%" },
                    ]}
                    value={
                      paymentFullDetails?.tax_type.includes("18%")
                        ? "18%"
                        : "0%"
                    }
                    error={""}
                    height={"36px"}
                    fontSize={"12px"}
                    errorFontSize={"9px"}
                    disabled={true}
                  />
                </Col>
                <Col span={8}>
                  <CommonInputField
                    label="Tax Amount"
                    labelFontSize={"11px"}
                    labelMarginTop={"1px"}
                    required={true}
                    value={paymentFullDetails?.gst_amount}
                    error={""}
                    height={"36px"}
                    fontSize={"12px"}
                    errorFontSize={"9px"}
                    disabled={true}
                  />
                </Col>
              </Row>
            </div>

            <Divider className="customer_statusupdate_divider" />

            <p
              className="leadmanager_paymentdetails_drawer_heading"
              id="leadmanager_paymentdetails_paymentinfo_heading"
            >
              Calculation's
            </p>

            <Row
              gutter={[16, 22]}
              className="leadmanager_paymentdetails_drawer_rowdiv"
              style={{ marginTop: "20px", marginBottom: "30px" }}
            >
              <Col span={8}>
                <CommonInputField
                  label="Total Fees Amount"
                  required={true}
                  disabled
                  value={paymentFullDetails?.total_amount || ""}
                  height={"36px"}
                  labelFontSize={"11px"}
                  labelMarginTop={"1px"}
                />
              </Col>
              <Col span={8}>
                <CommonInputField
                  label="Total Paid Amount"
                  required={true}
                  disabled
                  value={(
                    parseFloat(paymentFullDetails?.paid_amount || 0) +
                    (parseFloat(paidNow || 0) -
                      parseFloat(convenienceFees || 0))
                  ).toFixed(2)}
                  height={"36px"}
                  labelFontSize={"11px"}
                  labelMarginTop={"1px"}
                />
              </Col>
              <Col span={8}>
                <CommonInputField
                  label="Total Pending"
                  required={true}
                  disabled
                  value={balanceAmount !== undefined ? balanceAmount : 0}
                  height={"36px"}
                  labelFontSize={"11px"}
                  labelMarginTop={"1px"}
                />
              </Col>
              <Col span={8}>
                <CommonInputField
                  label="Fees"
                  required={true}
                  disabled
                  value={
                    paymentFullDetails?.tax_type.includes("18%")
                      ? (
                          (parseFloat(paidNow || 0) -
                            parseFloat(convenienceFees || 0)) /
                          1.18
                        ).toFixed(2)
                      : (
                          parseFloat(paidNow || 0) -
                          parseFloat(convenienceFees || 0)
                        ).toFixed(2)
                  }
                  height={"36px"}
                  labelFontSize={"11px"}
                  labelMarginTop={"1px"}
                />
              </Col>
              <Col span={8}>
                <CommonInputField
                  label="TAX"
                  required={true}
                  disabled
                  value={
                    paymentFullDetails?.tax_type.includes("18%")
                      ? (
                          ((parseFloat(paidNow || 0) -
                            parseFloat(convenienceFees || 0)) *
                            18) /
                          118
                        ).toFixed(2)
                      : 0
                  }
                  height={"36px"}
                  labelFontSize={"11px"}
                  labelMarginTop={"1px"}
                />
              </Col>
              <Col span={8}>
                <CommonInputField
                  label="Convenience fees"
                  required={true}
                  value={convenienceFees}
                  disabled={true}
                  type="number"
                  labelFontSize={"11px"}
                  labelMarginTop={"1px"}
                />
              </Col>
            </Row>

            <Divider className="leadmanger_paymentdrawer_divider" />

            <div className="customer_statusupdate_adddetailsContainer">
              <p className="customer_statusupdate_adddetails_heading">
                Update Rejected Payment
              </p>

              <Row gutter={16} style={{ marginTop: "20px" }}>
                <Col span={8}>
                  <CommonSelectField
                    label="Payment Mode"
                    required={true}
                    options={[
                      { id: 1, name: "Cash" },
                      { id: 11, name: "Card (POS)" },
                      { id: 4, name: "UPI" },
                      { id: 5, name: "Razorpay" },
                      { id: 12, name: "Bank" },
                    ]}
                    onChange={handlePaymentMode}
                    value={paymentMode}
                    error={paymentModeError}
                    height={"36px"}
                    labelFontSize={"11px"}
                    labelMarginTop={"1px"}
                    errorFontSize="9px"
                  />
                </Col>
                <Col span={8}>
                  <CommonSelectField
                    label={"Transaction To"}
                    required={true}
                    options={transactionToOptions?.map((item) => ({
                      id: item.id,
                      name: item.bank_name,
                    }))}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setTransactionTo(selectedId);

                      setPaidNow("");
                      setConvenienceFees(0);

                      const amt = parseFloat(pendingAmount) || 0;
                      const actualPaid = 0;

                      setIsShowDueDate(true);

                      setBalanceAmount(getBalanceAmount(amt, actualPaid));

                      if (paymentValidationTrigger) {
                        setTransactionToError(selectValidator(selectedId));
                      }
                    }}
                    value={transactionTo}
                    error={transactionToError}
                    height={"36px"}
                    labelFontSize={"11px"}
                    labelMarginTop={"1px"}
                    errorFontSize="9px"
                  />
                </Col>
                <Col span={8}>
                  <CommonInputField
                    label="Received"
                    labelFontSize={"11px"}
                    labelMarginTop={"1px"}
                    required={true}
                    onChange={handlePaidNow}
                    value={paidNow}
                    error={paidNowError}
                    errorFontSize="9px"
                    type="number"
                  />
                </Col>
              </Row>

              <Row
                gutter={16}
                style={{ marginTop: "40px", marginBottom: "30px" }}
              >
                <Col span={8}>
                  <CommonMuiDatePicker
                    label="Payment Date"
                    required={true}
                    onChange={(value) => {
                      setPaymentDate(value);
                      if (paymentValidationTrigger) {
                        setPaymentDateError(selectValidator(value));
                      }
                    }}
                    value={paymentDate}
                    error={paymentDateError}
                    labelFontSize={"11px"}
                    labelMarginTop={"1px"}
                    errorFontSize={"9px"}
                  />
                </Col>

                {isShowDueDate ? (
                  <Col span={8}>
                    <CommonMuiDatePicker
                      label="Next Due Date"
                      required={true}
                      onChange={(value) => {
                        setDueDate(value);
                        setDueDateError(selectValidator(value));
                      }}
                      value={dueDate}
                      error={dueDateError}
                      disablePreviousDates={true}
                      labelFontSize={"11px"}
                      labelMarginTop={"1px"}
                      errorFontSize={"9px"}
                    />
                  </Col>
                ) : (
                  ""
                )}

                <Col span={8}>
                  <ImageUploadCrop
                    label="Proof Upload"
                    aspect={1}
                    maxSizeMB={1}
                    required={true}
                    value={paymentScreenShotBase64}
                    onChange={(base64) => setPaymentScreenShotBase64(base64)}
                    onErrorChange={setPaymentScreenShotError} // ✅ pass setter directly
                  />
                  {paymentScreenShotError && (
                    <p
                      style={{
                        fontSize: "10px",
                        color: "#d32f2f",
                        marginTop: 4,
                      }}
                    >
                      {`Payment Screenshot ${paymentScreenShotError}`}
                    </p>
                  )}
                </Col>
              </Row>

              <div className="customer_paymentreject_buttoncontainer">
                {buttonLoading ? (
                  <Button
                    type="primary"
                    className="customer_paymentreject_loadingbutton"
                  >
                    <CommonSpinner />
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    className="customer_paymentreject_button"
                    onClick={handleUpdatePaymentTransaction}
                  >
                    Update Payment
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          ""
        )}

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

        {/* payment verify modal */}
        <Modal
          open={isOpenFinanceVerifyModal}
          onCancel={() => {
            setIsOpenFinanceVerifyModal(false);
          }}
          footer={false}
          width="30%"
          zIndex={1100}
        >
          <p className="customer_classcompletemodal_heading">Are you sure?</p>

          <p className="customer_classcompletemodal_text">
            You Want To Verify The Payment Of{" "}
            <span style={{ fontWeight: 700, color: "#333", fontSize: "14px" }}>
              {transactionDetails && transactionDetails.amount
                ? "₹" + transactionDetails.amount
                : "-"}{" "}
            </span>
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
                setIsOpenFinanceVerifyModal(false);
                setTransactionDetails(null);
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
                onClick={handleFinanceVerify}
              >
                Yes
              </Button>
            )}
          </div>
        </Modal>
      </div>
    );
  },
);
export default FinanceVerify;
