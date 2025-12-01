import React from "react";
import { Row, Col } from "antd";
import { FaRegUser } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineDateRange } from "react-icons/md";
import { BsGenderMale, BsGenderFemale } from "react-icons/bs";
import { IoLocationOutline } from "react-icons/io5";
import moment from "moment";

export default function ParticularCustomerDetails({
  customerDetails,
  isCustomerPage,
}) {
  return (
    <div>
      <div className="customer_profileContainer">
        {/* <img src={ProfileImage} className="cutomer_profileimage" /> */}
        {customerDetails && customerDetails.profile_image ? (
          <img
            src={customerDetails.profile_image}
            className="cutomer_profileimage"
          />
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
          <p className="customer_coursenametext">
            {" "}
            {customerDetails && customerDetails.course_name
              ? customerDetails.course_name
              : "-"}
          </p>
          <p className="customer_coursenametext">
            {" "}
            Created At:{" "}
            {customerDetails && customerDetails.created_date
              ? moment(customerDetails.created_date).format("DD/MM/YYYY")
              : "-"}
          </p>
        </div>
      </div>

      <Row gutter={16} style={{ marginTop: "30px" }}>
        <Col span={12}>
          <Row>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                <FaRegCircleUser size={15} color="gray" />

                <p className="customerdetails_rowheading">Name</p>
              </div>
            </Col>
            <Col span={12}>
              <p className="customerdetails_text">
                {customerDetails && customerDetails.name
                  ? customerDetails.name
                  : "-"}
              </p>
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
              <p className="customerdetails_text">
                {customerDetails && customerDetails.email
                  ? customerDetails.email
                  : "-"}
              </p>
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
                {customerDetails && customerDetails.phone
                  ? customerDetails.phone
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
                {customerDetails && customerDetails.whatsapp
                  ? customerDetails.whatsapp
                  : "-"}
              </p>
            </Col>
          </Row>
        </Col>

        <Col span={12}>
          <Row>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                <MdOutlineDateRange size={15} color="gray" />
                <p className="customerdetails_rowheading">Date Of Birth</p>
              </div>
            </Col>
            <Col span={12}>
              <p className="customerdetails_text">
                {customerDetails && customerDetails.date_of_birth
                  ? moment(customerDetails.date_of_birth).format("DD/MM/YYYY")
                  : "-"}
              </p>
            </Col>
          </Row>

          <Row style={{ marginTop: "12px" }}>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                {customerDetails && customerDetails.gender === "Male" ? (
                  <BsGenderMale size={15} color="gray" />
                ) : (
                  <BsGenderFemale size={15} color="gray" />
                )}
                <p className="customerdetails_rowheading">Gender</p>
              </div>
            </Col>
            <Col span={12}>
              <p className="customerdetails_text">
                {customerDetails && customerDetails.gender
                  ? customerDetails.gender
                  : "-"}
              </p>
            </Col>
          </Row>

          <Row style={{ marginTop: "12px" }}>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                <IoLocationOutline size={15} color="gray" />
                <p className="customerdetails_rowheading">Area</p>
              </div>
            </Col>
            <Col span={12}>
              <p className="customerdetails_text">
                {" "}
                {customerDetails && customerDetails.current_location
                  ? customerDetails.current_location
                  : "-"}
              </p>
            </Col>
          </Row>

          <Row style={{ marginTop: "12px" }}>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                <FaRegUser size={15} color="gray" />
                <p className="customerdetails_rowheading">Lead Executive</p>
              </div>
            </Col>
            <Col span={12}>
              <p className="customerdetails_text">
                {`${
                  customerDetails && customerDetails.lead_assigned_to_id
                    ? customerDetails.lead_assigned_to_id
                    : "-"
                } (${
                  customerDetails && customerDetails.lead_assigned_to_name
                    ? customerDetails.lead_assigned_to_name
                    : "-"
                })`}
              </p>
            </Col>
          </Row>
        </Col>
      </Row>

      <div className="customerdetails_coursecard">
        <div className="customerdetails_coursecard_headercontainer">
          <p>Course Details</p>
        </div>

        <div className="customerdetails_coursecard_contentcontainer">
          <Row>
            <Col span={12}>
              <Row>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Course</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {customerDetails && customerDetails.course_name
                      ? customerDetails.course_name
                      : "-"}
                  </p>
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Course Fees</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p
                    className="customerdetails_text"
                    style={{ fontWeight: 700 }}
                  >
                    {isCustomerPage == true
                      ? customerDetails && customerDetails.primary_fees
                        ? "₹" + customerDetails.primary_fees
                        : "-"
                      : customerDetails && customerDetails.course_fees
                      ? "₹" + customerDetails.course_fees
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
                  <p
                    className="customerdetails_text"
                    style={{ fontWeight: 700 }}
                  >
                    {isCustomerPage == true
                      ? customerDetails && customerDetails.payments.total_amount
                        ? "₹" + customerDetails.payments.total_amount
                        : "-"
                      : customerDetails && customerDetails.payment.total_amount
                      ? "₹" + customerDetails.payment.total_amount
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
                    <p className="customerdetails_rowheading">Next Due Date</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {customerDetails &&
                    customerDetails.next_due_date !== undefined &&
                    customerDetails.next_due_date !== null
                      ? moment(customerDetails.next_due_date).format(
                          "DD/MM/YYYY"
                        )
                      : "-"}
                  </p>
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Joining Date</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {" "}
                    {customerDetails && customerDetails.date_of_joining
                      ? moment(customerDetails.date_of_joining).format(
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
                    <p className="customerdetails_rowheading">Region</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {customerDetails && customerDetails.region_name
                      ? customerDetails.region_name
                      : "-"}
                  </p>
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Branch</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {customerDetails && customerDetails.branch_name
                      ? customerDetails.branch_name
                      : "-"}
                  </p>
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Batch Type</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {customerDetails && customerDetails.batch_timing
                      ? customerDetails.batch_timing
                      : "-"}
                  </p>
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Batch Track</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {customerDetails && customerDetails.batch_tracking
                      ? customerDetails.batch_tracking
                      : "-"}
                  </p>
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">Server</p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {customerDetails &&
                    customerDetails.is_server_required !== undefined
                      ? customerDetails.is_server_required === 1
                        ? "Required"
                        : "Not Required"
                      : "-"}
                  </p>
                </Col>
              </Row>

              <Row style={{ marginTop: "12px" }}>
                <Col span={12}>
                  <div className="customerdetails_rowheadingContainer">
                    <p className="customerdetails_rowheading">
                      Placement Support
                    </p>
                  </div>
                </Col>
                <Col span={12}>
                  <p className="customerdetails_text">
                    {customerDetails && customerDetails.placement_support
                      ? customerDetails.placement_support
                      : "-"}
                  </p>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>

      {customerDetails && customerDetails.signature_image ? (
        <div className="customerdetails_signatureContainer">
          <p style={{ fontWeight: "500", marginRight: "40px" }}>Signature</p>
          <img
            src={`${customerDetails.signature_image}`}
            alt="Customer Signature"
            className="customer_signature_image"
          />
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
