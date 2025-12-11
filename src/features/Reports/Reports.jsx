import React from "react";
import { useNavigate } from "react-router-dom";
import { Tabs } from "antd";
import LeadsScoreboardReport from "./LeadsScoreboardReport";
import UserwiseSalesReport from "./UserwiseSalesReport";
import UserwiseLeadsReport from "./UserwiseLeadsreport";
import BranchwiseLeadsReport from "./BranchwiseLeadsReport";
import BranchwiseSalesReport from "./BranchwiseSalesReport";
import HrPerformanceReport from "./HrPeroformanceReport";
import RaPerformanceReport from "./RaPerformanceReport";
import { useSelector } from "react-redux";
import "./styles.css";
import QualityReport from "./QualityReport";
import PostSalePerformanceReport from "./PostSalePerformanceReport";

export default function Reports() {
  const navigate = useNavigate();
  //permissions
  const permissions = useSelector((state) => state.userpermissions);

  React.useEffect(() => {
    if (permissions.length >= 1) {
      if (!permissions.includes("Reports Page")) {
        navigate("/dashboard");
        return;
      }
    }
  }, [permissions]);

  return (
    <div>
      <Tabs
        className="report_tabs"
        defaultActiveKey="1"
        items={[
          {
            label: "Scoreboard",
            key: "1",
            children: <LeadsScoreboardReport />,
          },
          {
            label: "Userwise Lead Analysis",
            key: "2",
            children: <UserwiseLeadsReport />,
          },
          {
            label: "Userwise Sales Analysis",
            key: "3",
            children: <UserwiseSalesReport />,
          },
          {
            label: "Branchwise Lead Analysis",
            key: "4",
            children: <BranchwiseLeadsReport />,
          },
          {
            label: "Branchwise Sales Analysis",
            key: "5",
            children: <BranchwiseSalesReport />,
          },
          {
            label: "Post Sale Performance",
            key: "6",
            children: <PostSalePerformanceReport />,
          },
          // {
          //   label: "RA Performance",
          //   key: "7",
          //   children: <RaPerformanceReport />,
          // },
          // {
          //   label: "Quality Performance",
          //   key: "8",
          //   children: <QualityReport />,
          // },
        ]}
      />
    </div>
  );
}
