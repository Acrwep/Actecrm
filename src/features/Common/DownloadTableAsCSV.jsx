import * as XLSX from "xlsx";
import moment from "moment";

const DownloadTableAsCSV = (data, columns, fileName) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Map columns and data to create a worksheet
  const worksheetData = [
    columns.map((column) => column.title), // headers
    ...data.map((row) =>
      columns.map((column) => {
        // Handle nested in/out times
        const columnData = column.dataIndex;
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
          column.dataIndex === "end_date"
        ) {
          return row[column.dataIndex]
            ? moment(row[column.dataIndex]).format("DD/MM/YYYY")
            : null;
        }
        return row[column.dataIndex]; // other fields
      })
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
