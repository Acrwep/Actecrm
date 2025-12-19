import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Tooltip, Button, Flex } from "antd";
import CommonSelectField from "../Common/CommonSelectField";
import { DownloadOutlined } from "@ant-design/icons";
import { RedoOutlined } from "@ant-design/icons";
import { HiStatusOnline } from "react-icons/hi";
import { PiCityDuotone } from "react-icons/pi";
import { MdCurrencyRupee } from "react-icons/md";
import { GiMoneyStack } from "react-icons/gi";
import { AiOutlineBank } from "react-icons/ai";
import { RiArrowRightDoubleFill } from "react-icons/ri";
import { FaRegCreditCard } from "react-icons/fa6";
import { SiRazorpay } from "react-icons/si";
import { HiOutlineInformationCircle } from "react-icons/hi";
import {
  customizeStartDateAndEndDate,
  getCurrentandPreviousweekDate,
  getLast3Months,
} from "../Common/Validation";
import { useSelector } from "react-redux";
import CommonDoubleMonthPicker from "../Common/CommonDoubleMonthPicker";
import {
  getAllDownlineUsers,
  paymentReport,
  userwiseLeadsAnalysisReports,
  userwiseSalesAnalysisReports,
} from "../ApiService/action";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import moment from "moment";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";

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
    limit: 10,
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
  ];

  const branchColumns = [
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
      title: "Velachery",
      key: "velachery",
      dataIndex: "velachery",
      width: 120,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Anna Nagar",
      key: "anna_nagar",
      dataIndex: "anna_nagar",
      width: 120,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Porur",
      key: "porur",
      dataIndex: "porur",
      width: 140,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "OMR",
      key: "omr",
      dataIndex: "omr",
      width: 140,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Electronic City",
      key: "e_city",
      dataIndex: "e_city",
      width: 140,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "BTM Layout",
      key: "btm_layout",
      dataIndex: "btm_layout",
      width: 140,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Rajaji Nagar",
      key: "rajaji_nagar",
      dataIndex: "rajaji_nagar",
      width: 140,
      render: (text) => {
        return <p>{Number(text).toLocaleString("en-IN")}</p>;
      },
    },
    {
      title: "Marathahalli",
      key: "marathahalli",
      dataIndex: "marathahalli",
      width: 140,
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
    });
    getPaymentReportData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      typeId
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
                DownloadTableAsCSV(
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

      {typeId == "Region" || typeId == "Branch" ? (
        <Row gutter={16}>
          {typeId == "Region" ? (
            <Col flex="20%" style={{ marginTop: "30px" }}>
              <div className="dashboard_leadcount_main_container">
                <div className="reports_leadcount_icon_container">
                  <HiStatusOnline size={18} />
                </div>
                <div className="reports_leadcount_container">
                  <p>Hub</p>
                  <p
                    style={{
                      marginTop: "4px",
                      color: "#5b69ca",
                      fontSize: "20px",
                    }}
                  >
                    {totalCounts &&
                    (totalCounts.hub_total != undefined ||
                      totalCounts.hub_total != null)
                      ? "₹" +
                        Number(totalCounts.hub_total).toLocaleString("en-IN")
                      : "-"}
                  </p>
                </div>
              </div>
            </Col>
          ) : (
            ""
          )}

          <Col flex="20%" style={{ marginTop: "30px" }}>
            <div className="dashboard_leadcount_main_container">
              <div className="reports_salevolume_icon_container">
                <PiCityDuotone size={18} />
              </div>
              <div className="reports_leadcount_container">
                <p>Chennai</p>
                <p
                  style={{
                    marginTop: "4px",
                    color: "#1e90ff",
                    fontSize: "20px",
                  }}
                >
                  {totalCounts &&
                  (totalCounts.chennai_total != undefined ||
                    totalCounts.chennai_total != null)
                    ? "₹" +
                      Number(totalCounts.chennai_total).toLocaleString("en-IN")
                    : "-"}
                </p>
              </div>

              {typeId == "Branch" && (
                <div>
                  <Flex
                    justify="center"
                    align="center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    <Tooltip
                      placement="bottomLeft"
                      color="#fff"
                      title={
                        <>
                          <div
                            style={{
                              maxHeight: "140px",
                              overflowY: "auto",
                              whiteSpace: "pre-line",
                              lineHeight: "24px",
                            }}
                          >
                            <p className="leadsmanager_executivecount_text">
                              {`${1}. Velachery - ${
                                totalCounts &&
                                (totalCounts.velachery_total != undefined ||
                                  totalCounts.velachery_total != null)
                                  ? Number(
                                      totalCounts.velachery_total
                                    ).toLocaleString("en-IN")
                                  : "-"
                              }`}
                            </p>
                            <p className="leadsmanager_executivecount_text">
                              {`${2}. Anna Nagar - ${
                                totalCounts &&
                                (totalCounts.anna_nagar_total != undefined ||
                                  totalCounts.anna_nagar_total != null)
                                  ? Number(
                                      totalCounts.anna_nagar_total
                                    ).toLocaleString("en-IN")
                                  : "-"
                              }`}
                            </p>
                            <p className="leadsmanager_executivecount_text">
                              {`${3}. Porur - ${
                                totalCounts &&
                                (totalCounts.porur_total != undefined ||
                                  totalCounts.porur_total != null)
                                  ? Number(
                                      totalCounts.porur_total
                                    ).toLocaleString("en-IN")
                                  : "-"
                              }`}
                            </p>
                            <p className="leadsmanager_executivecount_text">
                              {`${4}. OMR - ${
                                totalCounts &&
                                (totalCounts.omr_total != undefined ||
                                  totalCounts.omr_total != null)
                                  ? Number(
                                      totalCounts.omr_total
                                    ).toLocaleString("en-IN")
                                  : "-"
                              }`}
                            </p>
                          </div>
                        </>
                      }
                      trigger={["click"]}
                    >
                      <HiOutlineInformationCircle
                        size={18}
                        color="#333"
                        style={{ cursor: "pointer" }}
                      />
                    </Tooltip>
                  </Flex>
                </div>
              )}
            </div>
          </Col>

          <Col flex="20%" style={{ marginTop: "30px" }}>
            <div className="dashboard_leadcount_main_container">
              <div className="reports_bangalore_icon_container">
                <PiCityDuotone size={18} />
              </div>
              <div className="reports_leadcount_container">
                <p>Bangalore</p>
                <p
                  style={{
                    marginTop: "4px",
                    color: "#928afd",
                    fontSize: "20px",
                  }}
                >
                  {totalCounts &&
                  (totalCounts.bangalore_total != undefined ||
                    totalCounts.bangalore_total != null)
                    ? "₹" +
                      Number(totalCounts.bangalore_total).toLocaleString(
                        "en-IN"
                      )
                    : "-"}
                </p>
              </div>

              {typeId == "Branch" && (
                <div>
                  <Flex
                    justify="center"
                    align="center"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    <Tooltip
                      placement="bottomLeft"
                      color="#fff"
                      title={
                        <>
                          <div
                            style={{
                              maxHeight: "140px",
                              overflowY: "auto",
                              whiteSpace: "pre-line",
                              lineHeight: "24px",
                            }}
                          >
                            <p className="leadsmanager_executivecount_text">
                              {`${1}. Electronuc City - ${
                                totalCounts &&
                                (totalCounts.e_city_total != undefined ||
                                  totalCounts.e_city_total != null)
                                  ? Number(
                                      totalCounts.e_city_total
                                    ).toLocaleString("en-IN")
                                  : "-"
                              }`}
                            </p>
                            <p className="leadsmanager_executivecount_text">
                              {`${2}. BTM Layout - ${
                                totalCounts &&
                                (totalCounts.btm_layout_total != undefined ||
                                  totalCounts.btm_layout_total != null)
                                  ? Number(
                                      totalCounts.btm_layout_total
                                    ).toLocaleString("en-IN")
                                  : "-"
                              }`}
                            </p>
                            <p className="leadsmanager_executivecount_text">
                              {`${3}. Rajaji Nagar - ${
                                totalCounts &&
                                (totalCounts.rajaji_nagar != undefined ||
                                  totalCounts.rajaji_nagar != null)
                                  ? Number(
                                      totalCounts.rajaji_nagar
                                    ).toLocaleString("en-IN")
                                  : "-"
                              }`}
                            </p>
                            <p className="leadsmanager_executivecount_text">
                              {`${4}. Marathahalli - ${
                                totalCounts &&
                                (totalCounts.marathahalli_total != undefined ||
                                  totalCounts.marathahalli_total != null)
                                  ? Number(
                                      totalCounts.marathahalli_total
                                    ).toLocaleString("en-IN")
                                  : "-"
                              }`}
                            </p>
                          </div>
                        </>
                      }
                      trigger={["click"]}
                    >
                      <HiOutlineInformationCircle
                        size={18}
                        color="#333"
                        style={{ cursor: "pointer" }}
                      />
                    </Tooltip>
                  </Flex>
                </div>
              )}
            </div>
          </Col>

          <Col flex="20%" style={{ marginTop: "30px" }}>
            <div className="dashboard_leadcount_main_container">
              <div className="reports_collection_icon_container">
                <MdCurrencyRupee size={19} />
              </div>
              <div className="reports_leadcount_container">
                <p>Total</p>
                <p
                  style={{
                    marginTop: "4px",
                    color: "#3c9111",
                    fontSize: "20px",
                  }}
                >
                  {totalCounts &&
                  (totalCounts.over_all_total != undefined ||
                    totalCounts.over_all_total != null)
                    ? "₹" +
                      Number(totalCounts.over_all_total).toLocaleString("en-IN")
                    : "-"}
                </p>
              </div>
            </div>
          </Col>
        </Row>
      ) : (
        <Row gutter={16}>
          <Col flex="20%" style={{ marginTop: "30px" }}>
            <div className="dashboard_leadcount_main_container">
              <div className="reports_leadcount_icon_container">
                <GiMoneyStack size={18} />
              </div>
              <div className="reports_leadcount_container">
                <p>Cash</p>
                <p
                  style={{
                    marginTop: "4px",
                    color: "#5b69ca",
                    fontSize: "20px",
                  }}
                >
                  {totalCounts &&
                  (totalCounts.card_total != undefined ||
                    totalCounts.card_total != null)
                    ? "₹" +
                      Number(totalCounts.card_total).toLocaleString("en-IN")
                    : "-"}
                </p>
              </div>
            </div>
          </Col>

          <Col flex="20%" style={{ marginTop: "30px" }}>
            <div className="dashboard_leadcount_main_container">
              <div className="reports_salevolume_icon_container">
                <AiOutlineBank size={18} />
              </div>
              <div className="reports_leadcount_container">
                <p>Bank</p>
                <p
                  style={{
                    marginTop: "4px",
                    color: "#1e90ff",
                    fontSize: "20px",
                  }}
                >
                  {totalCounts &&
                  (totalCounts.bank_total != undefined ||
                    totalCounts.bank_total != null)
                    ? "₹" +
                      Number(totalCounts.bank_total).toLocaleString("en-IN")
                    : "-"}
                </p>
              </div>
            </div>
          </Col>

          <Col flex="20%" style={{ marginTop: "30px" }}>
            <div className="dashboard_leadcount_main_container">
              <div className="reports_bangalore_icon_container">
                <RiArrowRightDoubleFill size={20} />
              </div>
              <div className="reports_leadcount_container">
                <p>UPI</p>
                <p
                  style={{
                    marginTop: "4px",
                    color: "#928afd",
                    fontSize: "20px",
                  }}
                >
                  {totalCounts &&
                  (totalCounts.upi_total != undefined ||
                    totalCounts.upi_total != null)
                    ? "₹" +
                      Number(totalCounts.upi_total).toLocaleString("en-IN")
                    : "-"}
                </p>
              </div>
            </div>
          </Col>

          <Col flex="20%" style={{ marginTop: "30px" }}>
            <div className="dashboard_leadcount_main_container">
              <div className="reports_card_icon_container">
                <FaRegCreditCard size={18} />
              </div>
              <div className="reports_leadcount_container">
                <p>Card</p>
                <p
                  style={{
                    marginTop: "4px",
                    color: "#607d8b",
                    fontSize: "20px",
                  }}
                >
                  {totalCounts &&
                  (totalCounts.card_total != undefined ||
                    totalCounts.card_total != null)
                    ? "₹" +
                      Number(totalCounts.card_total).toLocaleString("en-IN")
                    : "-"}
                </p>
              </div>
            </div>
          </Col>

          <Col flex="20%" style={{ marginTop: "30px" }}>
            <div className="dashboard_leadcount_main_container">
              <div className="reports_razorpay_icon_container">
                <SiRazorpay size={18} />
              </div>
              <div className="reports_leadcount_container">
                <p>Razorpay</p>
                <p
                  style={{
                    marginTop: "4px",
                    color: "#00cec9",
                    fontSize: "20px",
                  }}
                >
                  {totalCounts &&
                  (totalCounts.razorpay_total != undefined ||
                    totalCounts.razorpay_total != null)
                    ? "₹" +
                      Number(totalCounts.razorpay_total).toLocaleString("en-IN")
                    : "-"}
                </p>
              </div>
            </div>
          </Col>

          <Col flex="20%" style={{ marginTop: "30px" }}>
            <div className="dashboard_leadcount_main_container">
              <div className="reports_razorpayupi_icon_container">
                <HiStatusOnline size={18} />
              </div>
              <div className="reports_leadcount_container">
                <p>Razorpay-UPI</p>
                <p
                  style={{
                    marginTop: "4px",
                    color: "#fd79a8",
                    fontSize: "20px",
                  }}
                >
                  {totalCounts &&
                  (totalCounts.razorpay_upi_total != undefined ||
                    totalCounts.razorpay_upi_total != null)
                    ? "₹" +
                      Number(totalCounts.razorpay_upi_total).toLocaleString(
                        "en-IN"
                      )
                    : "-"}
                </p>
              </div>
            </div>
          </Col>

          <Col flex="20%" style={{ marginTop: "30px" }}>
            <div className="dashboard_leadcount_main_container">
              <div className="reports_collection_icon_container">
                <MdCurrencyRupee size={19} />
              </div>
              <div className="reports_leadcount_container">
                <p>Total</p>
                <p
                  style={{
                    marginTop: "4px",
                    color: "#3c9111",
                    fontSize: "20px",
                  }}
                >
                  {totalCounts &&
                  (totalCounts.over_all_total != undefined ||
                    totalCounts.over_all_total != null)
                    ? "₹" +
                      Number(totalCounts.over_all_total).toLocaleString("en-IN")
                    : "-"}
                </p>
              </div>
            </div>
          </Col>
        </Row>
      )}

      <div style={{ marginTop: "30px" }}>
        <CommonTable
          scroll={{ x: 800 }}
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
          className="questionupload_table"
          onPaginationChange={handlePaginationChange} // callback to fetch new data
          limit={pagination.limit} // page size
          page_number={pagination.page} // current page
          totalPageNumber={pagination.total} // total rows
        />
      </div>
    </div>
  );
}
