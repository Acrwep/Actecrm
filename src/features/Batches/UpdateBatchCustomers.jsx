import React, {
  useState,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { Row, Col, Divider, Button, Tooltip, Drawer } from "antd";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import moment from "moment";
import CommonTable from "../Common/CommonTable";
import { FaRegEye } from "react-icons/fa";
import ParticularCustomerDetails from "../Customers/ParticularCustomerDetails";
import { getCustomers } from "../ApiService/action";
import CommonSpinner from "../Common/CommonSpinner";
import CommonSelectField from "../Common/CommonSelectField";
import { selectValidator } from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import ClassSchedule from "../Customers/ClassSchedule";

const UpdateBatchCustomers = forwardRef(({ editBatchItem }) => {
  //--------------useref----------------------
  const classScheduleRef = useRef();
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [formattedCustomerIds, setFormattedCustomerIds] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerDetailsLoading, setCustomerDetailsLoading] = useState("");
  //-----------update customer usestates----------------
  const [moveToOptions, setMoveToOptions] = useState([
    { id: "Awaiting Class", name: "Awaiting Class", is_active: true },
    { id: "Schedule Class", name: "Schedule Class", is_active: true },
    { id: "Update Class Going", name: "Update Class Going", is_active: true },
    { id: "Passedout Process", name: "Passedout Process", is_active: true },
    { id: "Others", name: "Others", is_active: true },
  ]);
  const [moveTo, setMoveTo] = useState("");
  const [moveToError, setMoveToError] = useState("");
  const [updateCustomerDetails, setUpdateCustomerDetails] = useState(null);
  const [updateButtonLoading, setUpdateButtonLoading] = useState(false);

  const columns = [
    {
      title: "Name",
      key: "name",
      dataIndex: "name",
      width: 100,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Email",
      key: "email",
      dataIndex: "email",
      width: 130,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Mobile",
      key: "phone",
      dataIndex: "phone",
      width: 90,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Course",
      key: "course_name",
      dataIndex: "course_name",
      width: 130,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      fixed: "right",
      width: 140,
      render: (text) => {
        return (
          <>
            {text === "Form Pending" ? (
              <div>
                <Button className="customers_status_formpending_button">
                  {text}
                </Button>
              </div>
            ) : text == "Payment Rejected" ? (
              <div>
                <Button className="trainers_rejected_button">
                  Payment Rejected
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
              text === "Payment Rejected" ||
              text === "Trainer Rejected" ||
              text === "Escalated" ||
              text === "Hold" ||
              text === "Partially Closed" ||
              text === "Discontinued" ||
              text === "Demo Completed" ||
              text === "Videos Given" ||
              text === "Refund" ? (
              <Button className="trainers_rejected_button">{text}</Button>
            ) : text === "Class Going" ? (
              <div style={{ display: "flex", gap: "12px" }}>
                <Button className="customers_status_classgoing_button">
                  {text}
                </Button>

                {/* <p className="customer_classgoing_percentage">{`${parseFloat(
                                    classPercent
                                  )}%`}</p> */}
              </div>
            ) : (
              <p style={{ marginLeft: "6px" }}>-</p>
            )}
          </>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      fixed: "right",
      width: 70,
      render: (text, record) => {
        const isLoading = customerDetailsLoading === record.email;
        return (
          <div className="trainers_actionbuttonContainer">
            {isLoading ? (
              <CommonSpinner color="#333" />
            ) : (
              <Tooltip
                placement="top"
                title="View Details"
                trigger={["hover", "click"]}
              >
                <FaRegEye
                  size={15}
                  className="trainers_action_icons"
                  onClick={() => {
                    getParticularCustomerDetails(record.email);
                    //   setCustomerDetails(record);
                  }}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  const getParticularCustomerDetails = async (customerEmail) => {
    setCustomerDetailsLoading(customerEmail);
    const payload = {
      email: customerEmail,
    };
    try {
      const response = await getCustomers(payload);
      const customer_details = response?.data?.data?.customers[0];
      console.log("customer full details", customer_details);
      setCustomerDetails(customer_details);
      setCustomerDetailsLoading("");
      setIsOpenDetailsDrawer(true);
    } catch (error) {
      setCustomerDetailsLoading("");
      console.log("getcustomer by id error", error);
      setCustomerDetails(null);
    }
  };

  //   const handleSelectedRow = (row) => {
  //     console.log("selected rowwww", row);
  //     setSelectedRows(row);
  //     const keys = row.map((item) => item.id); // or your unique row key
  //     setSelectedRowKeys(keys);
  //   };

  const handleSelectedRow = (rows) => {
    // Reset when nothing selected
    if (rows.length === 0) {
      setSelectedRows([]);
      setSelectedRowKeys([]);
      setFormattedCustomerIds([]);
      setSelectedStatus(null);
      setMoveTo("");
      setMoveToOptions([
        { id: "Awaiting Class", name: "Awaiting Class", is_active: true },
        { id: "Schedule Class", name: "Schedule Class", is_active: true },
        {
          id: "Update Class Going",
          name: "Update Class Going",
          is_active: true,
        },
        { id: "Passedout Process", name: "Passedout Process", is_active: true },
        { id: "Others", name: "Others", is_active: true },
      ]);
      setUpdateCustomerDetails(null);
      return;
    }

    console.log("selected rows", rows);

    const firstStatus = rows[0].status;
    setUpdateCustomerDetails(rows[0]);
    // Check if user selected different status
    const hasInvalidSelection = rows.some(
      (item) => item.status !== firstStatus,
    );

    if (hasInvalidSelection) {
      CommonMessage(
        "error",
        "You can select only customers with the same status",
      );
    }

    // Keep only valid rows
    const validRows = rows.filter((item) => item.status === firstStatus);

    setSelectedRows(validRows);
    setSelectedRowKeys(validRows.map((item) => item.id));
    const formattedIds = validRows.map((item) => ({
      customer_id: item.id,
    }));

    setFormattedCustomerIds(formattedIds);
    console.log("firstStatus", firstStatus);
    setSelectedStatus(firstStatus);

    if (firstStatus == "Class Going") {
      const updateMoveToOptions = moveToOptions.map((m) => {
        if (m.name == "Update Class Going" || m.name == "Others") {
          return { ...m, is_active: true };
        } else {
          return { ...m, is_active: false };
        }
      });
      setMoveToOptions(updateMoveToOptions);
    } else if (firstStatus == "Awaiting Class") {
      const updateMoveToOptions = moveToOptions.map((m) => {
        if (m.name == "Schedule Class" || m.name == "Others") {
          return { ...m, is_active: true };
        } else {
          return { ...m, is_active: false };
        }
      });
      setMoveToOptions(updateMoveToOptions);
    }
  };
  return (
    <div>
      <Row
        gutter={16}
        style={{ marginTop: "20px", padding: "0px 0px 0px 24px" }}
      >
        <Col span={12}>
          <Row>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                <p className="customerdetails_rowheading">Created At</p>
              </div>
            </Col>
            <Col span={12}>
              <EllipsisTooltip
                text={
                  editBatchItem && editBatchItem.created_date
                    ? moment(editBatchItem.created_date).format("DD/MM/YYYY")
                    : "-"
                }
                smallText={true}
              />
            </Col>
          </Row>

          <Row style={{ marginTop: "12px" }}>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                <p className="customerdetails_rowheading">Batch Name</p>
              </div>
            </Col>
            <Col span={12}>
              <EllipsisTooltip
                text={
                  editBatchItem && editBatchItem.batch_name
                    ? editBatchItem.batch_name
                    : "-"
                }
                smallText={true}
              />
            </Col>
          </Row>

          <Row style={{ marginTop: "12px" }}>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                <p className="customerdetails_rowheading">Batch Id</p>
              </div>
            </Col>
            <Col span={12}>
              <EllipsisTooltip
                text={
                  editBatchItem && editBatchItem.batch_number
                    ? editBatchItem.batch_number
                    : "-"
                }
                smallText={true}
              />
            </Col>
          </Row>
        </Col>

        <Col span={12}>
          <Row>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                <p className="customerdetails_rowheading">Region</p>
              </div>
            </Col>
            <Col span={12}>
              <EllipsisTooltip
                text={
                  editBatchItem && editBatchItem.region_name
                    ? editBatchItem.region_name
                    : "-"
                }
                smallText={true}
              />
            </Col>
          </Row>

          <Row style={{ marginTop: "12px" }}>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                <p className="customerdetails_rowheading">Branch Name</p>
              </div>
            </Col>
            <Col span={12}>
              <EllipsisTooltip
                text={
                  editBatchItem && editBatchItem.branch_name
                    ? editBatchItem.branch_name
                    : "-"
                }
                smallText={true}
              />
            </Col>
          </Row>

          <Row style={{ marginTop: "12px" }}>
            <Col span={12}>
              <div className="customerdetails_rowheadingContainer">
                <p className="customerdetails_rowheading">Customers</p>
              </div>
            </Col>
            <Col span={12}>
              <p className="customerdetails_text">
                {editBatchItem && editBatchItem.customers.length}
              </p>
            </Col>
          </Row>
        </Col>
      </Row>

      <Divider className="customer_statusupdate_divider" />

      <div className="customer_statusupdate_adddetailsContainer">
        <p className="customer_statusupdate_adddetails_heading">Customers</p>

        <div style={{ marginTop: "12px" }}>
          <CommonTable
            scroll={{ x: 800 }}
            columns={columns}
            dataSource={editBatchItem?.customers ?? []}
            dataPerPage={10}
            //   loading={loading}
            checkBox="true"
            size="small"
            selectedDatas={handleSelectedRow}
            selectedRowKeys={selectedRowKeys}
            className="questionupload_table"
          />
        </div>

        {selectedStatus ? (
          <>
            <p className="customer_statusupdate_adddetails_heading">
              Update Customers
            </p>

            <div style={{ marginTop: "16px" }}>
              <CommonSelectField
                label="Move To"
                options={moveToOptions}
                onChange={(e) => {
                  setMoveTo(e.target.value);
                  setMoveToError(selectValidator(e.target.value));
                }}
                value={moveTo}
                error={moveToError}
              />
            </div>
          </>
        ) : (
          ""
        )}
      </div>

      {selectedStatus ? (
        <>
          <div style={{ marginTop: "20px" }}>
            {moveTo == "Awaiting Class" || moveTo == "Update Class Going" ? (
              <ClassSchedule
                ref={classScheduleRef}
                drawerContentStatus={
                  moveTo == "Awaiting Class"
                    ? "Class Schedule"
                    : "Update Class Going"
                }
                customerDetails={updateCustomerDetails}
                customerIdsFromBatch={formattedCustomerIds}
                setUpdateButtonLoading={setUpdateButtonLoading}
                callgetCustomersApi={() => {}}
              />
            ) : (
              ""
            )}
          </div>

          <div className="leadmanager_tablefiler_footer">
            <div className="leadmanager_submitlead_buttoncontainer">
              {updateButtonLoading ? (
                <button className="users_adddrawer_loadingcreatebutton">
                  <CommonSpinner />
                </button>
              ) : (
                <button
                  className="users_adddrawer_createbutton"
                  onClick={
                    moveTo === "Class Schedule"
                      ? () => classScheduleRef.current?.handleClassSchedule()
                      : moveTo === "Update Class Going"
                        ? () =>
                            classScheduleRef.current?.handleUpdateClassGoing()
                        : ""
                  }
                >
                  Update
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        ""
      )}

      <Drawer
        title="Customer Details"
        open={isOpenDetailsDrawer}
        onClose={() => {
          setIsOpenDetailsDrawer(false);
          setCustomerDetails(null);
        }}
        width="50%"
        style={{ position: "relative" }}
      >
        {isOpenDetailsDrawer ? (
          <ParticularCustomerDetails
            customerDetails={customerDetails}
            isCustomerPage={true}
          />
        ) : (
          ""
        )}
      </Drawer>
    </div>
  );
});
export default UpdateBatchCustomers;
