import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import Leads from "./Leads";
import LeadFollowUp from "./LeadFollowUp";
import { Button, Tooltip, Tabs } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import {
  getAllAreas,
  getAllDownlineUsers,
  getBatchTrack,
  getLeadAndFollowupCount,
  getLeadStatus,
  getLeadType,
  getRegions,
  getTechnologies,
} from "../ApiService/action";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentandPreviousweekDate } from "../Common/Validation";
import CNAFollowup from "./CNAFollowup";
import { storeAreaList, storeCourseList } from "../Redux/Slice";

export default function LeadManager() {
  const mounted = useRef(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const childUsers = useSelector((state) => state.childusers);

  const [activePage, setActivePage] = useState("followup");
  const [triggerApi, setTriggerApi] = useState(true);
  const [followupCount, setFollowupCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);
  const [leadCountLoading, setLeadCountLoading] = useState(true);

  const [leadTypeOptions, setLeadTypeOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);
  //quality tab section
  const [refreshToggle, setRefreshToggle] = useState(false);
  //permissions
  const permissions = useSelector((state) => state.userpermissions);

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
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    if (childUsers.length > 0 && !mounted.current && permissions.length >= 1) {
      if (!permissions.includes("Lead Manager Page")) {
        navigate("/dashboard");
        return;
      }
      mounted.current = true;
      getAllDownlineUsersData(convertAsJson?.user_id);
      // getLeadAndFollowupCountData(childUsers);
    }
  }, [childUsers, permissions]);

  const getAllDownlineUsersData = async (user_id) => {
    try {
      const response = await getAllDownlineUsers(user_id);
      console.log("all downlines response", response);
      const downliners = response?.data?.data || [];
      const downliners_ids = downliners.map((u) => {
        return u.user_id;
      });
      getLeadAndFollowupCountData(downliners_ids);
    } catch (error) {
      console.log("all downlines error", error);
    }
  };

  const getLeadAndFollowupCountData = async (downliners) => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    const payload = {
      user_ids: downliners,
      start_date: PreviousAndCurrentDate[0],
      end_date: PreviousAndCurrentDate[1],
    };
    try {
      const response = await getLeadAndFollowupCount(payload);
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
        getCourseData();
      }, 300);
    }
  };

  const getCourseData = async () => {
    try {
      const response = await getTechnologies();
      // setCourseOptions(response?.data?.data || []);
      dispatch(storeCourseList(response?.data?.data || []));
    } catch (error) {
      dispatch(storeCourseList([]));
      console.log("response status error", error);
    } finally {
      setTimeout(() => {
        getAreasData();
      }, 300);
    }
  };

  const getAreasData = async () => {
    try {
      const response = await getAllAreas();
      // setAreaOptions(response?.data?.data || []);
      dispatch(storeAreaList(response?.data?.data || []));
    } catch (error) {
      dispatch(storeAreaList([]));
      console.log("response status error", error);
    }
  };

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
            {/* {leadCountLoading ? (
              <span
                style={{
                  width: "80px",
                  display: "inline-block",
                  height: "17px",
                }}
              >
                <Skeleton
                  active
                  size="small"
                  title={false}
                  paragraph={{ rows: 1, width: "100%" }}
                />
              </span>
            ) : ( */}
            <p>{`Leads (${leadCount})`}</p>
            {/* )} */}
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
        <div
          style={{
            display: activePage === "followup" ? "block" : "none",
          }}
        >
          <LeadFollowUp
            key={tabKeys.followup}
            setFollowupCount={setFollowupCount}
            refreshLeads={refreshLeads}
            leadTypeOptions={leadTypeOptions}
            regionOptions={regionOptions}
            courseOptions={courseOptions}
            setCourseOptions={setCourseOptions}
            areaOptions={areaOptions}
            setAreaOptions={setAreaOptions}
          />
        </div>
      )}

      {loadedTabs.leads && (
        <div
          style={{
            display: activePage === "leads" ? "block" : "none",
            marginTop: permissions.includes("Add Quality Comment")
              ? "-20px"
              : "0px",
          }}
        >
          {permissions.includes("Add Quality Comment") ? (
            <Tabs
              className="report_tabs"
              defaultActiveKey="1"
              items={[
                {
                  label: "Leads",
                  key: "1",
                  children: (
                    <Leads
                      triggerApi={triggerApi}
                      setTriggerApi={setTriggerApi}
                      key={tabKeys.leads}
                      refreshLeadFollowUp={refreshLeadFollowUp}
                      setLeadCount={setLeadCount}
                      leadTypeOptions={leadTypeOptions}
                      regionOptions={regionOptions}
                      setLeadCountLoading={setLeadCountLoading}
                      refreshToggle={refreshToggle}
                      setRefreshToggle={setRefreshToggle}
                    />
                  ),
                },
                {
                  label: "Followup",
                  key: "2",
                  children: (
                    <CNAFollowup
                      key={refreshToggle}
                      refreshLeadFollowUp={refreshLeadFollowUp}
                      refreshLeads={refreshLeads}
                    />
                  ),
                },
              ]}
            ></Tabs>
          ) : (
            <Leads
              triggerApi={triggerApi}
              setTriggerApi={setTriggerApi}
              key={tabKeys.leads}
              refreshLeadFollowUp={refreshLeadFollowUp}
              setLeadCount={setLeadCount}
              leadTypeOptions={leadTypeOptions}
              regionOptions={regionOptions}
              courseOptions={courseOptions}
              setCourseOptions={setCourseOptions}
              areaOptions={areaOptions}
              setAreaOptions={setAreaOptions}
              setLeadCountLoading={setLeadCountLoading}
            />
          )}
        </div>
      )}
    </div>
  );
}
