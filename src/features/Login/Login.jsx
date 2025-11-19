import React, { useState, useEffect } from "react";
import { Row, Col, Input, Checkbox } from "antd";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Logo from "../../assets/acte-logo.png";
import { passwordValidator, addressValidator } from "../Common/Validation";
import "./styles.css";
import CommonInputField from "../Common/CommonInputField";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { FiEyeOff, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  getUserDownline,
  getUserPermissions,
  LoginApi,
} from "../ApiService/action";
import CommonSpinner from "../Common/CommonSpinner";
import { CommonMessage } from "../Common/CommonMessage";
import {
  storeChildUsers,
  storeDownlineUsers,
  storeUserPermissions,
} from "../Redux/Slice";
import { useDispatch } from "react-redux";
import { requestForToken } from "../../firebase";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeSlide, setActiveSlide] = useState(0);
  const [userId, setUserId] = useState("");
  const [userIdError, setUserIdError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationTrigger, setValidationTrigger] = useState(false);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    localStorage.removeItem("AccessToken");
    localStorage.removeItem("loginUserDetails");
    sessionStorage.clear();
    const savedUserId = localStorage.getItem("rememberedUserId");
    const savedPassword = localStorage.getItem("rememberedPassword");
    const savedRemember = localStorage.getItem("rememberMe") === "true";
    console.log(savedUserId, savedRemember);
    if (savedRemember) {
      setUserId(savedUserId || "");
      setPassword(savedPassword || "");
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationTrigger(true);

    const emailValidate = addressValidator(userId);
    const passwordValidate = passwordValidator(password);

    setUserIdError(emailValidate);
    setPasswordError(passwordValidate);

    if (emailValidate || passwordValidate) return;

    setLoading(true);
    if (rememberMe) {
      localStorage.setItem("rememberedUserId", userId);
      localStorage.setItem("rememberedPassword", password);
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberedUserId");
      localStorage.removeItem("rememberedPassword");
      localStorage.removeItem("rememberMe");
    }

    const payload = {
      user_id: userId,
      password: password,
    };
    try {
      const response = await LoginApi(payload);
      console.log("login response", response);
      const loginUserDetails = response?.data?.data;
      localStorage.setItem("AccessToken", response?.data?.token);
      localStorage.setItem(
        "loginUserDetails",
        JSON.stringify(loginUserDetails)
      );
      setTimeout(async () => {
        await requestForToken();
        const event = new Event("callGetNotificationApi");
        window.dispatchEvent(event);
        getUserDownlineData(loginUserDetails?.user_id);
      }, 300);
    } catch (error) {
      console.log("login error");
      setLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const getUserDownlineData = async (user_id) => {
    let child_users;
    let downline_users;
    let user_roles;
    try {
      const response = await getUserDownline(user_id);
      console.log("user downline response", response);
      child_users = response?.data?.data?.child_users || [];
      downline_users = response?.data?.data?.downline_users || [];
      user_roles = response?.data?.data?.roles || [];
      dispatch(storeChildUsers(child_users));
      dispatch(storeDownlineUsers(downline_users));
    } catch (error) {
      user_roles = [];
      child_users = [];
      dispatch(storeChildUsers([]));
      dispatch(storeDownlineUsers([]));
      console.log("user downline error", error);
    } finally {
      setTimeout(() => {
        getPermissionsData(user_roles);
      }, 300);
    }
  };

  const getPermissionsData = async (user_roles) => {
    const payload = {
      role_ids: user_roles,
    };
    try {
      const response = await getUserPermissions(payload);
      console.log("user permissions response", response);
      const permission = response?.data?.data;
      if (permission.length >= 1) {
        const updateData = permission.map((item) => {
          return item.permission_name;
        });
        console.log("permissions", updateData);
        dispatch(storeUserPermissions(updateData));
      }
    } catch (error) {
      console.log("user permissions error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
        navigate("/dashboard");
      }, 300);
    }
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
                  <CommonInputField
                    label="User Id"
                    onChange={(e) => {
                      setUserId(e.target.value);
                      if (validationTrigger) {
                        setUserIdError(addressValidator(e.target.value));
                      }
                    }}
                    value={userId}
                    error={userIdError}
                  />
                </div>

                <div style={{ marginTop: "30px", position: "relative" }}>
                  <CommonOutlinedInput
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    icon={
                      <>
                        {showPassword ? (
                          <FiEye
                            size={18}
                            color="gray"
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowPassword(!showPassword)}
                          />
                        ) : (
                          <FiEyeOff
                            size={18}
                            color="gray"
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowPassword(!showPassword)}
                          />
                        )}
                      </>
                    }
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationTrigger) {
                        setPasswordError(passwordValidator(e.target.value));
                      }
                    }}
                    value={password}
                    error={passwordError}
                    helperTextContainerStyle={{
                      position: "absolute",
                      bottom: "-21px",
                      width: "65%",
                    }}
                  />
                </div>

                <div className="login_forgotpasswordtextContainer">
                  <Checkbox
                    className="login_remenberme_checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  >
                    Remember Me
                  </Checkbox>
                  {/* <p className="login_forgotpasswordtext">Forgot Password?</p> */}
                </div>
                {loading ? (
                  <button className="login_loadingsigninbutton">
                    <CommonSpinner />
                  </button>
                ) : (
                  <button className="login_signinbutton" onClick={handleSubmit}>
                    Sign In
                  </button>
                )}
              </form>

              {/* <p className="login_signupnow_text">
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
              </p> */}
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
