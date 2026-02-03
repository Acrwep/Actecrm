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
import OthersHandling from "../Customers/OthersHandling";
import PassesOutProcess from "../Customers/PassedOutProcess";
import { FaLinkedinIn } from "react-icons/fa";
import PreCertificate from "../Customers/PreCertificate";

const UpdateBatchCustomers = forwardRef(
  ({ editBatchItem, callgetBatchesApi }) => {
    //--------------useref----------------------
    const classScheduleRef = useRef();
    const othersHandlingRef = useRef();
    const passedOutProcessRef = useRef();
    const preCertificateRef = useRef();
    //--------------Basic usestates
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [formattedCustomerIds, setFormattedCustomerIds] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [isOpenDetailsDrawer, setIsOpenDetailsDrawer] = useState(false);
    const [customerDetails, setCustomerDetails] = useState(null);
    const [customerDetailsLoading, setCustomerDetailsLoading] = useState("");
    const [isCertificate, setIsCertificate] = useState(false);
    //-----------update customer usestates----------------
    const [moveToOptions, setMoveToOptions] = useState([
      { id: "Class Schedule", name: "Class Schedule", is_active: true },
      { id: "Update Class Going", name: "Update Class Going", is_active: true },
      { id: "Passedout Process", name: "Passedout Process", is_active: true },
    ]);
    const [moveTo, setMoveTo] = useState("");
    const [moveToError, setMoveToError] = useState("");
    const [updateCustomerDetails, setUpdateCustomerDetails] = useState(null);
    const [updateButtonLoading, setUpdateButtonLoading] = useState(false);
    //feedback usestates
    const [isCertGenerated, setIsCertGenerated] = useState(false);
    const [generateCertLoading, setGenerateCertLoading] = useState(false);
    const [certHtmlContent, setCertHtmlContent] = useState("");
    const [isOpenViewCertModal, setIsOpenViewCertModal] = useState(false);
    const [certificateName, setCertificateName] = useState("");
    const [stepIndex, setStepIndex] = useState(0);

    const prev = () => setStepIndex(stepIndex - 1);

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
                <div
                  style={{ display: "flex", gap: "6px", alignItems: "center" }}
                >
                  <Button className="customers_status_classgoing_button">
                    {text}
                  </Button>

                  <p className="customer_classgoing_percentage">{`${parseFloat(
                    classPercent,
                  )}%`}</p>

                  <Tooltip placement="top" title="Linkedin CheckIn">
                    <FaLinkedinIn
                      size={14}
                      color="#0a66c2"
                      className="customers_formlink_copybutton"
                      style={{ cursor: "pointer", marginTop: "-2px" }}
                      onClick={() => {
                        setCustomerDetails(record);
                        setIsCertificate(!isCertificate);
                        setSelectedRowKeys([]);
                        setSelectedRows([]);
                        setSelectedStatus("");
                        return;
                      }}
                    />
                  </Tooltip>
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

    const resetCustomersTable = () => {
      setSelectedRows([]);
      setSelectedRowKeys([]);
      setFormattedCustomerIds([]);
      setSelectedStatus(null);
      setMoveTo("");
      setMoveToOptions([
        { id: "Class Schedule", name: "Class Schedule", is_active: true },
        {
          id: "Update Class Going",
          name: "Update Class Going",
          is_active: true,
        },
        {
          id: "Passedout Process",
          name: "Passedout Process",
          is_active: true,
        },
      ]);
      setUpdateCustomerDetails(null);
    };

    const handleSelectedRow = (rows) => {
      // Reset when nothing selected
      if (rows.length === 0) {
        resetCustomersTable();
        return;
      } else {
        setIsCertificate(false);
      }

      console.log("selected rows", rows);

      const firstStatus = rows[0].status;

      /** 🚫 Block multi-select for Passedout Process */
      if (firstStatus === "Passedout process" && rows.length > 1) {
        CommonMessage(
          "error",
          "You can select only one customer for Passedout Process",
        );

        // Keep only first selected row
        rows = [rows[0]];
      }

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
          if (m.name == "Update Class Going") {
            return { ...m, is_active: true };
          } else {
            return { ...m, is_active: false };
          }
        });
        setMoveToOptions(updateMoveToOptions);
      } else if (firstStatus == "Awaiting Class") {
        const updateMoveToOptions = moveToOptions.map((m) => {
          if (m.name == "Class Schedule") {
            return { ...m, is_active: true };
          } else {
            return { ...m, is_active: false };
          }
        });
        setMoveToOptions(updateMoveToOptions);
      } else if (firstStatus == "Passedout process") {
        const data = rows[0];
        if (data.google_review === null) {
          setStepIndex(0);
        } else if (data.is_certificate_generated === 0) {
          setStepIndex(1);
        } else {
          setStepIndex(2);
        }
        setIsCertGenerated(data.is_certificate_generated === 1 ? true : false);
        const updateMoveToOptions = moveToOptions.map((m) => {
          if (m.name == "Passedout Process") {
            return { ...m, is_active: true };
          } else {
            return { ...m, is_active: false };
          }
        });
        setMoveToOptions(updateMoveToOptions);
      } else {
        CommonMessage(
          "error",
          "Cannot select. Update the customer status on the Customers page.",
        );
        resetCustomersTable();
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
                    setTimeout(() => {
                      const container = document.getElementById(
                        "batch_updatedrawer_bottomcontainer",
                      );
                      container.scrollIntoView({ behavior: "smooth" });
                    }, 200);
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

        {selectedStatus && moveTo ? (
          <>
            <div style={{ marginTop: "20px" }}>
              {moveTo == "Update Class Going" || moveTo == "Class Schedule" ? (
                <ClassSchedule
                  ref={classScheduleRef}
                  drawerContentStatus={
                    moveTo == "Class Schedule"
                      ? "Class Schedule"
                      : "Update Class Going"
                  }
                  customerDetails={updateCustomerDetails}
                  customerIdsFromBatch={formattedCustomerIds}
                  setUpdateButtonLoading={setUpdateButtonLoading}
                  callgetCustomersApi={() => {
                    callgetBatchesApi();
                  }}
                />
              ) : moveTo == "Passedout Process" ? (
                <PassesOutProcess
                  ref={passedOutProcessRef}
                  customerDetails={updateCustomerDetails}
                  setUpdateButtonLoading={setUpdateButtonLoading}
                  stepIndex={stepIndex}
                  setStepIndex={setStepIndex}
                  isCertGenerated={isCertGenerated}
                  generateCertLoading={generateCertLoading}
                  setGenerateCertLoading={setGenerateCertLoading}
                  callgetCustomersApi={(reset = true, cert_gen = false) => {
                    console.log("resetttt", reset);
                    if (reset != false) {
                      console.log("oooooooooooooooo", reset);
                      // updateStatusDrawerReset();
                    }
                    callgetBatchesApi();
                  }}
                />
              ) : (
                ""
              )}
            </div>

            <div
              className="batch_updatedrawer_bottomcontainer"
              id="batch_updatedrawer_bottomcontainer"
            />

            {moveTo ? (
              <div className="leadmanager_tablefiler_footer">
                <div className="leadmanager_submitlead_buttoncontainer">
                  {moveTo == "Passedout Process" ? (
                    <>
                      {stepIndex > 0 && (
                        <Button
                          onClick={prev}
                          style={{ marginRight: 12 }}
                          className="customer_stepperbuttons"
                        >
                          Previous
                        </Button>
                      )}
                      {stepIndex < 3 && (
                        <>
                          {updateButtonLoading ? (
                            <Button
                              className={
                                stepIndex == 2
                                  ? "customer_complete_loadingpassedoutbutton"
                                  : "customer_stepperbuttons"
                              }
                            >
                              <CommonSpinner />
                            </Button>
                          ) : (
                            <Button
                              onClick={
                                stepIndex == 0
                                  ? () =>
                                      passedOutProcessRef.current?.handleGoogleReview()
                                  : stepIndex == 1
                                    ? () =>
                                        passedOutProcessRef.current?.handleCertificateDetails()
                                    : stepIndex == 2
                                      ? () =>
                                          passedOutProcessRef.current?.handleCompleteProcess()
                                      : ""
                              }
                              className={
                                stepIndex == 2
                                  ? "customer_complete_passedoutbutton"
                                  : "customer_stepperbuttons"
                              }
                            >
                              {stepIndex == 2 ? "Submit" : "Next"}
                            </Button>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {updateButtonLoading ? (
                        <button className="users_adddrawer_loadingcreatebutton">
                          <CommonSpinner />
                        </button>
                      ) : (
                        <button
                          className="users_adddrawer_createbutton"
                          onClick={
                            moveTo === "Class Schedule"
                              ? () =>
                                  classScheduleRef.current?.handleClassSchedule()
                              : moveTo === "Update Class Going"
                                ? () =>
                                    classScheduleRef.current?.handleUpdateClassGoing()
                                : moveTo == "Others"
                                  ? () =>
                                      othersHandlingRef.current?.handleSubmit()
                                  : () => {
                                      CommonMessage("error", "Status Mismatch");
                                    }
                          }
                        >
                          Update
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              ""
            )}
          </>
        ) : (
          ""
        )}

        {isCertificate ? (
          <>
            <PreCertificate
              ref={preCertificateRef}
              customerDetails={customerDetails}
              setUpdateButtonLoading={setUpdateButtonLoading}
              callgetCustomersApi={() => {
                setIsCertificate(false);
              }}
            />
            <div className="leadmanager_tablefiler_footer">
              <div className="leadmanager_submitlead_buttoncontainer">
                {updateButtonLoading ? (
                  <button className="users_adddrawer_loadingcreatebutton">
                    <CommonSpinner />
                  </button>
                ) : (
                  <button
                    className="users_adddrawer_createbutton"
                    onClick={() =>
                      preCertificateRef.current?.handleGeneratePreCert()
                    }
                  >
                    Generate
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
  },
);
export default UpdateBatchCustomers;
