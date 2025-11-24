import React from "react";
import { Tabs } from "antd";
import LeadsScoreboardReport from "./LeadsScoreboardReport";
import UserwiseSalesReport from "./UserwiseSalesReport";
import UserwiseLeadsReport from "./UserwiseLeadsreport";
import BranchwiseLeadsReport from "./BranchwiseLeadsReport";
import BranchwiseSalesReport from "./BranchwiseSalesReport";
import HrPerformanceReport from "./HrPeroformanceReport";
import RaPerformanceReport from "./RaPerformanceReport";

export default function Reports() {
  return (
    <div>
      <Tabs
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
            label: "HR Performance",
            key: "6",
            children: <HrPerformanceReport />,
          },
          {
            label: "RA Performance",
            key: "7",
            children: <RaPerformanceReport />,
          },
        ]}
      />
    </div>
  );
}
