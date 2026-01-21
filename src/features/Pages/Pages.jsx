import React, { useState, useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Col, Layout, Row, theme } from "antd";
import Logo from "../../assets/logo.png";
import Logo2 from "../../assets/a-logo.png";
import CustomHeader from "./CustomHeader";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { message } from "antd";

import Login from "../Login/Login";
import SideMenu from "./SideMenu";

// Lead
import LeadManager from "../Lead/LeadManager";
import LeadFollowUp from "../Lead/LeadFollowUp";

// Bulk Search
import BulkSearch from "../BulkSearch/BulkSearch";

// Trainers
import Trainers from "../Trainers/Trainers";
import TrainerRegistration from "../Trainers/TrainerRegistration";
import Success from "../Trainers/Success";
import TrainerPayment from "../Trainers/TrainerPayment";

// Customers
import Customers from "../Customers/Customers";
import CustomerRegistration from "../Customers/CustomerRegistration";
import PendingFeesCustomers from "../Customers/Pending Fees/PendingFeesCustomers";

// Other
import Batches from "../Batches/Batches";
import Dashboard from "../Dashboard/Dashboard";
import Server from "../Server/Server";
import Settings from "../Settings/Settings";
import Reports from "../Reports/Reports";

import { onMessageListener } from "../../firebase";
import "./styles.css";

const { Sider, Content, Header } = Layout;

export default function Pages() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Helper to detect public routes
  const isPublicRoute = (path) => {
    return (
      path === "/login" ||
      path.startsWith("/trainer-registration") ||
      path.startsWith("/customer-registration") ||
      path === "/success"
    );
  };

  // Token expiration listener
  useEffect(() => {
    const handleTokenExpire = () => {
      navigate("/login");
    };

    window.addEventListener("tokenExpireUpdated", handleTokenExpire);
    return () => {
      window.removeEventListener("tokenExpireUpdated", handleTokenExpire);
    };
  }, [navigate]);

  // 🔐 Auth Guard
  useEffect(() => {
    const token = localStorage.getItem("AccessToken");
    const path = location.pathname;

    // Public routes → no sidebar, no redirect
    if (isPublicRoute(path)) {
      setShowSidebar(false);
      return;
    }

    // Private routes → no token
    if (!token) {
      setShowSidebar(false);
      navigate("/login", { replace: true });
      return;
    }

    // Private routes → token exists
    setShowSidebar(true);
  }, [location.pathname, navigate]);

  // Live lead foreground notifications
  useEffect(() => {
    const unsubscribe = onMessageListener((data) => {
      if (!data) return;

      // Uncomment below to show notification
      // message.open({
      //   type: "info",
      //   content: (
      //     <div
      //       style={{ cursor: "pointer" }}
      //       onClick={() => navigate("/lead-manager", { state: "open live_leads" })}
      //     >
      //       <b>{data.title || "Notification"}</b>
      //       <div>{data.body}</div>
      //     </div>
      //   ),
      //   duration: 5,
      //   style: { bottom: 24, right: 24 },
      // });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigate]);

  // Live lead background notifications via service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const handleSwMessage = (event) => {
        if (event.data?.type === "NAVIGATE") {
          navigate(event.data.url, { state: "open live_leads" });
        }
      };

      navigator.serviceWorker.addEventListener("message", handleSwMessage);
      return () => {
        navigator.serviceWorker.removeEventListener("message", handleSwMessage);
      };
    }
  }, [navigate]);

  // Render
  if (isPublicRoute(location.pathname)) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/trainer-registration/:trainer_id"
          element={<TrainerRegistration />}
        />
        <Route
          path="/customer-registration/:customer_id"
          element={<CustomerRegistration />}
        />
        <Route path="/success" element={<Success />} />
      </Routes>
    );
  }

  // Private layout
  if (!showSidebar && !isPublicRoute(location.pathname)) return null;

  return (
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
            <Route element={<TrainerPayment />} path="/trainer-payment" />
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
  );
}
