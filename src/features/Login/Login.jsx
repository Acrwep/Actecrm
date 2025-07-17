import React, { useState } from "react";
import { Row, Col, Input } from "antd";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Logo from "../../assets/acte-logo.png";
import { emailValidator, passwordValidator } from "../Common/Validation";
import "./styles.css";

export default function Login() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    arrows: false,
    beforeChange: (current, next) => setActiveSlide(next),
    appendDots: (dots) => (
      <div className="custom-dots">
        <ul>{dots}</ul>
      </div>
    ),
    customPaging: (i) => (
      <div className="custom-dot">
        {activeSlide === i ? (
          <div className="dot-progress animated" />
        ) : (
          <div
            className={
              activeSlide === 0 ? "dot-circle-left" : "dot-circle-right"
            }
          />
        )}
      </div>
    ),
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationTrigger(true);

    const emailValidate = emailValidator(email);
    const passwordValidate = passwordValidator(password);

    setEmailError(emailValidate);
    setPasswordError(passwordValidate);

    if (emailValidate || passwordValidate) return;

    alert("success");
  };

  return (
    <div className="login_mainContainer">
      <div className="login_card">
        <Row gutter={12}>
          <Col span={13} className="login_card_formcolumn_mainContainer">
            <div className="login_card_formcolumn_Container">
              <img src={Logo} className="login_logo" />
              <p className="login_cardheading">Sign In</p>
              <p className="login_accesstext">to access CRM</p>

              <form className="login_formContainer">
                <div style={{ position: "relative" }}>
                  <p className="login_formlabels">Email</p>
                  <Input
                    className={
                      emailError
                        ? "login_errorinputfields"
                        : "login_inputfields"
                    }
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationTrigger) {
                        setEmailError(emailValidator(e.target.value));
                      }
                    }}
                    value={email}
                  />
                  <p
                    className={
                      emailError
                        ? "login_inputfieldserror_show"
                        : "login_inputfieldserror_hide"
                    }
                  >
                    {"Email " + emailError}
                  </p>
                </div>

                <div style={{ marginTop: "22px", position: "relative" }}>
                  <p className="login_formlabels">Password</p>
                  <Input.Password
                    className={
                      passwordError
                        ? "login_errorinputfields"
                        : "login_inputfields"
                    }
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationTrigger) {
                        setPasswordError(passwordValidator(e.target.value));
                      }
                    }}
                    value={password}
                  />
                  <p
                    className={
                      passwordError
                        ? "login_passworderror_show"
                        : "login_passworderror_hide"
                    }
                  >
                    {passwordError}
                  </p>
                </div>

                <div className="login_forgotpasswordtextContainer">
                  <p className="login_forgotpasswordtext">Forgot Password?</p>
                </div>
                <button className="login_signinbutton" onClick={handleSubmit}>
                  Sign In
                </button>
              </form>

              <p className="login_signupnow_text">
                Don't have a account?{" "}
                <span
                  style={{
                    color: "#5b69ca",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Sign up now
                </span>
              </p>
            </div>
          </Col>
          <Col span={11} className="login_card_slidercolumn_Container">
            <div style={{ width: "100%", height: "100%", margin: "0 auto" }}>
              <Slider {...settings}>
                <div>
                  <img
                    src="https://static.zohocdn.com/iam/v2/components/images/Passwordless_illustration.5c0b2b6048ba19d2dec9f1fba38291c9.svg"
                    alt="Slide 1"
                    className="slider-image"
                  />
                </div>
                <div>
                  <img
                    src="https://static.zohocdn.com/iam/v2/components/images/MFA_illustration.1afa6dddd07d21ad33a652ec63d146d6.svg"
                    alt="Slide 2"
                    className="slider-image"
                  />
                </div>
              </Slider>

              <div>
                <p
                  className="login_sliderheadings"
                  onClick={() => console.log(activeSlide)}
                >
                  MFA for all accounts
                </p>
                <p className="login_sliderdescription">
                  Secure online accounts with OneAuth 2FA. Back up OTP secrets
                  and never lose access to your accounts.
                </p>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
