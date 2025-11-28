import React, {
  useState,
  forwardRef,
  useEffect,
  useImperativeHandle,
} from "react";
import { Row, Col, Divider, Collapse, Modal } from "antd";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import { FaRegEye } from "react-icons/fa";
import { FaRegCircleXmark } from "react-icons/fa6";
import { BsPatchCheckFill } from "react-icons/bs";
import CommonInputField from "../../Common/CommonInputField";
import CommonSelectField from "../../Common/CommonSelectField";
import CommonMuiDatePicker from "../../Common/CommonMuiDatePicker";
import ImageUploadCrop from "../../Common/ImageUploadCrop";
import {
  priceValidator,
  selectValidator,
  calculateThreePercentAmount,
  getBalanceAmount,
  validateConvenienceFee,
  formatToBackendIST,
  getConvenienceFees,
} from "../../Common/Validation";
import {
  customerDuePayment,
  inserCustomerTrack,
} from "../../ApiService/action";
import PrismaZoom from "react-prismazoom";
import moment from "moment";
import { CommonMessage } from "../../Common/CommonMessage";

const InsertPendingFees = forwardRef(
  (
    {
      pending,
      bal,
      customerDetails,
      paymentHistory,
      setButtonLoading,
      callgetCustomersApi,
    },
    ref
  ) => {
    const [collapseDefaultKey, setCollapseDefaultKey] = useState(["1"]);
    const [pendingAmount, setPendingAmount] = useState();
    const [payAmount, setPayAmount] = useState("");
    const [duplicatePayAmount, setDuplicatePayAmount] = useState("");
    const [payAmountError, setPayAmountError] = useState("");
    const [paymentMode, setPaymentMode] = useState("");
    const [paymentModeError, setPaymentModeError] = useState("");
    const convenienceFeesStatusOptions = [
      { id: 1, name: "Inclusive With Pay Amount" },
      { id: 2, name: "Exclusive With Pay Amount" },
    ];
    const [convenienceFeesStatus, setConvenienceFeesStatus] = useState(null);
    const [convenienceFeesStatusError, setConvenienceFeesStatusError] =
      useState("");
    const [convenienceFees, setConvenienceFees] = useState("");
    const [convenienceFeesError, setConvenienceFeesError] = useState("");
    const [paymentDate, setPaymentDate] = useState(null);
    const [paymentDateError, setPaymentDateError] = useState(null);
    const [paymentScreenShotBase64, setPaymentScreenShotBase64] = useState("");
    const [paymentScreenShotError, setPaymentScreenShotError] = useState("");
    const [paymentValidationTrigger, setPaymentValidationTrigger] =
      useState(false);
    const [balanceAmount, setBalanceAmount] = useState();
    const [isShowDueDate, setIsShowDueDate] = useState(true);
    const [dueDate, setDueDate] = useState(null);
    const [dueDateError, setDueDateError] = useState("");
    const [isOpenPaymentScreenshotModal, setIsOpenPaymentScreenshotModal] =
      useState(false);
    const [transactionScreenshot, setTransactionScreenshot] = useState("");

    useEffect(() => {
      setPendingAmount(pending);
      setBalanceAmount(bal);
    }, []);

    useImperativeHandle(ref, () => ({
      handlePaymentSubmit,
    }));

    const handlePaidNow = (e) => {
      const input = e.target.value;

      // Allow numbers, decimal point, or empty string
      if (!/^\d*\.?\d*$/.test(input)) return;

      // Keep the input as string
      setPayAmount(input);

      const value = parseFloat(input); // parse for calculations
      const amt = parseFloat(pendingAmount);

      if (value < amt || isNaN(value) || input === "" || input === null) {
        setIsShowDueDate(true);
      } else {
        setIsShowDueDate(false);
        setDueDate(null);
        setDueDateError("");
      }

      setBalanceAmount(
        getBalanceAmount(isNaN(amt) ? 0 : amt, isNaN(value) ? 0 : value)
      );

      if (paymentMode == 2 || paymentMode == 5) {
        const conve_fees = getConvenienceFees(isNaN(value) ? 0 : value);
        setConvenienceFees(conve_fees);
      } else {
        setConvenienceFees(0);
      }

      if (paymentValidationTrigger) {
        setPayAmountError(
          priceValidator(isNaN(value) ? 0 : value, parseFloat(amt))
        );
      }
    };

    const handlePaymentType = (e) => {
      const value = e.target.value;
      setPaymentMode(value);
      setConvenienceFeesStatus(null);
      setConvenienceFees(0);

      if (paymentValidationTrigger) {
        setPaymentModeError(selectValidator(value));
      }

      //handle balance amount
      if (
        payAmount < pendingAmount ||
        isNaN(payAmount) ||
        payAmount == "" ||
        payAmount == null
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
          isNaN(payAmount) ? 0 : payAmount
        )
      );

      //handle convenience fees
      if (value == 2 || value == 5) {
        const conve_fees = getConvenienceFees(
          payAmount ? parseInt(payAmount) : 0
        );
        setConvenienceFees(conve_fees);
      } else {
        setConvenienceFees(0);
      }
    };

    // const handleConvenienceFeesStatus = (e) => {
    //   const value = e.target.value;
    //   setConvenienceFeesStatus(value);
    //   setConvenienceFees(0);
    //   setConvenienceFeesStatusError(selectValidator(value));
    //   // -------------inclusive--------------
    //   if (value == 1) {
    //     setPayAmount(duplicatePayAmount);
    //     const threePercentAmount =
    //       calculateThreePercentAmount(duplicatePayAmount);
    //     console.log("threePercentAmount", threePercentAmount);

    //     //handle balance amount
    //     const pay = parseFloat(duplicatePayAmount); // parse for calculations
    //     const amt = parseFloat(pendingAmount);

    //     if (
    //       pay < amt ||
    //       isNaN(pay) ||
    //       duplicatePayAmount === "" ||
    //       duplicatePayAmount === null
    //     ) {
    //       setIsShowDueDate(true);
    //     } else {
    //       setIsShowDueDate(false);
    //       setDueDate(null);
    //       setDueDateError("");
    //     }

    //     setBalanceAmount(
    //       getBalanceAmount(isNaN(amt) ? 0 : amt, isNaN(pay) ? 0 : pay)
    //     );
    //   }
    //   // -------------exclusive--------------
    //   if (value == 2 && (paymentMode == 2 || paymentMode == 5)) {
    //     setConvenienceFeesError("");
    //     const threePercentAmount =
    //       calculateThreePercentAmount(duplicatePayAmount);
    //     setConvenienceFees(threePercentAmount);
    //     //handle payamount
    //     const updatePayAmount = duplicatePayAmount - threePercentAmount;
    //     setPayAmount(updatePayAmount);

    //     //handle balance amount
    //     const pay = parseFloat(updatePayAmount); // parse for calculations
    //     const amt = parseFloat(pendingAmount);

    //     if (pay < amt || isNaN(pay) || input === "" || input === null) {
    //       setIsShowDueDate(true);
    //     } else {
    //       setIsShowDueDate(false);
    //       setDueDate(null);
    //       setDueDateError("");
    //     }

    //     setBalanceAmount(
    //       getBalanceAmount(isNaN(amt) ? 0 : amt, isNaN(pay) ? 0 : pay)
    //     );
    //   }
    // };

    // const handleConvenienceFees = (e) => {
    //   const input = e.target.value;

    //   // Allow numbers, decimal point, or empty string
    //   if (!/^\d*\.?\d*$/.test(input)) return;

    //   // Keep the input as string
    //   setConvenienceFees(input);
    //   setConvenienceFeesError(validateConvenienceFee(payAmount, input));
    // };

    const handlePaymentSubmit = async () => {
      setPaymentValidationTrigger(true);
      const paymentTypeValidate = selectValidator(paymentMode);
      const paymentDateValidate = selectValidator(paymentDate);
      const payAmountValidate = priceValidator(
        parseInt(payAmount),
        parseInt(pendingAmount)
      );

      const screenshotValidate = selectValidator(paymentScreenShotBase64);
      let dueDateValidate;

      if (isShowDueDate) {
        dueDateValidate = selectValidator(dueDate);
      } else {
        dueDateValidate = "";
      }

      setPaymentModeError(paymentTypeValidate);
      setPayAmountError(payAmountValidate);
      setPaymentDateError(paymentDateValidate);
      setPaymentScreenShotError(screenshotValidate);
      setDueDateError(dueDateValidate);

      if (
        paymentTypeValidate ||
        payAmountValidate ||
        paymentDateValidate ||
        screenshotValidate ||
        dueDateValidate
      )
        return;

      setButtonLoading(true);

      const today = new Date();

      // setTimeout(() => {
      //   setInvoiceButtonLoading(false);
      //   setButtonLoading(false);
      // }, 300);

      const payload = {
        payment_master_id: customerDetails.payment_master_id,
        invoice_date: formatToBackendIST(paymentDate),
        paid_amount: payAmount,
        convenience_fees: convenienceFees,
        balance_amount: balanceAmount,
        paymode_id: paymentMode,
        payment_screenshot: paymentScreenShotBase64,
        payment_status: "Verify Pending",
        next_due_date: dueDate ? formatToBackendIST(dueDate) : null,
        created_date: formatToBackendIST(today),
        paid_date: formatToBackendIST(paymentDate),
      };

      console.log("payload", payload);
      try {
        await customerDuePayment(payload);
        setTimeout(() => {
          handleCustomerTrack("Part Payment Added");
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        console.log("part payment error", error);
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

      const payload = {
        customer_id: customerDetails.id,
        status: updatestatus,
        updated_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
        status_date: formatToBackendIST(today),
      };

      try {
        await inserCustomerTrack(payload);
        setTimeout(() => {
          setButtonLoading(false);
          callgetCustomersApi();
        }, 300);
      } catch (error) {
        console.log("customer track error", error);
      }
    };

    return (
      <div>
        <div style={{ padding: "0px 24px" }}>
          <div className="customerdetails_coursecard">
            <div className="customerdetails_coursecard_headercontainer">
              <p>Tax Details</p>
            </div>

            <div className="customerdetails_coursecard_contentcontainer">
              <Row>
                <Col span={12}>
                  <Row>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">
                          Course Fees
                        </p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p
                        className="customerdetails_text"
                        style={{ fontWeight: 700 }}
                      >
                        {customerDetails && customerDetails.course_fees
                          ? "₹" + customerDetails.course_fees
                          : "-"}
                      </p>
                    </Col>
                  </Row>

                  <Row style={{ marginTop: "12px" }}>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">Gst Amount</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p className="customerdetails_text">
                        {customerDetails?.payment?.gst_amount ? (
                          <>
                            ₹{customerDetails.payment.gst_amount}{" "}
                            <span style={{ fontSize: "11px" }}>
                              ({customerDetails.payment.tax_type || "-"})
                            </span>
                          </>
                        ) : (
                          "-"
                        )}
                      </p>
                    </Col>
                  </Row>
                </Col>

                <Col span={12}>
                  <Row>
                    <Col span={12}>
                      <div className="customerdetails_rowheadingContainer">
                        <p className="customerdetails_rowheading">Total Fees</p>
                      </div>
                    </Col>
                    <Col span={12}>
                      <p
                        className="customerdetails_text"
                        style={{ fontWeight: 700 }}
                      >
                        {customerDetails && customerDetails.payment.total_amount
                          ? "₹" + customerDetails.payment.total_amount
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
                        style={{ fontWeight: 700, color: "rgb(211, 47, 47)" }}
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
        </div>

        <Divider className="customer_statusupdate_divider" />

        <p className="leadmanager_paymentdetails_drawer_heading">
          Transaction History
        </p>

        <div style={{ padding: "0px 24px" }}>
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
                          Transaction Date -{" "}
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
                            <p style={{ color: "#d32f2f", fontWeight: 500 }}>
                              Rejected
                            </p>
                          </div>
                        ) : (
                          <div className="customer_trans_statustext_container">
                            <BsPatchCheckFill color="#3c9111" />
                            <p style={{ color: "#3c9111", fontWeight: 500 }}>
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
                        style={{ marginTop: "6px", marginBottom: "8px" }}
                      >
                        <Col span={12}>
                          <Row>
                            <Col span={12}>
                              <div className="customerdetails_rowheadingContainer">
                                <p className="customerdetails_rowheading">
                                  Invoice Date
                                </p>
                              </div>
                            </Col>
                            <Col span={12}>
                              <p className="customerdetails_text">
                                {moment(item.invoice_date).format("DD/MM/YYYY")}
                              </p>
                            </Col>
                          </Row>

                          <Row style={{ marginTop: "12px" }}>
                            <Col span={12}>
                              <div className="customerdetails_rowheadingContainer">
                                <p className="customerdetails_rowheading">
                                  Invoice Number
                                </p>
                              </div>
                            </Col>
                            <Col span={12}>
                              <p className="customerdetails_text">
                                {item.invoice_number}
                              </p>
                            </Col>
                          </Row>

                          <Row style={{ marginTop: "12px" }}>
                            <Col span={12}>
                              <div className="customerdetails_rowheadingContainer">
                                <p className="customerdetails_rowheading">
                                  Payment Mode
                                </p>
                              </div>
                            </Col>
                            <Col span={12}>
                              <p className="customerdetails_text">
                                {item.payment_mode}
                              </p>
                            </Col>
                          </Row>

                          <Row style={{ marginTop: "12px" }}>
                            <Col span={12}>
                              <div className="customerdetails_rowheadingContainer">
                                <p className="customerdetails_rowheading">
                                  Payment Screenshot
                                </p>
                              </div>
                            </Col>
                            <Col span={12}>
                              <button
                                className="pendingcustomer_paymentscreenshot_viewbutton"
                                onClick={() => {
                                  setIsOpenPaymentScreenshotModal(true);
                                  setTransactionScreenshot(
                                    item.payment_screenshot
                                  );
                                }}
                              >
                                <FaRegEye size={16} /> View screenshot
                              </button>
                            </Col>
                          </Row>
                        </Col>

                        <Col span={12}>
                          <Row>
                            <Col span={12}>
                              <div className="customerdetails_rowheadingContainer">
                                <p className="customerdetails_rowheading">
                                  Base Amount
                                </p>
                              </div>
                            </Col>
                            <Col span={12}>
                              <p className="customerdetails_text">
                                {"₹" + item.amount}
                              </p>
                            </Col>
                          </Row>
                          <Row style={{ marginTop: "12px" }}>
                            <Col span={12}>
                              <div className="customerdetails_rowheadingContainer">
                                <p className="customerdetails_rowheading">
                                  Convenience Fees
                                </p>
                              </div>
                            </Col>
                            <Col span={12}>
                              <p className="customerdetails_text">
                                {"₹" + item.convenience_fees}
                              </p>
                            </Col>
                          </Row>

                          <Row style={{ marginTop: "12px" }}>
                            <Col span={12}>
                              <div className="customerdetails_rowheadingContainer">
                                <p className="customerdetails_rowheading">
                                  Paid Amount{" "}
                                  <span className="customerdetails_coursegst">{` (Total)`}</span>
                                </p>
                              </div>
                            </Col>
                            <Col span={12}>
                              <p
                                className="customerdetails_text"
                                style={{
                                  color: "#3c9111",
                                  fontWeight: 700,
                                }}
                              >
                                {"₹" + item.paid_amount}
                              </p>
                            </Col>
                          </Row>

                          <Row style={{ marginTop: "12px" }}>
                            <Col span={12}>
                              <div className="customerdetails_rowheadingContainer">
                                <p className="customerdetails_rowheading">
                                  Nxt Due Date
                                </p>
                              </div>
                            </Col>
                            <Col span={12}>
                              <p className="customerdetails_text">
                                {item.next_due_date
                                  ? moment(item.next_due_date).format(
                                      "DD/MM/YYYY"
                                    )
                                  : "-"}{" "}
                              </p>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </div>

                    {item.payment_status == "Rejected" && (
                      <>
                        <Divider className="customer_statusupdate_divider" />
                        <div style={{ padding: "0px 12px 6px 12px" }}>
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
            <p className="customer_trainerhistory_nodatatext">No Data found</p>
          )}
        </div>

        <Divider className="customer_statusupdate_divider" />

        <p className="leadmanager_paymentdetails_drawer_heading">
          Payment Info
        </p>

        <Row gutter={16} className="leadmanager_paymentdetails_drawer_rowdiv">
          <Col span={8} style={{ marginTop: "16px" }}>
            <CommonInputField
              label="Pending Amount"
              required={true}
              value={pendingAmount}
              disabled={true}
            />
          </Col>
          <Col span={8} style={{ marginTop: "16px" }}>
            <CommonInputField
              label="Pay Amount"
              required={true}
              onChange={handlePaidNow}
              value={payAmount}
              error={payAmountError}
              errorFontSize="10px"
            />
          </Col>
          <Col span={8} style={{ marginTop: "16px" }}>
            <CommonSelectField
              label="Payment Mode"
              required={true}
              options={[
                { id: 1, name: "Cash" },
                { id: 2, name: "Card" },
                { id: 3, name: "Bank" },
                { id: 4, name: "UPI" },
                { id: 5, name: "Razorpay" },
                { id: 6, name: "Razorpay - UPI" },
              ]}
              onChange={handlePaymentType}
              value={paymentMode}
              error={paymentModeError}
            />
          </Col>

          <Col span={8} style={{ marginTop: "34px" }}>
            <CommonInputField
              label="Conv. Fee"
              required={true}
              value={convenienceFees}
              type="number"
              disabled={true}
            />
          </Col>

          <Col span={8} style={{ marginTop: "34px" }}>
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
            />
          </Col>

          <Col span={8} style={{ marginTop: "34px" }}>
            <ImageUploadCrop
              label="Payment Screenshot"
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
                  fontSize: "12px",
                  color: "#d32f2f",
                  marginTop: 4,
                }}
              >
                {`Payment Screenshot ${paymentScreenShotError}`}
              </p>
            )}
          </Col>
        </Row>

        <Divider className="leadmanger_paymentdrawer_divider" />

        <p className="leadmanager_paymentdetails_drawer_heading">
          Balance Amount Details
        </p>

        <Row
          gutter={16}
          style={{ marginTop: "20px", marginBottom: "30px" }}
          className="leadmanager_paymentdetails_drawer_rowdiv"
        >
          <Col span={8}>
            <CommonInputField
              label="Balance Amount"
              required={true}
              value={balanceAmount}
              disabled={true}
              type="number"
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
              />
            </Col>
          ) : (
            ""
          )}
        </Row>

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
      </div>
    );
  }
);

export default InsertPendingFees;
