import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Flex, Tooltip, Radio, Button } from "antd";
import { IoFilter } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { getLiveLeads } from "../ApiService/action";
import { getCurrentandPreviousweekDate } from "../Common/Validation";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonTable from "../Common/CommonTable";
import { width } from "@mui/system";

export default function LiveLead({ activePage, setLiveLeadCount }) {
  //useref
  const searchRef = useRef("");
  const datesRef = useRef([]);
  const paginationRef = useRef({ page: 1, limit: 10 });
  //usestates
  const [selectedDates, setSelectedDates] = useState([]);
  const [filterType, setFilterType] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [leadData, setLeadData] = useState([]);
  const [loading, setLoading] = useState(true);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const formatDuration = (dateString) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffMs = now - created;

    if (diffMs < 0) return { text: "00:00", hours: 0 };

    const totalSeconds = Math.floor(diffMs / 1000);
    const totalHours = totalSeconds / 3600;

    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const pad = (n) => String(n).padStart(2, "0");

    let text = "";

    if (days === 0) {
      // HHh:MMm
      const hh = pad(Math.floor(totalSeconds / 3600));
      text = `${hh}h:${pad(minutes)}m`;
    } else {
      // DDd:HHh:MMm
      text = `${pad(days)}d:${pad(hours)}h:${pad(minutes)}m`;
    }

    return { text, hours: totalHours };
  };

  const columns = [
    {
      title: "Created Before",
      key: "created_date",
      dataIndex: "created_date",
      width: 130,
      render: (text) => {
        const { text: durationText, hours } = formatDuration(text);

        let bg = "";
        let color = "";

        if (hours <= 1) {
          bg = "rgba(0, 128, 0, 0.12)"; // light green
          color = "#0f8a0f"; // dark green
        } else if (hours > 1 && hours <= 24) {
          bg = "rgba(255, 165, 0, 0.15)"; // light orange
          color = "#d27a00"; // dark orange
        } else {
          bg = "rgba(255, 0, 0, 0.13)"; // light red
          color = "#c80000"; // dark red
        }

        return (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                background: bg,
                color: color,
                padding: "3px 8px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 600,
                display: "inline-block",
                minWidth: "75px",
                textAlign: "center",
              }}
            >
              {durationText}
            </span>
          </div>
        );
      },
    },
    { title: "Candidate Name", key: "name", dataIndex: "name", width: 200 },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      width: 240,
      render: (text) => {
        return (
          <>
            {text.length > 26 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
                className="leadtable_comments_tooltip"
                styles={{
                  body: {
                    backgroundColor: "#fff", // Tooltip background
                    color: "#333", // Tooltip text color
                    fontWeight: 500,
                    fontSize: "13px",
                  },
                }}
              >
                <p style={{ cursor: "pointer" }}>{text.slice(0, 25) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text}</p>
            )}
          </>
        );
      },
    },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 160 },
    {
      title: "Course",
      key: "course",
      dataIndex: "course",
      width: 200,
      render: (text) => {
        return (
          <>
            {text.length > 22 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
                className="leadtable_comments_tooltip"
                styles={{
                  body: {
                    backgroundColor: "#fff", // Tooltip background
                    color: "#333", // Tooltip text color
                    fontWeight: 500,
                    fontSize: "13px",
                  },
                }}
              >
                <p style={{ cursor: "pointer" }}>{text.slice(0, 21) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text}</p>
            )}
          </>
        );
      },
    },
    {
      title: "Location",
      key: "location",
      dataIndex: "location",
      width: 160,
      render: (text) => {
        return (
          <>
            {text.length > 20 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
                className="leadtable_comments_tooltip"
                styles={{
                  body: {
                    backgroundColor: "#fff", // Tooltip background
                    color: "#333", // Tooltip text color
                    fontWeight: 500,
                    fontSize: "13px",
                  },
                }}
              >
                <p style={{ cursor: "pointer" }}>{text.slice(0, 19) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text}</p>
            )}
          </>
        );
      },
    },
    {
      title: "Training",
      key: "training",
      dataIndex: "training",
      fixed: "right",
      width: 140,
      render: (text) => {
        if (text.includes("Online")) {
          return (
            <div className="livelead_onlinetraining_container">
              <p>Online</p>
            </div>
          );
        } else {
          return (
            <div className="livelead_classroomtraining_container">
              <p>Classroom</p>
            </div>
          );
        }
      },
    },
    {
      title: "Comments",
      key: "comments",
      dataIndex: "comments",
      fixed: "right",
      width: 220,
      render: (text) => {
        return (
          <>
            {text.length > 26 ? (
              <Tooltip
                color="#fff"
                placement="bottom"
                title={text}
                className="leadtable_comments_tooltip"
                styles={{
                  body: {
                    backgroundColor: "#fff", // Tooltip background
                    color: "#333", // Tooltip text color
                    fontWeight: 500,
                    fontSize: "13px",
                  },
                }}
              >
                <p style={{ cursor: "pointer" }}>{text.slice(0, 25) + "..."}</p>
              </Tooltip>
            ) : (
              <p>{text}</p>
            )}
          </>
        );
      },
    },
  ];

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    console.log("acccccc", activePage);
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    searchRef.current = null;
    datesRef.current = PreviousAndCurrentDate;
    const initialPagination = { page: 1, limit: 10, total: 0, totalPages: 0 };
    paginationRef.current = initialPagination;

    if (activePage !== "live_leads") return; // Stop polling

    // Initial Call
    getLiveLeadsData(
      null,
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      1,
      10
    );

    // Call every 5 seconds
    const interval = setInterval(() => {
      getLiveLeadsData(
        searchRef.current,
        datesRef.current[0],
        datesRef.current[1],
        paginationRef.current.page,
        paginationRef.current.limit
      );
    }, 5000);

    // Cleanup interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  const getLiveLeadsData = async (
    searchvalue,
    startDate,
    endDate,
    pageNumber,
    limit
  ) => {
    const payload = {
      ...(searchvalue && filterType == 1
        ? { phone: searchvalue }
        : searchvalue && filterType == 2
        ? { name: searchvalue }
        : searchvalue && filterType == 3
        ? { email: searchvalue }
        : searchvalue && filterType == 4
        ? { course: searchvalue }
        : {}),
      start_date: startDate,
      end_date: endDate,
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getLiveLeads(payload);
      console.log("live lead response", response);
      const paginations = response?.data?.data?.pagination;

      setLeadData(response?.data?.data?.data || []);
      paginationRef.current = paginations;

      setLiveLeadCount(paginations.total);
      setPagination({
        page: paginations.page,
        limit: paginations.limit,
        total: paginations.total,
        totalPages: paginations.totalPages,
      });
    } catch (error) {
      setLeadData([]);
      console.log("get live lead error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    searchRef.current = e.target.value;
    setTimeout(() => {
      setPagination({
        page: 1,
      });
      getLiveLeadsData(
        e.target.value,
        selectedDates[0],
        selectedDates[1],
        1,
        pagination.limit
      );
    }, 300);
  };

  const handlePaginationChange = ({ page, limit }) => {
    getLiveLeadsData(
      searchValue,
      selectedDates[0],
      selectedDates[1],
      page,
      limit
    );
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={17}>
          <Row gutter={16}>
            <Col span={7}>
              <div className="overallduecustomers_filterContainer">
                <CommonOutlinedInput
                  label={
                    filterType == 1
                      ? "Search By Mobile"
                      : filterType == 2
                      ? "Search By Name"
                      : filterType == 3
                      ? "Search by Email"
                      : filterType == 4
                      ? "Search by Course"
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
                          setLoading(true);
                          searchRef.current = null;
                          setPagination({
                            page: 1,
                          });
                          getLiveLeadsData(
                            null,
                            selectedDates[0],
                            selectedDates[1],
                            1,
                            pagination.limit
                          );
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
                  value={searchValue}
                  onChange={handleSearch}
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
                            setLoading(true);
                            if (searchValue == "") {
                              return;
                            } else {
                              setSearchValue("");
                              searchRef.current = null;
                              setPagination({
                                page: 1,
                              });
                              getLiveLeadsData(
                                null,
                                selectedDates[0],
                                selectedDates[1],
                                1,
                                pagination.limit
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
                          <Radio value={3} style={{ marginBottom: "12px" }}>
                            Search by Email
                          </Radio>
                          <Radio value={4} style={{ marginBottom: "6px" }}>
                            Search by Course
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
            <Col span={10}>
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  datesRef.current = dates;
                  setLoading(true);
                  setPagination({
                    page: 1,
                  });
                  getLiveLeadsData(
                    searchValue,
                    dates[0],
                    dates[1],
                    1,
                    pagination.limit
                  );
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={24} sm={24} md={24} lg={7}></Col>
      </Row>

      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 1200 }}
          columns={columns}
          dataSource={leadData}
          dataPerPage={10}
          loading={loading}
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
