import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TrainerPaymentRequestForm from "./TrainerPaymentRequestForm";
import Logo from "../../assets/acte-logo.png";
import { Col, Row } from "antd";
import "./styles.css";
import { useParams } from "react-router-dom";
import CommonSpinner from "../Common/CommonSpinner";

export default function TrainerPaymentRequestPage() {
  const paymentRequestFormRef = useRef();
  const navigate = useNavigate();

  const { trainer_id } = useParams();
  const { payment_master_id } = useParams();

  const [buttonLoading, setButtonLoading] = useState(false);

  return (
    <div className="trainer_payment_page_container">
      <div className="trainer_payment_page_card">
        <div className="trainer_payment_page_header">
          <Row align="middle" justify="space-between" gutter={[16, 16]}>
            <Col
              xs={24}
              sm={24}
              md={8}
              lg={8}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <img
                src={Logo}
                alt="Logo"
                className="trainer_payment_page_logo"
              />
              <p className="trainer_payment_page_logotext">Technologies</p>
              <p className="trainer_payment_page_logosubtext">
                Private Limited
              </p>
            </Col>

            <Col
              xs={24}
              sm={24}
              md={8}
              lg={8}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <h2 className="trainer_payment_page_heading">
                Trainer Payment Claim Form
              </h2>
            </Col>

            <Col
              xs={24}
              sm={24}
              md={8}
              lg={8}
              className="trainer_payment_page_right_col"
            >
              {/* Optional right section, intentionally left empty for balance */}
            </Col>
          </Row>
        </div>
        <div className="trainer_payment_page_divider"></div>
        <TrainerPaymentRequestForm
          ref={paymentRequestFormRef}
          isTrainer={true}
          trainer_id={trainer_id}
          payment_master_id={payment_master_id}
          setButtonLoading={setButtonLoading}
          onFormRefresh={() => {
            setButtonLoading(false);
            navigate("/claim-success");
          }}
        />

        <div
          className="trainerregistrationform_submitbuttom_container"
          style={{ marginTop: "30px" }}
        >
          {buttonLoading ? (
            <button className="trainer_registration_loadingsubmitbutton">
              <CommonSpinner />
            </button>
          ) : (
            <button
              className="trainer_registration_submitbutton"
              onClick={() =>
                paymentRequestFormRef.current?.handlePaymentRequestFormSubmit()
              }
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
