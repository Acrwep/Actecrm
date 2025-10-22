import React, { useState, useEffect } from "react";
import "../styles.css";
import { Button, Tooltip } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import { getPendingFeesCustomersCount } from "../../ApiService/action";
import TodayDueCustomers from "./TodayDueCustomers";
import OverallDueCustomers from "./OverallDueCustomers";
import { getCurrentandPreviousweekDate } from "../../Common/Validation";
import UrgentDueCustomers from "./UrgentDueCustomers";
import { useSelector } from "react-redux";

export default function PendingFeesCustomers() {
  const childUsers = useSelector((state) => state.childusers);
  const [activePage, setActivePage] = useState("todaydue");
  const [dueSelectedDates, setDueSelectedDates] = useState([]);
  const [todayDueCount, setTodayDueCount] = useState(0);
  const [overAllDueCount, setOverAllDueCount] = useState(0);
  const [urgentDueCount, setUrgentDueCount] = useState(0);
  const [callCountApi, setCallCountApi] = useState(true);

  // Track whether each tab has been opened at least once
  const [loadedTabs, setLoadedTabs] = useState({
    todaydue: true, // first tab shown initially
    overalldue: false,
    urgentdue: false,
  });

  // For forcing remount
  const [tabKeys, setTabKeys] = useState({
    todaydue: 0,
    overalldue: 0,
    urgentdue: 0,
  });

  // const [userTableLoading, setUserTableLoading] = useState(true);

  useEffect(() => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();

    // if (dueSelectedDates.length === 0) {
    //   setDueSelectedDates(PreviousAndCurrentDate);
    //   getPendingCustomersCountData(
    //     PreviousAndCurrentDate[0],
    //     PreviousAndCurrentDate[1]
    //   );
    // } else {
    //   getPendingCustomersCountData(dueSelectedDates[0], dueSelectedDates[1]);
    // }
    if (childUsers.length <= 0) return;
    if (callCountApi) {
      getPendingCustomersCountData(
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1]
      );
    }
  }, [childUsers]);

  const getPendingCustomersCountData = async (startdate, enddate) => {
    const payload = {
      from_date: startdate,
      to_date: enddate,
      user_ids: childUsers,
    };
    try {
      const response = await getPendingFeesCustomersCount(payload);
      console.log("pending fees count response", response);
      const countDetails = response?.data?.data;
      setTodayDueCount(countDetails.today_count);
      setOverAllDueCount(countDetails.overall_count);
      setUrgentDueCount(countDetails.urgent_due_count);
    } catch (error) {
      console.log("lead count error", error);
      // dispatch(storeUsersList([]));
    } finally {
      setTimeout(() => {
        setCallCountApi(false);
        // setUserTableLoading(false);
      }, 300);
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
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    getPendingCustomersCountData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1]
    );
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
            Today Due ( {todayDueCount} )
          </button>
          <button
            className={
              activePage === "overalldue"
                ? "settings_tab_activebutton"
                : "settings_tab_inactivebutton"
            }
            onClick={() => handleTabClick("overalldue")}
          >
            Overall Due ( {overAllDueCount} )
          </button>

          <button
            className={
              activePage === "urgentdue"
                ? "settings_tab_activebutton"
                : "settings_tab_inactivebutton"
            }
            onClick={() => handleTabClick("urgentdue")}
          >
            Urgent Due ( {urgentDueCount} )
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
            setTodayDueCount={setTodayDueCount}
          />
        </div>
      )}

      {loadedTabs.overalldue && (
        <div
          style={{ display: activePage === "overalldue" ? "block" : "none" }}
        >
          <OverallDueCustomers
            key={tabKeys.overalldue}
            setTodayDueCount={setTodayDueCount}
            setOverAllDueCount={setOverAllDueCount}
            setDueSelectedDates={setDueSelectedDates}
          />
        </div>
      )}

      {loadedTabs.urgentdue && (
        <div style={{ display: activePage === "urgentdue" ? "block" : "none" }}>
          <UrgentDueCustomers
            key={tabKeys.urgentdue}
            setDueSelectedDates={setDueSelectedDates}
            setUrgentDueCount={setUrgentDueCount}
          />
        </div>
      )}
    </div>
  );
}
