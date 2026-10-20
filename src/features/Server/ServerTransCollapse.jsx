import React, { useState } from "react";
import { Collapse, Divider, Row, Col, Button } from "antd";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import { FaRegCircleXmark } from "react-icons/fa6";
import { BsPatchCheckFill } from "react-icons/bs";
import { VscLayersActive } from "react-icons/vsc";
import { RiPassExpiredLine } from "react-icons/ri";
import moment from "moment";

const ServerTransCollapse = ({
  serverDetails,
  isApprove = false,
  handleApprovalReject,
  setIsOpenApproveModal,
  setServerTransId,
  isShowStartAndEndDate = false,
}) => {
  const [collapseDefaultKey, setCollapseDefaultKey] = useState(["1"]);

  const transactions = serverDetails?.trans_details || [];

  const renderStatus = (status) => {
    const statusConfig = {
      Pending: {
        label: "Waiting for Approval",
        color: "gray",
        icon: <PiClockCounterClockwiseBold size={14} color="gray" />,
      },
      Rejected: {
        label: "Rejected",
        color: "#d32f2f",
        icon: <FaRegCircleXmark color="#d32f2f" size={12} />,
      },
      Approved: {
        label: "Approved",
        color: "#3c9111",
        icon: <BsPatchCheckFill color="#3c9111" size={12} />,
      },
      Active: {
        label: "Active",
        color: "#3c9111",
        icon: <VscLayersActive color="#3c9111" size={16} />,
      },
      Expired: {
        label: "Expired",
        color: "#607d8b",
        icon: <RiPassExpiredLine color="#607d8b" size={12} />,
      },
    };

    const config = statusConfig[status];

    if (!config) return null;

    return (
      <div className="customer_trans_statustext_container">
        {config.icon}
        <p
          style={{
            color: config.color,
            fontWeight: 500,
            fontSize: "12px",
          }}
        >
          {config.label}
        </p>
      </div>
    );
  };

  if (transactions.length === 0) {
    return <p className="customer_trainerhistory_nodatatext">No Data found</p>;
  }

  return (
    <div style={{ marginTop: "12px", marginBottom: "20px" }}>
      <Collapse
        activeKey={collapseDefaultKey}
        onChange={setCollapseDefaultKey}
        className="assesmntresult_collapse"
      >
        {transactions.map((item, index) => (
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
                  {transactions.length > 1
                    ? `${transactions.length - index}. Server Details`
                    : "Server Details"}
                </span>

                {renderStatus(item.server_trans_status)}
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
                      <td className="text-right">{item.vendor_id || "-"}</td>
                    </tr>

                    {isShowStartAndEndDate && (
                      <>
                        <tr>
                          <td>Start Date</td>
                          <td className="text-right">
                            {item.start_date
                              ? moment(item.start_date).format("DD/MM/YYYY")
                              : "-"}
                          </td>
                        </tr>

                        <tr>
                          <td>End Date</td>
                          <td className="text-right">
                            {item.end_date
                              ? moment(item.end_date).format("DD/MM/YYYY")
                              : "-"}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {item.server_trans_status === "Rejected" && item.comments && (
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
                                Rejection Reason:
                              </p>
                            </div>
                          </Col>

                          <Col span={15}>
                            <p className="customerdetails_text">
                              {item.comments}
                            </p>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </div>
                </>
              )}

              {isApprove &&
              item.server_trans_status === "Pending" &&
              item.comments ? (
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
                              {item.comments}
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

              {isApprove && item.server_trans_status === "Pending" && (
                <div className="customer_finance_verify_buttons_container">
                  <Button
                    className="customer_finance_rejectbutton"
                    onClick={(e) => {
                      e.stopPropagation();
                      setServerTransId(item.server_trans_id);
                      handleApprovalReject();
                    }}
                  >
                    Reject
                  </Button>

                  <Button
                    className="customer_finance_verifybutton"
                    onClick={(e) => {
                      e.stopPropagation();
                      setServerTransId(item.server_trans_id);
                      setIsOpenApproveModal(true);
                    }}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </div>
          </Collapse.Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default ServerTransCollapse;
