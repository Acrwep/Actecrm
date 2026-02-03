import React, { useState, useRef, useEffect } from "react";
import { Row, Col, Tooltip, Button, Drawer } from "antd";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { RedoOutlined } from "@ant-design/icons";
import {
  checkTicketEmail,
  getAllTickets,
  getTrainers,
} from "../ApiService/action";
import {
  emailValidator,
  getCurrentandPreviousweekDate,
} from "../Common/Validation";
import moment from "moment";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonTable from "../Common/CommonTable";
import CommonSpinner from "../Common/CommonSpinner";
import AddTicket from "./AddTicket";

export default function Tickets() {
  const scrollRef = useRef();
  const addTicketRef = useRef();

  const scroll = (scrollOffset) => {
    scrollRef.current.scrollBy({
      left: scrollOffset,
      behavior: "smooth",
    });
  };

  // ----------usestates----------------
  const [selectedDates, setSelectedDates] = useState([]);
  const [status, setStatus] = useState("");
  const [statusCounts, setStatusCounts] = useState(null);
  const [ticketsData, setTicketsData] = useState([]);
  const [loading, setLoading] = useState(true);
  //-------------form usestates-----------------------
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [trainersData, setTrainersData] = useState([]);
  const [buttonLoading, setButtonLoading] = useState(false);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const columns = [
    {
      title: "Created At",
      key: "created_at",
      dataIndex: "created_at",
      width: 130,
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
    {
      title: "Title",
      key: "title",
      dataIndex: "title",
      width: 150,
      render: (text) => {
        return <EllipsisTooltip text={text || "-"} />;
      },
    },
    {
      title: "Category",
      key: "category_name",
      dataIndex: "category_name",
      width: 150,
      render: (text) => {
        return <EllipsisTooltip text={text || "-"} />;
      },
    },
    {
      title: "Sub Category",
      key: "sub_category_name",
      dataIndex: "sub_category_name",
      width: 150,
      render: (text) => {
        return <EllipsisTooltip text={text || "-"} />;
      },
    },
    {
      title: "Priority",
      key: "priority",
      dataIndex: "priority",
      width: 150,
      render: (text) => {
        return <EllipsisTooltip text={text || "-"} />;
      },
    },
    {
      title: "Type",
      key: "type",
      dataIndex: "type",
      width: 150,
      render: (text) => {
        return <EllipsisTooltip text={text || "-"} />;
      },
    },
    {
      title: "Description",
      key: "description",
      dataIndex: "description",
      width: 150,
      render: (text) => {
        return <EllipsisTooltip text={text || "-"} />;
      },
    },
  ];

  useEffect(() => {
    getTrainersData();
  }, []);

  const getTrainersData = async () => {
    const payload = {
      status: "Verified",
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getTrainers(payload);
      setTrainersData(response?.data?.data?.trainers || []);
    } catch (error) {
      setTrainersData([]);
      console.log(error);
    } finally {
      setTimeout(() => {
        // getCategoriesData();
        const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
        setSelectedDates(PreviousAndCurrentDate);
        getTicketsData(
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
          "",
          1,
          10,
        );
      }, 300);
    }
  };

  const getTicketsData = async (
    startDate,
    endDate,
    status,
    pageNumber,
    limit,
  ) => {
    setLoading(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      status: status,
      page: pageNumber,
      limit: limit,
    };
    try {
      const response = await getAllTickets(payload);
      console.log("tickets response", response);
      // Extract data from response
      const responseData = response?.data?.data?.tickets || [];
      const paginationData = response?.data?.data?.pagination || {};
      const statusCountsData = response?.data?.data?.statusCount || {};

      // Set payment requests data
      setTicketsData(responseData);

      // Update pagination
      setPagination({
        page: paginationData.page || 1,
        limit: paginationData.limit || 10,
        total: paginationData.total || 0,
        totalPages: paginationData.totalPages || 0,
      });

      // Update status counts
      setStatusCounts(statusCountsData);
    } catch (error) {
      setTicketsData([]);
      console.log("get tickets error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleEmail = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (validationTrigger) {
      let emailValidate = emailValidator(value);
      setEmailError(emailValidate);

      if (emailValidate == "") {
        const payload = {
          email: value,
        };
        setTimeout(async () => {
          try {
            const response = await checkTicketEmail(payload);
            console.log("email response", response);
            setEmailError(
              response?.data?.data?.status == false ? " is not valid" : "",
            );
            // setSubCategoryOptions(response?.data?.data || []);
          } catch (error) {
            // setSubCategoryOptions([]);
            console.log("email error", error);
          }
        }, 300);
      }
    }
  };

  const handlePaginationChange = ({ page, limit }) => {
    setPagination({
      page: page,
      limit: limit,
    });
    getTicketsData(selectedDates[0], selectedDates[1], status, page, limit);
  };

  const handleRefresh = () => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setPagination({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
    getTicketsData(
      PreviousAndCurrentDate[0],
      PreviousAndCurrentDate[1],
      "",
      1,
      10,
    );
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12}>
          <Row gutter={16}>
            <Col span={10}>
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  // setPagination({
                  //   page: 1,
                  // });
                  //    getBatchesData(trainerFilterId, dates[0], dates[1]);
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
            gap: "12px",
          }}
        >
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

      <Row>
        <Col span={18}>
          <div className="customers_scroll_wrapper">
            {/* <button
                    onClick={() => scroll(-600)}
                    className="customer_statusscroll_button"
                  >
                    <IoMdArrowDropleft size={25} />
                  </button> */}
            <div className="customers_status_mainContainer" ref={scrollRef}>
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
                }}
              >
                <p>
                  All{" "}
                  {`( ${
                    statusCounts &&
                    statusCounts.total !== undefined &&
                    statusCounts.total !== null
                      ? statusCounts.total
                      : "-"
                  } )`}
                </p>
              </div>
              <div
                className={
                  status === "Open"
                    ? "customers_active_classschedule_container"
                    : "customers_classschedule_container"
                }
                onClick={() => {
                  if (status === "Open") {
                    return;
                  }
                  setStatus("Open");
                  setPagination({ ...pagination, page: 1 });
                  getTicketsData(
                    selectedDates[0],
                    selectedDates[1],
                    "Open",
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  Open{" "}
                  {`(  ${
                    statusCounts &&
                    statusCounts.open !== undefined &&
                    statusCounts.open !== null
                      ? statusCounts.open
                      : "-"
                  }
 )`}
                </p>
              </div>
              <div
                className={
                  status === "Hold"
                    ? "trainers_active_verifypending_container"
                    : "customers_studentvefity_container"
                }
                onClick={() => {
                  if (status === "Hold") {
                    return;
                  }
                  setStatus("Hold");
                  setPagination({ ...pagination, page: 1 });
                  getTicketsData(
                    selectedDates[0],
                    selectedDates[1],
                    "Hold",
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  Hold{" "}
                  {`( ${
                    statusCounts &&
                    statusCounts.hold !== undefined &&
                    statusCounts.hold !== null
                      ? statusCounts.hold
                      : "-"
                  } )`}
                </p>
              </div>
              <div
                className={
                  status === "Overdue"
                    ? "customers_active_escalated_container"
                    : "customers_escalated_container"
                }
                onClick={() => {
                  if (status === "Overdue") {
                    return;
                  }
                  setStatus("Overdue");
                  setPagination({ ...pagination, page: 1 });
                  getTicketsData(
                    selectedDates[0],
                    selectedDates[1],
                    "Overdue",
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  Overdue{" "}
                  {`( ${
                    statusCounts &&
                    statusCounts.overdue !== undefined &&
                    statusCounts.overdue !== null
                      ? statusCounts.overdue
                      : "-"
                  } )`}
                </p>
              </div>
              <div
                className={
                  status === "Closed"
                    ? "trainers_active_verifiedtrainers_container"
                    : "customers_completed_container"
                }
                onClick={() => {
                  if (status === "Closed") {
                    return;
                  }
                  setStatus("Closed");
                  setPagination({ ...pagination, page: 1 });
                  getTicketsData(
                    selectedDates[0],
                    selectedDates[1],
                    "Closed",
                    1,
                    pagination.limit,
                  );
                }}
              >
                <p>
                  Closed{" "}
                  {`( ${
                    statusCounts &&
                    statusCounts.closed !== undefined &&
                    statusCounts.closed !== null
                      ? statusCounts.closed
                      : "-"
                  } )`}
                </p>
              </div>
            </div>
            {/* <button
                    onClick={() => scroll(900)}
                    className="customer_statusscroll_button"
                  >
                    <IoMdArrowDropright size={25} />
                  </button> */}
          </div>
        </Col>
        <Col
          span={6}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <button
            className="leadmanager_addleadbutton"
            onClick={() => {
              setIsOpenAddDrawer(true);
            }}
          >
            Add Ticket
          </button>
        </Col>
      </Row>

      <div style={{ marginTop: "12px" }}>
        <CommonTable
          scroll={{
            x: columns.reduce((total, col) => total + (col.width || 150), 0),
          }}
          columns={columns}
          dataSource={ticketsData}
          dataPerPage={10}
          loading={loading}
          checkBox="false"
          size="small"
          className="questionupload_table"
          onPaginationChange={handlePaginationChange}
          limit={pagination.limit}
          page_number={pagination.page}
          totalPageNumber={pagination.total}
        />
      </div>

      <Drawer
        title="Add Ticket"
        open={isOpenAddDrawer}
        onClose={() => {
          setIsOpenAddDrawer(false);
          setButtonLoading(false);
        }}
        width="50%"
        className="customer_statusupdate_drawer"
        style={{ position: "relative", paddingBottom: 65 }}
      >
        {isOpenAddDrawer ? (
          <AddTicket
            ref={addTicketRef}
            trainersData={trainersData}
            setButtonLoading={setButtonLoading}
            callgetTicketApi={() => {
              setIsOpenAddDrawer(false);
              setButtonLoading(false);
              getTicketsData(
                selectedDates[0],
                selectedDates[1],
                status,
                pagination.page,
                pagination.limit,
              );
            }}
          />
        ) : (
          ""
        )}
        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            {buttonLoading ? (
              <button className="users_adddrawer_loadingcreatebutton">
                <CommonSpinner />
              </button>
            ) : (
              <button
                className="users_adddrawer_createbutton"
                onClick={() => addTicketRef.current.handleSubmit()}
              >
                {"Submit"}
              </button>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
