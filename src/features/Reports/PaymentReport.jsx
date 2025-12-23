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
      width: 160,
      fixed: "left",
      render: (text) => {
        return <p>{moment(text).format("DD/MM/YYYY")}</p>;
      },
    },
    {
      title: "Hub",
      key: "hub",
      dataIndex: "hub",
      width: 120,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Chennai",
      key: "chennai",
      dataIndex: "chennai",
      width: 170,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Bangalore",
      key: "bangalore",
      dataIndex: "bangalore",
      width: 140,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Total",
      key: "total",
      dataIndex: "total",
      width: 140,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
  ];

  const branchColumns = [
    {
      title: "Date",
      key: "date",
      dataIndex: "date",
      width: 90,
      fixed: "left",
      render: (text) => {
        return <p>{moment(text).format("DD/MM/YYYY")}</p>;
      },
    },
    {
      title: "Velachery",
      key: "velachery",
      dataIndex: "velachery",
      width: 85,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Anna Nagar",
      key: "anna_nagar",
      dataIndex: "anna_nagar",
      width: 100,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Porur",
      key: "porur",
      dataIndex: "porur",
      width: 75,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "OMR",
      key: "omr",
      dataIndex: "omr",
      width: 74,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "E-City",
      key: "e_city",
      dataIndex: "e_city",
      width: 75,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "BTM Layout",
      key: "btm_layout",
      dataIndex: "btm_layout",
      width: 80,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Rajaji Nagar",
      key: "rajaji_nagar",
      dataIndex: "rajaji_nagar",
      width: 85,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Marathahalli",
      key: "marathahalli",
      dataIndex: "marathahalli",
      width: 82,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Total",
      key: "total",
      dataIndex: "total",
      width: 80,
      fixed: "right",
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
  ];

  const paymodeColumns = [
    {
      title: "Date",
      key: "date",
      dataIndex: "date",
      width: 160,
      fixed: "left",
      render: (text) => {
        return <p>{moment(text).format("DD/MM/YYYY")}</p>;
      },
    },
    {
      title: "Cash",
      key: "cash",
      dataIndex: "cash",
      width: 120,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Bank",
      key: "bank",
      dataIndex: "bank",
      width: 140,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "UPI",
      key: "upi",
      dataIndex: "upi",
      width: 140,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Card",
      key: "card",
      dataIndex: "card",
      width: 120,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Razorpay",
      key: "razorpay",
      dataIndex: "razorpay",
      width: 140,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Razorpay-UPI",
      key: "razorpay_upi",
      dataIndex: "razorpay_upi",
      width: 140,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Total",
      key: "total",
      dataIndex: "total",
      width: 140,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
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
      setReportData(response?.data?.data?.day_wise || []);
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

  const regionTotals = {
    hub:
      totalCounts &&
      (totalCounts.hub_total != undefined || totalCounts.hub_total != null)
        ? "₹" + Number(totalCounts.hub_total).toLocaleString("en-IN")
        : "-",
    chennai:
      totalCounts &&
      (totalCounts.chennai_total != undefined ||
        totalCounts.chennai_total != null)
        ? "₹" + Number(totalCounts.chennai_total).toLocaleString("en-IN")
        : "-",
    bangalore:
      totalCounts &&
      (totalCounts.bangalore_total != undefined ||
        totalCounts.bangalore_total != null)
        ? "₹" + Number(totalCounts.bangalore_total).toLocaleString("en-IN")
        : "-",
    total:
      totalCounts &&
      (totalCounts.over_all_total != undefined ||
        totalCounts.over_all_total != null)
        ? "₹" + Number(totalCounts.over_all_total).toLocaleString("en-IN")
        : "-",
  };

  const branchTotals = {
    velachery:
      totalCounts &&
      (totalCounts.velachery_total != undefined ||
        totalCounts.velachery_total != null)
        ? Number(totalCounts.velachery_total).toLocaleString("en-IN")
        : "-",
    anna_nagar:
      totalCounts &&
      (totalCounts.anna_nagar_total != undefined ||
        totalCounts.anna_nagar_total != null)
        ? Number(totalCounts.anna_nagar_total).toLocaleString("en-IN")
        : "-",
    porur:
      totalCounts &&
      (totalCounts.porur_total != undefined || totalCounts.porur_total != null)
        ? Number(totalCounts.porur_total).toLocaleString("en-IN")
        : "-",
    omr:
      totalCounts &&
      (totalCounts.omr_total != undefined || totalCounts.omr_total != null)
        ? Number(totalCounts.omr_total).toLocaleString("en-IN")
        : "-",
    e_city:
      totalCounts &&
      (totalCounts.e_city_total != undefined ||
        totalCounts.e_city_total != null)
        ? Number(totalCounts.e_city_total).toLocaleString("en-IN")
        : "-",
    btm_layout:
      totalCounts &&
      (totalCounts.btm_layout_total != undefined ||
        totalCounts.btm_layout_total != null)
        ? Number(totalCounts.btm_layout_total).toLocaleString("en-IN")
        : "-",
    rajaji_nagar:
      totalCounts &&
      (totalCounts.rajaji_nagar != undefined ||
        totalCounts.rajaji_nagar != null)
        ? Number(totalCounts.rajaji_nagar).toLocaleString("en-IN")
        : "-",
    marathahalli:
      totalCounts &&
      (totalCounts.marathahalli_total != undefined ||
        totalCounts.marathahalli_total != null)
        ? Number(totalCounts.marathahalli_total).toLocaleString("en-IN")
        : "-",
    total:
      totalCounts &&
      (totalCounts.over_all_total != undefined ||
        totalCounts.over_all_total != null)
        ? "₹" + Number(totalCounts.over_all_total).toLocaleString("en-IN")
        : "-",
  };

  const paymodeTotals = {
    cash:
      totalCounts &&
      (totalCounts.cash_total != undefined || totalCounts.cash_total != null)
        ? Number(totalCounts.cash_total).toLocaleString("en-IN")
        : "-",
    bank:
      totalCounts &&
      (totalCounts.bank_total != undefined || totalCounts.bank_total != null)
        ? Number(totalCounts.bank_total).toLocaleString("en-IN")
        : "-",
    upi:
      totalCounts &&
      (totalCounts.upi_total != undefined || totalCounts.upi_total != null)
        ? Number(totalCounts.upi_total).toLocaleString("en-IN")
        : "-",
    card:
      totalCounts &&
      (totalCounts.card_total != undefined || totalCounts.card_total != null)
        ? Number(totalCounts.card_total).toLocaleString("en-IN")
        : "-",
    razorpay:
      totalCounts &&
      (totalCounts.razorpay_total != undefined ||
        totalCounts.razorpay_total != null)
        ? Number(totalCounts.razorpay_total).toLocaleString("en-IN")
        : "-",
    razorpay_upi:
      totalCounts &&
      (totalCounts.razorpay_upi_total != undefined ||
        totalCounts.razorpay_upi_total != null)
        ? Number(totalCounts.razorpay_upi_total).toLocaleString("en-IN")
        : "-",
    total:
      totalCounts &&
      (totalCounts.over_all_total != undefined ||
        totalCounts.over_all_total != null)
        ? "₹" + Number(totalCounts.over_all_total).toLocaleString("en-IN")
        : "-",
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
                PaymentDownloadTableAsCSV(
                  reportData,
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
                  } Payment Report.csv`,
                  typeId == "Region"
                    ? regionTotals
                    : typeId == "Branch"
                    ? branchTotals
                    : paymodeTotals
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
          scroll={{ x: 600 }}
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
          totals={
            typeId == "Region"
              ? regionTotals
              : typeId == "Branch"
              ? branchTotals
              : paymodeTotals
          }
        />
      </div>
    </div>
  );
}
