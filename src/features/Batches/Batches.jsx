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
import { IoIosClose } from "react-icons/io";
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
  getBranches,
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
import { useSelector } from "react-redux";

export default function Batches() {
  //permissions
  const permissions = useSelector((state) => state.userpermissions);

  // ----------userefs----------------
  const inputRef = useRef();
  const addBatchRef = useRef();
  const updateBatchCustomersRef = useRef();
  // ----------usestates----------------
  const [searchValue, setSearchValue] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [isOpenAddBatchComponent, setIsOpenAddBatchComponent] = useState(false);
  const [regionOptions, setRegionOptions] = useState([]);
  const [batchesData, setBatchesData] = useState([]);
  const [editBatchItem, setEditBatchItem] = useState(null);
  const [regionCounts, setRegionCounts] = useState(null);
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
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });


  useEffect(() => {
    // getTrainersData(null, 1, true);
    getRegionData();
  }, []);

  /* ---------------- FETCH TRAINERS ---------------- */
  const getTrainersData = async (searchvalue, pageNumber = 1) => {
    setTrainerSelectloading(true);
    const payload = {
      status: "Verified",
      keyword: searchvalue,
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
        fetchBatchesData({
          trainerId: null,
          searchvalue: "",
          regionId: null,
          branchId: null,
          startDate: PreviousAndCurrentDate[0],
          endDate: PreviousAndCurrentDate[1],
        });
      }, 300);
    }
  };

  const fetchBatchesData = (overrides = {}) => {
    getBatchesData(
      overrides.trainerId !== undefined
        ? overrides.trainerId
        : selectedTrainerId,
      overrides.searchvalue !== undefined ? overrides.searchvalue : searchValue,
      overrides.regionId !== undefined ? overrides.regionId : selectedRegionId,
      overrides.branchId !== undefined ? overrides.branchId : selectedBranchId,
      overrides.startDate !== undefined
        ? overrides.startDate
        : selectedDates?.[0] || null,
      overrides.endDate !== undefined
        ? overrides.endDate
        : selectedDates?.[1] || null,
    );
  };

  const getBatchesData = async (
    trainerId,
    customerSearch,
    regionId,
    branchId,
    startDate,
    endDate,
  ) => {
    setLoading(true);
    const payload = {
      ...(trainerId && { trainer_id: trainerId }),
      ...(customerSearch && { customer_search_filter: customerSearch }),
      ...(regionId && { region_id: regionId }),
      ...(branchId && { branch_id: branchId }),
      start_date: startDate,
      end_date: endDate,
    };
    try {
      const response = await getCustomerBatches(payload);
      console.log("get batches response", response);
      
      const responseData = response?.data?.data?.data || [];
      setBatchesData(responseData);
      setRegionCounts(response?.data?.data?.region_count || null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setBatchesData([]);
      console.log("get batches error", error);
    } finally {
      setLoading(false);
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
      setPagination({
        page: 1,
      });
      fetchBatchesData({
        trainerId: selectedId,
      });
    } else {
      setSelectedTrainerId(null);
      setSelectedTrainerObject(null);
      setTrainerSearchText("");
      getTrainersData(null, 1);
      fetchBatchesData({
        trainerId: null,
      });
      setPagination({
        page: 1,
      });
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

  const handlePaginationChange = ({ page, limit }) => {
    setPagination({
      page: page,
      limit: limit,
    });
  };

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setTimeout(() => {
      // setPagination({
      //   page: 1,
      // });
      fetchBatchesData({
        searchvalue: e.target.value,
      });
    }, 300);
  };

  const handleSelectRegionId = (e) => {
    const regionId = e.target.value;
    setSelectedRegionId(regionId);
    getBranchesData(regionId);
    fetchBatchesData({
      regionId: regionId,
      branchId: null,
    });
  };

  const getBranchesData = async (regionid) => {
    console.log("regionid", regionid);
    if (!regionid) {
      setSelectedBranchId(null);
      setBranchOptions([]);
      return;
    }
    try {
      const response = await getBranches({ region_id: regionid });
      const branch_data = response?.data?.result || [];

      if (branch_data.length >= 1) {
        if (regionid == 1 || regionid == 2) {
          const reordered = [
            ...branch_data.filter((b) => b.name !== "Online"),
            ...branch_data.filter((b) => b.name === "Online"),
          ];
          setBranchOptions(reordered);
        } else {
          setBranchOptions([]);
          setSelectedBranchId(branch_data[0]?.id);
        }
      } else {
        setBranchOptions([]);
      }
    } catch (error) {
      setBranchOptions([]);
      console.log("branch error", error);
    }
  };

  const handleRefresh = () => {
    const PreviousAndCurrentDate = getCurrentandPreviousweekDate();
    setSelectedDates(PreviousAndCurrentDate);
    setSelectedTrainerId(null);
    setSelectedTrainerObject(null);
    setTrainerSearchText("");
    setSearchValue("");
    setSelectedRegionId(null);
    setSelectedBranchId(null);
    getTrainersData(null, 1);
    fetchBatchesData({
      trainerId: null,
      searchvalue: "",
      regionId: null,
      branchId: null,
      startDate: PreviousAndCurrentDate[0],
      endDate: PreviousAndCurrentDate[1],
    });
  };

  return (
    <div>
      <Row align="middle">
        <Col xs={24} sm={24} md={24} lg={20} xxl={18}>
          <Row gutter={12} align="middle" wrap={false}>
            {/* Trainer */}
            <Col flex="0.9 1 0%">
              <CommonCustomerSingleSelectField
                label="Trainer Search..."
                height="33px"
                labelFontSize="11px"
                labelMarginTop="0px"
                required={false}
                options={mergedTrainersList}
                value={selectedTrainerId}
                inputValue={trainerSearchText}
                onChange={handleTrainerSelect}
                onInputChange={handleTrainerSearch}
                onDropdownOpen={handleTrainerDropdownOpen}
                onDropdownScroll={handleTrainerScroll}
                loading={trainerSelectloading}
                error={selectedTrainerIdError}
                disableClearable={false}
              />
            </Col>

            {/* Candidate Search */}
            <Col flex="0.9 1 0%">
              <div
                className="overallduecustomers_filterContainer"
                style={{ marginBottom: "0px" }}
              >
                <CommonOutlinedInput
                  label="Candidate Search..."
                  width="100%"
                  height="33px"
                  labelFontSize="11px"
                  icon={
                    searchValue ? (
                      <div
                        className="users_filter_closeIconContainer"
                        onClick={() => {
                          setSearchValue("");
                          fetchBatchesData({
                            searchvalue: "",
                          });
                        }}
                      >
                        <IoIosClose size={11} />
                      </div>
                    ) : (
                      <CiSearch size={16} />
                    )
                  }
                  labelMarginTop="0px"
                  style={{
                    padding: searchValue
                      ? "0px 26px 0px 0px"
                      : "0px 8px 0px 0px",
                  }}
                  onChange={handleSearch}
                  value={searchValue}
                />
              </div>
            </Col>

            {/* Region */}
            <Col flex="0.8 1 0%">
              <CommonSelectField
                width="100%"
                height="33px"
                label="Select Region"
                labelMarginTop="0px"
                labelFontSize="11px"
                options={regionOptions}
                onChange={handleSelectRegionId}
                value={selectedRegionId}
                disableClearable={false}
              />
            </Col>

            {/* Branch */}
            <Col flex="0.8 1 0%">
              <CommonSelectField
                label="Branch"
                height="33px"
                labelMarginTop="0px"
                labelFontSize="11px"
                options={branchOptions}
                value={selectedBranchId}
                onChange={(e) => {
                  setSelectedBranchId(e.target.value);
                  fetchBatchesData({
                    branchId: e.target.value,
                  });
                }}
                error=""
                disableClearable={false}
                disabled={!selectedRegionId || selectedRegionId == 3}
              />
            </Col>

            {/* Date */}
            <Col flex="1.4 1 0%">
              <CommonMuiCustomDatePicker
                width="100%"
                value={selectedDates}
                onDateChange={(dates) => {
                  setSelectedDates(dates);
                  setPagination({
                    page: 1,
                  });
                  fetchBatchesData({
                    startDate: dates[0],
                    endDate: dates[1],
                  });
                }}
              />
            </Col>
          </Row>
        </Col>

        {/* Buttons */}
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={4}
          xxl={6}
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

      {permissions.includes("Show Region Summary") && (
        <div
          className="livelead_today_summary_container"
          style={{ marginTop: "20px" }}
        >
          <p className="livelead_today_label">REGION SUMMARY</p>

          <div className="livelead_badge_item online">
            <div
              className="livelead_badge_dot"
              style={{ backgroundColor: "#3c9111" }}
            />
            <p className="livelead_badge_text">
              Hub{" "}
              <span className="livelead_badge_count">
                {regionCounts?.hub_region ?? 0}
              </span>
            </p>
          </div>

          <div className="livelead_badge_item classroom">
            <div
              className="livelead_badge_dot"
              style={{ backgroundColor: "#1e90ff" }}
            />
            <p className="livelead_badge_text">
              Chennai{" "}
              <span className="livelead_badge_count">
                {regionCounts?.chennai_region ?? 0}
              </span>
            </p>
          </div>

          <div className="livelead_badge_item classroom">
            <div
              className="livelead_badge_dot"
              style={{ backgroundColor: "#5b69ca" }}
            />
            <p className="livelead_badge_text">
              Bangalore{" "}
              <span className="livelead_badge_count">
                {regionCounts?.bangalore_region ?? 0}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="batches_layout_container" style={{ marginTop: "20px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "50px" }}>
            <CommonSpinner />
          </div>
        ) : batchesData && batchesData.length > 0 ? (
          batchesData.map((region) => {
            const totalBatchesInRegion = region.branches?.reduce(
              (acc, branch) => acc + (branch.batches?.length || 0),
              0
            ) || 0;

            return (
              <div key={region.region_id} className="batch_region_block">
                <div className="batch_region_header">
                  <h3>{region.region_name} Region</h3>
                  <span className="batch_count_badge">{totalBatchesInRegion} Batches</span>
                </div>

                <div className="batch_branches_container">
                  {region.branches?.map((branch) => (
                    <div key={branch.branch_id} className="batch_branch_section">
                      <h4 className="batch_branch_title">
                        📍 {branch.branch_name}
                      </h4>
                      <Row gutter={[16, 16]}>
                        {branch.batches?.map((batch) => (
                          <Col xs={24} sm={12} md={8} lg={6} xl={4} key={batch.batch_id}>
                            <div className="batch_card">
                              <div className="batch_card_header">
                                <span className="batch_card_number">{batch.batch_number}</span>
                                <AiOutlineEdit
                                  className="batch_card_edit_icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditBatchItem(batch);
                                    setIsOpenAddBatchComponent(true);
                                    setIsOpenAddDrawer(true);
                                  }}
                                />
                              </div>
                              <div 
                                className="batch_card_body" 
                                onClick={() => {
                                  setEditBatchItem(batch);
                                  setIsOpenAddBatchComponent(true);
                                  setIsOpenBatchDetailsDrawer(true);
                                }}
                              >
                                <div className="batch_card_title">
                                  <EllipsisTooltip text={batch.batch_name} />
                                </div>
                                <div className="batch_card_trainer">
                                  {batch.trainer_name || "No Trainer"}
                                </div>
                                <div className="batch_card_time">10:00 - 12:00</div>
                                <div className="batch_card_status">🟢 ONGOING</div>
                              </div>
                              <div 
                                className="batch_card_footer"
                                onClick={() => {
                                  setEditBatchItem(batch);
                                  setIsOpenAddBatchComponent(true);
                                  setIsOpenBatchDetailsDrawer(true);
                                }}
                              >
                                <span className="batch_card_students">
                                  👥 {batch.customers?.length || 0} Students
                                </span>
                              </div>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: "50px", textAlign: "center", background: "#fff", borderRadius: "8px", border: "1px solid #f0f0f0" }}>
            <p style={{ color: "#8c8c8c", margin: 0 }}>No batches found</p>
          </div>
        )}
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
              fetchBatchesData({});
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
              fetchBatchesData({});
            }}
          />
        </Drawer>
      ) : (
        ""
      )}
    </div>
  );
}
