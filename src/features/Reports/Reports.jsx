import React from "react";
import { Tabs } from "antd";
import LeadsScoreboardReports from "./LeadsScoreboardReports";

export default function Reports() {
  return (
    <div>
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            label: "Scoreboard",
            key: "1",
            children: <LeadsScoreboardReports />,
          },
          {
            label: "Sales Scoreboard",
            key: "2",
            children: "Tab 2",
          },
          {
            label: "Tab 3",
            key: "3",
            children: "Tab 3",
          },
        ]}
      />
    </div>
  );
}
