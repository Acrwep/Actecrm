import React, { useState, useEffect } from "react";
import "./styles.css";
import { Button, Tooltip } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import { getLeadAndFollowupCount } from "../ApiService/action";
import TodayDueCustomers from "./TodayDueCustomers";
import OverallDueCustomers from "./OverallDueCustomers";

export default function PendingFeesCustomers() {
  const [activePage, setActivePage] = useState("todaydue");
  const [followupCount, setFollowupCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);

  // Track whether each tab has been opened at least once
  const [loadedTabs, setLoadedTabs] = useState({
    todaydue: true, // first tab shown initially
    overalldue: false,
  });

  // For forcing remount
  const [tabKeys, setTabKeys] = useState({
    todaydue: 0,
    overalldue: 0,
  });

  // const [userTableLoading, setUserTableLoading] = useState(true);

  const handleTabClick = (tab) => {
    setActivePage(tab);
    setLoadedTabs((prev) => ({ ...prev, [tab]: true }));
  };

  const handleRefresh = () => {
    setTabKeys((prev) => ({
      ...prev,
      [activePage]: prev[activePage] + 1, // change key to remount
    }));
  };

  return (
    <div>
      <div className="settings_tabbutton_maincontainer">
        <div style={{ display: "flex", gap: "18px" }}>
          <button
            className={
              activePage === "todaydue"
                ? "settings_tab_activebutton"
                : "settings_tab_inactivebutton"
            }
            onClick={() => handleTabClick("todaydue")}
          >
            Today Due ( 2 )
          </button>
          <button
            className={
              activePage === "overalldue"
                ? "settings_tab_activebutton"
                : "settings_tab_inactivebutton"
            }
            onClick={() => handleTabClick("overalldue")}
          >
            Overall Due ( 10 )
          </button>
        </div>

        {/* <Button className="leadmanager_refresh_button">
          <VscRefresh />
        </Button> */}

        <Tooltip placement="top" title="Refresh">
          <Button
            className="leadmanager_refresh_button"
            onClick={handleRefresh}
          >
            <RedoOutlined className="refresh_icon" />
          </Button>
        </Tooltip>
      </div>

      {/* Mount only when first opened, keep mounted afterward */}
      {loadedTabs.todaydue && (
        <div style={{ display: activePage === "todaydue" ? "block" : "none" }}>
          <TodayDueCustomers
            key={tabKeys.todaydue}
            setFollowupCount={setFollowupCount}
          />
        </div>
      )}

      {loadedTabs.overalldue && (
        <div
          style={{ display: activePage === "overalldue" ? "block" : "none" }}
        >
          <OverallDueCustomers key={tabKeys.overalldue} />
        </div>
      )}
    </div>
  );
}
