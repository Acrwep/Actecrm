import React, { useState, useEffect } from "react";
import "./styles.css";
import Leads from "./Leads";
import LeadFollowUp from "./LeadFollowUp";
import { Button, Tooltip } from "antd";
import { RedoOutlined } from "@ant-design/icons";

export default function Settings() {
  const [activePage, setActivePage] = useState("followup");
  const [triggerApi, setTriggerApi] = useState(true);
  const [followupCount, setFollowupCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);

  // Track whether each tab has been opened at least once
  const [loadedTabs, setLoadedTabs] = useState({
    followup: true, // first tab shown initially
    leads: false,
  });

  // For forcing remount
  const [tabKeys, setTabKeys] = useState({
    followup: 0,
    leads: 0,
  });

  // const [userTableLoading, setUserTableLoading] = useState(true);

  // useEffect(() => {
  //   getUsersData();
  // }, []);

  // const getUsersData = async () => {
  //   setUserTableLoading(true);
  //   try {
  //     const response = await getUsers();
  //     console.log("users response", response);
  //     dispatch(storeUsersList(response?.data?.data || []));
  //   } catch (error) {
  //     dispatch(storeUsersList([]));
  //   } finally {
  //     setTimeout(() => {
  //       setUserTableLoading(false);
  //     }, 300);
  //   }
  // };

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

  const refreshLeadFollowUp = () => {
    setTabKeys((prev) => ({
      ...prev,
      followup: prev.followup + 1,
    }));
  };

  return (
    <div>
      <div className="settings_tabbutton_maincontainer">
        <div style={{ display: "flex", gap: "18px" }}>
          <button
            className={
              activePage === "followup"
                ? "settings_tab_activebutton"
                : "settings_tab_inactivebutton"
            }
            onClick={() => handleTabClick("followup")}
          >
            Lead Followup ( {followupCount} )
          </button>
          <button
            className={
              activePage === "leads"
                ? "settings_tab_activebutton"
                : "settings_tab_inactivebutton"
            }
            onClick={() => handleTabClick("leads")}
          >
            Leads ( {leadCount} )
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
      {loadedTabs.followup && (
        <div style={{ display: activePage === "followup" ? "block" : "none" }}>
          <LeadFollowUp
            key={tabKeys.followup}
            setFollowupCount={setFollowupCount}
          />
        </div>
      )}

      {loadedTabs.leads && (
        <div style={{ display: activePage === "leads" ? "block" : "none" }}>
          <Leads
            triggerApi={triggerApi}
            setTriggerApi={setTriggerApi}
            key={tabKeys.leads}
            refreshLeadFollowUp={refreshLeadFollowUp}
            setLeadCount={setLeadCount}
          />
        </div>
      )}
    </div>
  );
}
