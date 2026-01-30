import React, { useState, useRef, useEffect } from "react";
import {
  Row,
  Col,
  Drawer,
  Progress,
  Modal,
  Tooltip,
  Button,
  Flex,
  Radio,
} from "antd";
import { CiSearch } from "react-icons/ci";
import { RedoOutlined } from "@ant-design/icons";
import { AiOutlineEdit } from "react-icons/ai";
import { IoFilter } from "react-icons/io5";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonTable from "../Common/CommonTable";
import "./styles.css";
import {
  getCustomerBatches,
  getRegions,
  getTrainers,
} from "../ApiService/action";
import AddBatch from "./AddBatch";
import CommonSpinner from "../Common/CommonSpinner";
import CommonMuiCustomDatePicker from "../Common/CommonMuiCustomDatePicker";
import { getCurrentandPreviousweekDate } from "../Common/Validation";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import moment from "moment";
import UpdateBatchCustomers from "./UpdateBatchCustomers";
import CommonSelectField from "../Common/CommonSelectField";

export default function Batches() {
  // ----------userefs----------------
  const inputRef = useRef();
  const addBatchRef = useRef();
  const updateBatchCustomersRef = useRef();
  // ----------usestates----------------
  const [selectedDates, setSelectedDates] = useState([]);
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [isOpenAddBatchComponent, setIsOpenAddBatchComponent] = useState(false);
  const [regionOptions, setRegionOptions] = useState([]);
  const [batchesData, setBatchesData] = useState([]);
  const [editBatchItem, setEditBatchItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  /* ---------------- Trainer STATES ---------------- */
  const [trainersData, setTrainersData] = useState([]);
  const [trainerFilterId, setTrainerFilterId] = useState(null);
  const [trainerFilterType, setTrainerFilterType] = useState(1);
  const [isTrainerSelectFocused, setIsTrainerSelectFocused] = useState(false);
  //-----------batch details usestates-------------
  const [isOpenBatchDetailsDrawer, setIsOpenBatchDetailsDrawer] =
    useState(false);
  const columns = [
    {
      title: "Created At",
      key: "created_date",
      dataIndex: "created_date",
      width: 100,
      render: (text) => {
        return <p>{moment(text).format("DD/MM/YYYY")}</p>;
      },
    },
    {
      title: "Batch Id",
      key: "batch_number",
      dataIndex: "batch_number",
      width: 120,
    },
    {
      title: "Batch Name",
      key: "batch_name",
      dataIndex: "batch_name",
      width: 160,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Customers",
      key: "customers",
      dataIndex: "customers",
      width: 110,
      render: (text, record) => {
        return (
          <div
            className="leadfollowup_tabledateContainer"
            style={{ fontWeight: 500 }}
            onClick={() => {
              setEditBatchItem(record);
              setIsOpenAddBatchComponent(true);
              setIsOpenBatchDetailsDrawer(true);
            }}
          >
            {text.length + " Customers"}
          </div>
        );
      },
    },
    {
      title: "Region",
      key: "region_name",
      dataIndex: "region_name",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Branch",
      key: "branch_name",
      dataIndex: "branch_name",
      width: 130,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Trainer",
      key: "trainer_name",
      dataIndex: "trainer_name",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      fixed: "right",
      width: 120,
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            <AiOutlineEdit
              size={18}
              className="trainers_action_icons"
              onClick={() => {
                setEditBatchItem(record);
                setIsOpenAddBatchComponent(true);
                setIsOpenAddDrawer(true);
              }}
            />
          </div>
        );
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
        getRegionData();
      }, 300);
    }
  };

  const getRegionData = async () => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    try {
      const response = await getRegions();
      setRegionOptions(response?.data?.data || []);
    } catch (error) {
      setRegionOptions([]);
      console.log("response status error", error);
    } finally {
      setTimeout(() => {
        getBatchesData(
          null,
          PreviousAndCurrentDate[0],
          PreviousAndCurrentDate[1],
        );
      }, 300);
    }
  };

  const getBatchesData = async (trainerId, startDate, endDate) => {
    setLoading(true);
    const payload = {
      trainer_id: trainerId,
      start_date: startDate,
      end_date: endDate,
    };
    try {
      const response = await getCustomerBatches(payload);
      console.log("get batches response", response);
      setBatchesData(response?.data?.data || []);
      setTimeout(() => {
        setLoading(false);
      }, 300);
    } catch (error) {
      setLoading(false);
      setBatchesData([]);
      console.log("get batches error", error);
    } finally {
      // getCustomersData(null, 1);
    }
  };

  const formReset = () => {
    setIsOpenAddDrawer(false);
    setIsOpenAddBatchComponent(false);
    setEditBatchItem(null);
    setIsOpenBatchDetailsDrawer(false);
  };

  const handleRefresh = () => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setTrainerFilterId(null);
    getBatchesData(null, PreviousAndCurrentDate[0], PreviousAndCurrentDate[1]);
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={17}>
          <Row gutter={16}>
            <Col span={8}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <CommonSelectField
                    label="Select Trainer"
                    required={false}
                    height="35px"
                    labelMarginTop="0px"
                    labelFontSize="13px"
                    options={trainersData}
                    onChange={(e) => {
                      console.log("traineeeee", e.target.value);
                      setTrainerFilterId(e.target.value);
                      getBatchesData(
                        e.target.value,
                        selectedDates[0],
                        selectedDates[1],
                      );
                    }}
                    value={trainerFilterId}
                    error={""}
                    disableClearable={false}
                    onFocus={() => setIsTrainerSelectFocused(true)}
                    onBlur={() => setIsTrainerSelectFocused(false)}
                    borderRightNone={true}
                    showLabelStatus={
                      trainerFilterType == 1
                        ? "Name"
                        : trainerFilterType == 2
                          ? "Trainer Id"
                          : trainerFilterType == 3
                            ? "Email"
                            : "Mobile"
                    }
                  />
                </div>

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
                          value={trainerFilterType}
                          onChange={(e) => {
                            console.log(e.target.value);
                            setTrainerFilterType(e.target.value);
                          }}
                        >
                          <Radio
                            value={1}
                            style={{
                              marginTop: "6px",
                              marginBottom: "12px",
                            }}
                          >
                            Search by Name
                          </Radio>
                          <Radio value={2} style={{ marginBottom: "12px" }}>
                            Search by Trainer Id
                          </Radio>
                          <Radio value={3} style={{ marginBottom: "12px" }}>
                            Search by Email
                          </Radio>
                          <Radio value={4} style={{ marginBottom: "12px" }}>
                            Search by Mobile
                          </Radio>
                        </Radio.Group>
                      }
                    >
                      <Button
                        className="customer_trainermappingfilter_container"
                        style={{
                          borderLeftColor: isTrainerSelectFocused && "#5b69ca",
                          height: "35px",
                        }}
                      >
                        <IoFilter size={16} />
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
                  // setPagination({
                  //   page: 1,
                  // });
                  getBatchesData(trainerFilterId, dates[0], dates[1]);
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
            gap: "12px",
          }}
        >
          <button
            className="leadmanager_addleadbutton"
            onClick={() => {
              setIsOpenAddDrawer(true);
              setIsOpenAddBatchComponent(true);
              setTimeout(() => {
                inputRef.current?.focus();
              }, 0);
            }}
          >
            Add Batch
          </button>

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
          scroll={{ x: 1000 }}
          columns={columns}
          dataSource={batchesData}
          dataPerPage={10}
          loading={loading}
          checkBox="false"
          size="small"
          className="questionupload_table"
        />
      </div>

      {/* add batch drawer */}
      <Drawer
        title={editBatchItem ? "Update Batch" : "Add Batch"}
        open={isOpenAddDrawer}
        onClose={formReset}
        width="40%"
        style={{ position: "relative" }}
      >
        {isOpenAddBatchComponent ? (
          <AddBatch
            ref={addBatchRef}
            trainersData={trainersData}
            regionOptions={regionOptions}
            editBatchItem={editBatchItem}
            setButtonLoading={setButtonLoading}
            callgetBatchesApi={() => {
              formReset();
              getBatchesData(
                trainerFilterId,
                selectedDates[0],
                selectedDates[1],
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
                onClick={() => addBatchRef.current.handleBatchCreate()}
              >
                {editBatchItem ? "Update" : "Submit"}
              </button>
            )}
          </div>
        </div>
      </Drawer>

      {isOpenAddBatchComponent ? (
        <Drawer
          title="Batch Details"
          open={isOpenBatchDetailsDrawer}
          onClose={formReset}
          width="50%"
          className="customer_statusupdate_drawer"
          style={{ position: "relative", paddingBottom: 65 }}
        >
          <UpdateBatchCustomers
            ref={updateBatchCustomersRef}
            editBatchItem={editBatchItem}
            callgetBatchesApi={() => {
              formReset();
              getBatchesData(
                trainerFilterId,
                selectedDates[0],
                selectedDates[1],
              );
            }}
          />
        </Drawer>
      ) : (
        ""
      )}
    </div>
  );
}
