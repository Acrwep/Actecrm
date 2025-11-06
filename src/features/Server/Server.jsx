import React, { useState, useEffect } from "react";
import { Row, Col, Button, Flex, Radio, Tooltip } from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CiSearch } from "react-icons/ci";
import { IoFilter } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";
import CommonTable from "../Common/CommonTable";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { getCurrentandPreviousweekDate } from "../Common/Validation";
import { getServerRequest } from "../ApiService/action";
import moment from "moment";

export default function Server() {
  const [status, setStatus] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState(1);
  const [serverData, setServerData] = useState([]);
  const [statusCount, setStatusCount] = useState(null);
  const [loading, setLoading] = useState(true);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const nonChangeColumns = [
    {
      title: "Created At",
      key: "created_date",
      dataIndex: "created_date",
      width: 130,
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Created By",
      key: "created_by_id",
      dataIndex: "created_by_id",
      width: 180,
      render: (text, record) => {
        return <p>{text ? `${text} - ${record.created_by}` : "-"}</p>;
      },
    },
    { title: "Name", key: "name", dataIndex: "name", width: 180 },
    { title: "Mobile", key: "phone", dataIndex: "phone", width: 140 },
    { title: "Email", key: "email", dataIndex: "email", width: 220 },
    {
      title: "Server Name",
      key: "server_name",
      dataIndex: "server_name",
      width: 180,
    },
    {
      title: "Server Cost",
      key: "server_cost",
      dataIndex: "server_cost",
      width: 130,
      render: (text) => {
        return <p>{text ? `₹${text}` : "-"}</p>;
      },
    },
    { title: "Duration", key: "duration", dataIndex: "duration", width: 120 },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      fixed: "right",
      width: 140,
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            <AiOutlineEdit size={20} className="trainers_action_icons" />
            <RiDeleteBinLine
              size={19}
              color="#d32f2f"
              className="trainers_action_icons"
            />
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    getServerRequestData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      null,
      null,
      1,
      10
    );
  }, []);

  const getServerRequestData = async (
    startDate,
    endDate,
    serverStatus,
    searchvalue,
    pageNumber,
    limit
  ) => {
    setLoading(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      ...(serverStatus && { status: serverStatus }),
      ...(searchvalue && filterType == 1
        ? { mobile: searchvalue }
        : searchvalue && filterType == 2
        ? { name: searchvalue }
        : searchvalue && filterType == 3
        ? { email: searchvalue }
        : searchvalue && filterType == 4
        ? { server: searchvalue }
        : {}),
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getServerRequest(payload);
      console.log("server response", response);
      setServerData(response?.data?.data?.data || []);
      setStatusCount(response?.data?.data?.statusCount[0] || null);

      const pagination = response?.data?.data?.pagination;
      setPagination({
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      });
    } catch (error) {
      setServerData([]);
      setStatusCount(null);
      console.log("get server error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setTimeout(() => {
      setPagination({
        page: 1,
      });
      getServerRequestData(
        selectedDates[0],
        selectedDates[1],
        status,
        e.target.value,
        1,
        pagination.limit
      );
    }, 300);
  };

  const handlePaginationChange = ({ page, limit }) => {
    getServerRequestData(
      selectedDates[0],
      selectedDates[1],
      status,
      searchValue,
      page,
      limit
    );
  };

  return (
    <div>
      <Row style={{ marginBottom: "12px" }}>
        <Col xs={24} sm={24} md={24} lg={12}>
          <Row gutter={16}>
            <Col span={10}>
              <div className="overallduecustomers_filterContainer">
                {/* <CommonOutlinedInput
              label="Search"
              width="40%"
              height="33px"
              labelFontSize="12px"
              icon={<CiSearch size={16} />}
              labelMarginTop="-1px"
            /> */}
                <CommonOutlinedInput
                  label={
                    filterType == 1
                      ? "Search By Mobile"
                      : filterType == 2
                      ? "Search By Name"
                      : filterType == 3
                      ? "Search by Email"
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
                          getServerRequestData(
                            selectedDates[0],
                            selectedDates[1],
                            status,
                            null,
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
                            console.log(e.target.value);
                            setFilterType(e.target.value);
                            if (searchValue === "") {
                              return;
                            } else {
                              setSearchValue("");
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
                            Search by Server Name
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

            <Col span={14}>
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setPagination({
                    page: 1,
                  });
                  getServerRequestData(
                    dates[0],
                    dates[1],
                    status,
                    searchValue,
                    1,
                    pagination.limit
                  );
                }}
              />
            </Col>
          </Row>
        </Col>

        <Col
          xs={24}
          sm={24}
          md={24}
          lg={12}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        ></Col>
      </Row>

      <div className="customers_status_mainContainer">
        {" "}
        <div
          className={
            status === ""
              ? "trainers_active_all_container"
              : "trainers_all_container"
          }
          onClick={() => {
            if (status === "") {
              return;
            }
            setStatus("");
            getServerRequestData(
              selectedDates[0],
              selectedDates[1],
              null,
              searchValue,
              1,
              pagination.limit
            );
          }}
        >
          <p>
            All{" "}
            {`( ${
              statusCount && statusCount.total ? statusCount.total : "-"
            } )`}
          </p>
        </div>
        <div
          className={
            status === "Requested"
              ? "trainers_active_formpending_container"
              : "customers_feedback_container"
          }
          onClick={() => {
            if (status === "Requested") {
              return;
            }
            setStatus("Requested");
            getServerRequestData(
              selectedDates[0],
              selectedDates[1],
              "Requested",
              searchValue,
              1,
              pagination.limit
            );
          }}
        >
          <p>
            Server Request{" "}
            {`( ${
              statusCount && statusCount.requested ? statusCount.requested : "-"
            } )`}
          </p>
        </div>
        <div
          className={
            status === "Awaiting Verify"
              ? "trainers_active_verifypending_container"
              : "customers_studentvefity_container"
          }
          onClick={() => {
            if (status === "Awaiting Verify") {
              return;
            }
            setStatus("Awaiting Verify");
            getServerRequestData(
              selectedDates[0],
              selectedDates[1],
              "Awaiting Verify",
              searchValue,
              1,
              pagination.limit
            );
          }}
        >
          <p>
            Awaiting Verify{" "}
            {`( ${
              statusCount && statusCount.awaiting_verify
                ? statusCount.awaiting_verify
                : "-"
            } )`}
          </p>
        </div>
        <div
          className={
            status === "Awaiting Approval"
              ? "customers_active_classschedule_container"
              : "customers_classschedule_container"
          }
          onClick={() => {
            if (status === "Awaiting Approval") {
              return;
            }
            setStatus("Awaiting Approval");
            getServerRequestData(
              selectedDates[0],
              selectedDates[1],
              "Awaiting Approval",
              searchValue,
              1,
              pagination.limit
            );
          }}
        >
          <p>
            Awaiting Approval{" "}
            {`( ${
              statusCount && statusCount.awaiting_approval
                ? statusCount.awaiting_approval
                : "-"
            } )`}
          </p>
        </div>
        <div
          className={
            status === "Issued"
              ? "trainers_active_verifiedtrainers_container"
              : "customers_completed_container"
          }
          onClick={() => {
            if (status === "Issued") {
              return;
            }
            setStatus("Issued");
            getServerRequestData(
              selectedDates[0],
              selectedDates[1],
              "Issued",
              searchValue,
              1,
              pagination.limit
            );
          }}
        >
          <p>
            Server Issued{" "}
            {`( ${
              statusCount && statusCount.issued ? statusCount.issued : "-"
            } )`}
          </p>
        </div>
        <div
          className={
            status === "Rejected"
              ? "trainers_active_rejectedtrainers_container"
              : "trainers_rejected_container"
          }
          onClick={() => {
            if (status === "Rejected") {
              return;
            }
            setStatus("Rejected");
            getServerRequestData(
              selectedDates[0],
              selectedDates[1],
              "Rejected",
              searchValue,
              1,
              pagination.limit
            );
          }}
        >
          <p>
            Rejected Servers{" "}
            {`( ${
              statusCount && statusCount.rejected ? statusCount.rejected : "-"
            } )`}
          </p>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 1400 }}
          columns={nonChangeColumns}
          dataSource={serverData}
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
