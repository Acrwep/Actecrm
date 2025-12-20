import * as XLSX from "xlsx";
import moment from "moment";

const PaymentDownloadTableAsCSV = (
  data,
  columns,
  fileName,
  over_all // 👈 pass total object
) => {
  if (!data?.length || !columns?.length) return;

  // ----------------------------
  // 1. MAP COLUMN → TOTAL KEY
  // ----------------------------
  const totalKeyMap = {
    hub: "hub",
    chennai: "chennai",
    bangalore: "bangalore",
    total: "total",
    velachery: "velachery",
    anna_nagar: "anna_nagar",
    porur: "porur",
    omr: "omr",
    e_city: "e_city",
    btm_layout: "btm_layout",
    rajaji_nagar: "rajaji_nagar",
    marathahalli: "marathahalli",
  };

  // ----------------------------
  // 2. CREATE EXCEL DATA
  // ----------------------------
  const worksheetData = [
    // HEADER
    columns.map((col) => col.title),

    // DATA ROWS
    ...data.map((row) =>
      columns.map((column) => {
        const key = column.dataIndex;

        // DATE
        if (key === "date" || key === "DATE") {
          return row[key] ? moment(row[key]).format("DD/MM/YYYY") : "";
        }

        // AMOUNTS
        if (totalKeyMap[key]) {
          return `₹${Number(row[key] || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
        }

        return row[key] ?? "";
      })
    ),

    // ----------------------------
    // 3. TOTAL ROW (FROM over_all)
    // ----------------------------
    columns.map((column) => {
      const key = column.dataIndex;

      if (key === "date" || key === "DATE") return "Total";

      const totalKey = totalKeyMap[key];
      if (totalKey && over_all?.[totalKey] !== undefined) {
        return `${over_all[totalKey]}`;
      }

      return "";
    }),
  ];

  // ----------------------------
  // 4. CREATE FILE
  // ----------------------------
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  XLSX.writeFile(workbook, fileName);
};

export default PaymentDownloadTableAsCSV;
