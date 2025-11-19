export const DashboardDownloadColumns = (type) => {
  let columns;

  if (type == "Sale Performance") {
    columns = [
      {
        title: "Sale Volume",
        key: "sale_volume",
        dataIndex: "sale_volume",
      },
      {
        title: "Collection",
        key: "total_collection",
        dataIndex: "total_collection",
      },
      {
        title: "Pending Fees",
        key: "pending_payment",
        dataIndex: "pending_payment",
      },
    ];
  } else if (type == "Userwise Leads") {
    columns = [
      {
        title: "User Id",
        key: "user_id",
        dataIndex: "user_id",
      },
      {
        title: "User Name",
        key: "user_name",
        dataIndex: "user_name",
      },
      {
        title: "Total Leads",
        key: "total_leads",
        dataIndex: "total_leads",
      },
      {
        title: "Joinings",
        key: "leads_customer_count",
        dataIndex: "leads_customer_count",
      },
      {
        title: "Conversion Rate",
        key: "leads_percentage",
        dataIndex: "leads_percentage",
      },
      {
        title: "Total Followup",
        key: "lead_followup_count",
        dataIndex: "lead_followup_count",
      },
      {
        title: "Followup Handled",
        key: "followup_handled",
        dataIndex: "followup_handled",
      },
      {
        title: "Followup Un-Handled",
        key: "followup_unhandled",
        dataIndex: "followup_unhandled",
      },
      {
        title: "Followup Efficiency",
        key: "followup_percentage",
        dataIndex: "followup_percentage",
      },
    ];
  } else if (type == "Userwise Followup") {
    columns = [
      {
        title: "User Id",
        key: "user_id",
        dataIndex: "user_id",
      },
      {
        title: "User Name",
        key: "user_name",
        dataIndex: "user_name",
      },
      {
        title: "Total Followup",
        key: "lead_followup_count",
        dataIndex: "lead_followup_count",
      },
      {
        title: "Followup Handled",
        key: "followup_handled",
        dataIndex: "followup_handled",
      },
      {
        title: "Followup Un-Handled",
        key: "followup_unhandled",
        dataIndex: "followup_unhandled",
      },
      {
        title: "Efficiency",
        key: "percentage",
        dataIndex: "percentage",
      },
    ];
  } else if (type == "Userwise Joinings") {
    columns = [
      {
        title: "User Id",
        key: "user_id",
        dataIndex: "user_id",
      },
      {
        title: "User Name",
        key: "user_name",
        dataIndex: "user_name",
      },
      {
        title: "Joinings",
        key: "customer_count",
        dataIndex: "customer_count",
      },
    ];
  } else if (type == "Userwise Sales") {
    columns = [
      {
        title: "User Id",
        key: "user_id",
        dataIndex: "user_id",
      },
      {
        title: "User Name",
        key: "user_name",
        dataIndex: "user_name",
      },
      {
        title: "Sale Volume",
        key: "sale_volume",
        dataIndex: "sale_volume",
      },
      {
        title: "Target",
        key: "target_value",
        dataIndex: "target_value",
      },
      {
        title: "Collection",
        key: "total_collection",
        dataIndex: "total_collection",
      },
      {
        title: "Collection Efficiency",
        key: "target_percentage",
        dataIndex: "target_percentage",
      },
      {
        title: "Pending",
        key: "pending",
        dataIndex: "pending",
      },
    ];
  } else if (type == "Userwise Collection") {
    columns = [
      {
        title: "User Id",
        key: "user_id",
        dataIndex: "user_id",
      },
      {
        title: "User Name",
        key: "user_name",
        dataIndex: "user_name",
      },
      {
        title: "Target",
        key: "target_value",
        dataIndex: "target_value",
      },
      {
        title: "Collection",
        key: "total_collection",
        dataIndex: "total_collection",
      },
      {
        title: "Percentage",
        key: "percentage",
        dataIndex: "percentage",
      },
    ];
  } else if (type == "Userwise Pending") {
    columns = [
      {
        title: "User Id",
        key: "user_id",
        dataIndex: "user_id",
      },
      {
        title: "User Name",
        key: "user_name",
        dataIndex: "user_name",
      },
      {
        title: "Pending",
        key: "pending",
        dataIndex: "pending",
      },
    ];
  } else if (type == "Branchwise Leads") {
    columns = [
      {
        title: "Branch Name",
        key: "branch_name",
        dataIndex: "branch_name",
      },
      {
        title: "Total Leads",
        key: "total_leads",
        dataIndex: "total_leads",
      },
      {
        title: "Joinings",
        key: "customer_count",
        dataIndex: "customer_count",
      },
      {
        title: "Conversion",
        key: "percentage",
        dataIndex: "percentage",
      },
    ];
  } else if (type == "Branchwise Followup") {
    columns = [
      {
        title: "Branch Name",
        key: "branch_name",
        dataIndex: "branch_name",
      },
      {
        title: "Total Followup",
        key: "lead_followup_count",
        dataIndex: "lead_followup_count",
      },
      {
        title: "Followup Handled",
        key: "followup_handled",
        dataIndex: "followup_handled",
      },
      {
        title: "Followup Un-Handled",
        key: "followup_unhandled",
        dataIndex: "followup_unhandled",
      },
      {
        title: "Efficiency",
        key: "percentage",
        dataIndex: "percentage",
      },
    ];
  } else if (type == "Branchwise Joinings") {
    columns = [
      {
        title: "Branch Name",
        key: "branch_name",
        dataIndex: "branch_name",
      },
      {
        title: "Joinings",
        key: "customer_count",
        dataIndex: "customer_count",
      },
    ];
  } else if (type == "Branchwise Sale Volume") {
    columns = [
      {
        title: "Branch Name",
        key: "branch_name",
        dataIndex: "branch_name",
      },
      {
        title: "Sale Volume",
        key: "sale_volume",
        dataIndex: "sale_volume",
      },
    ];
  } else if (type == "Branchwise Collection") {
    columns = [
      {
        title: "Branch Name",
        key: "branch_name",
        dataIndex: "branch_name",
      },
      {
        title: "Collection",
        key: "total_collection",
        dataIndex: "total_collection",
      },
    ];
  } else if (type == "Branchwise Pending") {
    columns = [
      {
        title: "Branch Name",
        key: "branch_name",
        dataIndex: "branch_name",
      },
      {
        title: "Pending",
        key: "pending",
        dataIndex: "pending",
      },
    ];
  } else if (type == "HR Dashboard") {
    columns = [
      {
        title: "Awaiting Trainer",
        key: "awaiting_trainer",
        dataIndex: "awaiting_trainer",
      },
      {
        title: "Awaiting Trainer Verify",
        key: "awaiting_trainer_verify",
        dataIndex: "awaiting_trainer_verify",
      },
      {
        title: "Verified Trainers",
        key: "verified_trainer",
        dataIndex: "verified_trainer",
      },
      {
        title: "Rejected Trainers",
        key: "rejected_trainer",
        dataIndex: "rejected_trainer",
      },
    ];
  } else if (type == "RA Dashboard") {
    columns = [
      {
        title: "Awaiting Class",
        key: "awaiting_class",
        dataIndex: "awaiting_class",
      },
      {
        title: "Awaiting Student Verify",
        key: "awaiting_verify",
        dataIndex: "awaiting_verify",
      },
      {
        title: "Class Scheduled",
        key: "class_scheduled",
        dataIndex: "class_scheduled",
      },
      {
        title: "Class Going",
        key: "class_going",
        dataIndex: "class_going",
      },
      {
        title: "Google Review Collected",
        key: "google_review_count",
        dataIndex: "google_review_count",
      },
      {
        title: "Linkedin Review Collected",
        key: "linkedin_review_count",
        dataIndex: "linkedin_review_count",
      },
      {
        title: "Completed",
        key: "class_completed",
        dataIndex: "class_completed",
      },
    ];
  } else {
    columns = [];
  }

  return columns;
};
