import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Col, Layout, Row, theme, Button } from "antd";
import Logo from "../../assets/logo.png";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import CustomHeader from "./Header";

const { Sider, Content, Header } = Layout;

import Login from "../Login/Login";
import SideMenu from "./SideMenu";
import "./styles.css";
import LeadManager from "../Lead/LeadManager";
// import Header from "./Header";
import LeadFollowUp from "../Lead/LeadFollowUp";
import Customers from "../Customers/Customers";
import Batches from "../Batches/Batches";
import Dashboard from "../Dashboard/Dashboard";
import Trainers from "../Trainers/Trainers";
import Server from "../Server/Server";
import Settings from "../Settings/Settings";

export default function Pages() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    const pathName = location.pathname.split("/")[1];

    console.log("pathNameee", pathName);
    if (pathName === "login") {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }
  }, [location.pathname]);

  return (
    <div>
      {location.pathname === "/login" ? (
        <Routes>
          <Route element={<Login />} path="/login" />
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
            <div className="pages_sidebarlogoContainer">
              <img src={Logo} style={{ width: "92px" }} />
            </div>
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
                <Route element={<Customers />} path="/customers" />
                <Route element={<Batches />} path="/batches" />
                <Route element={<Trainers />} path="/trainers" />
                <Route element={<Server />} path="/server" />
                <Route element={<Settings />} path="/settings" />
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
