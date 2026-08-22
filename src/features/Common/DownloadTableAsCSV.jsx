import * as XLSX from "xlsx";
import moment from "moment";
import { Country, State } from "country-state-city";

const DownloadTableAsCSV = (
  data,
  columns,
  fileName,
  isTrainerPayment = false,
) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Map columns and data to create a worksheet
  const worksheetData = [
    columns.map((column) => column.title), // headers
    ...data.map((row) =>
      columns.map((column) => {
        // Handle nested in/out times
        const columnData = column.dataIndex;
        console.log(columnData, "columnData");
        if (Array.isArray(columnData)) {
          const dateKey = columnData[0];
          const timeType = columnData[1];

          const logData = row[dateKey];
          if (logData && logData[timeType]) {
            if (logData[timeType] === "weeklyoff") {
              return "Weekly off";
            } else if (logData[timeType] !== "0001-01-01T00:00:00") {
              return moment(logData[timeType]).format("hh:mm A");
            }
          }
          return null;
        }

        // Format time fields using moment
        if (
          column.dataIndex === "created_on" ||
          column.dataIndex === "end_date" ||
          column.dataIndex === "next_follow_up_date" ||
          column.dataIndex === "expected_join_date" ||
          column.dataIndex === "created_date" ||
          column.dataIndex === "date" ||
          column.dataIndex === "entry_date" ||
          column.dataIndex === "paid_date" ||
          column.dataIndex === "approved_date" ||
          column.dataIndex === "bill_raisedate" ||
          column.dataIndex === "DATE"
        ) {
          const value = row[column.dataIndex];

          // ✅ Keep TOTAL as is
          if (value === "total" || value === "Total") return "Total";

          const parsed = moment(value, ["DD/MM/YYYY", "YYYY-MM-DD"], true);

          return parsed.isValid() ? parsed.format("YYYY-MM-DD") : value;
        }
        if (
          column.dataIndex === "percentage" ||
          column.dataIndex === "leads_percentage" ||
          column.dataIndex === "followup_percentage" ||
          column.dataIndex === "target_percentage" ||
          column.dataIndex === "lead_to_customer_percentage" ||
          column.dataIndex === "followup_handled_percentage"
        ) {
          return row[column.dataIndex] ? row[column.dataIndex] + "%" : 0 + "%";
        }
        if (
          column.dataIndex === "sale_volume" ||
          column.dataIndex === "target_value" ||
          column.dataIndex === "total_collection" ||
          column.dataIndex === "pending" ||
          column.dataIndex === "collection" ||
          column.dataIndex === "pending_payment" ||
          column.dataIndex === "primary_fees" ||
          column.dataIndex === "total_amount" ||
          column.dataIndex === "gst_amount" ||
          column.dataIndex === "paid_amount" ||
          column.dataIndex === "pending_fees" ||
          column.dataIndex === "secondary_fees" ||
          column.dataIndex === "chennai" ||
          column.dataIndex === "bangalore" ||
          column.dataIndex === "hub" ||
          column.dataIndex === "velachery" ||
          column.dataIndex === "anna_nagar" ||
          column.dataIndex === "porur" ||
          column.dataIndex === "omr" ||
          column.dataIndex === "e_city" ||
          column.dataIndex === "btm_layout" ||
          column.dataIndex === "rajaji_nagar" ||
          column.dataIndex === "marathahalli" ||
          column.dataIndex === "cash" ||
          column.dataIndex === "upi" ||
          column.dataIndex === "razorpay" ||
          column.dataIndex === "razorpay_upi" ||
          column.dataIndex === "tds" ||
          column.dataIndex === "sbi_bank" ||
          column.dataIndex === "axis_bank" ||
          column.dataIndex === "hdfc_bank" ||
          column.dataIndex === "sbi_pos" ||
          column.dataIndex === "razorpay_pos" ||
          column.dataIndex === "total_course_fees" ||
          column.dataIndex === "paid_amount" ||
          column.dataIndex === "balance_due" ||
          column.dataIndex === "request_amount" ||
          column.dataIndex === "total"
        ) {
          return row[column.dataIndex]
            ? ` ₹${Number(row[column.dataIndex]).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "₹" + 0;
        }
        if (
          column.dataIndex === "leads" ||
          column.dataIndex === "joins" ||
          column.dataIndex === "total_followups" ||
          column.dataIndex === "follow_up_handled" ||
          column.dataIndex === "follow_up_unhandled" ||
          column.dataIndex === "followup_handled" ||
          column.dataIndex === "followup_unhandled"
        ) {
          return row[column.dataIndex]
            ? ` ${Number(row[column.dataIndex]).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : 0;
        }
        //leads table handle
        if (column.dataIndex === "country") {
          let countryName = "";
          const countries = Country.getAllCountries();

          const findCountry = countries.find(
            (f) => f.isoCode == row[column.dataIndex],
          );

          if (findCountry) {
            countryName = findCountry.name;
          } else {
            countryName = "";
          }
          return countryName;
        }

        if (column.dataIndex === "state") {
          const stateList = State.getStatesOfCountry(row.country);
          const updateSates = stateList.map((s) => {
            return { ...s, id: s.isoCode };
          });

          let stateName = "";

          const findState = updateSates.find(
            (f) => f.id == row[column.dataIndex],
          );
          if (findState) {
            stateName = findState.name;
          } else {
            stateName = "";
          }
          return stateName;
        }
        //customers table handling
        if (column.dataIndex === "lead_assigned_to_name") {
          const lName = row[column.dataIndex];
          if (!lName) return "-";
          return row.lead_assigned_to_id
            ? `${row.lead_assigned_to_id} - ${lName}`
            : lName;
        }
        if (column.dataIndex === "lead_assigned_to_id") {
          const l_id = row[column.dataIndex];
          if (!l_id) return "-";
          return l_id ? `${l_id} - ${row.lead_assigned_to_name}` : l_id;
        }

        if (column.dataIndex === "ra_user_id") {
          const ra_id = row[column.dataIndex];
          if (!ra_id) return "-";
          return ra_id ? `${ra_id} - ${row.ra_user_name}` : ra_id;
        }

        if (column.dataIndex === "hr_user_id") {
          const hr_id = row[column.dataIndex];
          if (!hr_id) return "-";
          return hr_id ? `${hr_id} - ${row.hr_user_name}` : hr_id;
        }

        if (column.dataIndex === "user_name") {
          const uName = row[column.dataIndex];
          if (!uName) return "-";
          if (uName === "Total" || uName === "total") return "Total";
          return row.user_id ? `${row.user_id} - ${uName}` : uName;
        }
        if (column.dataIndex === "is_customer_updated") {
          if (row[column.dataIndex] == 1) {
            return "Completed";
          } else {
            return "Pending";
          }
        }

        if (
          column.dataIndex === "google_review" ||
          column.dataIndex === "linkedin_review"
        ) {
          return row[column.dataIndex] ? "Collected" : "Not Collected";
        }

        if (
          column.dataIndex === "is_payment_cleared" ||
          column.dataIndex === "is_class_percentage" ||
          column.dataIndex === "is_acknowledged" ||
          column.dataIndex === "is_google_verified" ||
          column.dataIndex === "is_linkedin_verified"
        ) {
          return row[column.dataIndex] ? "Yes" : "No";
        }

        if (column.dataIndex === "status" && isTrainerPayment) {
          const status = row[column.dataIndex];
          if (status === "Requested") {
            return "Claim";
          } else if (status === "Awaiting Finance") {
            return "Ready to Pay";
          } else {
            return status;
          }
        }
        if (column.dataIndex === "commercial_percentage") {
          return row[column.dataIndex] ? row[column.dataIndex] + "%" : "-";
        }

        //assign lead table handling
        if (column.dataIndex === "assigned_by_user") {
          const Name = row[column.dataIndex];
          if (!Name) return "-";
          return row.assigned_by ? `${row.assigned_by} - ${Name}` : Name;
        }

        if (column.dataIndex === "assigned_to_user") {
          const Name = row[column.dataIndex];
          if (!Name) return "-";
          return row.assigned_to ? `${row.assigned_to} - ${Name}` : Name;
        }

        return row[column.dataIndex]; // other fields
      }),
    ), // data rows
  ];

  // Create worksheet from array of arrays
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Write the workbook to file
  XLSX.writeFile(workbook, fileName);
};

export default DownloadTableAsCSV;
