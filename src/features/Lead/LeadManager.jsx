import React, { useState, useEffect } from "react";
import "./styles.css";
import Leads from "./Leads";
import LeadFollowUp from "./LeadFollowUp";
import { Button, Tooltip } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import {
  getBatchTrack,
  getLeadAndFollowupCount,
  getLeadStatus,
  getLeadType,
  getRegions,
  getTechnologies,
} from "../ApiService/action";

export default function LeadManager() {
  const [activePage, setActivePage] = useState("followup");
  const [triggerApi, setTriggerApi] = useState(true);
  const [followupCount, setFollowupCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);

  const [leadTypeOptions, setLeadTypeOptions] = useState([]);
  const [leadStatusOptions, setLeadStatusOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [batchTrackOptions, setBatchTrackOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);

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

  useEffect(() => {
    getLeadAndFollowupCountData();
  }, []);

  const getLeadAndFollowupCountData = async () => {
    try {
      const response = await getLeadAndFollowupCount();
      console.log("lead count response", response);
      const countDetails = response?.data?.data;
      setFollowupCount(countDetails.follow_up_count);
      setLeadCount(countDetails.total_lead_count);
      // dispatch(storeUsersList(response?.data?.data || []));
    } catch (error) {
      console.log("lead count error", error);
      // dispatch(storeUsersList([]));
    } finally {
      setTimeout(() => {
        // setUserTableLoading(false);
        getLeadTypeData();
      }, 300);
    }
  };

  const getLeadTypeData = async () => {
    try {
      const response = await getLeadType();
      setLeadTypeOptions(response?.data?.result || []);
    } catch (error) {
      setLeadTypeOptions([]);
      console.log("lead type error", error);
    } finally {
      setTimeout(() => {
        getLeadStatusData();
      }, 300);
    }
  };

  const getLeadStatusData = async () => {
    try {
      const response = await getLeadStatus();
      setLeadStatusOptions(response?.data?.result || []);
    } catch (error) {
      setLeadStatusOptions([]);
      console.log("lead status error", error);
    } finally {
      setTimeout(() => {
        getRegionData();
      }, 300);
    }
  };

  const getRegionData = async () => {
    try {
      const response = await getRegions();
      setRegionOptions(response?.data?.data || []);
    } catch (error) {
      setRegionOptions([]);
      console.log("response status error", error);
    } finally {
      setTimeout(() => {
        getBatchTrackData();
      }, 300);
    }
  };

  const getBatchTrackData = async () => {
    try {
      const response = await getBatchTrack();
      setBatchTrackOptions(response?.data?.result || []);
    } catch (error) {
      setBatchTrackOptions([]);
      console.log("response status error", error);
    } finally {
      setTimeout(() => {
        getCourseData();
      }, 300);
    }
  };

  const getCourseData = async () => {
    try {
      const response = await getTechnologies();
      setCourseOptions(response?.data?.data || []);
    } catch (error) {
      setCourseOptions([]);
      console.log("response status error", error);
    }
  };

  const handleTabClick = (tab) => {
    setActivePage(tab);
    setLoadedTabs((prev) => ({ ...prev, [tab]: true }));
  };

  const handleRefresh = () => {
    getLeadAndFollowupCountData();

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

  const refreshLeads = () => {
    setTabKeys((prev) => ({
      ...prev,
      leads: prev.leads + 1,
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
            refreshLeads={refreshLeads}
            leadTypeOptions={leadTypeOptions}
            leadStatusOptions={leadStatusOptions}
            regionOptions={regionOptions}
            batchTrackOptions={batchTrackOptions}
            courseOptions={courseOptions}
            setCourseOptions={setCourseOptions}
          />
        </div>
      )}

      <div style={{ display: activePage === "leads" ? "block" : "none" }}>
        <Leads
          triggerApi={triggerApi}
          setTriggerApi={setTriggerApi}
          key={tabKeys.leads}
          refreshLeadFollowUp={refreshLeadFollowUp}
          setLeadCount={setLeadCount}
          leadTypeOptions={leadTypeOptions}
          leadStatusOptions={leadStatusOptions}
          regionOptions={regionOptions}
          batchTrackOptions={batchTrackOptions}
          courseOptions={courseOptions}
          setCourseOptions={setCourseOptions}
        />
      </div>
    </div>
  );
}
