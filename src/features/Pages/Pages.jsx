import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Col, Layout, Row, theme } from "antd";
import Logo from "../../assets/acte-logo.png";

const { Sider, Content } = Layout;

import Login from "../Login/Login";
import SideMenu from "./SideMenu";
import "./styles.css";
import LeadManager from "../Lead/LeadManager";
import Header from "./Header";

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
          <Sider trigger={null} collapsible collapsed={collapsed}>
            <div className="demo-logo-vertical" />
            <div className="pages_sidebarlogoContainer">
              <img src={Logo} style={{ width: "92px" }} />
            </div>
            <SideMenu />
          </Sider>
          <Layout>
            <Content
              style={{
                // margin: "24px 16px",
                borderTopLeftRadius: "24px",
                padding: 24,
                minHeight: 280,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              <Header />
              <Routes>
                <Route element={<LeadManager />} path="/lead-manager" />
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
