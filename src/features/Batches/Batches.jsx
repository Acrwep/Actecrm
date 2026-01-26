import React, { useState, useRef, useEffect } from "react";
import { Row, Col, Drawer, Progress, Modal, Tooltip, Button } from "antd";
import { CiSearch } from "react-icons/ci";
import { RedoOutlined } from "@ant-design/icons";
import { AiOutlineEdit } from "react-icons/ai";
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
        getBatchesData(PreviousAndCurrentDate[0], PreviousAndCurrentDate[1]);
      }, 300);
    }
  };

  const getBatchesData = async (startDate, endDate) => {
    setLoading(true);
    const payload = {
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
    getBatchesData(PreviousAndCurrentDate[0], PreviousAndCurrentDate[1]);
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="leadmanager_filterContainer">
            <CommonOutlinedInput
              label="Search"
              width="36%"
              height="33px"
              labelFontSize="12px"
              icon={<CiSearch size={16} />}
              labelMarginTop="-1px"
            />
            <CommonMuiCustomDatePicker
              value={selectedDates}
              onDateChange={(dates) => {
                setSelectedDates(dates);
              }}
            />
          </div>
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

      <div style={{ marginTop: "20px" }}>
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
              getBatchesData(selectedDates[0], selectedDates[1]);
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
              getBatchesData(selectedDates[0], selectedDates[1]);
            }}
          />
        </Drawer>
      ) : (
        ""
      )}
    </div>
  );
}
