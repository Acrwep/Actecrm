import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Row, Col, Collapse, Divider } from "antd";
import { FaRegCircleXmark } from "react-icons/fa6";
import { BsPatchCheckFill } from "react-icons/bs";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import { getBalanceAmount, priceValidator } from "../Common/Validation";

const RaiseTrainerPayment = forwardRef(({ paymentHistory }) => {
  //payment onchange functions
  const handlePaidNow = (e) => {
    const input = e.target.value;

    // Allow numbers, decimal point, or empty string
    if (!/^\d*\.?\d*$/.test(input)) return;

    setPaidNow(input); // store as string for user input

    const value = parseFloat(input); // parse for calculations
    const amt = parseFloat(selectedPaymentDetails?.balance_amount ?? "");

    const balance_amount = getBalanceAmount(
      isNaN(amt) ? 0 : amt,
      isNaN(value) ? 0 : value
    );

    if (balance_amount == 0) {
      setPaymentType("Full");
    } else if (balance_amount > 0) {
      setPaymentType("Partial");
    } else {
      setPaymentType("");
    }
    setBalanceAmount(balance_amount);

    if (paymentValidationTrigger) {
      setPaidNowError(
        priceValidator(isNaN(value) ? 0 : value, parseFloat(amt), true)
      );
    }
  };

  return (
    <div>
      <>
        {paymentHistory.length >= 1 ? (
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
              <div style={{ marginTop: "12px", marginBottom: "20px" }}>
                <Collapse
                  activeKey={collapseDefaultKey}
                  onChange={(keys) => setCollapseDefaultKey(keys)}
                  className="customer_updatepayment_history_collapse"
                >
                  {paymentHistory.map((item, index) => {
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
                                  selectedPaymentDetails.bill_raisedate
                                ).format("DD/MM/YYYY")}
                              </span>
                            </span>

                            {item.finance_status === "Rejected" ? (
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

                          {item.finance_status == "Rejected" ? (
                            <>
                              <Divider className="customer_statusupdate_divider" />
                              <div
                                style={{
                                  padding: "0px 12px 6px 12px",
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
                                          {item.reject_reason}
                                        </p>
                                      </Col>
                                    </Row>
                                  </Col>
                                </Row>
                              </div>
                            </>
                          ) : (
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
                                      {item.verified_date
                                        ? moment(item.verified_date).format(
                                            "DD/MM/YYYY"
                                          )
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
                            </Row>
                          )}
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
        <p className="customer_statusupdate_adddetails_heading">Add Details</p>

        <Row gutter={16} style={{ marginTop: "20px", marginBottom: "40px" }}>
          <Col span={8}>
            <CommonInputField
              label="Pay Amount"
              required={true}
              onChange={handlePaidNow}
              value={paidNow}
              error={paidNowError}
              errorFontSize="10px"
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Payment Type"
              required={true}
              options={paymentTypeOptions}
              value={paymentType}
              error={""}
              disabled={true}
            />
          </Col>
          <Col span={8}>
            <CommonInputField
              label="Balance Amount"
              required={true}
              value={balanceAmount}
              disabled={true}
              type="number"
            />
          </Col>
        </Row>
      </>
    </div>
  );
});
export default RaiseTrainerPayment;
