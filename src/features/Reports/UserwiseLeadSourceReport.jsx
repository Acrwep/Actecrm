import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Tooltip, Button, Table } from "antd";
import CommonSelectField from "../Common/CommonSelectField";
import { DownloadOutlined } from "@ant-design/icons";
import { RedoOutlined } from "@ant-design/icons";
import {
  customizeStartDateAndEndDate,
  getCurrentandPreviousweekDate,
  getLast3Months,
} from "../Common/Validation";
import { useSelector } from "react-redux";
import CommonDoubleMonthPicker from "../Common/CommonDoubleMonthPicker";
import { getUsers, userwiseLeadSourceAnalysis } from "../ApiService/action";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import moment from "moment";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import CommonMultiSelectField from "../Common/CommonMultiSelectField";

export default function UserwiseLeadsourceReport() {
  const mounted = useRef(false);
  //permissions
  const childUsers = useSelector((state) => state.childusers);

  const [selectedDates, setSelectedDates] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [totalCounts, setTotalCounts] = useState(null);
  const [loginUserId, setLoginUserId] = useState("");
  const [saleUsersData, setSaleUsersData] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      setSelectedDates(PreviousAndCurrentDate);

      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      setLoginUserId(convertAsJson?.user_id);
      getAllUsersData();
    }
  }, [childUsers]);

  const getAllUsersData = async () => {
    const payload = {
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getUsers(payload);
      const users_data = response?.data?.data?.data || [];
      const activeSaleUsers = users_data.filter(
        (user) =>
          user.is_active === 1 &&
          user.roles?.some((role) => role.role_name === "Sale"),
      );
      setSaleUsersData(activeSaleUsers);
    } catch (error) {
      setSaleUsersData([]);
      console.log(error);
    } finally {
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      getTransactionReportData(
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        null,
      );
    }
  };

  const getColumns = (data) => {
    if (!data || !data.length) return [];

    const firstRow = data[0];

    const baseColumns = [
      {
        title: "DATE",
        dataIndex: "report_date",
        key: "report_date",
        fixed: "left",
        width: 120,
        align: "center",
        render: (text) => moment(text).format("DD/MM/YYYY"),
      },
    ];

    const suffixMap = {
      direct: "Direct",
      livechat: "Live Chat",
      ivr: "IVR",
      smo: "SMO",
      call: "Call",
      enquiry: "Enquiry",
      reference: "Reference",
      whatsapp: "Whatapp",
      total: "Total",
    };

    const orderedSuffixes = [
      "direct",
      "ivr",
      "smo",
      "call",
      "enquiry",
      "reference",
      "livechat",
      "whatsapp",
      "total",
    ];

    // extract only valid users
    const users = [];

    Object.keys(firstRow).forEach((key) => {
      if (key !== "report_date" && key.includes("_")) {
        const parts = key.split("_");
        const suffix = parts.pop();

        if (orderedSuffixes.includes(suffix)) {
          const username = parts.join("_");

          if (!users.includes(username)) {
            users.push(username);
          }
        }
      }
    });

    const groupedColumns = users.map((user) => ({
      title: user.toUpperCase(),
      align: "center",
      children: orderedSuffixes
        .filter((suffix) => firstRow.hasOwnProperty(`${user}_${suffix}`))
        .map((suffix) => ({
          title: suffixMap[suffix],
          dataIndex: `${user}_${suffix}`,
          key: `${user}_${suffix}`,
          width: 90,
          align: "center",
          className: suffix === "total" ? "total-column-cell" : "",
          onHeaderCell: () => ({
            className: suffix === "total" ? "total-column-header" : "",
          }),
          render: (value) => (
            <div
              style={{
                fontWeight: suffix === "total" ? 700 : 400,
                color: suffix === "total" ? "#7a5200" : "#000",
              }}
            >
              {value || 0}
            </div>
          ),
        })),
    }));

    return [...baseColumns, ...groupedColumns];
  };

  const getTransactionReportData = async (startDate, endDate, user_id) => {
    setLoading(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      user_ids: user_id,
    };
    try {
      const response = await userwiseLeadSourceAnalysis(payload);
      console.log("userwise transaction report response", response);
      const apiRows = response?.data?.data[0] || []; // 🔥 IMPORTANT FIX

      const formatted = apiRows
        .filter((row) => row.user_name !== "total")
        .map((row, index) => ({
          key: index,
          ...row,
        }));

      const totalRow = apiRows.find((row) => row.user_name === "total");
      const sortedData = formatted.sort((a, b) => {
        if (a.user_name && a.user_name.toLowerCase().includes("balaji"))
          return -1;
        if (b.user_name && b.user_name.toLowerCase().includes("balaji"))
          return 1;
        return 0;
      });
      setTotalCounts(totalRow);
      setReportData(sortedData);
    } catch (error) {
      setReportData([]);
      setTotalCounts(null);
      console.log("userwise transaction report error", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = getColumns(reportData);

  const handlePaginationChange = ({ page, limit }) => {
    setPagination({
      page: page,
      limit: limit,
    });
  };

  const handleSelectUser = (e) => {
    const value = e.target.value;
    setSelectedUserId(value);
    setPagination({
      page: 1,
      limit: pagination.limit,
    });
    getTransactionReportData(selectedDates[0], selectedDates[1], value);
  };

  const flattenColumns = (columns) => {
    const result = [];

    columns.forEach((col) => {
      if (col.children) {
        col.children.forEach((child) => {
          result.push({
            title: `${col.title} - ${child.title}`,
            dataIndex: child.dataIndex,
            key: child.key,
          });
        });
      } else {
        result.push({
          title: col.title,
          dataIndex: col.dataIndex,
          key: col.key,
        });
      }
    });

    return result;
  };

  const DownloadDataAsCSV = (data, columns, filename) => {
    const headerRow1 = [];
    const headerRow2 = [];
    const flatColumns = [];

    columns.forEach((col) => {
      if (col.children) {
        col.children.forEach((child) => {
          headerRow1.push(col.title);
          headerRow2.push(child.title);
          flatColumns.push(child);
        });
      } else {
        headerRow1.push(col.title);
        headerRow2.push("");
        flatColumns.push(col);
      }
    });

    let csvContent = "";

    // Parent Header Row
    csvContent += headerRow1.join(",") + "\n";

    // Child Header Row
    csvContent += headerRow2.join(",") + "\n";

    // Data Rows
    data.forEach((row) => {
      const rowData = flatColumns.map((col) => row[col.dataIndex] ?? "");

      csvContent += rowData.join(",") + "\n";
    });

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = () => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setPagination({
      page: 1,
      limit: 100,
    });
    getTransactionReportData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      null,
    );
  };

  const renderSummary = () => {
    if (!totalCounts) return null;

    // Flatten leaf columns (skip the first user name column)
    const leafColumns = columns.reduce((acc, col) => {
      if (col.children) acc.push(...col.children);
      else if (col.key !== "user_name") acc.push(col);
      return acc;
    }, []);

    return (
      <Table.Summary fixed="top">
        <Table.Summary.Row className="total-row-bg sticky-header">
          <Table.Summary.Cell index={0} fixed="left">
            <p style={{ fontWeight: 600, paddingLeft: "8px" }}>Total</p>
          </Table.Summary.Cell>
          {leafColumns.map((col, index) => {
            const value = totalCounts[col.key] || 0;
            const amount = Number(value).toLocaleString("en-IN");
            return (
              <Table.Summary.Cell
                key={col.key}
                index={index + 1}
                align="right"
                fixed={col.fixed}
              >
                <p
                  style={{
                    fontWeight: 600,
                    textAlign: "right",
                    paddingRight: "4px",
                    fontSize: "12px",
                  }}
                >
                  {"₹" + amount}
                </p>
              </Table.Summary.Cell>
            );
          })}
        </Table.Summary.Row>
      </Table.Summary>
    );
  };
  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={17}>
          <Row gutter={16}>
            <Col span={7}>
              <CommonMultiSelectField
                height="35px"
                label="Select User"
                labelMarginTop="0px"
                labelFontSize="13px"
                options={saleUsersData}
                onChange={handleSelectUser}
                value={selectedUserId}
              />
            </Col>
            <Col span={16}>
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setPagination({
                    page: 1,
                    limit: pagination.limit,
                  });
                  getTransactionReportData(dates[0], dates[1], selectedUserId);
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={7}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <Tooltip placement="top" title="Download">
            <Button
              className="reports_download_button"
              onClick={() => {
                const formattedData = [...reportData, totalCounts]
                  .filter(Boolean)
                  .map((row) => ({
                    ...row,
                    user_name:
                      row.user_name === "total" ? "Total" : row.user_name, // Excel-safe
                  }));
                DownloadDataAsCSV(
                  formattedData,
                  columns,
                  `${moment(selectedDates[0]).format("DD-MM-YYYY")} to ${moment(
                    selectedDates[1],
                  ).format("DD-MM-YYYY")} Userwise Lead Source Report.csv`,
                );
              }}
            >
              <DownloadOutlined size={10} className="download_icon" />
            </Button>
          </Tooltip>

          <Tooltip placement="top" title="Refresh">
            <Button
              className="leadmanager_refresh_button"
              onClick={handleRefresh}
            >
              <RedoOutlined className="refresh_icon" />
            </Button>
          </Tooltip>
        </Col>
      </Row>

      <div style={{ marginTop: "30px" }}>
        {/* <CommonTable
          scroll={{ x: "max-content" }}
          columns={columns}
          dataSource={reportData}
          dataPerPage={10}
          loading={loading}
          checkBox="false"
          size="small"
          className="leadsourcereport_table"
          onPaginationChange={handlePaginationChange} // callback to fetch new data
          limit={pagination.limit} // page size
          page_number={pagination.page} // current page
          totalPageNumber={pagination.total} // total rows
          rowClassName={(record, index) =>
            record.user_name === "total" ? "total-row-bg" : ""
          }
          summary={renderSummary}
        /> */}
        <Table
          scroll={{ x: "max-content" }}
          columns={columns}
          dataSource={reportData}
          loading={loading}
          size="small"
          bordered
          pagination={false}
          className="leadsourcereport_table"
          summary={renderSummary}
        />
      </div>
    </div>
  );
}
