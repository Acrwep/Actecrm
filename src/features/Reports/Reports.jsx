import React from "react";
import { useNavigate } from "react-router-dom";
import { Tabs } from "antd";
import LeadsScoreboardReport from "./LeadsScoreboardReport";
import UserwisePerformanceReport from "./UserwisePerformanceReport";
import BranchPerformanceReport from "./BranchPerformanceReport";
import { useSelector } from "react-redux";
import "./styles.css";
import PostSalePerformanceReport from "./PostSalePerformanceReport";
import TopPerformanceReport from "./TopPerformanceReport";
import PaymentReport from "./PaymentReport";
import TransactionReport from "./TransactionReport";
import UserwiseTransactionReport from "./UserwiseTransactionReport";
import ServerReport from "./ServerReport";

export default function Reports() {
  const navigate = useNavigate();
  //permissions
  const permissions = useSelector((state) => state.userpermissions);

  React.useEffect(() => {
    if (permissions.length >= 1) {
      if (!permissions.includes("Reports Page")) {
        navigate("/dashboard");
        return;
      }
    }
  }, [permissions]);

  return (
    <div>
      <Tabs
        className="report_tabs"
        defaultActiveKey="1"
        items={[
          {
            label: "Scoreboard",
            key: "1",
            children: <LeadsScoreboardReport />,
          },
          {
            label: "Userwise Performance",
            key: "2",
            children: <UserwisePerformanceReport />,
          },
          {
            label: "Userwise Transaction Analysis",
            key: "3",
            children: <UserwiseTransactionReport />,
          },
          {
            label: "Branchwise Performance",
            key: "4",
            children: <BranchPerformanceReport />,
          },
          {
            label: "Top Performance Channel",
            key: "5",
            children: <TopPerformanceReport />,
          },
          {
            label: "Post Sale Performance",
            key: "6",
            children: <PostSalePerformanceReport />,
          },
          {
            label: "Payment Report",
            key: "7",
            children: <PaymentReport />,
          },
          {
            label: "Transaction Report",
            key: "8",
            children: <TransactionReport />,
          },
          {
            label: "Server Report",
            key: "9",
            children: <ServerReport />,
          },
          // {
          //   label: "RA Performance",
          //   key: "7",
          //   children: <RaPerformanceReport />,
          // },
          // {
          //   label: "Quality Performance",
          //   key: "8",
          //   children: <QualityReport />,
          // },
        ]}
      />
    </div>
  );
}
