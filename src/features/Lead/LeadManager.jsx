import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./styles.css";
import Leads from "./Leads";
import LeadFollowUp from "./LeadFollowUp";
import { Button, Tooltip } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import { FaCaretDown } from "react-icons/fa";
import {
  getAllAreas,
  getAllDownlineUsers,
  getLeadAndFollowupCount,
  getLeadType,
  getRegions,
  getTechnologies,
} from "../ApiService/action";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentandPreviousweekDate } from "../Common/Validation";
import {
  resetFollowUpFilterValues,
  storeAreaList,
  storeAssignLeadFilterValues,
  storeCourseList,
  storeFollowUpFilterValues,
  storeJunkLeadFilterValues,
  storeLeadFilterValues,
  storeLeadManagerActivePage,
  storeLiveLeadFilterType,
  storeLiveLeadSearchValue,
  storeLiveLeadSelectedDates,
} from "../Redux/Slice";
import LiveLead from "./LiveLeads";
import JunkLeads from "./JunkLeads";
import AssignLeads from "./AssignLeads";
import moment from "moment";

export default function LeadManager() {
  const mounted = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const childUsers = useSelector((state) => state.childusers);

  const [activePage, setActivePage] = useState("followup");
  const [triggerApi, setTriggerApi] = useState(true);
  const [followupCount, setFollowupCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);
  const [liveLeadCount, setLiveLeadCount] = useState(0);
  const [openLiveLeadTooltip, setOpenLiveLeadTooltip] = useState(false);
  const [junkLeadCount, setJunkLeadCount] = useState(0);
  const [assignLeadCount, setAssignLeadCount] = useState(0);
  const [isLeadPageVisited, setIsLeadPageVisited] = useState(false);
  const [isAssignLeadPageVisited, setIsAssignLeadPageVisited] = useState(false);
  const [isJunkPageVisited, setIsJunkPageVisited] = useState(false);
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
    live_leads: false,
    junk: false,
    assign_leads: false,
  });

  // For forcing remount
  const [tabKeys, setTabKeys] = useState({
    followup: 0,
    leads: 0,
    live_leads: 0,
    junk: 0,
    assign_leads: 0,
  });

  // const [userTableLoading, setUserTableLoading] = useState(true);

  useEffect(() => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    console.log("locationnnnn", location);
    if (childUsers.length > 0 && !mounted.current && permissions.length >= 1) {
      if (!permissions.includes("Lead Manager Page")) {
        navigate("/dashboard");
        return;
      }
      mounted.current = true;
      if (location) {
        if (location?.state == "open live_leads") {
          handleTabClick("live_leads");
        }
      }
      // const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      const today = new Date();

      dispatch(storeLiveLeadFilterType(null));
      dispatch(storeLiveLeadSelectedDates([]));
      dispatch(storeLiveLeadSearchValue(null));
      dispatch(
        storeFollowUpFilterValues({
          searchValue: null,
          filterType: 1,
          start_date: moment(today).format("YYYY-MM-DD"),
          end_date: moment(today).format("YYYY-MM-DD"),
          user_id: null,
          pageNumber: 1,
          pageLimit: 10,
        }),
      );
      dispatch(
        storeLeadFilterValues({
          searchValue: null,
          filterType: 1,
          start_date: moment(today).format("YYYY-MM-DD"),
          end_date: moment(today).format("YYYY-MM-DD"),
          user_id: null,
          lead_source: null,
          pageNumber: 1,
          pageLimit: 10,
        }),
      );
      dispatch(
        storeAssignLeadFilterValues({
          searchValue: null,
          filterType: 1,
          start_date: moment(today).format("YYYY-MM-DD"),
          end_date: moment(today).format("YYYY-MM-DD"),
          pageNumber: 1,
          pageLimit: 10,
        }),
      );
      dispatch(
        storeJunkLeadFilterValues({
          searchValue: null,
          filterType: 1,
          start_date: moment(today).format("YYYY-MM-DD"),
          end_date: moment(today).format("YYYY-MM-DD"),
          pageNumber: 1,
          pageLimit: 10,
        }),
      );
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
    const today = new Date();
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      user_ids: downliners,
      start_date: moment(today).format("YYYY-MM-DD"),
      end_date: moment(today).format("YYYY-MM-DD"),
      login_by: convertAsJson?.user_id,
    };
    try {
      const response = await getLeadAndFollowupCount(payload);
      console.log("lead count response", response);
      const countDetails = response?.data?.data;
      setFollowupCount(countDetails.follow_up_count);
      setLeadCount(countDetails.total_lead_count);
      setLiveLeadCount(countDetails.web_lead_count);
      setJunkLeadCount(countDetails.junk_lead_count);
      setAssignLeadCount(countDetails.assign_lead_count);
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
    dispatch(storeLeadManagerActivePage(tab));
    setLoadedTabs((prev) => ({ ...prev, [tab]: true }));
  };

  const handleRefresh = () => {
    setTabKeys((prev) => ({
      ...prev,
      [activePage]: prev[activePage] + 1, // change key to remount
    }));
    setRefreshToggle(!refreshToggle);
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

  const refreshAssignLeads = () => {
    setTabKeys((prev) => ({
      ...prev,
      assign_leads: prev.assign_leads + 1,
    }));
  };

  const refreshJunkLeads = () => {
    setTabKeys((prev) => ({
      ...prev,
      junk: prev.junk + 1,
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
            <p>{`Leads (${leadCount})`}</p>
          </button>

          {/* <Tooltip
            open={openLiveLeadTooltip}
            placement="bottomRight"
            color="#fff"
            styles={{
              body: {
                maxWidth: "none",
                whiteSpace: "normal",
              },
            }}
            title={
              <div style={{ color: "#333" }}>
                <p>Hiii</p>
              </div>
            }
          > */}
          <button
            className={
              activePage === "live_leads"
                ? "livelead_tab_activebutton"
                : "livelead_tab_inactivebutton"
            }
            onClick={() => handleTabClick("live_leads")}
          >
            <p>{`Live Leads (${liveLeadCount})`}</p>

            {/* <FaCaretDown
                size={15}
                style={{ marginLeft: "8px", marginTop: "-2px" }}
                color={activePage === "live_leads" ? "#fff" : "#333"}
                onMouseEnter={() => setOpenLiveLeadTooltip(true)}
                onMouseLeave={() => setOpenLiveLeadTooltip(false)}
              /> */}
          </button>
          {/* </Tooltip> */}

          <button
            className={
              activePage === "assign_leads"
                ? "settings_tab_activebutton"
                : "settings_tab_inactivebutton"
            }
            onClick={() => handleTabClick("assign_leads")}
          >
            <p>{`Assign Leads (${assignLeadCount})`}</p>
          </button>

          {permissions.includes("Junk Leads Tab") && (
            <button
              className={
                activePage === "junk"
                  ? "settings_tab_activebutton"
                  : "settings_tab_inactivebutton"
              }
              onClick={() => handleTabClick("junk")}
            >
              <p>{`Junk (${junkLeadCount})`}</p>
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Tooltip placement="top" title="Refresh">
            <Button
              className="leadmanager_refresh_button"
              onClick={handleRefresh}
            >
              <RedoOutlined className="refresh_icon" />
            </Button>
          </Tooltip>
        </div>
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
          }}
        >
          <Leads
            triggerApi={triggerApi}
            setTriggerApi={setTriggerApi}
            key={tabKeys.leads}
            refreshLeadFollowUp={refreshLeadFollowUp}
            setLeadCount={setLeadCount}
            leadTypeOptions={leadTypeOptions}
            regionOptions={regionOptions}
            setLeadCountLoading={setLeadCountLoading}
            setRefreshToggle={setRefreshToggle}
          />
        </div>
      )}

      {loadedTabs.live_leads && (
        <div
          style={{
            display: activePage === "live_leads" ? "block" : "none",
          }}
        >
          <LiveLead
            key={tabKeys.live_leads}
            activePage={activePage}
            setLiveLeadCount={setLiveLeadCount}
            refreshLeads={refreshLeads}
            refreshLeadFollowUp={refreshLeadFollowUp}
            leadTypeOptions={leadTypeOptions}
            regionOptions={regionOptions}
            refreshJunkLeads={refreshJunkLeads}
            refreshAssignLeads={refreshAssignLeads}
          />
        </div>
      )}

      {loadedTabs.assign_leads && (
        <div
          style={{
            display: activePage === "assign_leads" ? "block" : "none",
          }}
        >
          <AssignLeads
            key={tabKeys.assign_leads}
            setLiveLeadCount={setLiveLeadCount}
            refreshLeads={refreshLeads}
            refreshLeadFollowUp={refreshLeadFollowUp}
            leadTypeOptions={leadTypeOptions}
            regionOptions={regionOptions}
            refreshJunkLeads={refreshJunkLeads}
            setAssignLeadCount={setAssignLeadCount}
          />
        </div>
      )}

      {loadedTabs.junk && (
        <div
          style={{
            display: activePage === "junk" ? "block" : "none",
          }}
        >
          <JunkLeads key={tabKeys.junk} setJunkLeadCount={setJunkLeadCount} />
        </div>
      )}
    </div>
  );
}
