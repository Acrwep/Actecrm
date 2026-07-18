import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Skeleton } from "antd";
import Logo from "../../assets/acte-logo.png";
import { PiSealCheckFill } from "react-icons/pi";
import { PiWarningFill } from "react-icons/pi";
import "./styles.css";
import {
  acknowledgeClassCompletion,
  getCustomerById,
  sendOtpToCustomer,
  verifyCustomerOtp,
} from "../ApiService/action";
import { formatToBackendIST, emailValidator } from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import CommonInputField from "../Common/CommonInputField";
import CommonSpinner from "../Common/CommonSpinner";

export default function AcknowledgeClassCompletion() {
  const confettiTypes = [
    "confetti--animation-slow",
    "confetti--animation-medium",
    "confetti--animation-fast",
  ];

  const { customer_id } = useParams();
  const { status } = useParams();
  const navigate = useNavigate();

  const [confettiArray, setConfettiArray] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpEmailError, setOtpEmailError] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await getCustomerById(customer_id);
        if (response?.data?.data?.email) {
          setEmail(response.data.data.email);
        }
      } catch (error) {
        console.error(error);
      }
    };
    if (customer_id) {
      fetchCustomer();
    }
  }, [customer_id]);

  const handleSendOtp = async () => {
    const err = emailValidator(otpEmail);
    if (err) {
      setOtpEmailError(err);
      return;
    }

    if (otpEmail != email) {
      setOtpEmailError(
        " is not registered. Please use your registered email address",
      );
      return;
    }
    setOtpLoading(true);
    try {
      await sendOtpToCustomer({ email: otpEmail });
      CommonMessage("success", "OTP sent successfully");
      setOtpEmailError("");
      setIsOtpSent(true);
    } catch (error) {
      console.log("send OTP error", error);
      CommonMessage(
        "error",
        error?.response?.data?.message || "Failed to send OTP",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      CommonMessage("error", "Please enter OTP");
      return;
    }
    setOtpLoading(true);
    try {
      await verifyCustomerOtp({ email: otpEmail, otp: otpCode });
      CommonMessage("success", "OTP verified successfully");
      setIsOtpVerified(true);
    } catch (error) {
      console.log("verify OTP error", error);
      CommonMessage("error", error?.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  useEffect(() => {
    // Generate confetti
    setConfettiArray(
      [...Array(50)].map((_, i) => ({
        id: i,
        type: confettiTypes[i % 3],
        left: `${Math.random() * 100}vw`,
        width: `${Math.random() * 10 + 5}px`,
        height: `${Math.random() * 10 + 5}px`,
        backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
        animationDelay: `${Math.random() * 2}s`,
      })),
    );
  }, []);

  useEffect(() => {
    if (status !== undefined) {
      if (isOtpVerified) {
        acknowledgeClass();
      }
    } else {
      setLoading(false);
    }
  }, [status, isOtpVerified]);

  const acknowledgeClass = async () => {
    // Validation
    // const status = searchParams.get("status");
    setLoading(true);

    if (!customer_id) {
      setLoading(false);
      setMessage("Invalid acknowledgement link");
      setIsSuccess(false);
      return;
    }

    // Not completed
    // if (status === "notcompleted") {
    //   setMessage(
    //     "Thank you for your response. We will contact you shortly regarding the pending syllabus.",
    //   );
    //   setIsSuccess(false);
    //   return;
    // }
    try {
      const payload = {
        customer_id: customer_id,
        is_acknowledged: status,
        acknowledged_date: formatToBackendIST(new Date()),
      };
      // API Call
      await acknowledgeClassCompletion(payload);

      setMessage("Class acknowledged successfully");

      setIsSuccess(true);
    } catch (error) {
      setMessage(error?.response?.data?.details || "Something went wrong");

      setIsSuccess(false);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  return (
    <div className="login_mainContainer">
      {/* Confetti */}
      {/* {isSuccess &&
        confettiArray.map((confetti) => (
          <div
            key={confetti.id}
            className={`confetti ${confetti.type}`}
            style={{
              left: confetti.left,
              width: confetti.width,
              height: confetti.height,
              backgroundColor: confetti.backgroundColor,
              animationDelay: confetti.animationDelay,
            }}
          />
        ))} */}

      {!isOtpVerified ? (
        <div
          className="congrats_card"
          style={{
            maxWidth: "450px",
            margin: "12vh auto",
            padding: "40px 30px",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            backgroundColor: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <img
              src={Logo}
              alt="ACTE Logo"
              style={{
                width: "120px",
                marginBottom: "12px",
                objectFit: "contain",
              }}
            />
            <h2
              style={{
                color: "#1b538c",
                fontSize: "19px",
                fontWeight: "600",
                margin: "0 0 8px 0",
              }}
            >
              Customer Verification
            </h2>
            <p
              style={{
                color: "#6c757d",
                fontSize: "12px",
                margin: 0,
                textAlign: "center",
              }}
            >
              Please verify your email address to proceed.
            </p>
          </div>

          <div style={{ marginBottom: isOtpSent ? "20px" : "30px" }}>
            <CommonInputField
              label="Email Address"
              value={otpEmail}
              onChange={(e) => {
                setOtpEmail(e.target.value);
                setOtpEmailError(emailValidator(e.target.value));
              }}
              error={otpEmailError}
              disabled={isOtpSent}
              errorFontSize={"9px"}
              required={true}
            />
          </div>

          {isOtpSent && (
            <div style={{ marginBottom: "30px" }}>
              <CommonInputField
                label="Enter OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required={true}
                maxLength={6}
              />
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center" }}>
            {otpLoading ? (
              <button
                className="trainer_registration_loadingsubmitbutton"
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  padding: "10px 0",
                }}
                disabled
              >
                <CommonSpinner />
              </button>
            ) : isOtpSent ? (
              <button
                className="trainer_registration_submitbutton"
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  padding: "10px 0",
                  fontSize: "13.5px",
                }}
                onClick={handleVerifyOtp}
              >
                Verify OTP
              </button>
            ) : (
              <button
                className="trainer_registration_submitbutton"
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  padding: "10px 0",
                  fontSize: "13.5px",
                }}
                onClick={handleSendOtp}
              >
                Send OTP
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="congrats_card">
          <div className="success_logoContainer">
            <img src={Logo} className="success_actelogo" alt="logo" />
          </div>

          {status === undefined ? (
            <div>
              <p
                style={{
                  fontSize: "13px",
                  textAlign: "center",
                  color: "#333",
                }}
              >
                This is to inform you that your trainer has successfully
                completed the full course syllabus as scheduled.
              </p>

              <p
                style={{
                  fontSize: "13px",
                  marginTop: "15px",
                  textAlign: "center",
                  color: "#333",
                }}
              >
                Kindly confirm your acknowledgement by clicking one of the
                options below:
              </p>

              <div className="ack_buttons_container">
                <button
                  className="ack_btn ack_btn_success"
                  onClick={() =>
                    navigate(`/acknowledge-class-completion/${customer_id}/1`)
                  }
                >
                  100% Class Completed
                </button>
                <button
                  className="ack_btn ack_btn_danger"
                  onClick={() =>
                    navigate(`/acknowledge-class-completion/${customer_id}/0`)
                  }
                >
                  Not Yet Completed
                </button>
              </div>
            </div>
          ) : loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                marginTop: "20px",
              }}
            >
              <Skeleton.Avatar
                active
                size={65}
                shape="circle"
                style={{ marginBottom: "16px" }}
              />
              <Skeleton.Input
                active
                size="small"
                style={{
                  width: "200px",
                  marginBottom: "16px",
                  borderRadius: "4px",
                }}
              />
              <Skeleton
                active
                paragraph={{ rows: 1, width: "100%" }}
                title={false}
              />
            </div>
          ) : (
            <>
              <div className="congrats_imageContainer">
                {isSuccess ? (
                  <PiSealCheckFill
                    color={"#1b538c"}
                    size={65}
                    className="congrats_icon"
                  />
                ) : (
                  <PiWarningFill
                    color={"#dc3545"}
                    size={65}
                    className="congrats_icon"
                  />
                )}
              </div>

              <p className="success_headingtext">
                {isSuccess ? "Acknowledgement Submitted" : "Submission Failed"}
              </p>

              <p className="success_descriptiontext">{message}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
