import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Received from "./Received";
import Receivables from "./Receivables";
import FeeHistory from "./FeeHistory";
import { Button, Tooltip } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import { getTableColumns } from "../ApiService/action";
import { useSelector } from "react-redux";

export default function Accounts() {
  const location = useLocation();
  const [activeBucket, setActiveBucket] = useState("Received");
  const [filterData, setFilterData] = useState(null);
  const [receivedCount, setReceivedCount] = useState(0);
  const [receivableCount, setReceivableCount] = useState(0);
  const [feeHistoryCount, setFeeHistoryCount] = useState(0);
  const [allTableColumns, setAllTableColumns] = useState(null);

  const permissions = useSelector((state) => state.userpermissions);

  const fetchTableColumns = useCallback(async () => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = getLoginUserDetails ? JSON.parse(getLoginUserDetails) : null;
    if (convertAsJson?.user_id) {
      try {
        const response = await getTableColumns(convertAsJson.user_id);
        setAllTableColumns(response?.data?.data || []);
      } catch (error) {
        console.log("Accounts table columns error", error);
        setAllTableColumns([]);
      }
    }
  }, []);

  useEffect(() => {
    fetchTableColumns();
  }, [permissions]);

  useEffect(() => {
    if (location.state && location.state.activeBucket) {
      setActiveBucket(location.state.activeBucket);
      setFilterData(location.state);
    }
  }, [location.state]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail && e.detail.activeBucket) {
        setActiveBucket(e.detail.activeBucket);
        setFilterData(e.detail);
      }
    };
    window.addEventListener("accountsNotificationFilter", handler);
    return () =>
      window.removeEventListener("accountsNotificationFilter", handler);
  }, []);

  const handleRefresh = () => {
    if (activeBucket === "Received") {
      window.dispatchEvent(new CustomEvent("refreshReceivedTab"));
    } else if (activeBucket === "Receivables") {
      window.dispatchEvent(new CustomEvent("refreshReceivablesTab"));
    } else if (activeBucket === "FeeHistory") {
      window.dispatchEvent(new CustomEvent("refreshFeeHistoryTab"));
    }
  };

  return (
    <div>
      <div
        className="customers_scroll_wrapper"
        style={{ marginTop: "0px", marginBottom: "16px" }}
      >
        <div
          className="customers_status_mainContainer"
          style={{
            marginTop: "0px",
            marginBottom: "0px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            <div
              className={
                activeBucket === "Received"
                  ? "customers_active_completed_container"
                  : "customers_completed_container"
              }
              onClick={() => setActiveBucket("Received")}
            >
              <p>{`Received (${receivedCount})`}</p>
            </div>

            <div
              className={
                activeBucket === "Receivables"
                  ? "customers_active_pendingfees_container"
                  : "customers_pendingfees_container"
              }
              onClick={() => setActiveBucket("Receivables")}
            >
              <p>{`Receivable (${receivableCount})`}</p>
            </div>
            
            <div
              className={
                activeBucket === "FeeHistory"
                  ? "customers_active_others_container"
                  : "customers_others_container"
              }
              onClick={() => setActiveBucket("FeeHistory")}
            >
              <p>{`Fees History (${feeHistoryCount})`}</p>
            </div>
          </div>

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

      <div>
        <div
          style={{ display: activeBucket === "Received" ? "block" : "none" }}
        >
          <Received
            filterData={filterData}
            setReceivedCount={setReceivedCount}
            allTableColumns={allTableColumns}
            refreshTableColumns={fetchTableColumns}
          />
        </div>
        <div
          style={{ display: activeBucket === "Receivables" ? "block" : "none" }}
        >
          <Receivables
            filterData={filterData}
            setReceivableCount={setReceivableCount}
            allTableColumns={allTableColumns}
            refreshTableColumns={fetchTableColumns}
          />
        </div>
        <div
          style={{ display: activeBucket === "FeeHistory" ? "block" : "none" }}
        >
          <FeeHistory
            filterData={filterData}
            setFeeHistoryCount={setFeeHistoryCount}
            allTableColumns={allTableColumns}
            refreshTableColumns={fetchTableColumns}
          />
        </div>
      </div>
    </div>
  );
}
