import React, { useState } from "react";
import { Row, Col, Upload, Modal } from "antd";
import moment from "moment";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline, IoLocationOutline } from "react-icons/io5";
import { FaWhatsapp, FaRegUser } from "react-icons/fa";
import EllipsisTooltip from "../Common/EllipsisTooltip";

const CustomerOverview = ({ customerDetails }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const handlePreview = async (file) => {
    if (file.url) {
      setPreviewImage(file.url);
      setPreviewOpen(true);
      return;
    }
    setPreviewOpen(true);
    const rawFile = file.originFileObj || file;
    const reader = new FileReader();
    reader.readAsDataURL(rawFile);
    reader.onload = () => {
      const dataUrl = reader.result;
      setPreviewImage(dataUrl);
      setPreviewOpen(true);
    };
  };

  return (
    <>
      <div className="customer_statusupdate_drawer_profileContainer">
        {customerDetails && customerDetails.profile_image ? (
          <Upload
            listType="picture-circle"
            fileList={[
              {
                uid: "-1",
                name: "profile.jpg",
                status: "done",
                url: customerDetails.profile_image, // Base64 string directly usable
              },
            ]}
            onPreview={handlePreview}
            onRemove={false}
            showUploadList={{
              showRemoveIcon: false,
            }}
            beforeUpload={() => false} // prevent auto upload
            style={{ width: 90, height: 90 }} // reduce size
            accept=".png,.jpg,.jpeg"
          ></Upload>
        ) : (
          <FaRegUser size={50} color="#333" />
        )}

        <div>
          <p className="customer_nametext">
            {" "}
            {customerDetails && customerDetails.name
              ? customerDetails.name
              : "-"}
          </p>
          {customerDetails?.student_id && (
            <p className="customer_overview_studentid_badge">
              {customerDetails && customerDetails.student_id
                ? customerDetails.student_id
                : "-"}
            </p>
          )}
          <p className="customer_coursenametext">
            {" "}
            Date Of Joining:{" "}
            <span style={{ color: "#333", fontWeight: 600 }}>
              {customerDetails && customerDetails.date_of_joining
                ? moment(customerDetails.date_of_joining).format("DD/MM/YYYY")
                : "-"}
            </span>
          </p>

          <p className="customer_coursenametext" style={{ marginTop: "6px" }}>
            Sale Executive:{" "}
            <span style={{ color: "#333", fontWeight: 600 }}>
              {`${
                customerDetails && customerDetails.lead_assigned_to_view_user_id
                  ? customerDetails.lead_assigned_to_view_user_id
                  : "-"
              } (${
                customerDetails && customerDetails.lead_assigned_to_name
                  ? customerDetails.lead_assigned_to_name
                  : "-"
              })`}
            </span>
          </p>
        </div>
      </div>

      <Row
        gutter={16}
        style={{ marginTop: "20px", padding: "0px 0px 0px 24px" }}
      >
        <Col span={12}>
          <Row>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                <FaRegCircleUser size={15} color="gray" />
                <p className="customerdetails_rowheading">Name</p>
              </div>
            </Col>
            <Col span={12}>
              <EllipsisTooltip
                text={
                  customerDetails && customerDetails.name
                    ? customerDetails.name
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
              <EllipsisTooltip
                text={
                  customerDetails && customerDetails.email
                    ? customerDetails.email
                    : "-"
                }
                smallText={true}
              />
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
              <p className="customerdetails_text">
                {customerDetails?.phone
                  ? `${
                      customerDetails?.phonecode
                        ? customerDetails.phonecode.startsWith("+")
                          ? customerDetails.phonecode
                          : `+${customerDetails.phonecode}`
                        : ""
                    } ${customerDetails.phone}`
                  : "-"}
              </p>
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
              <p className="customerdetails_text">
                {customerDetails?.whatsapp
                  ? `${
                      customerDetails?.whatsapp_phone_code
                        ? customerDetails.whatsapp_phone_code.startsWith("+")
                          ? customerDetails.whatsapp_phone_code
                          : `+${customerDetails.whatsapp_phone_code}`
                        : ""
                    } ${customerDetails.whatsapp}`
                  : "-"}
              </p>
            </Col>
          </Row>

          <Row style={{ marginTop: "12px" }}>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                <IoLocationOutline size={15} color="gray" />
                <p className="customerdetails_rowheading">Address</p>
              </div>
            </Col>
            <Col span={12}>
              <EllipsisTooltip
                text={
                  customerDetails && customerDetails.address
                    ? customerDetails.address
                    : "-"
                }
                smallText={true}
              />
            </Col>
          </Row>
        </Col>

        <Col span={12}>
          <Row>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                <p className="customerdetails_rowheading">Course</p>
              </div>
            </Col>
            <Col span={12}>
              <EllipsisTooltip
                text={
                  customerDetails && customerDetails.course_name
                    ? customerDetails.course_name
                    : "-"
                }
                smallText={true}
              />
            </Col>
          </Row>

          <Row style={{ marginTop: "12px" }}>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                <p className="customerdetails_rowheading">Course Fees</p>
              </div>
            </Col>
            <Col span={12}>
              <p className="customerdetails_text" style={{ fontWeight: 700 }}>
                {customerDetails && customerDetails.primary_fees
                  ? "₹" + customerDetails.primary_fees
                  : "-"}
              </p>
            </Col>
          </Row>
          <Row style={{ marginTop: "12px" }}>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                <p className="customerdetails_rowheading">
                  Course Fees
                  <span className="customerdetails_coursegst">{` (+Gst)`}</span>
                </p>
              </div>
            </Col>
            <Col span={12}>
              <p className="customerdetails_text" style={{ fontWeight: 700 }}>
                {customerDetails && customerDetails.total_amount
                  ? "₹" + customerDetails.total_amount
                  : "-"}
              </p>
            </Col>
          </Row>
          <Row style={{ marginTop: "12px" }}>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                <p className="customerdetails_rowheading">Balance Amount</p>
              </div>
            </Col>
            <Col span={12}>
              <p
                className="customerdetails_text"
                style={{ color: "#d32f2f", fontWeight: 700 }}
              >
                {customerDetails &&
                customerDetails.balance_amount !== undefined &&
                customerDetails.balance_amount !== null
                  ? "₹" + customerDetails.balance_amount
                  : "-"}
              </p>
            </Col>
          </Row>
          <Row style={{ marginTop: "12px" }}>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                <p className="customerdetails_rowheading">Mode Of Class</p>
              </div>
            </Col>
            <Col span={12}>
              <EllipsisTooltip
                text={
                  customerDetails?.mode_of_class_name
                    ? `${customerDetails.mode_of_class_name}${
                        customerDetails?.place_of_service_name
                          ? ` (${customerDetails.place_of_service_name})`
                          : ""
                      }`
                    : "-"
                }
                smallText={true}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <Modal
        open={previewOpen}
        title="Preview Profile"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </>
  );
};

export default CustomerOverview;
