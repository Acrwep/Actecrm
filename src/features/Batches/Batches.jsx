import React, { useState, useRef, useEffect, useMemo } from "react";
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
import { IoFilter, IoCallOutline } from "react-icons/io5";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
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
import CommonCustomerSingleSelectField from "../Common/CommonCustomerSingleSelect";

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
  const [trainersDataList, setTrainersDataList] = useState([]);
  // ✅ IMPORTANT: keep IDs & Objects separately
  const [selectedTrainerId, setSelectedTrainerId] = useState(null);
  const [selectedTrainerIdError, setSelectedTrainerIdError] = useState(null);
  const [selectedTrainerObject, setSelectedTrainerObject] = useState(null);
  const [trainerSearchText, setTrainerSearchText] = useState("");
  /* ---------------- PAGINATION ---------------- */
  const [trainerPage, setTrainerPage] = useState(1);
  const [trainerHasMore, setTrainerHasMore] = useState(true);
  const [trainerSelectloading, setTrainerSelectloading] = useState(false);
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
      title: "Customers",
      key: "customers",
      dataIndex: "customers",
      width: 130,
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
      title: "Trainer",
      key: "trainer_name",
      dataIndex: "trainer_name",
      width: 120,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Google Review",
      key: "google_review",
      dataIndex: "google_review",
      width: 120,
      render: (text) => {
        return (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <p>{text}</p>
          </div>
        );
      },
    },
    {
      title: "Linkedin Review",
      key: "linkedin_review",
      dataIndex: "linkedin_review",
      width: 130,
      render: (text) => {
        return (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <p>{text}</p>
          </div>
        );
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
    // getTrainersData(null, 1, true);
    getRegionData();
  }, []);

  /* ---------------- FETCH TRAINERS ---------------- */
  const buildCustomerSearchPayload = (value) => {
    if (!value) return {};
    const trimmed = value.trim();

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return { email: trimmed };
    }

    if (/^\d{6,15}$/.test(trimmed)) {
      return { mobile: trimmed };
    }

    return { name: trimmed };
  };

  const getTrainersData = async (searchvalue, pageNumber = 1) => {
    setTrainerSelectloading(true);
    const payload = {
      status: "Verified",
      ...buildCustomerSearchPayload(searchvalue),
      page: pageNumber,
      limit: 10,
    };
    try {
      const response = await getTrainers(payload);
      const trainers = response?.data?.data?.trainers || [];
      const pagination = response?.data?.data?.pagination;

      setTrainersDataList((prev) =>
        pageNumber === 1 ? trainers : [...prev, ...trainers],
      );
      setTrainerHasMore(pageNumber < (pagination?.totalPages || 1));
      setTrainerPage(pageNumber);
    } catch (error) {
      setTrainersDataList([]);
      console.log(error);
    } finally {
      setTrainerSelectloading(false);
      setLoading(false);
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
          true,
        );
      }, 300);
    }
  };

  const getBatchesData = async (
    trainerId,
    startDate,
    endDate,
    callTrainersApi = false,
  ) => {
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
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setBatchesData([]);
      console.log("get batches error", error);
    } finally {
      if (callTrainersApi) {
        getTrainersData(null, 1);
      }
      // getCustomersData(null, 1);
    }
  };

  /* ---------------- SEARCH HANDLER ---------------- */
  const handleTrainerSearch = (value) => {
    setTrainerSearchText(value);
    setTrainerPage(1);
    setTrainerHasMore(true);
    setTrainersDataList([]);
    getTrainersData(value, 1);
  };

  /* ---------------- SELECT HANDLER ---------------- */
  const handleTrainerSelect = (event) => {
    const selectedId = event.target.value;
    if (selectedId) {
      const selectedObj = event.target.object;
      setSelectedTrainerId(selectedId);
      setSelectedTrainerObject(selectedObj);
      setTrainerSearchText(selectedObj?.name || "");

      getBatchesData(selectedId, selectedDates[0], selectedDates[1]);
    } else {
      setSelectedTrainerId(null);
      setSelectedTrainerObject(null);
      setTrainerSearchText("");
      getTrainersData(null, 1);
      getBatchesData(null, selectedDates[0], selectedDates[1]);
    }
  };

  /* ---------------- MERGED OPTIONS ---------------- */
  const mergedTrainersList = useMemo(() => {
    const map = new Map();
    if (selectedTrainerObject) {
      map.set(selectedTrainerObject.id, selectedTrainerObject);
    }
    trainersDataList.forEach((c) => map.set(c.id, c));
    return Array.from(map.values());
  }, [trainersDataList, selectedTrainerObject]);

  /* ---------------- DROPDOWN OPEN ---------------- */
  const handleTrainerDropdownOpen = () => {
    if (trainersDataList.length === 0) {
      getTrainersData(null, 1);
    }
  };

  /* ---------------- INFINITE SCROLL ---------------- */
  const handleTrainerScroll = (e) => {
    const listbox = e.target;
    if (
      listbox.scrollTop + listbox.clientHeight >= listbox.scrollHeight - 5 &&
      trainerHasMore &&
      !trainerSelectloading
    ) {
      getTrainersData(trainerSearchText, trainerPage + 1);
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
    setSelectedTrainerId(null);
    setSelectedTrainerObject(null);
    setTrainerSearchText("");
    getTrainersData(null, 1);
    getBatchesData(null, PreviousAndCurrentDate[0], PreviousAndCurrentDate[1]);
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={17}>
          <Row gutter={16}>
            <Col span={8}>
              <CommonCustomerSingleSelectField
                label="Trainer"
                height="32px"
                labelMarginTop="-1px"
                required={false}
                options={mergedTrainersList}
                value={selectedTrainerId}
                inputValue={trainerSearchText}
                onChange={handleTrainerSelect}
                onInputChange={handleTrainerSearch}
                onDropdownOpen={handleTrainerDropdownOpen}
                onDropdownScroll={handleTrainerScroll}
                loading={trainerSelectloading}
                // renderOption={renderTrainerOption}
                error={selectedTrainerIdError}
                disableClearable={false}
              />
            </Col>
            <Col span={10}>
              <CommonMuiCustomDatePicker
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  // setPagination({
                  //   page: 1,
                  // });
                  getBatchesData(selectedTrainerId, dates[0], dates[1]);
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
            regionOptions={regionOptions}
            editBatchItem={editBatchItem}
            setButtonLoading={setButtonLoading}
            callgetBatchesApi={() => {
              formReset();
              getBatchesData(
                selectedTrainerId,
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
                selectedTrainerId,
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
