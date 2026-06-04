import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Tooltip, Button, DatePicker, Table } from "antd";
import { DownloadOutlined, RedoOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { annualReport } from "../ApiService/action";
import "./styles.css";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import dayjs from "dayjs";

export default function AnnualSaleReport() {
  const mounted = useRef(false);
  const childUsers = useSelector((state) => state.childusers);

  const [selectedYear, setSelectedYear] = useState(dayjs());
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state just in case CommonTable expects it
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0,
  });

  const getHeaderStyle = (colorClass) => () => ({
    className: colorClass,
    style: {
      whiteSpace: "nowrap",
      border: "1px solid rgba(255,255,255,0.15)",
    },
  });

  const blueHeader = getHeaderStyle("header-blue");
  const orangeHeader = getHeaderStyle("header-orange");
  const greenHeader = getHeaderStyle("header-green");
  const cyanHeader = getHeaderStyle("header-cyan");
  const purpleHeader = getHeaderStyle("header-purple");

  const getCellProps = (record, spanKey, colorClass) => {
    return {
      rowSpan: spanKey ? record[spanKey] : 1,
      className: colorClass || "cell-grey",
    };
  };

  const columns = [
    {
      title: "ANNUALLY",
      dataIndex: "annually",
      align: "center",
      width: 100,
      onHeaderCell: blueHeader,
      onCell: (record) => getCellProps(record, "rowSpan12", "cell-light-blue"),
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "TOTAL",
      onHeaderCell: blueHeader,
      children: [
        { title: "LEAD", dataIndex: "total_lead", align: "center", width: 80, onHeaderCell: blueHeader, onCell: (record) => getCellProps(record, "rowSpan12", "cell-light-blue") },
        { title: "JOINT", dataIndex: "total_joint", align: "center", width: 80, onHeaderCell: blueHeader, onCell: (record) => getCellProps(record, "rowSpan12", "cell-light-blue") },
        { title: "PAYMENT", dataIndex: "total_payment", align: "center", width: 100, onHeaderCell: blueHeader, onCell: (record) => getCellProps(record, "rowSpan12", "cell-light-blue") },
      ],
    },
    {
      title: "AVERAGE PER MONTH",
      onHeaderCell: orangeHeader,
      children: [
        { title: "L", dataIndex: "avg_month_lead", align: "center", width: 60, onHeaderCell: orangeHeader, onCell: (record) => getCellProps(record, "rowSpan12", "cell-light-orange") },
        { title: "J", dataIndex: "avg_month_joint", align: "center", width: 60, onHeaderCell: orangeHeader, onCell: (record) => getCellProps(record, "rowSpan12", "cell-light-orange") },
        { title: "P", dataIndex: "avg_month_payment", align: "center", width: 80, onHeaderCell: orangeHeader, onCell: (record) => getCellProps(record, "rowSpan12", "cell-light-orange") },
      ],
    },
    {
      title: "AVERAGE PER DAY",
      onHeaderCell: orangeHeader,
      children: [
        { title: "L", dataIndex: "avg_day_lead", align: "center", width: 60, onHeaderCell: orangeHeader, onCell: (record) => getCellProps(record, "rowSpan12", "cell-light-orange") },
        { title: "J", dataIndex: "avg_day_joint", align: "center", width: 60, onHeaderCell: orangeHeader, onCell: (record) => getCellProps(record, "rowSpan12", "cell-light-orange") },
        { title: "P", dataIndex: "avg_day_payment", align: "center", width: 80, onHeaderCell: orangeHeader, onCell: (record) => getCellProps(record, "rowSpan12", "cell-light-orange") },
      ],
    },
    {
      title: "HALF YEARLY",
      dataIndex: "half_yearly_name",
      align: "center",
      width: 100,
      onHeaderCell: greenHeader,
      onCell: (record) => getCellProps(record, "rowSpan6", "cell-light-green"),
      render: (text) => <em>{text}</em>,
    },
    {
      title: "LEAD",
      dataIndex: "half_yearly_lead",
      align: "center",
      width: 70,
      onHeaderCell: greenHeader,
      onCell: (record) => getCellProps(record, "rowSpan6", "cell-light-green"),
    },
    {
      title: "JOINT",
      dataIndex: "half_yearly_joint",
      align: "center",
      width: 70,
      onHeaderCell: greenHeader,
      onCell: (record) => getCellProps(record, "rowSpan6", "cell-light-green"),
    },
    {
      title: "PAYMENT",
      dataIndex: "half_yearly_payment",
      align: "center",
      width: 90,
      onHeaderCell: greenHeader,
      onCell: (record) => getCellProps(record, "rowSpan6", "cell-light-green"),
    },
    {
      title: "QUARTERLY",
      dataIndex: "quarterly_name",
      align: "center",
      width: 90,
      onHeaderCell: cyanHeader,
      onCell: (record) => getCellProps(record, "rowSpan3", "cell-light-cyan"),
    },
    {
      title: "LEAD",
      dataIndex: "quarterly_lead",
      align: "center",
      width: 70,
      onHeaderCell: cyanHeader,
      onCell: (record) => getCellProps(record, "rowSpan3", "cell-light-cyan"),
    },
    {
      title: "JOINT",
      dataIndex: "quarterly_joint",
      align: "center",
      width: 70,
      onHeaderCell: cyanHeader,
      onCell: (record) => getCellProps(record, "rowSpan3", "cell-light-cyan"),
    },
    {
      title: "PAYMENT",
      dataIndex: "quarterly_payment",
      align: "center",
      width: 90,
      onHeaderCell: cyanHeader,
      onCell: (record) => getCellProps(record, "rowSpan3", "cell-light-cyan"),
    },
    {
      title: "MONTH",
      dataIndex: "month_name",
      align: "center",
      width: 70,
      onHeaderCell: purpleHeader,
      onCell: (record) => getCellProps(record, null, "cell-light-purple"),
    },
    {
      title: "LEAD",
      dataIndex: "month_lead",
      align: "center",
      width: 70,
      onHeaderCell: purpleHeader,
      onCell: (record) => getCellProps(record, null, "cell-light-purple"),
    },
    {
      title: "JOINT",
      dataIndex: "month_joint",
      align: "center",
      width: 70,
      onHeaderCell: purpleHeader,
      onCell: (record) => getCellProps(record, null, "cell-light-purple"),
    },
    {
      title: "PAYMENT",
      dataIndex: "month_payment",
      align: "center",
      width: 90,
      onHeaderCell: purpleHeader,
      onCell: (record) => getCellProps(record, null, "cell-light-purple"),
    },
  ];

  const monthOrder = [
    { name: "APR", q: "Q1", h: "first_half", hName: "FIRST HALF" },
    { name: "MAY", q: "Q1", h: "first_half", hName: "FIRST HALF" },
    { name: "JUN", q: "Q1", h: "first_half", hName: "FIRST HALF" },
    { name: "JUL", q: "Q2", h: "first_half", hName: "FIRST HALF" },
    { name: "AUG", q: "Q2", h: "first_half", hName: "FIRST HALF" },
    { name: "SEP", q: "Q2", h: "first_half", hName: "FIRST HALF" },
    { name: "OCT", q: "Q3", h: "second_half", hName: "SECOND HALF" },
    { name: "NOV", q: "Q3", h: "second_half", hName: "SECOND HALF" },
    { name: "DEC", q: "Q3", h: "second_half", hName: "SECOND HALF" },
    { name: "JAN", q: "Q4", h: "second_half", hName: "SECOND HALF" },
    { name: "FEB", q: "Q4", h: "second_half", hName: "SECOND HALF" },
    { name: "MAR", q: "Q4", h: "second_half", hName: "SECOND HALF" },
  ];

  const transformData = (data) => {
    if (!data || data.length === 0) return [];
    const rows = [];

    data.forEach((report, index) => {
      monthOrder.forEach((month, row) => {
        rows.push({
          id: `${report.financial_year || index}_${month.name}`,

          annually: report.financial_year || "-",
          rowSpan12: row === 0 ? 12 : 0,

          total_lead: report.total?.lead || 0,
          total_joint: report.total?.joint || 0,
          total_payment: report.total?.payment || 0,

          avg_month_lead: report.average_per_month?.lead || 0,
          avg_month_joint: report.average_per_month?.joint || 0,
          avg_month_payment: report.average_per_month?.payment || 0,

          avg_day_lead: report.average_per_day?.lead || 0,
          avg_day_joint: report.average_per_day?.joint || 0,
          avg_day_payment: report.average_per_day?.payment || 0,

          rowSpan6: row % 6 === 0 ? 6 : 0,
          half_yearly_name: month.hName,
          half_yearly_lead: report.half_yearly?.[month.h]?.lead || 0,
          half_yearly_joint: report.half_yearly?.[month.h]?.joint || 0,
          half_yearly_payment: report.half_yearly?.[month.h]?.payment || 0,

          rowSpan3: row % 3 === 0 ? 3 : 0,
          quarterly_name: month.q,
          quarterly_lead: report.quarterly?.[month.q]?.lead || 0,
          quarterly_joint: report.quarterly?.[month.q]?.joint || 0,
          quarterly_payment: report.quarterly?.[month.q]?.payment || 0,

          month_name: month.name,
          month_lead: report.monthly?.[month.name]?.lead || 0,
          month_joint: report.monthly?.[month.name]?.joint || 0,
          month_payment: report.monthly?.[month.name]?.payment || 0,
        });
      });
    });

    return rows;
  };

  useEffect(() => {
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      const currentYear = dayjs().year();
      const startDate = `${currentYear - 1}-12-26`;
      const endDate = `${currentYear}-12-25`;
      getAnnualReportData(startDate, endDate);
    }
  }, [childUsers]);

  const getAnnualReportData = async (startDate, endDate) => {
    setLoading(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
    };
    try {
      const response = await annualReport(payload);
      console.log("annual report response", response);
      const transformedData = transformData(response?.data?.data || []);
      setReportData(transformedData);
      setPagination((prev) => ({
        ...prev,
        total: transformedData.length,
      }));
    } catch (error) {
      setReportData([]);
      console.log("annual report error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (date) => {
    setSelectedYear(date);
    if (date) {
      const year = date.year();
      const startDate = `${year - 1}-12-26`;
      const endDate = `${year}-12-25`;
      getAnnualReportData(startDate, endDate);
    } else {
      setReportData([]);
    }
  };

  const handleRefresh = () => {
    const year = selectedYear ? selectedYear.year() : dayjs().year();
    const startDate = `${year - 1}-12-26`;
    const endDate = `${year}-12-25`;
    getAnnualReportData(startDate, endDate);
  };

  const handlePaginationChange = ({ page, limit }) => {
    setPagination({
      ...pagination,
      page: page,
      limit: limit,
    });
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={17}>
          <Row gutter={16}>
            <Col span={16}>
              <DatePicker
                picker="year"
                value={selectedYear}
                onChange={handleYearChange}
                style={{ width: "100%" }}
                allowClear={false}
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
                DownloadTableAsCSV(
                  reportData,
                  columns,
                  `Annual Sale Report ${selectedYear ? selectedYear.year() : dayjs().year()}.csv`,
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
        <Table
          scroll={{ x: 1800 }}
          columns={columns}
          dataSource={reportData}
          loading={loading}
          size="small"
          className="annualsalereport_table"
          bordered={true}
          pagination={false}
          rowKey="id"
        />
      </div>
    </div>
  );
}
