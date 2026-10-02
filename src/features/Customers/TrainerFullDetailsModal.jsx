import React, { useState, useEffect } from "react";
import { Modal, Row, Col } from "antd";
import moment from "moment";
import CommonTable from "../Common/CommonTable";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import { getCustomerByTrainerId, getTrainerById } from "../ApiService/action";
import CommonSpinner from "../Common/CommonSpinner";

const TrainerDetailsModal = ({ open, onCancel, trainerId }) => {
  const [trainerDetails, setTrainerDetails] = useState([]);
  const [trainerDetailsLoading, setTrainerDetailsLoading] = useState(false);
  const [classTakenCount, setClassTakenCount] = useState(0);
  const [classGoingCount, setClassGoingCount] = useState(0);
  const [customerByTrainerData, setCustomerByTrainerData] = useState([]);
  const [customerByTrainerLoading, setCustomerByTrainerLoading] =
    useState(false);

  useEffect(() => {
    if (open && trainerId) {
      getTrainerDataById(trainerId);
      getCustomerByTrainerIdData(trainerId);
    } else {
      // Clear data when modal is closed
      setTrainerDetails([]);
      setCustomerByTrainerData([]);
      setClassTakenCount(0);
      setClassGoingCount(0);
    }
  }, [open, trainerId]);

  const getTrainerDataById = async (id) => {
    setTrainerDetailsLoading(true);
    try {
      const response = await getTrainerById(id);
      const details = response?.data?.data;
      setTrainerDetails([details]);
    } catch (error) {
      console.log("get trainer by id error", error);
    } finally {
      setTrainerDetailsLoading(false);
    }
  };

  const getCustomerByTrainerIdData = async (trainer_id) => {
    setCustomerByTrainerLoading(true);
    const payload = {
      trainer_id: trainer_id,
      is_class_taken: 0,
    };
    try {
      const response = await getCustomerByTrainerId(payload);
      console.log("get class taken customers by trainer_id response", response);

      setClassTakenCount(response?.data?.data?.on_boarding_count || 0);
      setClassGoingCount(response?.data?.data?.on_going_count || 0);
      setCustomerByTrainerData(response?.data?.data?.students || []);
    } catch (error) {
      setCustomerByTrainerData([]);
      console.log("get class taken customers by trainer_id error", error);
    } finally {
      setCustomerByTrainerLoading(false);
    }
  };

  const renderField = (label, value) => (
    <div style={{ marginBottom: "8px" }}>
      <span
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
      </span>
      {typeof value === "string" || typeof value === "number" ? (
        <EllipsisTooltip text={value} isViewLeadDetailsText={true} />
      ) : (
        value
      )}
    </div>
  );

  const customerByTrainerColumn = [
    {
      title: "Customer Name",
      key: "cus_name",
      dataIndex: "cus_name",
      width: 140,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Customer Email",
      key: "cus_email",
      dataIndex: "cus_email",
      width: 140,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Customer Mobile",
      key: "cus_phone",
      dataIndex: "cus_phone",
      width: 140,
    },
    {
      title: "Course Name",
      key: "course_name",
      dataIndex: "course_name",
      width: 160,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Region",
      key: "region_name",
      dataIndex: "region_name",
      width: 120,
    },
    {
      title: "Branch Name",
      key: "branch_name",
      dataIndex: "branch_name",
      width: 140,
    },
    {
      title: "Course Fees",
      key: "primary_fees",
      dataIndex: "primary_fees",
      width: 120,
      render: (text) => {
        return <p>{"₹" + text}</p>;
      },
    },
    {
      title: "Class Going %",
      key: "class_percentage",
      dataIndex: "class_percentage",
      width: 115,
      fixed: "right",
      render: (text) => {
        return <p>{text ? `${parseInt(text)}%` : `0%`}</p>;
      },
    },
    {
      title: "Trainer Commercial",
      key: "commercial",
      dataIndex: "commercial",
      fixed: "right",
      width: 160,
      render: (text) => {
        return <p>{"₹" + text}</p>;
      },
    },
  ];

  return (
    <Modal
      title="Trainer Full Details"
      open={open}
      onCancel={onCancel}
      footer={false}
      width="50%"
    >
      {trainerDetailsLoading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "40px" }}
        >
          <CommonSpinner />
        </div>
      ) : (
        <>
          {trainerDetails?.filter(Boolean).map((item, index) => (
            <Row
              gutter={24}
              style={{ marginTop: "20px" }}
              key={item.id || index}
            >
              <Col span={6}>{renderField("HR Name", item.hr_head || "-")}</Col>

              <Col span={6}>
                {renderField(
                  "Trainer Name",
                  item.name
                    ? `${item.name} (${item.trainer_code || "-"})`
                    : "-",
                )}
              </Col>

              <Col span={6}>{renderField("Email", item.email || "-")}</Col>

              <Col span={6}>
                {renderField(
                  "Mobile",
                  item.mobile
                    ? `${
                        item.mobile_phone_code
                          ? item.mobile_phone_code.startsWith("+")
                            ? item.mobile_phone_code
                            : `+${item.mobile_phone_code}`
                          : ""
                      } ${item.mobile}`
                    : "-",
                )}
              </Col>

              <Col span={6}>
                {renderField(
                  "Whatsapp",
                  item.whatsapp
                    ? `${
                        item.whatsapp_phone_code
                          ? item.whatsapp_phone_code.startsWith("+")
                            ? item.whatsapp_phone_code
                            : `+${item.whatsapp_phone_code}`
                          : ""
                      } ${item.whatsapp}`
                    : "-",
                )}
              </Col>

              <Col span={6}>
                {renderField("Location", item.location || "-")}
              </Col>

              <Col span={6}>
                {renderField("Technology", item.technology || "-")}
              </Col>

              <Col span={6}>
                {renderField(
                  "Experience",
                  item.overall_exp_year
                    ? `${item.overall_exp_year} Years`
                    : "-",
                )}
              </Col>

              <Col span={6}>
                {renderField(
                  "Relevant Experience",
                  item.relavant_exp_year
                    ? `${item.relavant_exp_year} Years`
                    : "-",
                )}
              </Col>

              <Col span={6}>
                {renderField(
                  "Availability Timing",
                  item.availability_time
                    ? moment(item.availability_time, "HH:mm:ss").format(
                        "hh:mm A",
                      )
                    : "-",
                )}
              </Col>

              <Col span={6}>
                {renderField(
                  "Secondary Timing",
                  item.secondary_time
                    ? moment(item.secondary_time, "HH:mm:ss").format("hh:mm A")
                    : "-",
                )}
              </Col>

              <Col span={6}>
                {renderField(
                  "Skills",
                  Array.isArray(item.skills) && item.skills.length > 0
                    ? item.skills.map((skill) => skill.name).join(", ")
                    : "-",
                )}
              </Col>
            </Row>
          ))}

          {/* Class Counts */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "0px",
            }}
          >
            <div className="customer_trainer_badge_mainconatiner">
              <div className="customer_trainer_onboardcount_badgecount_container">
                <p className="customer_trainer_onboardcount_badgecount">
                  Class Taken{" "}
                  <span style={{ fontWeight: 600 }}>{classTakenCount}</span>{" "}
                  Customers
                </p>
              </div>

              <div className="customer_trainer_ongoingcount_badgecount_container">
                <p className="customer_trainer_onboardcount_badgecount">
                  Class Going{" "}
                  <span style={{ fontWeight: 600 }}>{classGoingCount}</span>{" "}
                  Customers
                </p>
              </div>
            </div>
          </div>

          {/* Customer List */}
          <div style={{ marginTop: "16px" }}>
            <p className="customer_trainer_cusomer_heading">
              Class Going Customers List
            </p>

            <CommonTable
              scroll={{ x: 1200 }}
              columns={customerByTrainerColumn}
              dataSource={customerByTrainerData}
              dataPerPage={10}
              loading={customerByTrainerLoading}
              checkBox="false"
              size="small"
              className="questionupload_table"
            />
          </div>
        </>
      )}
    </Modal>
  );
};

export default TrainerDetailsModal;
