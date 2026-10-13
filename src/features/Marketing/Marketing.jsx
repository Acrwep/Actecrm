import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs } from "antd";
import { useSelector } from "react-redux";
import MarketingLeads from "./MarketingLeads";
import WhatsAppCampaigns from "./WhatsAppCampaigns";
import "./styles.css";

export default function Marketing() {
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = useSelector((state) => state.userpermissions);

  // Permission Guard (similar to Reports.jsx)
  useEffect(() => {
    if (permissions.length >= 1) {
      if (!permissions.includes("Marketing Page")) {
        navigate("/dashboard");
        return;
      }
    }
  }, [permissions]);

  // Determine active tab based on route / location state
  const isCampaignRoute =
    location.pathname === "/whatsapp-campaigns" ||
    location.pathname === "/marketing/campaigns" ||
    location.state?.tab === "campaigns";

  const [activeTab, setActiveTab] = useState(isCampaignRoute ? "2" : "1");

  useEffect(() => {
    if (
      location.pathname === "/whatsapp-campaigns" ||
      location.pathname === "/marketing/campaigns" ||
      location.state?.tab === "campaigns"
    ) {
      setActiveTab("2");
    } else if (location.pathname === "/marketing") {
      if (location.state?.tab !== "campaigns") {
        setActiveTab("1");
      }
    }
  }, [location.pathname, location.state]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const tabItems = [
    {
      label: "Leads",
      key: "1",
      children: (
        <MarketingLeads onSwitchToCampaigns={() => setActiveTab("2")} />
      ),
    },
    {
      label: "Campaigns",
      key: "2",
      children: <WhatsAppCampaigns onSwitchToLeads={() => setActiveTab("1")} />,
    },
  ];

  return (
    <div className="marketing-main-tabs-container">
      <Tabs
        className="report_tabs"
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
      />
    </div>
  );
}
