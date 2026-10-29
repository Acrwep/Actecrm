import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Button, Tooltip } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import { getTableColumns } from "../ApiService/action";
import { useSelector } from "react-redux";
import "./styles.css";
import Placement from "./Placement";
import PlacementCampaigns from "./PlacementCampaigns";

export default function PlacementMainTab() {
  const location = useLocation();
  const [activeBucket, setActiveBucket] = useState("Placement");
  const [placementCount, setPlacementCount] = useState(0);
  const [allTableColumns, setAllTableColumns] = useState(null);

  const permissions = useSelector((state) => state.userpermissions);

  const [visitedBuckets, setVisitedBuckets] = useState({
    Received: true,
  });

  const fetchTableColumns = useCallback(async () => {
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = getLoginUserDetails
      ? JSON.parse(getLoginUserDetails)
      : null;
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
    setVisitedBuckets((prev) => ({ ...prev, [activeBucket]: true }));
  }, [activeBucket]);

  useEffect(() => {
    fetchTableColumns();
  }, [permissions]);

  const handleRefresh = () => {
    if (activeBucket === "Placement") {
      window.dispatchEvent(new CustomEvent("refreshPlacementTab"));
    } else if (activeBucket === "Campaigns") {
      window.dispatchEvent(new CustomEvent("refreshCampaignsTab"));
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
                activeBucket === "Placement"
                  ? "addlead_tab_activebutton"
                  : "addlead_tab_inactivebutton"
              }
              onClick={() => setActiveBucket("Placement")}
            >
              <p>{`Placement (${placementCount})`}</p>
            </div>

            <div
              className={
                activeBucket === "Campaigns"
                  ? "trainers_active_stage4_container"
                  : "trainers_stage4_container"
              }
              onClick={() => setActiveBucket("Campaigns")}
            >
              <p>Campaigns</p>
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
        {visitedBuckets["Placement"] && (
          <div
            style={{
              display: activeBucket === "Placement" ? "block" : "none",
              marginTop: "20px",
            }}
          >
            <Placement
              allTableColumns={allTableColumns}
              setPlacementCount={setPlacementCount}
              refreshTableColumns={fetchTableColumns}
            />
          </div>
        )}

        {visitedBuckets["Campaigns"] && (
          <div
            style={{
              display: activeBucket === "Campaigns" ? "block" : "none",
            }}
          >
            <PlacementCampaigns
              allTableColumns={allTableColumns}
              refreshTableColumns={fetchTableColumns}
            />
          </div>
        )}
      </div>
    </div>
  );
}
