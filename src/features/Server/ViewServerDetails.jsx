import React from "react";
import ServerTransCollapse from "./ServerTransCollapse";

export default function ViewServerDetails({ serverDetails }) {
  return (
    <div style={{ padding: "1px 24px 20px 24px" }}>
      <ServerTransCollapse
        serverDetails={serverDetails}
        isShowStartAndEndDate={true}
      />
    </div>
  );
}
