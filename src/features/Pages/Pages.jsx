import React, { useState, useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Col, Layout, Row, theme, Button } from "antd";
import Logo from "../../assets/logo.png";
import CustomHeader from "./CustomHeader";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import Logo2 from "../../assets/a-logo.png";
import { message } from "antd";

const { Sider, Content, Header } = Layout;

import Login from "../Login/Login";
import SideMenu from "./SideMenu";
import "./styles.css";
//lead
import LeadManager from "../Lead/LeadManager";
import LeadFollowUp from "../Lead/LeadFollowUp";
//bulk search
import BulkSearch from "../BulkSearch/BulkSearch";
//trainers
import Trainers from "../Trainers/Trainers";
import TrainerRegistration from "../Trainers/TrainerRegistration";
import Success from "../Trainers/Success";
//customers
import Customers from "../Customers/Customers";
import CustomerRegistration from "../Customers/CustomerRegistration";
import Batches from "../Batches/Batches";
import Dashboard from "../Dashboard/Dashboard";
import Server from "../Server/Server";
import Settings from "../Settings/Settings";
import PendingFeesCustomers from "../Customers/Pending Fees/PendingFeesCustomers";
//reports
import Reports from "../Reports/Reports";
import { onMessageListener } from "../../firebase";

export default function Pages() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  //the useEffect call only the token will expire
  useEffect(() => {
    //handle navigate to login page when token expire
    const handleTokenExpire = () => {
      navigate("/login");
    };

    window.addEventListener("tokenExpireUpdated", handleTokenExpire);

    // Initial load
    // handleTokenExpire();

    return () => {
      window.removeEventListener("tokenExpireUpdated", handleTokenExpire);
    };
  }, []);

  useEffect(() => {
    const AccessToken = localStorage.getItem("AccessToken");
    const pathName = location.pathname.split("/")[1];
    const fullPath = location.pathname;

    console.log("pathNameee", pathName);

    if (fullPath.startsWith("/trainer-registration")) {
      console.log("Trainer Registration page detected");
      // Extract ID (if exists)
      const parts = fullPath.split("/");
      const id = parts[2]; // /trainer-registration/:id
      console.log("url iddd", id);
      if (id) {
        navigate(`/trainer-registration/${id}`, { replace: true });
      }
      return;
    }

    if (fullPath.startsWith("/customer-registration")) {
      console.log("Customer Registration page detected");
      // Extract ID (if exists)
      const parts = fullPath.split("/");
      const id = parts[2]; // /customer-registration/:id
      console.log("url iddd", id);

      if (id) {
        navigate(`/customer-registration/${id}`, { replace: true });
      }

      return;
    }

    if (pathName === "success") {
      setShowSidebar(false);
      navigate("/success", { replace: true });
      return;
    }

    if (AccessToken) {
      setShowSidebar(true);
      navigate(`/${pathName}`, { replace: true });
    } else {
      setShowSidebar(false);
      navigate("/login", { replace: true });
    }
  }, [location.pathname]);

  //live lead forground notification handling

  useEffect(() => {
    const unsubscribe = onMessageListener((data) => {
      console.log("onMessageListener", data);
      if (!data) return;

      message.open({
        type: "info",
        content: (
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              navigate("/lead-manager", {
                state: "open live_leads",
              });
            }}
          >
            <b>{data.title || "Notification"}</b>
            <div>{data.body}</div>
          </div>
        ),
        duration: 3,
        style: {
          bottom: 24,
          right: 24,
        },
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  //live lead background notification handling
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const handleSwMessage = (event) => {
        if (event.data?.type === "NAVIGATE") {
          // window.location.href = event.data.url;
          navigate(event.data.url, {
            state: "open live_leads",
          });
        }
      };

      navigator.serviceWorker.addEventListener("message", handleSwMessage);

      return () => {
        navigator.serviceWorker.removeEventListener("message", handleSwMessage);
      };
    }
  }, []);

  return (
    <div>
      {location.pathname === "/login" ? (
        <Routes>
          <Route element={<Login />} path="/login" />
        </Routes>
      ) : location.pathname.includes("/trainer-registration") ? (
        <Routes>
          <Route
            element={<TrainerRegistration />}
            path="/trainer-registration/:trainer_id"
          />
        </Routes>
      ) : location.pathname.includes("/customer-registration") ? (
        <Routes>
          <Route
            element={<CustomerRegistration />}
            path="/customer-registration/:customer_id"
          />
        </Routes>
      ) : location.pathname === "/success" ? (
        <Routes>
          <Route element={<Success />} path="/success" />
        </Routes>
      ) : showSidebar ? (
        <Layout style={{ height: "100vh" }}>
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            style={{
              position: "fixed",
              height: "100vh",
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 1,
            }}
          >
            <div className="demo-logo-vertical" />
            {/* <div className="pages_sidebarlogoContainer">
              <img src={Logo} style={{ width: "92px" }} />
              <p>Hii</p>
            </div> */}
            <Row className="pages_sidebarlogoContainer">
              <Col span={15} className="pages_sidebarlogo_col">
                {collapsed ? (
                  <img src={Logo2} style={{ width: "22px" }} />
                ) : (
                  <img src={Logo} style={{ width: "92px" }} />
                )}
              </Col>
              <Col span={9} className="pages_sidebarlogo_col">
                <div
                  className={
                    collapsed
                      ? "pages_collapseicon_collapsedcontainer"
                      : "pages_collapseicon_container"
                  }
                  onClick={() => setCollapsed(!collapsed)}
                >
                  <HiOutlineMenuAlt3 color="#333" size={21} />
                </div>
              </Col>
            </Row>
            <SideMenu />
          </Sider>
          <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
            <Header
              style={{
                padding: 0,
                background: colorBgContainer,
                position: "fixed",
                left: collapsed ? 80 : 200,
                width: `calc(100% - ${collapsed ? 80 : 200}px)`,
                zIndex: 100,
                transition: "all 0.3s ease-in-out",
              }}
            >
              <CustomHeader />
            </Header>

            <Content
              style={{
                // margin: "24px 16px",
                borderTopLeftRadius: "24px",
                padding: 24,
                minHeight: 280,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
                marginTop: "60px",
              }}
            >
              <Routes>
                <Route element={<Dashboard />} path="/dashboard" />
                <Route element={<LeadManager />} path="/lead-manager" />
                <Route element={<LeadFollowUp />} path="/lead-followup" />
                <Route element={<BulkSearch />} path="/bulk-search" />
                <Route element={<Customers />} path="/customers" />
                <Route
                  element={<PendingFeesCustomers />}
                  path="/fee-pending-customers"
                />
                <Route element={<Batches />} path="/batches" />
                <Route element={<Trainers />} path="/trainers" />
                <Route element={<Server />} path="/server" />
                <Route element={<Settings />} path="/settings" />
                <Route element={<Reports />} path="/reports" />
                <Route
                  element={<TrainerRegistration />}
                  path="/trainer-registration"
                />
                <Route element={<Navigate to={"/dashboard"} />} path="*" />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      ) : (
        ""
      )}
    </div>
  );
}
