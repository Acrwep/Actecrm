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
  getAllBranches,
  getUsers,
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
import ScrollableTabContainer from "../Common/ScrollableTabContainer";

export default function LeadManager() {
  const mounted = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const childUsers = useSelector((state) => state.childusers);
  const liveLeadSelecteDates = useSelector(
    (state) => state.liveleadselecteddates,
  );

  const [activePage, setActivePage] = useState("add_lead");
  const [pickLeadItem, setPickLeadItem] = useState(null);
  const [editLeadItem, setEditLeadItem] = useState(null);
  const [isReAssignLead, setIsReAssignLead] = useState(false);
  const [allUsersList, setAllUsersList] = useState([]);

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
      window.dispatchEvent(new Event("refreshLiveLeads"));
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
        if (!pickLeadItem.is_assign_lead) {
          releaseLead(pickLeadItem.id);
        }
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
      if (pickLeadItemRef.current && !pickLeadItemRef.current.is_assign_lead) {
        releaseLead(pickLeadItemRef.current.id);
      }
    };
  }, []);

  const [triggerApi, setTriggerApi] = useState(true);
  const [followupCount, setFollowupCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);
  const [bucketCounts, setBucketCounts] = useState({
    all: 0,
    valid_leads: 0,
    eligible_leads: 0,
    interested_leads: 0,
    joinings: 0,
  });
  const [liveLeadCount, setLiveLeadCount] = useState(0);
  const [junkLeadCount, setJunkLeadCount] = useState(0);
  const [assignLeadCount, setAssignLeadCount] = useState(0);
  const [leadCountLoading, setLeadCountLoading] = useState(true);

  const [leadTypeOptions, setLeadTypeOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);
  const [allBranchesData, setAllBranchesData] = useState([]);
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
    assign_leads: true,
    add_lead: true,
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
  const prevActivePageRef = useRef("all_leads");

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
          handleTabClick(
            permissions.includes("Add Lead Button")
              ? "live_leads"
              : "all_leads",
          );
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
  }, [childUsers, permissions, location.state]);

  useEffect(() => {
    const hasAddLeadPerm = permissions.includes("Add Lead Button");

    if (location?.state === "open live_leads") {
      handleTabClick(hasAddLeadPerm ? "live_leads" : "all_leads");
    } else if (location?.state === "open leads") {
      handleTabClick("all_leads");
    } else if (location?.state?.editItem) {
      if (hasAddLeadPerm) {
        setEditLeadItem(location.state.editItem);
        setIsReAssignLead(location.state.isReAssign);
        handleTabClick("add_lead");
      } else {
        handleTabClick("all_leads");
      }
    } else {
      if (
        activePage !== "add_lead" &&
        activePage !== "live_leads" &&
        activePage !== "assign_leads" &&
        activePage !== "junk" &&
        ![
          "all_leads",
          "valid_leads",
          "eligible_leads",
          "interested_leads",
          "joinings",
        ].includes(activePage)
      ) {
        handleTabClick(hasAddLeadPerm ? "add_lead" : "all_leads");
      } else if (
        !hasAddLeadPerm &&
        (activePage === "add_lead" || activePage === "live_leads")
      ) {
        handleTabClick("all_leads");
      }
    }
  }, [location.state, permissions]);

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
      setBucketCounts((prev) => ({
        ...prev,
        all: countDetails.total_lead_count,
      }));
      setLiveLeadCount(countDetails.web_lead_count);
      setJunkLeadCount(countDetails.junk_lead_count);
      // setAssignLeadCount(countDetails.assign_lead_count);
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

        return updatedItem;
      });
      const order = [
        "Call",
        "Direct",
        "Website",
        "SMO",
        "Live Chat",
        "Reference",
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
    } finally {
      getAllBranchesData();
    }
  };

  const getAllBranchesData = async () => {
    try {
      const response = await getAllBranches();
      console.log("all branches response", response);
      setAllBranchesData(response?.data?.result || []);
    } catch (error) {
      setAllBranchesData([]);
      console.log(error);
    } finally {
      getUsersData();
    }
  };

  const getUsersData = async () => {
    const payload = {
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getUsers(payload);
      console.log("users response", response);
      setAllUsersList(response?.data?.data?.data || []);
    } catch (error) {
      setAllUsersList([]);
      console.log("get all users error", error);
    }
  };

  const handleTabClick = (tab) => {
    if (tab !== "add_lead") {
      prevActivePageRef.current = tab;
    }
    setActivePage(tab);
    dispatch(storeLeadManagerActivePage(tab));

    setLoadedTabs((prev) => {
      const isLeadBucket = [
        "all_leads",
        "valid_leads",
        "eligible_leads",
        "interested_leads",
        "joinings",
      ].includes(tab);
      return {
        ...prev,
        [tab]: true,
        ...(isLeadBucket ? { leads: true } : {}),
      };
    });

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
    } else if (
      [
        "all_leads",
        "valid_leads",
        "eligible_leads",
        "interested_leads",
        "joinings",
      ].includes(activePage)
    ) {
      const bucketMapping = {
        all_leads: "all",
        valid_leads: "Valid Leads",
        eligible_leads: "Eligible Leads",
        interested_leads: "Interested Leads",
        joinings: "Joinings",
      };
      dispatch(
        storeLeadFilterValues({
          searchValue: null,
          filterType: 1,
          start_date: todayFormatted,
          end_date: todayFormatted,
          user_id: null,
          lead_source: null,
          lead_status_id: null,
          bucket: bucketMapping[activePage],
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
    setTabKeys((prev) => {
      const isLeadBucket = [
        "all_leads",
        "valid_leads",
        "eligible_leads",
        "interested_leads",
        "joinings",
      ].includes(activePage);

      const keyToIncrement = isLeadBucket ? "leads" : activePage;

      return {
        ...prev,
        [keyToIncrement]: (prev[keyToIncrement] || 0) + 1, // change key to remount
      };
    });
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
    setRefreshToggle((prev) => !prev);
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
      <div
        className="settings_tabbutton_maincontainer"
        style={{ marginBottom: "8px" }}
      >
        <ScrollableTabContainer>
          {permissions.includes("Add Lead Button") && (
            <div
              className={
                activePage === "add_lead"
                  ? "addlead_tab_activebutton"
                  : "addlead_tab_inactivebutton"
              }
              onClick={() => handleTabClick("add_lead")}
            >
              <p style={{ margin: 0 }}>Add Lead</p>
            </div>
          )}

          {permissions.includes("Add Lead Button") && (
            <div
              className={
                activePage === "live_leads"
                  ? "livelead_tab_activebutton"
                  : "livelead_tab_inactivebutton"
              }
              onClick={() => handleTabClick("live_leads")}
            >
              <p style={{ margin: 0 }}>{`Live Leads (${liveLeadCount})`}</p>
            </div>
          )}

          <div
            className={
              activePage === "assign_leads"
                ? "assignleads_tab_activebutton"
                : "assignleads_tab_inactivebutton"
            }
            onClick={() => handleTabClick("assign_leads")}
          >
            <p style={{ margin: 0 }}>{`Assign Leads (${assignLeadCount})`}</p>
          </div>

          <div
            className={
              activePage === "all_leads" || activePage === "leads"
                ? "allleads_tab_activebutton"
                : "allleads_tab_inactivebutton"
            }
            onClick={() => handleTabClick("all_leads")}
          >
            <p style={{ margin: 0 }}>{`All Leads (${bucketCounts.all})`}</p>
          </div>

          <div
            className={
              activePage === "valid_leads"
                ? "validleads_tab_activebutton"
                : "validleads_tab_inactivebutton"
            }
            onClick={() => handleTabClick("valid_leads")}
          >
            <p
              style={{ margin: 0 }}
            >{`Valid Leads (${bucketCounts.valid_leads})`}</p>
          </div>

          <div
            className={
              activePage === "eligible_leads"
                ? "eligibleleads_tab_activebutton"
                : "eligibleleads_tab_inactivebutton"
            }
            onClick={() => handleTabClick("eligible_leads")}
          >
            <p
              style={{ margin: 0 }}
            >{`Eligible Leads (${bucketCounts.eligible_leads})`}</p>
          </div>

          <div
            className={
              activePage === "interested_leads"
                ? "interestedleads_tab_activebutton"
                : "interestedleads_tab_inactivebutton"
            }
            onClick={() => handleTabClick("interested_leads")}
          >
            <p
              style={{ margin: 0 }}
            >{`Interested Leads (${bucketCounts.interested_leads})`}</p>
          </div>

          <div
            className={
              activePage === "joinings"
                ? "joinings_tab_activebutton"
                : "joinings_tab_inactivebutton"
            }
            onClick={() => handleTabClick("joinings")}
          >
            <p style={{ margin: 0 }}>{`Joinings (${bucketCounts.joinings})`}</p>
          </div>

          {/* {permissions.includes("Junk Leads Tab") && (
            <button
              className={
                activePage === "junk"
                  ? "junk_tab_activebutton"
                  : "junk_tab_inactivebutton"
              }
              onClick={() => handleTabClick("junk")}
            >
              <p style={{ margin: 0 }}>{`Junk (${junkLeadCount})`}</p>
            </button>
          )} */}
        </ScrollableTabContainer>

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
            display: [
              "all_leads",
              "valid_leads",
              "eligible_leads",
              "interested_leads",
              "joinings",
            ].includes(activePage)
              ? "block"
              : "none",
          }}
        >
          <Leads
            activePage={activePage}
            triggerApi={triggerApi}
            setTriggerApi={setTriggerApi}
            key={tabKeys.leads}
            refreshLeadFollowUp={refreshLeadFollowUp}
            setLeadCount={setLeadCount}
            setBucketCounts={setBucketCounts}
            leadTypeOptions={leadTypeOptions}
            regionOptions={regionOptions}
            setLeadCountLoading={setLeadCountLoading}
            setRefreshToggle={setRefreshToggle}
            onEditLead={(itemData, isReAssign) => {
              setEditLeadItem(itemData);
              setIsReAssignLead(isReAssign);
              handleTabClick("add_lead");
            }}
            allUsersList={allUsersList}
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
            refreshToggle={refreshToggle}
            setLiveLeadCount={setLiveLeadCount}
            refreshLeads={refreshLeads}
            refreshLeadFollowUp={refreshLeadFollowUp}
            leadTypeOptions={leadTypeOptions}
            regionOptions={regionOptions}
            refreshJunkLeads={refreshJunkLeads}
            setAssignLeadCount={setAssignLeadCount}
            onPickLead={(itemData) => {
              setPickLeadItem(itemData);
              handleTabClick("add_lead");
            }}
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
            setActivePage={handleTabClick}
            leadTypeOptions={leadTypeOptions}
            regionOptions={regionOptions}
            allBranchesData={allBranchesData}
            subUsers={childUsers}
            liveLeadItem={pickLeadItem}
            updateLeadItem={editLeadItem}
            isReAssign={isReAssignLead}
            allUsersList={allUsersList}
            callgetLeadsApi={(dontSwitchTab, isCancel, isReAssign) => {
              console.log("callgetLeadsApi", isReAssign);
              if (!isCancel) {
                setPickLeadItem(null);
                setEditLeadItem(null);
                setIsReAssignLead(false);
              }
              if (!dontSwitchTab) {
                handleTabClick(prevActivePageRef.current);
              }
              refreshLeads();
              if (isReAssign) {
                refreshAssignLeads();
              }
              // refreshLeadFollowUp();
            }}
          />
        </div>
      )}
    </div>
  );
}
