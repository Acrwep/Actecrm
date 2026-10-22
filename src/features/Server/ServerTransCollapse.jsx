import React, { useState } from "react";
import { Collapse, Divider, Row, Col, Button, Tooltip, Modal } from "antd";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import { FaRegCircleXmark } from "react-icons/fa6";
import { BsPatchCheckFill } from "react-icons/bs";
import { VscLayersActive } from "react-icons/vsc";
import { RiPassExpiredLine } from "react-icons/ri";
import { FaRegEye } from "react-icons/fa";
import moment from "moment";
import { getPreviousServerHistory } from "../ApiService/action";
import CommonSpinner from "../Common/CommonSpinner";
import CommonTable from "../Common/CommonTable";
import EllipsisTooltip from "../Common/EllipsisTooltip";

const ServerTransCollapse = ({
  serverDetails,
  isApprove = false,
  handleApprovalReject,
  setIsOpenApproveModal,
  setServerTransId,
  isShowStartAndEndDate = false,
}) => {
  const transactions = serverDetails?.trans_details || [];

  const [collapseDefaultKey, setCollapseDefaultKey] = useState(["1"]);
  const [loadingServerTransId, setLoadingServerTransId] = useState(null);
  const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const columns = [
    {
      title: "Candidate Name",
      key: "name",
      dataIndex: "name",
      width: 130,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Mobile",
      key: "phone",
      dataIndex: "phone",
      width: 100,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Purchased At",
      key: "start_date",
      dataIndex: "start_date",
      width: 100,
      width: 100,
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Server Cost",
      key: "server_cost",
      dataIndex: "server_cost",
      width: 100,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Duration",
      key: "duration",
      dataIndex: "duration",
      width: 90,
      render: (text) => {
        return <p>{text ? `${text} Days` : "-"}</p>;
      },
    },
    {
      title: "Vendor",
      key: "vendor_id",
      dataIndex: "vendor_id",
      width: 80,
      render: (text, record) => {
        return <EllipsisTooltip text={text ? `${text}` : "-"} />;
      },
    },
  ];

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

  const getPreviousServerHistoryData = async () => {
    setTableLoading(true);
    try {
      const response = await getPreviousServerHistory({
        course_id: serverDetails?.course_id || null,
      });
      console.log("previous server history response", response);
      setHistoryData(response?.data?.data || []);
      setIsOpenHistoryModal(true);
    } catch (error) {
      setHistoryData([]);
      console.log("previous server history error", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.details ||
        "Failed to get history";

      CommonMessage("error", errorMessage);
    } finally {
      setTableLoading(false);
      setLoadingServerTransId(null);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    setPagination({
      page: page,
      limit: limit,
    });
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
                      <td>Trainer Commercial</td>
                      <td className="text-right">
                        {serverDetails.trainer_commercial
                          ? `${serverDetails.trainer_commercial} ${serverDetails.trainer_commercial_percentage ? `(${serverDetails?.trainer_commercial_percentage}%)` : ""}`
                          : "Trainer Not Assigned Yet"}
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          Server Cost
                          <Tooltip
                            title="View Previous History"
                            placement="top"
                            trigger={["click", "hover"]}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                cursor:
                                  loadingServerTransId === item.server_trans_id
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                              onClick={async (e) => {
                                e.stopPropagation();

                                if (loadingServerTransId !== null) return;
                                setLoadingServerTransId(item.server_trans_id);
                                getPreviousServerHistoryData();
                              }}
                            >
                              {loadingServerTransId === item.server_trans_id ? (
                                <CommonSpinner color="#333" size={14} />
                              ) : (
                                <FaRegEye
                                  style={{
                                    color: "#5b69ca",
                                    fontSize: "14px",
                                  }}
                                />
                              )}
                            </span>
                          </Tooltip>
                        </span>
                      </td>

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

      <Modal
        title={
          <span style={{ fontSize: "15px", fontWeight: 600 }}>
            Previous History of the Server
          </span>
        }
        open={isOpenHistoryModal}
        onCancel={() => {
          setIsOpenHistoryModal(false);
          setHistoryData([]);
        }}
        footer={false}
        width="50%"
      >
        <div style={{ marginTop: "12px" }}>
          <CommonTable
            scroll={{ x: 600 }}
            columns={columns}
            dataSource={historyData}
            dataPerPage={10}
            loading={tableLoading}
            checkBox="false"
            size="small"
            className="questionupload_table"
            onPaginationChange={handlePaginationChange} // callback to fetch new data
            limit={pagination.limit} // page size
            page_number={pagination.page} // current page
            totalPageNumber={pagination.total} // total rows
          />
        </div>
      </Modal>
    </div>
  );
};

export default ServerTransCollapse;
