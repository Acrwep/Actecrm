import React, { useEffect, useState } from "react";
import Logo from "../../assets/acte-logo.png";
import congratsImage from "../../assets/congrats.jpg";
import { PiSealCheckFill } from "react-icons/pi";
import "./styles.css";

export default function Success() {
  const confettiTypes = [
    "confetti--animation-slow",
    "confetti--animation-medium",
    "confetti--animation-fast",
  ];

  const [confettiArray, setConfettiArray] = useState([]);

  useEffect(() => {
    // Generate new confetti array with unique keys to force re-rendering
    setConfettiArray(
      [...Array(50)].map((_, i) => ({
        id: i,
        type: confettiTypes[i % 3],
        left: `${Math.random() * 100}vw`,
        width: `${Math.random() * 10 + 5}px`,
        height: `${Math.random() * 10 + 5}px`,
        backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
        animationDelay: `${Math.random() * 2}s`,
      }))
    );
  }, []);

  return (
    <div className="login_mainContainer">
      <div className="congrats_card">
        <div className="success_logoContainer">
          <img src={Logo} className="success_actelogo" />
        </div>

        <div className="congrats_imageContainer">
          <PiSealCheckFill
            color="#1b538c"
            size={65}
            className="congrats_icon"
          />
        </div>
        <p className="success_headingtext">
          Registration Completed Successfully
        </p>
        <p className="success_descriptiontext">
          Thank you for registering with Acte Technologies. Your registration
          has been completed successfully.
        </p>
      </div>
    </div>
  );
}
