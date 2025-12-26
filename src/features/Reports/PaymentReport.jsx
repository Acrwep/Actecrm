import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Tooltip, Button, Flex } from "antd";
import CommonSelectField from "../Common/CommonSelectField";
import { DownloadOutlined } from "@ant-design/icons";
import { RedoOutlined } from "@ant-design/icons";
import { getCurrentandPreviousweekDate } from "../Common/Validation";
import { useSelector } from "react-redux";
import { paymentReport } from "../ApiService/action";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import moment from "moment";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import PaymentDownloadTableAsCSV from "./DownloadPaymentReport";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";

export default function PaymentReport() {
  const mounted = useRef(false);
  //permissions
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);

  const [selectedDates, setSelectedDates] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [totalCounts, setTotalCounts] = useState(null);
  const [loginUserId, setLoginUserId] = useState("");
  const [loading, setLoading] = useState(true);
  // filter
  const typeOptions = [
    { id: "Region", name: "Region" },
    { id: "Branch", name: "Branch" },
    { id: "Paymode", name: "Paymode" },
  ];
  const [typeId, setTypeId] = useState("Region");

  const [subUsers, setSubUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0,
  });

  const columns = [
    {
      title: "Date",
      key: "date",
      dataIndex: "date",
      fixed: "left",
      render: (text) => {
        return (
          <p>
            {text && text === "Total"
              ? "Total"
              : text
              ? moment(text).format("DD/MM/YYYY")
              : "-"}
          </p>
        );
      },
    },
    {
      title: "Hub",
      key: "hub",
      dataIndex: "hub",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "Chennai",
      key: "chennai",
      dataIndex: "chennai",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "Bangalore",
      key: "bangalore",
      dataIndex: "bangalore",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "Total",
      key: "total",
      dataIndex: "total",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
  ];

  const branchColumns = [
    {
      title: "Date",
      key: "date",
      dataIndex: "date",
      // width: 90,
      fixed: "left",
      render: (text) => {
        return (
          <p>
            {text && text === "Total"
              ? "Total"
              : text
              ? moment(text).format("DD/MM/YYYY")
              : "-"}
          </p>
        );
      },
    },
    {
      title: "Velachery",
      key: "velachery",
      dataIndex: "velachery",
      align: "end",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "Anna Nagar",
      key: "anna_nagar",
      dataIndex: "anna_nagar",
      align: "end",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "Porur",
      key: "porur",
      dataIndex: "porur",
      align: "end",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "OMR",
      key: "omr",
      dataIndex: "omr",
      align: "end",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "E-City",
      key: "e_city",
      dataIndex: "e_city",
      align: "end",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "BTM Layout",
      key: "btm_layout",
      dataIndex: "btm_layout",
      align: "end",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "Rajaji Nagar",
      key: "rajaji_nagar",
      dataIndex: "rajaji_nagar",
      align: "end",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "Marathahalli",
      key: "marathahalli",
      dataIndex: "marathahalli",
      align: "end",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "Total",
      key: "total",
      dataIndex: "total",
      align: "end",
      fixed: "right",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
  ];

  const paymodeColumns = [
    {
      title: "Date",
      key: "date",
      dataIndex: "date",
      fixed: "left",
      render: (text) => {
        return (
          <p>
            {text && text === "Total"
              ? "Total"
              : text
              ? moment(text).format("DD/MM/YYYY")
              : "-"}
          </p>
        );
      },
    },
    {
      title: "Cash",
      key: "cash",
      dataIndex: "cash",
      align: "right",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "UPI",
      key: "upi",
      dataIndex: "upi",
      align: "right",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "Razorpay",
      key: "razorpay",
      dataIndex: "razorpay",
      align: "right",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "Razorpay-UPI",
      key: "razorpay_upi",
      dataIndex: "razorpay_upi",
      align: "right",
      width: 105,
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "TDS",
      key: "tds",
      dataIndex: "tds",
      align: "right",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "SBI Bank",
      key: "sbi_bank",
      dataIndex: "sbi_bank",
      align: "right",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "AXIS Bank",
      key: "axis_bank",
      dataIndex: "axis_bank",
      align: "right",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "HDFC Bank",
      key: "hdfc_bank",
      dataIndex: "hdfc_bank",
      align: "right",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "SBI POS",
      key: "sbi_pos",
      dataIndex: "sbi_pos",
      align: "right",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "Razorpay POS",
      key: "razorpay_pos",
      dataIndex: "razorpay_pos",
      align: "right",
      width: 105,
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
    {
      title: "Total",
      key: "total",
      dataIndex: "total",
      align: "right",
      render: (text, record) => {
        return (
          <p>
            {record.date == "Total"
              ? `₹${Number(text).toLocaleString("en-IN")}`
              : Number(text).toLocaleString("en-IN")}
          </p>
        );
      },
    },
  ];

  useEffect(() => {
    if (childUsers.length > 0 && !mounted.current) {
      mounted.current = true;
      setSubUsers(downlineUsers);
      const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
      setSelectedDates(PreviousAndCurrentDate);

      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);
      setLoginUserId(convertAsJson?.user_id);
      getPaymentReportData(
        PreviousAndCurrentDate[0],
        PreviousAndCurrentDate[1],
        "Region"
      );
    }
  }, [childUsers]);

  const preparePaymodeData = (apiResponse, typeName) => {
    const dayWise = apiResponse?.data?.data?.day_wise || [];
    const overall = apiResponse?.data?.data?.over_all || {};
    let totalRow;

    if (typeName == "Region") {
      totalRow = {
        key: "total-row",
        date: "Total",
        hub: Number(overall.hub_total || 0),
        chennai: Number(overall.chennai_total || 0),
        bangalore: Number(overall.bangalore_total || 0),
        total: Number(overall.over_all_total || 0),
        isTotalRow: true,
      };
    } else if (typeName == "Branch") {
      totalRow = {
        key: "total-row",
        date: "Total",
        velachery: Number(overall.velachery_total || 0),
        anna_nagar: Number(overall.anna_nagar_total || 0),
        porur: Number(overall.porur_total || 0),
        omr: Number(overall.omr_total || 0),
        e_city: Number(overall.e_city_total || 0),
        btm_layout: Number(overall.btm_layout_total || 0),
        rajaji_nagar: Number(overall.rajaji_nagar || 0),
        marathahalli: Number(overall.marathahalli_total || 0),
        total: Number(overall.over_all_total || 0),
        isTotalRow: true,
      };
    } else {
      totalRow = {
        key: "total-row",
        date: "Total",
        cash: Number(overall.cash_total || 0),
        upi: Number(overall.upi_total || 0),
        razorpay: Number(overall.razorpay_total || 0),
        razorpay_upi: Number(overall.razorpay_upi_total || 0),
        tds: Number(overall.tds_total || 0),
        sbi_bank: Number(overall.sbi_bank_total || 0),
        axis_bank: Number(overall.axis_bank_total || 0),
        hdfc_bank: Number(overall.hdfc_bank_total || 0),
        sbi_pos: Number(overall.sbi_pos_total || 0),
        razorpay_pos: Number(overall.razorpay_pos_total || 0),
        total: Number(overall.over_all_total || 0),
        isTotalRow: true,
      };
    }

    const dayRows = dayWise.map((item, index) => ({
      key: index,
      ...item,
      isTotalRow: false,
    }));

    return [totalRow, ...dayRows];
  };

  const getPaymentReportData = async (startDate, endDate, typeName) => {
    setLoading(true);
    const payload = {
      type: typeName,
      start_date: startDate,
      end_date: endDate,
    };
    try {
      const response = await paymentReport(payload);
      console.log("payment report response", response);
      const formatData = preparePaymodeData(response, typeName);
      console.log("formatData 🙌", formatData);
      setReportData(formatData);
      setTotalCounts(response?.data?.data?.over_all || null);
    } catch (error) {
      setReportData([]);
      setTotalCounts(null);
      console.log("payment report error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    setPagination({
      page: page,
      limit: limit,
    });
  };

  const handleRefresh = () => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setTypeId("Region");
    setPagination({
      page: 1,
      limit: 100,
    });
    getPaymentReportData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      "Region"
    );
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={17}>
          <Row gutter={16}>
            <Col span={7}>
              <CommonSelectField
                height="35px"
                label="Select Type"
                labelMarginTop="0px"
                labelFontSize="13px"
                options={typeOptions}
                onChange={(e) => {
                  setTypeId(e.target.value);
                  getPaymentReportData(
                    selectedDates[0],
                    selectedDates[1],
                    e.target.value
                  );
                }}
                value={typeId}
                disableClearable={true}
              />
            </Col>
            <Col span={16}>
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setPagination({
                    page: 1,
                    limit: 100,
                  });
                  getPaymentReportData(dates[0], dates[1], typeId);
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
                const formattedData = reportData.map((row) => ({
                  ...row,
                  date: row.date === "Total" ? "Total" : row.date, // Excel-safe
                }));
                console.log("formattedData", formattedData);
                // return;
                DownloadTableAsCSV(
                  formattedData,
                  typeId == "Region"
                    ? columns
                    : typeId == "Branch"
                    ? branchColumns
                    : paymodeColumns,
                  `${moment(selectedDates[0]).format("DD-MM-YYYY")} to ${moment(
                    selectedDates[1]
                  ).format("DD-MM-YYYY")} ${
                    typeId == "Region"
                      ? "Regionwise"
                      : typeId == "Branch"
                      ? "Branchwise"
                      : "Modewise"
                  } Payment Report.csv`
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
        <CommonTable
          scroll={{ x: typeId == "Paymode" ? 600 : 600 }}
          columns={
            typeId == "Region"
              ? columns
              : typeId == "Branch"
              ? branchColumns
              : paymodeColumns
          }
          dataSource={reportData}
          dataPerPage={10}
          loading={loading}
          checkBox="false"
          size="small"
          className="paymentreport_table"
          onPaginationChange={handlePaginationChange} // callback to fetch new data
          limit={pagination.limit} // page size
          page_number={pagination.page} // current page
          totalPageNumber={pagination.total} // total rows
          rowClassName={(record, index) =>
            record.date === "Total" ? "total-row-bg" : ""
          }
          // totals={
          //   typeId == "Region"
          //     ? regionTotals
          //     : typeId == "Branch"
          //     ? branchTotals
          //     : paymodeTotals
          // }
        />
      </div>
    </div>
  );
}
