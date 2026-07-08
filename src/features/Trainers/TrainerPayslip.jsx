import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Modal, Button, Row, Col } from "antd";
import { moveTrainerPaymentToPaid } from "../ApiService/action";
import { formatToBackendIST, selectValidator } from "../Common/Validation";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import { CommonMessage } from "../Common/CommonMessage";
import moment from "moment";
import CommonDatePicker from "../Common/CommonDatePicker";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";

const TrainerPayslip = forwardRef(
  ({ selectedPaymentDetails, setButtonLoading }, ref) => {
    //details states
    const [paymentDate, setPaymentDate] = useState(null);
    const [paymentDateError, setPaymentDateError] = useState("");
    const [paymentMode, setPaymentMode] = useState("");
    const [paymentModeError, setPaymentModeError] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [transactionIdError, setTransactionIdError] = useState("");
    const [validationTrigger, setValidationTrigger] = useState("");

    //modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    useImperativeHandle(ref, () => ({
      handlePaid,
    }));

    const handlePaid = async () => {
      setValidationTrigger(true);
      // setCurrentIndex(0);
      // setIsModalOpen(true);

      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);

      const paymentDateValidate = selectValidator(paymentDate);
      const paymentModeValidate = selectValidator(paymentMode);
      const transactionIdValidate = selectValidator(transactionId);

      setPaymentDateError(paymentDateValidate);
      setPaymentModeError(paymentModeValidate);
      setTransactionIdError(transactionIdValidate);

      if (paymentDateValidate || paymentModeValidate || transactionIdValidate)
        return;

      console.log("selectedPaymentDetails", selectedPaymentDetails);

      setButtonLoading(true);

      const payload = {
        trainer_payment_id: selectedPaymentDetails?.id,
        paid_amount: selectedPaymentDetails?.request_amount,
        payment_type: "Fully Paid",
        paid_date: formatToBackendIST(paymentDate),
        paid_by: convertAsJson?.user_id,
        transaction_id: transactionId,
        payment_mode: paymentMode,
      };
      try {
        await moveTrainerPaymentToPaid(payload);
        CommonMessage("success", "Moved to Paid Successfully");

        setButtonLoading(false);
      } catch (error) {
        setButtonLoading(false);
        console.log("move to paid error", error);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleClose = () => {
      setIsModalOpen(false);
    };

    const students =
      selectedPaymentDetails?.students?.length > 0
        ? selectedPaymentDetails.students
        : [null];

    const currentStudent = students[currentIndex];
    const totalStudents = students.length;

    const handleNext = () => {
      if (currentIndex < totalStudents - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    };

    const handlePrev = () => {
      if (currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    };

    return (
      <div>
        <p
          style={{
            fontWeight: 600,
            color: "#333",
            fontSize: "15px",
          }}
        >
          Add Details
        </p>

        <Row gutter={12} style={{ marginTop: "12px", marginBottom: "40px" }}>
          <Col span={8}>
            <CommonMuiDatePicker
              label={"Payment Date"}
              required={true}
              onChange={(value) => {
                setPaymentDate(value);
                if (validationTrigger) {
                  setPaymentDateError(selectValidator(value));
                }
              }}
              value={paymentDate}
              error={paymentDateError}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label={"Payment Mode"}
              required={true}
              options={[
                { id: "Bank - NEFT/IMPS", name: "Bank - NEFT/IMPS" },
                { id: "UPI", name: "UPI" },
              ]}
              onChange={(e) => {
                setPaymentMode(e.target.value);
                if (validationTrigger) {
                  setPaymentModeError(selectValidator(e.target.value));
                }
              }}
              value={paymentMode}
              error={paymentModeError}
            />
          </Col>
          <Col span={8}>
            <CommonInputField
              label={"Reference Id"}
              required={true}
              onChange={(e) => {
                setTransactionId(e.target.value);
                if (validationTrigger) {
                  setTransactionIdError(selectValidator(e.target.value));
                }
              }}
              value={transactionId}
              error={transactionIdError}
              errorFontSize={"10px"}
            />
          </Col>
        </Row>
        <Modal
          title={null}
          open={isModalOpen}
          onCancel={handleClose}
          footer={null}
          width={850}
          centered
          styles={{ body: { padding: "32px" } }}
        >
          <div
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              color: "#000",
            }}
          >
            {/* Header */}
            <div
              style={{
                border: "1px solid #f39c12",
                backgroundColor: "#fef8ea",
                textAlign: "center",
                padding: "10px",
                fontWeight: "600",
                fontSize: "16px",
                marginBottom: "16px",
                color: "#333",
              }}
            >
              FREELANCER PAYMENT SLIP
            </div>

            <div
              style={{
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex" }}>
                <span style={{ width: "120px", fontWeight: "600" }}>
                  Institute Name:
                </span>
                <span style={{ fontWeight: "600" }}>
                  ACTE TECHNOLOGIES PRIVATE LIMITED
                </span>
              </div>
              <div style={{ display: "flex" }}>
                <span style={{ width: "120px", fontWeight: "600" }}>
                  CST No:
                </span>
                <span style={{ fontWeight: "600" }}>33AAQCA7617L1Z9</span>
              </div>
            </div>

            {/* General Details Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "24px",
                border: "1px solid #000",
              }}
            >
              <tbody>
                <tr>
                  <td style={tdHeaderStyle}>Freelancer Name:</td>
                  <td style={tdValueStyle}>
                    {selectedPaymentDetails?.trainer_name || "-"}
                  </td>
                  <td style={tdHeaderStyle}>Technology / Course Handled</td>
                  <td style={tdValueStyle}>{currentStudent?.course || "-"}</td>
                </tr>
                <tr>
                  <td style={tdHeaderStyle}>ID:</td>
                  <td style={tdValueStyle}>
                    {selectedPaymentDetails?.trainer_id || "-"}
                  </td>
                  <td style={tdHeaderStyle}>Total Classes Conducted</td>
                  <td style={tdValueStyle}>-</td>
                </tr>
                <tr>
                  <td style={tdHeaderStyle}>Course:</td>
                  <td style={tdValueStyle}>-</td>
                  <td style={tdHeaderStyle}>Total Hours Taken</td>
                  <td style={tdValueStyle}>-</td>
                </tr>
                <tr>
                  <td style={tdHeaderStyle}>Classes Taken:</td>
                  <td style={tdValueStyle}>
                    -{" "}
                    <span
                      style={{
                        float: "right",
                        color: "gray",
                        fontSize: "10px",
                        fontWeight: "normal",
                      }}
                    >
                      Online / Offline
                    </span>
                  </td>
                  <td style={tdHeaderStyle}>Batch Name(s)</td>
                  <td style={tdValueStyle}>
                    {currentStudent?.batch_name || "-"}
                  </td>
                </tr>
                <tr>
                  <td style={tdHeaderStyle}>Payment Date:</td>
                  <td style={tdValueStyle}>{moment().format("DD/MM/YYYY")}</td>
                  <td style={tdHeaderStyle}>Mode</td>
                  <td style={tdValueStyle}>{currentStudent?.mode || "-"}</td>
                </tr>
                <tr>
                  <td style={tdHeaderStyle}>Designation</td>
                  <td style={tdValueStyle}>Freelancer</td>
                  <td style={tdHeaderStyle}>Training Period</td>
                  <td style={tdValueStyle}>-</td>
                </tr>
                <tr>
                  <td style={tdHeaderStyle}>Department</td>
                  <td style={tdValueStyle}>Training</td>
                  <td style={tdHeaderStyle}>Earnings</td>
                  <td style={tdValueStyle}>-</td>
                </tr>
              </tbody>
            </table>

            {/* Earnings Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "24px",
                border: "1px solid #000",
              }}
            >
              <tbody>
                <tr>
                  <td
                    rowSpan={8}
                    style={{
                      ...tdHeaderStyle,
                      width: "22%",
                      textAlign: "center",
                      fontSize: "14px",
                    }}
                  >
                    Earnings
                  </td>
                  <td
                    style={{
                      ...tdHeaderStyle,
                      backgroundColor: "#dbe8f4",
                      textAlign: "center",
                      width: "39%",
                    }}
                  >
                    Particulars
                  </td>
                  <td
                    style={{
                      ...tdHeaderStyle,
                      backgroundColor: "#dbe8f4",
                      width: "39%",
                    }}
                  ></td>
                </tr>
                <tr>
                  <td style={tdHeaderStyle}>Training Fees</td>
                  <td style={tdValueStyle}>-</td>
                </tr>
                <tr>
                  <td style={tdHeaderStyle}>Incentives</td>
                  <td style={tdValueStyle}>-</td>
                </tr>
                <tr>
                  <td style={tdHeaderStyle}>Bonus</td>
                  <td style={tdValueStyle}>-</td>
                </tr>
                <tr>
                  <td style={tdHeaderStyle}>Gross Amount</td>
                  <td style={tdValueStyle}>-</td>
                </tr>
                <tr>
                  <td style={tdHeaderStyle}>TDS</td>
                  <td style={tdValueStyle}>-</td>
                </tr>
                <tr>
                  <td style={tdHeaderStyle}>Other Deductions</td>
                  <td style={tdValueStyle}>-</td>
                </tr>
                <tr>
                  <td style={{ ...tdHeaderStyle, backgroundColor: "#fff4ce" }}>
                    Net Pay
                  </td>
                  <td style={{ ...tdValueStyle, backgroundColor: "#fff4ce" }}>
                    -
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Payment Information Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "30px",
                border: "1px solid #000",
              }}
            >
              <tbody>
                <tr>
                  <td
                    rowSpan={4}
                    style={{
                      ...tdHeaderStyle,
                      width: "22%",
                      textAlign: "center",
                      fontSize: "14px",
                    }}
                  >
                    Payment Information
                  </td>
                  <td
                    style={{
                      ...tdHeaderStyle,
                      backgroundColor: "#dbe8f4",
                      textAlign: "center",
                      width: "39%",
                    }}
                  >
                    Particulars
                  </td>
                  <td
                    style={{
                      ...tdHeaderStyle,
                      backgroundColor: "#dbe8f4",
                      width: "39%",
                    }}
                  ></td>
                </tr>
                <tr>
                  <td style={tdHeaderStyle}>Payment Mode</td>
                  <td style={tdValueStyle}>-</td>
                </tr>
                <tr>
                  <td style={tdHeaderStyle}>Transaction Reference No</td>
                  <td style={tdValueStyle}>-</td>
                </tr>
                <tr>
                  <td style={tdHeaderStyle}>Payment Status</td>
                  <td style={tdValueStyle}>-</td>
                </tr>
              </tbody>
            </table>

            {/* Declaration Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "30px",
                border: "1px solid #000",
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      ...tdHeaderStyle,
                      width: "22%",
                      backgroundColor: "#e2eef9",
                      textAlign: "center",
                    }}
                  >
                    Declaration
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "10px",
                      fontSize: "11px",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    This is a system-generated freelancer payment slip issued
                    for professional training services rendered to the institute
                    during the mentioned period.
                  </td>
                </tr>
              </tbody>
            </table>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
                fontWeight: "600",
                padding: "0 10px",
              }}
            >
              <div>Date:</div>
              <div>Authorized Signatory</div>
            </div>

            {/* Pagination Controls */}
            {totalStudents > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "40px",
                  borderTop: "1px solid #eee",
                  paddingTop: "20px",
                }}
              >
                <Button onClick={handlePrev} disabled={currentIndex === 0}>
                  Previous
                </Button>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>
                  {currentIndex + 1} of {totalStudents}
                </span>
                <Button
                  onClick={handleNext}
                  disabled={currentIndex === totalStudents - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </Modal>
      </div>
    );
  },
);

const tdHeaderStyle = {
  border: "1px solid #000",
  padding: "6px 8px",
  fontWeight: "600",
};

const tdValueStyle = {
  border: "1px solid #000",
  padding: "6px 8px",
};

export default TrainerPayslip;
