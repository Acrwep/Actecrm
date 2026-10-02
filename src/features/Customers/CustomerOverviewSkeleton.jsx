import React from "react";
import { Row, Col, Skeleton } from "antd";

const CustomerOverviewSkeleton = () => {
  return (
    <div style={{ padding: "24px" }}>
      {/* Profile Header */}
      <div className="customer_profileContainer">
        <Skeleton.Avatar active size={90} shape="circle" />

        <div style={{ marginLeft: "20px", flex: 1 }}>
          <Skeleton active paragraph={{ rows: 2 }} title={{ width: 150 }} />
        </div>
      </div>

      {/* Customer Details */}
      <Row gutter={16} style={{ marginTop: "30px" }}>
        {[1, 2].map((column) => (
          <Col span={12} key={column}>
            {[1, 2, 3, 4].map((i) => (
              <Row
                key={i}
                style={{
                  marginTop: i === 1 ? "0" : "12px",
                }}
              >
                <Col span={12}>
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: "80%" }}
                  />
                </Col>

                <Col span={12}>
                  <Skeleton.Input
                    active
                    size="small"
                    style={{ width: "100%" }}
                  />
                </Col>
              </Row>
            ))}
          </Col>
        ))}
      </Row>

      {/* Course Details */}
      <div className="customerdetails_coursecard" style={{ marginTop: "30px" }}>
        <div className="customerdetails_coursecard_headercontainer">
          <Skeleton.Input active size="small" style={{ width: 150 }} />
        </div>

        <div
          className="customerdetails_coursecard_contentcontainer"
          style={{ padding: "20px" }}
        >
          <Row gutter={16}>
            {[1, 2].map((column) => (
              <Col span={12} key={column}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Row
                    key={i}
                    style={{
                      marginTop: i === 1 ? "0" : "12px",
                    }}
                  >
                    <Col span={12}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "80%" }}
                      />
                    </Col>

                    <Col span={12}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "100%" }}
                      />
                    </Col>
                  </Row>
                ))}
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
};

export default CustomerOverviewSkeleton;
