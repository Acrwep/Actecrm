import React from "react";
import { Modal, Row, Col } from "antd";
import moment from "moment";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import EllipsisTooltip from "../Common/EllipsisTooltip";

const TrainerFullDetailsModal = ({
  open,
  onClose,
  trainerDetails = [],
  width = "50%",
}) => {
  return (
    <Modal
      title={<span style={{ padding: "0px 24px" }}>Trainer Full Details</span>}
      open={open}
      onCancel={onClose}
      footer={false}
      width={width}
      className="trainerpaymentrequest_trainerfulldetails_modal"
    >
      {trainerDetails.map((item, index) => (
        <>
          <Row
            gutter={16}
            style={{ marginTop: "20px" }}
            className="trainerpaymentrequest_addrequestdrawer_rowcontainer"
          >
            <Col span={12}>
              <Row>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <FaRegCircleUser size={15} color="gray" />
                    <p className="customerdetails_rowheading">HR Name</p>
                  </div>
                </Col>
                <Col span={12}>
                  <EllipsisTooltip
                    text={item.hr_head ? item.hr_head : "-"}
                    smallText={true}
                  />
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <FaRegCircleUser size={15} color="gray" />
                    <p className="customerdetails_rowheading">Trainer Name</p>
                  </div>
                </Col>
                <Col span={12}>
                  <EllipsisTooltip
                    text={
                      item.name
                        ? `${item.name} (${
                            item.trainer_code ? item.trainer_code : "-"
                          })`
                        : "-"
                    }
                    smallText={true}
                  />
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <MdOutlineEmail size={15} color="gray" />
                    <p className="customerdetails_rowheading">Email</p>
                  </div>
                </Col>
                <Col span={12}>
                  <EllipsisTooltip text={item.email} smallText={true} />
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <IoCallOutline size={15} color="gray" />
                    <p className="customerdetails_rowheading">Mobile</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">{item.mobile}</p>
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <FaWhatsapp size={15} color="gray" />
                    <p className="customerdetails_rowheading">Whatsapp</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">{item.whatsapp}</p>
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <IoLocationOutline size={15} color="gray" />
                    <p className="customerdetails_rowheading">Location</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">{item.location}</p>
                </Col>
              </Row>
            </Col>

            <Col span={12}>
              <Row>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Technology</p>
                  </div>
                </Col>
                <Col span={12}>
                  <EllipsisTooltip text={item.technology} smallText={true} />
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Experience</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {item.overall_exp_year + " Years"}
                  </p>
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">
                      Relevent Experience
                    </p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {item.relavant_exp_year + " Years"}
                  </p>
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">
                      Avaibility Timing
                    </p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {item.availability_time
                      ? moment(item.availability_time, "HH:mm:ss").format(
                          "hh:mm A",
                        )
                      : "-"}
                  </p>
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">
                      Secondary Timing
                    </p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {item.secondary_time
                      ? moment(item.secondary_time, "HH:mm:ss").format(
                          "hh:mm A",
                        )
                      : "-"}
                  </p>
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Skills</p>
                  </div>
                </Col>
                <Col span={12}>
                  <EllipsisTooltip
                    text={item.skills.map((item) => item.name).join(", ")}
                    smallText={true}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </>
      ))}
    </Modal>
  );
};

export default TrainerFullDetailsModal;
