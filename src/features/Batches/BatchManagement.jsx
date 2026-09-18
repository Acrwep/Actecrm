import React from "react";
import { useNavigate } from "react-router-dom";
import { Tabs } from "antd";
import Batches from "./Batches";

export default function BatchManagement() {
  const navigate = useNavigate();
  const tabItems = [
    {
      label: "Batch",
      key: "1",
      children: <Batches mainType={"Batch"} />,
    },
    {
      label: "Group",
      key: "2",
      children: <Batches mainType={"Group"} />,
    },
  ];
  return (
    <div style={{ marginTop: "-9px" }}>
      <Tabs
        className="report_tabs"
        defaultActiveKey={tabItems[0]?.key} // ✅ auto select first visible tab
        items={tabItems}
      />
    </div>
  );
}
