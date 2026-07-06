import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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

  const customer_id = useParams();
  const status = useParams();

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
    acknowledgeClass();
  }, []);

  const acknowledgeClass = async () => {
    // Validation
    // const status = searchParams.get("status");

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
      setLoading(false);
    }
  };

  return (
    <div className="login_mainContainer">
      {/* Confetti */}
      {isSuccess &&
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
        ))}

      <div className="congrats_card">
        <div className="success_logoContainer">
          <img src={Logo} className="success_actelogo" alt="logo" />
        </div>

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
          {loading
            ? "Submitting Acknowledgement..."
            : isSuccess
              ? "Acknowledgement Submitted"
              : ""}
        </p>

        <p className="success_descriptiontext">
          {loading
            ? "Please wait while we process your acknowledgement."
            : message}
        </p>
      </div>
    </div>
  );
}
