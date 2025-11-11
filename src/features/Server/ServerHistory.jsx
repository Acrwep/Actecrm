import React from "react";
import { Row, Col, Timeline } from "antd";
import { LuCircleCheck } from "react-icons/lu";
import { FaRegCircleXmark } from "react-icons/fa6";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import moment from "moment";

export default function ServerHistory({ data = [] }) {
  const items = data.map((item) => ({
    key: item.id,
    dot:
      item.status.includes("Details Updated") ||
      item.status.includes("Verified") ||
      item.status.includes("Approved") ||
      item.status.includes("Issued") ? (
        <LuCircleCheck size={16} style={{ color: "green" }} />
      ) : item.status.includes("Rejected") ? (
        <FaRegCircleXmark style={{ color: "#d32f2f" }} />
      ) : item.status.includes("Awaiting") ||
        item.status.includes("Passedout") ? (
        <PiClockCounterClockwiseBold size={18} style={{ color: "gray" }} />
      ) : undefined,
    label: <span style={{ whiteSpace: "nowrap" }}>{item.status}</span>,
    children: (
      <>
        {item.status === "Details Updated" ||
        item.status == "Server Approved" ? (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{" "}
              <span style={{ color: "gray" }}>{item.updated_by}</span>
            </p>
            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <p className="customer_history_details_label">
                      Server Name
                    </p>
                  </Col>
                  <Col span={12}>
                    <p className="customer_history_details_text">
                      {item.details.server_name
                        ? item.details.server_name
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <p className="customer_history_details_label">
                      Server Cost
                    </p>
                  </Col>
                  <Col span={12}>
                    <p
                      className="customer_history_details_text"
                      style={{ fontWeight: 700 }}
                    >
                      {item.details.server_cost
                        ? "₹" + item.details.server_cost
                        : "-"}
                    </p>
                  </Col>
                </Row>
              </Col>
              <Col span={12}>
                <Row gutter={4}>
                  <Col span={12}>
                    <p className="customer_history_details_label">
                      Server Duration
                    </p>
                  </Col>
                  <Col span={12}>
                    <p className="customer_history_details_text">
                      {item.details.server_duration
                        ? item.details.server_duration + " Days"
                        : "-"}
                    </p>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        ) : item.status === "Server Rejected" ||
          item.status === "Approval Rejected" ? (
          <>
            <div>
              <p className="customer_history_updateddate">
                {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
              </p>
              <p className="customer_history_updateddate">
                Updated By:{" "}
                <span style={{ color: "gray" }}>{item.updated_by}</span>
              </p>
            </div>
            <Row style={{ marginTop: "12px" }}>
              <Col span={24}>
                <Row>
                  <Col span={7}>
                    <p className="customer_history_details_label">
                      Rejection Reason
                    </p>
                  </Col>
                  <Col>
                    <p className="customer_history_details_text">
                      {item.details.reject_comment
                        ? item.details.reject_comment
                        : "-"}
                    </p>
                  </Col>
                </Row>
              </Col>
            </Row>
          </>
        ) : (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.status_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{" "}
              <span style={{ color: "gray" }}>{item.updated_by}</span>
            </p>
          </div>
        )}
      </>
    ),
  }));

  return (
    <div>
      <Timeline mode="left" items={items} />
    </div>
  );
}
