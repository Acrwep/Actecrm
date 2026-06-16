import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./styles.css";
import Leads from "./Leads";
import LeadFollowUp from "./LeadFollowUp";
import { Button, Tooltip } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import {
  getAllAreas,
  getAllDownlineUsers,
  getLeadAndFollowupCount,
  getLeadType,
  getRegions,
  getTechnologies,
  getLeadStatus,
  assignLiveLead,
} from "../ApiService/action";
import { useDispatch, useSelector } from "react-redux";
import {
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
import AddNewLead from "./AddNewLead";
import moment from "moment";

export default function LeadManager({ type }) {
  const mounted = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const childUsers = useSelector((state) => state.childusers);
  const liveLeadSelecteDates = useSelector(
    (state) => state.liveleadselecteddates,
  );

  const [activePage, setActivePage] = useState("leads");
  const [pickLeadItem, setPickLeadItem] = useState(null);
  const [editLeadItem, setEditLeadItem] = useState(null);
  const [isReAssignLead, setIsReAssignLead] = useState(false);

  const releaseLead = async (lead_id) => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);
    const payload = {
      user_id: convertAsJson?.user_id,
      lead_id: lead_id,
      is_assigned: false,
    };
    try {
      await assignLiveLead(payload);
    } catch (error) {
      console.log("assign live lead error", error);
    }
  };

  const pickLeadItemRef = useRef(null);

  useEffect(() => {
    pickLeadItemRef.current = pickLeadItem;
  }, [pickLeadItem]);

  useEffect(() => {
    if (activePage !== "add_lead") {
      if (pickLeadItem) {
        releaseLead(pickLeadItem.id);
        setPickLeadItem(null);
      }
      if (editLeadItem) {
        setEditLeadItem(null);
        setIsReAssignLead(false);
      }
    }
  }, [activePage, pickLeadItem, editLeadItem]);

  useEffect(() => {
    return () => {
      if (pickLeadItemRef.current) {
        releaseLead(pickLeadItemRef.current.id);
      }
    };
  }, []);

  const [triggerApi, setTriggerApi] = useState(true);
  const [followupCount, setFollowupCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);
  const [liveLeadCount, setLiveLeadCount] = useState(0);
  const [junkLeadCount, setJunkLeadCount] = useState(0);
  const [assignLeadCount, setAssignLeadCount] = useState(0);
  const [leadCountLoading, setLeadCountLoading] = useState(true);

  const [leadTypeOptions, setLeadTypeOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);
  const [leadStatusOptions, setLeadStatusOptions] = useState([]);
  //quality tab section
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [isReduxReset, setIsReduxReset] = useState(false);
  //permissions
  const permissions = useSelector((state) => state.userpermissions);

  // Track whether each tab has been opened at least once
  const [loadedTabs, setLoadedTabs] = useState({
    followup: false,
    leads: true,
    live_leads: false,
    junk: false,
    assign_leads: false,
    add_lead: false,
  });

  // For forcing remount
  const [tabKeys, setTabKeys] = useState({
    followup: 0,
    leads: 0,
    live_leads: 0,
    junk: 0,
    assign_leads: 0,
    add_lead: 0,
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
      const todayFormatted = moment(today).format("YYYY-MM-DD");

      dispatch(storeLiveLeadFilterType(1));
      dispatch(storeLiveLeadSelectedDates([todayFormatted, todayFormatted]));
      dispatch(storeLiveLeadSearchValue(null));
      dispatch(
        storeFollowUpFilterValues({
          searchValue: null,
          filterType: 1,
          start_date: todayFormatted,
          end_date: todayFormatted,
          user_id: null,
          status_id: null,
          pageNumber: 1,
          pageLimit: 10,
        }),
      );
      dispatch(
        storeLeadFilterValues({
          searchValue: null,
          filterType: 1,
          start_date: todayFormatted,
          end_date: todayFormatted,
          user_id: null,
          lead_source: null,
          lead_status_id: null,
          bucket: "all",
          call_getraapi: true,
          pageNumber: 1,
          pageLimit: 10,
        }),
      );
      dispatch(
        storeAssignLeadFilterValues({
          searchValue: null,
          filterType: 1,
          start_date: todayFormatted,
          end_date: todayFormatted,
          pageNumber: 1,
          pageLimit: 10,
        }),
      );
      dispatch(
        storeJunkLeadFilterValues({
          searchValue: null,
          filterType: 1,
          start_date: todayFormatted,
          end_date: todayFormatted,
          pageNumber: 1,
          pageLimit: 10,
        }),
      );
      setIsReduxReset(true);
      getAllDownlineUsersData(convertAsJson?.user_id);
      // getLeadAndFollowupCountData(childUsers);
    }
  }, [childUsers, permissions, type, location.state]);

  useEffect(() => {
    if (location?.state === "open live_leads") {
      handleTabClick("live_leads");
    } else if (location?.state === "open leads") {
      handleTabClick("leads");
    } else if (location?.state?.editItem) {
      setEditLeadItem(location.state.editItem);
      setIsReAssignLead(location.state.isReAssign);
      handleTabClick("add_lead");
    } else if (type === "leads") {
      if (activePage !== "leads" || !loadedTabs.leads) {
        handleTabClick("leads");
      }
    } else if (type === "addlead") {
      if (
        activePage !== "add_lead" &&
        activePage !== "live_leads" &&
        activePage !== "assign_leads" &&
        activePage !== "junk"
      ) {
        handleTabClick("add_lead");
      }
    }
  }, [type, location.state]);

  const isFetchingLiveLead = useRef(false);
  const liveLeadTimeout = useRef(null);

  useEffect(() => {
    const handleSocketRefresh = () => {
      // debounce logic
      if (activePage === "live_leads") return;

      if (liveLeadTimeout.current) {
        clearTimeout(liveLeadTimeout.current);
      }

      liveLeadTimeout.current = setTimeout(() => {
        getLiveLeadCountData();
      }, 500); // adjust delay if needed
    };

    window.addEventListener("refreshLiveLeads", handleSocketRefresh);
    window.addEventListener("socket_notification", handleSocketRefresh);

    return () => {
      window.removeEventListener("refreshLiveLeads", handleSocketRefresh);
      window.removeEventListener("socket_notification", handleSocketRefresh);

      if (liveLeadTimeout.current) {
        clearTimeout(liveLeadTimeout.current);
      }
    };
  }, [activePage]); // 👈 important dependency

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
      ...(!permissions.includes("View All Assigned Leads")
        ? { login_by: convertAsJson?.user_id }
        : {}),
    };
    try {
      const response = await getLeadAndFollowupCount(payload);
      console.log("lead count response", response);
      const countDetails = response?.data?.data;
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

  const getLiveLeadCountData = async () => {
    // prevent multiple parallel API calls
    if (isFetchingLiveLead.current) return;

    isFetchingLiveLead.current = true;

    try {
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);

      const payload = {
        user_ids: null,
        start_date: moment(liveLeadSelecteDates[0]).format("YYYY-MM-DD"),
        end_date: moment(liveLeadSelecteDates[1]).format("YYYY-MM-DD"),
        login_by: convertAsJson?.user_id,
      };

      const response = await getLeadAndFollowupCount(payload);

      const countDetails = response?.data?.data;
      setLiveLeadCount(countDetails?.web_lead_count || 0);
    } catch (error) {
      console.log("live lead count error", error);
    } finally {
      isFetchingLiveLead.current = false;
    }
  };

  const getLeadTypeData = async () => {
    try {
      const response = await getLeadType();
      const lead_status = response?.data?.result || [];

      const update_lead_status = lead_status.map((item) => {
        let updatedItem = { ...item };

        if (item.name === "Whatsapp") {
          updatedItem.is_active = permissions.includes("Whatsapp Lead Source")
            ? 1
            : 0;
        } else {
          updatedItem.is_active = 1;
        }

        if (item.name === "Call") {
          updatedItem.name = "Direct Call";
        }

        return updatedItem;
      });
      const order = [
        "Enquiry Form",
        "Direct Call",
        "IVR",
        "SMO",
        "Whatsapp",
        "Live Chat",
        "Direct",
        "Reference",
        "G-Add",
      ];

      const sortedLeadTypes = [...update_lead_status].sort(
        (a, b) => order.indexOf(a.name) - order.indexOf(b.name),
      );
      console.log("sortedLeadTypes", sortedLeadTypes);

      setLeadTypeOptions(sortedLeadTypes);
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
    } finally {
      setTimeout(() => {
        getLeadStatusData();
      }, 300);
    }
  };

  const getLeadStatusData = async () => {
    try {
      const response = await getLeadStatus();
      console.log("lead status response", response);
      setLeadStatusOptions(
        response?.data?.data || response?.data?.result || [],
      );
    } catch (error) {
      setLeadStatusOptions([]);
      console.log("lead status error", error);
    }
  };

  const handleTabClick = (tab) => {
    setActivePage(tab);
    dispatch(storeLeadManagerActivePage(tab));
    setLoadedTabs((prev) => ({ ...prev, [tab]: true }));
    if (tab === "add_lead") {
      setTabKeys((prev) => ({ ...prev, add_lead: prev.add_lead + 1 }));
    }
  };

  const handleRefresh = () => {
    const today = new Date();
    const todayFormatted = moment(today).format("YYYY-MM-DD");

    if (activePage === "followup") {
      dispatch(
        storeFollowUpFilterValues({
          searchValue: null,
          filterType: 1,
          start_date: todayFormatted,
          end_date: todayFormatted,
          user_id: null,
          status_id: null,
          pageNumber: 1,
          pageLimit: 10,
        }),
      );
    } else if (activePage === "leads") {
      dispatch(
        storeLeadFilterValues({
          searchValue: null,
          filterType: 1,
          start_date: todayFormatted,
          end_date: todayFormatted,
          user_id: null,
          lead_source: null,
          lead_status_id: null,
          bucket: "all",
          call_getraapi: true,
          pageNumber: 1,
          pageLimit: 10,
        }),
      );
    } else if (activePage === "live_leads") {
      dispatch(storeLiveLeadSelectedDates([todayFormatted, todayFormatted]));
      dispatch(storeLiveLeadSearchValue(null));
      dispatch(storeLiveLeadFilterType(1));
    } else if (activePage === "assign_leads") {
      dispatch(
        storeAssignLeadFilterValues({
          searchValue: null,
          filterType: 1,
          start_date: todayFormatted,
          end_date: todayFormatted,
          pageNumber: 1,
          pageLimit: 10,
        }),
      );
    } else if (activePage === "junk") {
      dispatch(
        storeJunkLeadFilterValues({
          searchValue: null,
          filterType: 1,
          start_date: todayFormatted,
          end_date: todayFormatted,
          pageNumber: 1,
          pageLimit: 10,
        }),
      );
    }

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

  if (!isReduxReset) {
    return null;
  }

  return (
    <div>
      <div className="settings_tabbutton_maincontainer">
        <div style={{ display: "flex", gap: "18px" }}>
          {type === "leads" && (
            <>
              {/* <button
                className={
                  activePage === "followup"
                    ? "settings_tab_activebutton"
                    : "settings_tab_inactivebutton"
                }
                onClick={() => handleTabClick("followup")}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                Lead Followup ( {followupCount} ){" "}
              </button> */}

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
            </>
          )}

          {type === "addlead" && (
            <>
              {permissions.includes("Add Lead Button") && (
                <button
                  className={
                    activePage === "add_lead"
                      ? "settings_tab_activebutton"
                      : "settings_tab_inactivebutton"
                  }
                  onClick={() => handleTabClick("add_lead")}
                >
                  <p>Add Lead</p>
                </button>
              )}

              <button
                className={
                  activePage === "live_leads"
                    ? "livelead_tab_activebutton"
                    : "livelead_tab_inactivebutton"
                }
                onClick={() => handleTabClick("live_leads")}
              >
                <p>{`Live Leads (${liveLeadCount})`}</p>
              </button>

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
            </>
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
            onEditLead={(itemData, isReAssign) => {
              navigate("/leads/add-lead", {
                state: { editItem: itemData, isReAssign: isReAssign },
              });
            }}
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
            onPickLead={(itemData) => {
              setPickLeadItem(itemData);
              handleTabClick("add_lead");
            }}
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

      {loadedTabs.add_lead && (
        <div
          style={{
            display: activePage === "add_lead" ? "block" : "none",
          }}
        >
          <AddNewLead
            key={tabKeys.add_lead}
            setActivePage={setActivePage}
            leadTypeOptions={leadTypeOptions}
            regionOptions={regionOptions}
            subUsers={childUsers}
            liveLeadItem={pickLeadItem}
            updateLeadItem={editLeadItem}
            isReAssign={isReAssignLead}
            callgetLeadsApi={(is_refreshjunk, saveType) => {
              setPickLeadItem(null);
              setEditLeadItem(null);
              setIsReAssignLead(false);

              if (saveType === "Save And Add New") {
                // "Save Lead" button -> navigate to Leads Page
                navigate("/leads/lead-manager", { state: "open leads" });
              } else {
                // "Save & Add Another" button (Save Only) -> stay on Add Lead, but reset form.
                // Resetting form is already handled in AddNewLead component.
              }

              refreshLeads();
              refreshLeadFollowUp();
            }}
          />
        </div>
      )}
    </div>
  );
}
