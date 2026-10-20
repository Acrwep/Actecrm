import React, { useState } from "react";
import { Row, Col, Typography, Collapse } from "antd";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import { FaRegCircleXmark } from "react-icons/fa6";
import { BsPatchCheckFill } from "react-icons/bs";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import moment from "moment";

const { Text } = Typography;

export default function ViewServerDetails({ serverDetails }) {
  const [collapseDefaultKey, setCollapseDefaultKey] = useState(["1"]);

  const cardStyle = {
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    background: "#fff",
    padding: "12px",
  };

  const HeaderTitle = ({ icon, title }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "12px",
        borderBottom: "1px solid #f1f5f9",
        paddingBottom: "6px",
      }}
    >
      {icon}
      <span
        style={{
          fontFamily: "'Poppins', sans-serif",
          color: "#1e3a8a",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        {title}
      </span>
    </div>
  );

  const formatDateTime = (date, format = "DD/MM/YYYY") => {
    return date ? moment(date).format(format) : "-";
  };

  const renderField = (label, value) => (
    <div style={{ marginBottom: "8px" }}>
      <Text
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
      </Text>
      <EllipsisTooltip
        isViewLeadDetailsText={true}
        text={value}
        showRed={label == "Balance Amount" ? true : false}
      />
    </div>
  );

  return (
    <div style={{ padding: "2px 24px 20px 24px" }}>
      {/* <div style={cardStyle}>
        <HeaderTitle title="Server Details" />
        <Row gutter={24}>
          <Col span={6}>
            {renderField(
              "Created At",
              formatDateTime(
                serverDetails && serverDetails.created_date
                  ? serverDetails.created_date
                  : null,
              ),
            )}
          </Col>
          <Col span={6}>
            {renderField(
              "Server Name",
              serverDetails && serverDetails.server_name
                ? serverDetails.server_name
                : "-",
            )}
          </Col>
          <Col span={6}>
            {renderField(
              "Server Cost",
              serverDetails && serverDetails.server_cost
                ? `₹${serverDetails.server_cost}`
                : "-",
            )}
          </Col>
          <Col span={6}>
            {renderField(
              "Server Duration",
              serverDetails && serverDetails.duration
                ? serverDetails.duration + " " + "Days"
                : "-",
            )}
          </Col>
          <Col span={6}>
            {renderField(
              "Vendor",
              serverDetails && serverDetails.vendor_id
                ? serverDetails.vendor_id
                : "-",
            )}
          </Col>
          <Col span={6}>
            {renderField(
              "Start Date",
              formatDateTime(
                serverDetails && serverDetails.start_date
                  ? serverDetails.start_date
                  : null,
              ),
            )}
          </Col>
          <Col span={6}>
            {renderField(
              "Expiry Date",
              formatDateTime(
                serverDetails && serverDetails.end_date
                  ? serverDetails.end_date
                  : null,
              ),
            )}
          </Col>
        </Row>
      </div> */}

      {serverDetails && serverDetails.trans_details.length >= 1 ? (
        <div style={{ marginTop: "12px", marginBottom: "20px" }}>
          <Collapse
            activeKey={collapseDefaultKey}
            onChange={(keys) => setCollapseDefaultKey(keys)}
            className="assesmntresult_collapse"
          >
            {serverDetails.trans_details.map((item, index) => (
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
                      Server Details
                      {/* <span style={{ fontWeight: "500" }}>
                                {moment(item.invoice_date).format("DD/MM/YYYY")}
                              </span> */}
                    </span>

                    {item.approval_status === "Pending" ? (
                      <div className="customer_trans_statustext_container">
                        <PiClockCounterClockwiseBold size={14} color="gray" />
                        <p
                          style={{
                            color: "gray",
                            fontWeight: 500,
                            fontSize: "12px",
                          }}
                        >
                          Waiting for Approval
                        </p>
                      </div>
                    ) : item.approval_status === "Rejected" ? (
                      <div className="customer_trans_statustext_container">
                        <FaRegCircleXmark color="#d32f2f" size={12} />
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
                    ) : (
                      <div className="customer_trans_statustext_container">
                        <BsPatchCheckFill color="#3c9111" size={12} />
                        <p
                          style={{
                            color: "#3c9111",
                            fontWeight: 500,
                            fontSize: "12px",
                          }}
                        >
                          Approved
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
                          <td>Course Fees</td>
                          <td className="text-right">
                            {serverDetails.primary_fees}
                          </td>
                        </tr>

                        <tr>
                          <td>Course Fees + GST(18%)</td>
                          <td className="text-right">
                            {serverDetails.total_course_amount}
                          </td>
                        </tr>

                        <tr>
                          <td>Server Cost</td>
                          <td className="text-right">{item.server_cost}</td>
                        </tr>

                        <tr>
                          <td>Duration</td>
                          <td className="text-right">
                            {item?.server_trans_duration
                              ? `${item.server_trans_duration} Days`
                              : "-"}
                          </td>
                        </tr>

                        <tr>
                          <td>Vendor</td>
                          <td className="text-right">{item.vendor_id}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Collapse.Panel>
            ))}
          </Collapse>
        </div>
      ) : (
        <p className="customer_trainerhistory_nodatatext">No Data found</p>
      )}
    </div>
  );
}
