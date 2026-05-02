import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Tooltip, Button, Flex, Radio, Table, Tag } from "antd";
import CommonSelectField from "../Common/CommonSelectField";
import { DownloadOutlined } from "@ant-design/icons";
import { RedoOutlined } from "@ant-design/icons";
import { IoIosClose } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { IoFilter } from "react-icons/io5";
import { FaRegCopy } from "react-icons/fa6";
import {
  customizeStartDateAndEndDate,
  getCurrentandPreviousweekDate,
  getLast3Months,
} from "../Common/Validation";
import { useSelector } from "react-redux";
import CommonDoubleMonthPicker from "../Common/CommonDoubleMonthPicker";
import {
  getAllDownlineUsers,
  getCustomerFeesHistoryReport,
  hrPerformanceReport,
  postSalePerformanceReport,
  raPerformanceReport,
  scoreBoardReports,
} from "../ApiService/action";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import moment from "moment";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CommonMessage } from "../Common/CommonMessage";
import EllipsisTooltip from "../Common/EllipsisTooltip";
const { Column, ColumnGroup } = Table;

export default function CustomerFeesHistoryReport() {
  const mounted = useRef(false);
  //permissions
  const childUsers = useSelector((state) => state.childusers);
  const downlineUsers = useSelector((state) => state.downlineusers);

  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState(1);
  const [selectedDates, setSelectedDates] = useState([]);
  const [startDateAndEndDate, setStartDateAndEndDate] = useState([]);
  const [allDownliners, setAllDownliners] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [totalCounts, setTotalCounts] = useState(null);
  const [loginUserId, setLoginUserId] = useState("");
  const [loading, setLoading] = useState(true);
  //executive filter
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
      title: "S.No",
      key: "id",
      dataIndex: "id",
      width: 70,
      fixed: "left",
      render: (text, record, index) => {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 10;
        return (page - 1) * limit + index + 1;
      },
    },
    {
      title: "Sale Name",
      key: "sale_name",
      dataIndex: "sale_name",
      fixed: "left",
      width: 120,
      render: (text, record) => {
        const lead_executive = `${record.sale_id} - ${text}`;
        return <EllipsisTooltip text={lead_executive} />;
      },
    },
    {
      title: "Created Date",
      key: "created_date",
      dataIndex: "created_date",
      width: 120,
      fixed: "left",
      render: (text) => {
        return <EllipsisTooltip text={moment(text).format("DD/MM/YYYY")} />;
      },
    },
    {
      title: "Customer Name",
      key: "name",
      dataIndex: "name",
      width: 150,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Mobile",
      key: "phone",
      dataIndex: "phone",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      width: 200,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Course Name",
      key: "course_name",
      dataIndex: "course_name",
      width: 150,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Primary Fees",
      key: "primary_fees",
      dataIndex: "primary_fees",
      width: 120,
      render: (text) => <span>{Number(text).toLocaleString("en-IN")}</span>,
    },
    {
      title: "GST Amount",
      key: "gst_amount",
      dataIndex: "gst_amount",
      width: 120,
      render: (text) => <span>{Number(text).toLocaleString("en-IN")}</span>,
    },
    {
      title: "Fees+GST",
      key: "total_amount",
      dataIndex: "total_amount",
      width: 120,
      render: (text) => <span>{Number(text).toLocaleString("en-IN")}</span>,
    },
    {
      title: "Paid Amount",
      key: "paid_amount",
      dataIndex: "paid_amount",
      width: 120,
      render: (text) => <span>{Number(text).toLocaleString("en-IN")}</span>,
    },
    {
      title: "Balance Fees",
      key: "pending_fees",
      dataIndex: "pending_fees",
      width: 120,
      render: (text) => (
        <span
          style={{
            color: Number(text) > 0 ? "red" : "green",
            fontWeight: "600",
          }}
        >
          {Number(text).toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      width: 180,
      render: (text, record) => {
        let classPercent = 0;

        if (
          record.class_percentage !== null &&
          record.class_percentage !== undefined
        ) {
          const parsed = parseFloat(record.class_percentage);
          classPercent = isNaN(parsed) ? 0 : parsed;
        }
        return (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {text === "Form Pending" ? (
              <div>
                <Button className="customers_status_formpending_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Finance" ? (
              <div>
                <Button className="customers_status_awaitfinance_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Verify" ? (
              <div>
                <Button className="customers_status_awaitverify_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Trainer" ? (
              <div>
                <Button className="customers_status_awaittrainer_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Trainer Verify" ? (
              <div>
                <Button className="customers_status_awaittrainerverify_button">
                  {text}
                </Button>
              </div>
            ) : text === "Awaiting Class" ? (
              <div>
                <Button className="customers_status_awaitingclass_button">
                  {text}
                </Button>
              </div>
            ) : text === "Class Scheduled" ? (
              <div>
                <Button className="customers_status_classscheduled_button">
                  {text}
                </Button>
              </div>
            ) : text === "Passedout process" ? (
              <div>
                <Button className="customers_status_awaitfeedback_button">
                  {text}
                </Button>
              </div>
            ) : text === "Completed" ? (
              <div>
                <Button className="customers_status_completed_button">
                  {text}
                </Button>
              </div>
            ) : text === "Rejected" ||
              text === "REJECTED" ||
              text === "Trainer Rejected" ||
              text === "Payment Rejected" ||
              text === "Escalated" ||
              text === "Hold" ||
              text === "Partially Closed" ||
              text === "Discontinued" ||
              text === "Videos Given" ||
              text === "Refund" ? (
              <Button className="trainers_rejected_button">{text}</Button>
            ) : text === "Class Going" ? (
              <div style={{ display: "flex", gap: "12px" }}>
                <Button className="customers_status_classgoing_button">
                  {text}
                </Button>

                <p className="customer_classgoing_percentage">{`${parseFloat(
                  classPercent,
                )}%`}</p>
              </div>
            ) : (
              <p style={{ marginLeft: "6px" }}>-</p>
            )}
            {record.status === "Form Pending" && (
              <Tooltip
                placement="top"
                title="Copy form link"
                trigger={["hover", "click"]}
              >
                <FaRegCopy
                  size={14}
                  className="customers_formlink_copybutton"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${
                        import.meta.env.VITE_EMAIL_URL
                      }/customer-registration/${record.id}`,
                    );
                    CommonMessage("success", "Link Copied");
                    console.log("Copied: eeee");
                  }}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "1st INSTALL",
      className: "installment-header-1",
      onHeaderCell: () => ({
        id: "installment-header-1",
      }),
      children: [
        {
          title: "Amount",
          dataIndex: ["1st_installment", "amount"],
          key: "1st_amount",
          width: 100,
          className: "installment-sub-header-1",
          onHeaderCell: () => ({
            className: "installment-sub-header-1",
          }),
          render: (text) => (text ? Number(text).toLocaleString("en-IN") : "-"),
        },
        {
          title: "Date",
          dataIndex: ["1st_installment", "date"],
          key: "1st_date",
          width: 110,
          className: "installment-sub-header-1",
          onHeaderCell: () => ({
            className: "installment-sub-header-1",
          }),
          render: (text) => {
            return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
          },
        },
        {
          title: "Mode",
          dataIndex: ["1st_installment", "mode"],
          key: "1st_mode",
          width: 100,
          className: "installment-sub-header-1",
          onHeaderCell: () => ({
            className: "installment-sub-header-1",
          }),
          render: (text) => text || "-",
        },
      ],
    },
    {
      title: "2nd INSTALL",
      className: "installment-header-2",
      onHeaderCell: () => ({
        id: "installment-header-2",
      }),
      children: [
        {
          title: "Amount",
          dataIndex: ["2nd_installment", "amount"],
          key: "2nd_amount",
          width: 100,
          className: "installment-sub-header-2",
          onHeaderCell: () => ({
            className: "installment-sub-header-2",
          }),
          render: (text) => (text ? Number(text).toLocaleString("en-IN") : "-"),
        },
        {
          title: "Date",
          dataIndex: ["2nd_installment", "date"],
          key: "2nd_date",
          width: 110,
          className: "installment-sub-header-2",
          onHeaderCell: () => ({
            className: "installment-sub-header-2",
          }),
          render: (text) => {
            return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
          },
        },
        {
          title: "Mode",
          dataIndex: ["2nd_installment", "mode"],
          key: "2nd_mode",
          width: 100,
          className: "installment-sub-header-2",
          onHeaderCell: () => ({
            className: "installment-sub-header-2",
          }),
          render: (text) => text || "-",
        },
      ],
    },
    {
      title: "3rd INSTALL",
      className: "installment-header-3",
      onHeaderCell: () => ({
        id: "installment-header-3",
      }),
      children: [
        {
          title: "Amount",
          dataIndex: ["3rd_installment", "amount"],
          key: "3rd_amount",
          width: 100,
          className: "installment-sub-header-3",
          onHeaderCell: () => ({
            className: "installment-sub-header-3",
          }),
          render: (text) => (text ? Number(text).toLocaleString("en-IN") : "-"),
        },
        {
          title: "Date",
          dataIndex: ["3rd_installment", "date"],
          key: "3rd_date",
          width: 110,
          className: "installment-sub-header-3",
          onHeaderCell: () => ({
            className: "installment-sub-header-3",
          }),
          render: (text) => {
            return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
          },
        },
        {
          title: "Mode",
          dataIndex: ["3rd_installment", "mode"],
          key: "3rd_mode",
          width: 100,
          className: "installment-sub-header-3",
          onHeaderCell: () => ({
            className: "installment-sub-header-3",
          }),
          render: (text) => text || "-",
        },
      ],
    },
    {
      title: "4th INSTALL",
      className: "installment-header-4",
      onHeaderCell: () => ({
        id: "installment-header-4",
      }),
      children: [
        {
          title: "Amount",
          dataIndex: ["4th_installment", "amount"],
          key: "4th_amount",
          width: 100,
          className: "installment-sub-header-4",
          onHeaderCell: () => ({
            className: "installment-sub-header-4",
          }),
          render: (text) => (text ? Number(text).toLocaleString("en-IN") : "-"),
        },
        {
          title: "Date",
          dataIndex: ["4th_installment", "date"],
          key: "4th_date",
          width: 110,
          className: "installment-sub-header-4",
          onHeaderCell: () => ({
            className: "installment-sub-header-4",
          }),
          render: (text) => {
            return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
          },
        },
        {
          title: "Mode",
          dataIndex: ["4th_installment", "mode"],
          key: "4th_mode",
          width: 100,
          className: "installment-sub-header-4",
          onHeaderCell: () => ({
            className: "installment-sub-header-4",
          }),
          render: (text) => text || "-",
        },
      ],
    },
    {
      title: "5th INSTALL",
      className: "installment-header-5",
      onHeaderCell: () => ({
        id: "installment-header-5",
      }),
      children: [
        {
          title: "Amount",
          dataIndex: ["5th_installment", "amount"],
          key: "5th_amount",
          width: 100,
          className: "installment-sub-header-5",
          onHeaderCell: () => ({
            className: "installment-sub-header-5",
          }),
          render: (text) => (text ? Number(text).toLocaleString("en-IN") : "-"),
        },
        {
          title: "Date",
          dataIndex: ["5th_installment", "date"],
          key: "5th_date",
          width: 110,
          className: "installment-sub-header-5",
          onHeaderCell: () => ({
            className: "installment-sub-header-5",
          }),
          render: (text) => {
            return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
          },
        },
        {
          title: "Mode",
          dataIndex: ["5th_installment", "mode"],
          key: "5th_mode",
          width: 100,
          className: "installment-sub-header-5",
          onHeaderCell: () => ({
            className: "installment-sub-header-5",
          }),
          render: (text) => text || "-",
        },
      ],
    },
  ];

  useEffect(() => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setStartDateAndEndDate(PreviousAndCurrentDate);
    getCustomerFeesHistoryData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      null,
    );
  }, []);

  const getCustomerFeesHistoryData = async (
    startDate,
    endDate,
    searchvalue,
  ) => {
    setLoading(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      ...(searchvalue && filterType == 1
        ? { phone: searchvalue }
        : searchvalue && filterType == 2
          ? { name: searchvalue }
          : {}),
    };
    try {
      const response = await getCustomerFeesHistoryReport(payload);
      console.log("get customer fees report response", response);
      setReportData(response?.data?.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response?.data?.data?.length || 0,
      }));
    } catch (error) {
      setReportData([]);
      console.log("get customer fees report error", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    setPagination((prev) => ({
      ...prev,
      page: page,
      limit: limit,
    }));
  };

  const handleDownload = () => {
    const downloadData = reportData.map((item, index) => {
      const flattened = { ...item };
      flattened.id = (pagination.page - 1) * pagination.limit + index + 1;
      [1, 2, 3, 4, 5].forEach((i) => {
        const baseKey = `${i}${
          i === 1 ? "st" : i === 2 ? "nd" : i === 3 ? "rd" : "th"
        }_installment`;
        const inst = item[baseKey];
        flattened[`${i}_amount`] = inst?.amount || "-";
        flattened[`${i}_date`] = inst?.date || "-";
        flattened[`${i}_mode`] = inst?.mode || "-";
      });
      return flattened;
    });

    const downloadColumns = [];
    columns.forEach((col) => {
      if (col.children) {
        const installNum = col.className.split("-").pop();
        col.children.forEach((child) => {
          downloadColumns.push({
            ...child,
            title: `${col.title} ${child.title}`,
            dataIndex: `${installNum}_${child.title.toLowerCase()}`,
          });
        });
      } else {
        downloadColumns.push(col);
      }
    });

    DownloadTableAsCSV(
      downloadData,
      downloadColumns,
      `${moment(startDateAndEndDate[0]).format("DD MMMM YYYY")} to ${moment(
        startDateAndEndDate[1],
      ).format("DD MMMM YYYY")} Customer Fees History Report.csv`,
    );
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
    setTimeout(() => {
      getCustomerFeesHistoryData(
        selectedDates[0],
        selectedDates[1],
        e.target.value,
      );
    }, 300);
  };

  const handleRefresh = () => {
    setSearchValue("");
    setFilterType(1);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setPagination({
      page: 1,
    });
    getCustomerFeesHistoryData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      null,
    );
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={17}>
          <Row gutter={16}>
            <Col span={7}>
              <div className="overallduecustomers_filterContainer">
                {/* Search Input */}
                <CommonOutlinedInput
                  label={
                    filterType == 1
                      ? "Search By Mobile"
                      : filterType == 2
                        ? "Search By Name"
                        : ""
                  }
                  width="100%"
                  height="33px"
                  labelFontSize="12px"
                  icon={
                    searchValue ? (
                      <div
                        className="users_filter_closeIconContainer"
                        onClick={() => {
                          setSearchValue("");
                          setPagination({
                            page: 1,
                          });
                          getCustomerFeesHistoryData(dates[0], dates[1], null);
                        }}
                      >
                        <IoIosClose size={11} />
                      </div>
                    ) : (
                      <CiSearch size={16} />
                    )
                  }
                  labelMarginTop="-1px"
                  style={{
                    borderTopRightRadius: "0px",
                    borderBottomRightRadius: "0px",
                    padding: searchValue
                      ? "0px 26px 0px 0px"
                      : "0px 8px 0px 0px",
                  }}
                  onChange={handleSearch}
                  value={searchValue}
                />
                {/* Filter Button */}
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
                        <Radio.Group
                          value={filterType}
                          onChange={(e) => {
                            setFilterType(e.target.value);
                            if (searchValue === "") {
                              return;
                            } else {
                              setSearchValue("");
                              setPagination({
                                page: 1,
                              });
                              getCustomerFeesHistoryData(
                                selectedDates[0],
                                selectedDates[1],
                                null,
                              );
                            }
                          }}
                        >
                          <Radio
                            value={1}
                            style={{ marginTop: "6px", marginBottom: "12px" }}
                          >
                            Search by Mobile
                          </Radio>
                          <Radio value={2} style={{ marginBottom: "12px" }}>
                            Search by Name
                          </Radio>
                        </Radio.Group>
                      }
                    >
                      <Button className="users_filterbutton">
                        <IoFilter size={18} />
                      </Button>
                    </Tooltip>
                  </Flex>
                </div>
              </div>
            </Col>
            <Col span={16}>
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates, strings) => {
                  setSelectedDates([dates[0], dates[1]]);
                  setStartDateAndEndDate([dates[0], dates[1]]);
                  getCustomerFeesHistoryData(dates[0], dates[1], searchValue);
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
              onClick={handleDownload}
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
          columns={columns}
          dataSource={reportData}
          scroll={{ x: 3200 }}
          // bordered="true"
          loading={loading}
          limit={pagination.limit}
          page_number={pagination.page}
          totalPageNumber={pagination.total}
          onPaginationChange={(page, limit) =>
            handlePaginationChange({ page, limit })
          }
          className="fees-history-table"
          checkBox={"false"}
          size={"small"}
        />
      </div>
    </div>
  );
}
