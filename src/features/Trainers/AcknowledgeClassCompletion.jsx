import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Skeleton } from "antd";
import Logo from "../../assets/acte-logo.png";
import { PiSealCheckFill } from "react-icons/pi";
import { PiWarningFill } from "react-icons/pi";
import "./styles.css";
import { acknowledgeClassCompletion } from "../ApiService/action";
import { formatToBackendIST } from "../Common/Validation";

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
      acknowledgeClass();
    } else {
      setLoading(false);
    }
  }, [status]);

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
      setMessage(error?.response?.data?.message || "Something went wrong");

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
              This is to inform you that your trainer has successfully completed
              the full course syllabus as scheduled.
            </p>

            <p
              style={{
                fontSize: "13px",
                marginTop: "15px",
                textAlign: "center",
                color: "#333",
              }}
            >
              Kindly confirm your acknowledgement by clicking one of the options
              below:
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
    </div>
  );
}
