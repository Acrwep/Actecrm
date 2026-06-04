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
import TicketsReport from "./TicketsReport";
import CustomerFeesHistoryReport from "./CustomerFeesHistoryReport";
import RegionPerformanceReport from "./RegionPerformanceReport";
import UserwiseLeadsourceReport from "./UserwiseLeadSourceReport";
import AnnualSaleReport from "./AnnualSaleReport";

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

  // ✅ Tabs with condition
  const tabItems = [
    permissions.includes("Scorecard Report") && {
      label: "Scoreboard",
      key: "1",
      children: <LeadsScoreboardReport />,
    },
    permissions.includes("Userwise Performance Report") && {
      label: "Userwise Performance",
      key: "2",
      children: <UserwisePerformanceReport />,
    },
    permissions.includes("Userwise Leadsource Analysis Report") && {
      label: "Userwise Leadsource Analysis",
      key: "3",
      children: <UserwiseLeadsourceReport />,
    },
    permissions.includes("Userwise Transaction Analysis Report") && {
      label: "Userwise Transaction Analysis",
      key: "4",
      children: <UserwiseTransactionReport />,
    },
    permissions.includes("Regionwise Performance Report") && {
      label: "Regionwise Performance",
      key: "5",
      children: <RegionPerformanceReport />,
    },
    permissions.includes("Branchwise Performance Report") && {
      label: "Branchwise Performance",
      key: "6",
      children: <BranchPerformanceReport />,
    },
    permissions.includes("Top Performance Channel Report") && {
      label: "Top Performance Channel",
      key: "7",
      children: <TopPerformanceReport />,
    },
    permissions.includes("Post Sale Performance Report") && {
      label: "Post Sale Performance",
      key: "8",
      children: <PostSalePerformanceReport />,
    },
    permissions.includes("Payment Report") && {
      label: "Payment Report",
      key: "9",
      children: <PaymentReport />,
    },
    permissions.includes("Transaction Report") && {
      label: "Transaction Report",
      key: "10",
      children: <TransactionReport />,
    },
    permissions.includes("Transaction Report") && {
      label: "Annual Sale Report",
      key: "11",
      children: <AnnualSaleReport />,
    },
    permissions.includes("Customer Fees History Report") && {
      label: "Customer Fees History Report",
      key: "12",
      children: <CustomerFeesHistoryReport />,
    },
    permissions.includes("Server Report") && {
      label: "Server Report",
      key: "13",
      children: <ServerReport />,
    },
    permissions.includes("Tickets Report") && {
      label: "Tickets Report",
      key: "14",
      children: <TicketsReport />,
    },
  ].filter(Boolean); // ✅ removes false/null items

  return (
    <div>
      <Tabs
        className="report_tabs"
        defaultActiveKey={tabItems[0]?.key} // ✅ auto select first visible tab
        items={tabItems}
      />
    </div>
  );
}
