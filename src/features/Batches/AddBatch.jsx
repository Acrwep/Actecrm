import React, {
  useState,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
} from "react";
import { Row, Col, Button, Flex, Tooltip, Radio, Modal, Divider } from "antd";
import { IoFilter } from "react-icons/io5";
import { FaRegEye } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import CommonInputField from "../Common/CommonInputField";
import {
  selectValidator,
  addressValidator,
  formatToBackendIST,
} from "../Common/Validation";
import CommonSelectField from "../Common/CommonSelectField";
import {
  createBatch,
  getBatchStudents,
  getBranches,
  getTechnologies,
  getTrainerById,
  getTrainers,
  updateBatch,
} from "../ApiService/action";
import CommonCustomerMultiSelectField from "../Common/CommonCustomerSelect";
import CommonCustomerSingleSelectField from "../Common/CommonCustomerSingleSelect";
import { CommonMessage } from "../Common/CommonMessage";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import moment from "moment";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import CommonMuiTimePicker from "../Common/CommonMuiTimePicker";

const AddBatch = forwardRef(
  (
    {
      mainType,
      regionOptions,
      trainersData,
      editBatchItem,
      callgetBatchesApi,
      setButtonLoading,
    },
    ref,
  ) => {
    /* ---------------- BASIC STATES ---------------- */
    const [batchName, setBatchName] = useState("");
    const [batchNameError, setBatchNameError] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [startDateError, setStartDateError] = useState("");
    const [endDate, setEndDate] = useState(null);
    const [endDateError, setEndDateError] = useState("");
    const [batchTimingId, setBatchTimingId] = useState(null);
    const [batchTimingIdError, setBatchTimingIdError] = useState("");
    const [startTime, setStartTime] = useState(null);
    const [startTimeError, setStartTimeError] = useState("");
    const [endTime, setEndTime] = useState(null);
    const [endTimeError, setEndTimeError] = useState("");
    const [courseOptions, setCourseOptions] = useState([]);
    const [courseId, setCourseId] = useState(null);
    const [courseIdError, setCourseIdError] = useState("");
    const [courseLoading, setCourseLoading] = useState(false);
    const [regionId, setRegionId] = useState(null);
    const [regionError, setRegionError] = useState("");
    const [branchOptions, setBranchOptions] = useState([]);
    const [branchId, setBranchId] = useState(null);
    const [branchIdError, setBranchIdError] = useState("");
    const [batchStatus, setBatchStatus] = useState("");
    const [batchStatusError, setBatchStatusError] = useState("");

    /* ---------------- Trainer STATES ---------------- */
    // const [trainerId, setTrainerId] = useState(null);
    // const [trainerFilterType, setTrainerFilterType] = useState(1);
    // const [isTrainerSelectFocused, setIsTrainerSelectFocused] = useState(false);
    const [clickedTrainerDetails, setClickedTrainerDetails] = useState([]);
    const [isOpenTrainerDetailModal, setIsOpenTrainerDetailModal] =
      useState(false);
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
    /* ---------------- CUSTOMER STATES ---------------- */
    const [customersData, setCustomersData] = useState([]);

    // ✅ IMPORTANT: keep IDs & Objects separately
    const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
    const [selectedCustomersError, setSelectedCustomersError] = useState("");
    const [selectedCustomerObjects, setSelectedCustomerObjects] = useState([]);
    const [customerSearchText, setCustomerSearchText] = useState("");

    /* ---------------- PAGINATION ---------------- */
    const [customerPage, setCustomerPage] = useState(1);
    const [customerHasMore, setCustomerHasMore] = useState(true);
    const [customerSelectloading, setCustomerSelectloading] = useState(false);

    /* ---------------- INITIAL LOAD ---------------- */
    useEffect(() => {
      getCoursesData();
      getTrainersData(null, 1);
    }, []);

    useEffect(() => {
      if (editBatchItem) {
        console.log("editBatchItem", editBatchItem);
        setBranchId(editBatchItem?.branch_id ?? null);
        setBatchName(editBatchItem?.batch_name ?? "");
        setCourseId(editBatchItem?.batch_course_id ?? null);
        setStartDate(editBatchItem?.batch_start_date ?? null);
        setEndDate(editBatchItem?.batch_end_date ?? null);
        setBatchTimingId(editBatchItem?.batch_timing_id ?? null);
        setStartTime(editBatchItem?.batch_start_time ?? null);
        setEndTime(editBatchItem?.batch_end_time ?? null);
        setRegionId(editBatchItem?.region_id ?? null);
        setBatchStatus(editBatchItem?.batch_status ?? "");
        getBranchesData(editBatchItem?.region_id ?? null);
        setSelectedCustomerIds(
          editBatchItem?.customers.map((c) => String(c.id)),
        );
        setSelectedCustomerObjects(editBatchItem?.customers);

        // 🔹 Set trainer from editBatchItem
        if (editBatchItem.trainer_id) {
          getTrainerByIdData(editBatchItem.trainer_id);
          getCustomersData(null, editBatchItem.trainer_id, 1);
        }
      }
    }, [editBatchItem]);

    const getCoursesData = async () => {
      setCourseLoading(true);
      try {
        const response = await getTechnologies();
        setCourseOptions(response?.data?.data || []);
      } catch (error) {
        setCourseOptions([]);
        console.log("response status error", error);
      } finally {
        setCourseLoading(false);
      }
    };

    /* ---------------- FETCH CUSTOMERS ---------------- */
    const getCustomersData = async (searchvalue, trainerId, pageNumber = 1) => {
      setCustomerSelectloading(true);

      const payload = {
        ...(searchvalue && { search_filter: searchvalue }),
        ...(trainerId && { trainer_id: trainerId }),
        page: pageNumber,
        limit: 10,
      };

      try {
        const response = await getBatchStudents(payload);

        const customers = response?.data?.data?.customers || [];
        const pagination = response?.data?.data?.pagination;

        setCustomersData((prev) =>
          pageNumber === 1 ? customers : [...prev, ...customers],
        );

        setCustomerHasMore(pageNumber < pagination.totalPages);
        setCustomerPage(pageNumber);
      } catch (error) {
        console.log("get customers error", error);
      } finally {
        setCustomerSelectloading(false);
      }
    };

    /* ---------------- FETCH BRANCHES ---------------- */
    const getBranchesData = async (regionid) => {
      try {
        const response = await getBranches({ region_id: regionid });
        const branch_data = response?.data?.result || [];
        setBranchOptions(branch_data);
      } catch (error) {
        setBranchOptions([]);
        console.log("branch error", error);
      }
    };

    /* ---------------- FETCH TRAINER BY ID ---------------- */
    const getTrainerByIdData = async (trainerId) => {
      try {
        const response = await getTrainerById(trainerId);
        const trainerDetails = response?.data?.data;
        setSelectedTrainerId(trainerId);
        setClickedTrainerDetails([trainerDetails]);
        setSelectedTrainerObject(trainerDetails);
        setTrainerSearchText(trainerDetails.name);
      } catch (error) {
        setClickedTrainerDetails([]);
        console.log("get trainer by id error", error);
      }
    };

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
      const selectedObj = event.target.object;
      setSelectedTrainerId(selectedId);
      setSelectedTrainerObject(selectedObj);

      getCustomersData(null, selectedId, 1);
      setSelectedTrainerIdError(selectValidator(selectedId));
      setTrainerSearchText(selectedObj?.name || "");
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

    const renderTrainerOption = (props, option) => {
      const { key, ...optionProps } = props;
      return (
        <li
          key={key}
          {...optionProps}
          style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}
        >
          <Flex vertical gap={4} style={{ width: "100%" }}>
            <Flex
              align="center"
              justify="space-between"
              style={{ width: "100%" }}
            >
              <Flex align="center" gap={8}>
                {/* <FaRegCircleUser size={15} style={{ color: "#5b69ca" }} /> */}
                <span
                  style={{ fontWeight: 600, fontSize: "13px", color: "#333" }}
                >
                  {option.name}
                </span>
              </Flex>
              {option.trainer_type && (
                <span
                  style={{
                    fontSize: "10px",
                    background: "#e6f7ff",
                    color: "#1890ff",
                    padding: "1px 8px",
                    borderRadius: "10px",
                    border: "1px solid #91d5ff",
                    fontWeight: 500,
                  }}
                >
                  {option.trainer_type}
                </span>
              )}
            </Flex>
            <Flex gap={12} wrap="wrap">
              {option.trainer_code && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#8c8c8c",
                    fontWeight: 500,
                  }}
                >
                  ID: {option.trainer_code}
                </span>
              )}
              {option.email && (
                <Flex
                  align="center"
                  gap={4}
                  style={{ fontSize: "12px", color: "#666" }}
                >
                  <MdOutlineEmail size={13} style={{ color: "#8c8c8c" }} />
                  <span>{option.email}</span>
                </Flex>
              )}
              {option.mobile && (
                <Flex
                  align="center"
                  gap={4}
                  style={{ fontSize: "12px", color: "#666" }}
                >
                  <IoCallOutline size={13} style={{ color: "#8c8c8c" }} />
                  <span>{option.mobile}</span>
                </Flex>
              )}
            </Flex>
          </Flex>
        </li>
      );
    };

    /* ---------------- SEARCH HANDLER ---------------- */
    const handleCustomerSearch = (value) => {
      setCustomerSearchText(value);
      setCustomerPage(1);
      setCustomerHasMore(true);
      setCustomersData([]);
      getCustomersData(value, selectedTrainerId, 1);
    };

    /* ---------------- SELECT HANDLER (KEY FIX) ---------------- */
    const handleCustomerSelect = (event) => {
      const selectedIds = event.target.value || [];

      setSelectedCustomerIds(selectedIds);
      setSelectedCustomersError(selectValidator(selectedIds));

      const selectedObjs = customersData.filter((c) =>
        selectedIds.includes(String(c.id)),
      );

      setSelectedCustomerObjects((prev) => {
        const map = new Map(prev.map((p) => [p.id, p]));
        selectedObjs.forEach((o) => map.set(o.id, o));
        return Array.from(map.values());
      });

      // setSelectedCustomerError(selectedIds.length ? "" : "is required");
    };

    /* ---------------- MERGED OPTIONS (CRITICAL) ---------------- */
    const mergedCustomers = useMemo(() => {
      const map = new Map();

      selectedCustomerObjects.forEach((c) => map.set(c.id, c));
      customersData.forEach((c) => map.set(c.id, c));

      return Array.from(map.values());
    }, [customersData, selectedCustomerObjects]);

    /* ---------------- DROPDOWN OPEN ---------------- */
    const handleCustomerDropdownOpen = () => {
      if (customersData.length === 0) {
        getCustomersData(null, null, 1);
      }
    };

    /* ---------------- INFINITE SCROLL ---------------- */
    const handleCustomerScroll = (e) => {
      const listbox = e.target;
      if (
        listbox.scrollTop + listbox.clientHeight >= listbox.scrollHeight - 5 &&
        customerHasMore &&
        !customerSelectloading
      ) {
        getCustomersData(
          customerSearchText,
          selectedTrainerId,
          customerPage + 1,
        );
      }
    };

    useImperativeHandle(ref, () => ({
      handleBatchCreate,
    }));

    const handleBatchCreate = async () => {
      console.log("Batch Create Triggered");
      const batchNameValidate = addressValidator(batchName);
      const courseIdValidate = selectValidator(courseId);
      const startDateValidate = selectValidator(startDate);
      const endDateValidate = selectValidator(endDate);
      const batchTimingValidate = selectValidator(batchTimingId);
      const startTimeValidate = selectValidator(startTime);
      const endTimeValidate = selectValidator(endTime);
      const regionIdValidate = selectValidator(regionId);
      const branchIdValidate = regionId == 3 ? "" : selectValidator(branchId);
      const statusValidate = selectValidator(batchStatus);
      const trainerIdValidate = selectValidator(selectedTrainerId);
      const customerValidate = selectValidator(selectedCustomerIds);

      setBatchNameError(batchNameValidate);
      setCourseIdError(courseIdValidate);
      setStartDateError(startDateValidate);
      setEndDateError(endDateValidate);
      setBatchTimingIdError(batchTimingValidate);
      setStartTimeError(startTimeValidate);
      setEndTimeError(endTimeValidate);
      setRegionError(regionIdValidate);
      setBranchIdError(branchIdValidate);
      setBatchStatusError(statusValidate);
      setSelectedTrainerIdError(trainerIdValidate);
      setSelectedCustomersError(customerValidate);

      if (
        batchNameValidate ||
        courseIdValidate ||
        startDateValidate ||
        endDateValidate ||
        batchTimingValidate ||
        startTimeValidate ||
        endTimeValidate ||
        regionIdValidate ||
        branchIdValidate ||
        statusValidate ||
        trainerIdValidate ||
        customerValidate
      )
        return;

      setButtonLoading(true);
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);

      const updateCustomerIds = selectedCustomerIds.map((c) => {
        return { customer_id: parseInt(c) };
      });
      const payload = {
        ...(editBatchItem && { batch_id: editBatchItem?.batch_id }),
        type: mainType.toLowerCase(),
        batch_name: batchName,
        trainer_id: selectedTrainerId,
        course_id: courseId,
        start_date: startDate ? formatToBackendIST(startDate) : null,
        end_date: endDate ? formatToBackendIST(endDate) : null,
        batch_timing_id: batchTimingId,
        start_time: startTime,
        end_time: endTime,
        status: batchStatus,
        region_id: regionId,
        branch_id: branchId,
        customers: updateCustomerIds,
        created_by: convertAsJson?.user_id,
        created_date: formatToBackendIST(new Date()),
      };
      console.log("create batch payload", payload);
      // return;

      if (editBatchItem) {
        try {
          await updateBatch(payload);
          CommonMessage("success", "Updated Successfully");
          setTimeout(() => {
            setButtonLoading(false);
            formReset();
            callgetBatchesApi();
          }, 300);
        } catch (error) {
          setButtonLoading(false);
          CommonMessage(
            "error",
            error?.response?.data?.details ||
              "Something went wrong. Try again later",
          );
        }
      } else {
        try {
          await createBatch(payload);
          CommonMessage("success", `${mainType} Created Successfully`);
          setTimeout(() => {
            setButtonLoading(false);
            formReset();
            callgetBatchesApi();
          }, 300);
        } catch (error) {
          setButtonLoading(false);
          CommonMessage(
            "error",
            error?.response?.data?.details ||
              "Something went wrong. Try again later",
          );
        }
      }
    };

    const formReset = () => {
      setBatchName("");
      setBatchNameError("");
      setCourseId(null);
      setCourseIdError("");
      setStartDate(null);
      setStartDateError("");
      setStartTime(null);
      setStartTimeError("");
      setRegionId(null);
      setRegionError("");
      setBranchId(null);
      setBranchIdError("");
      setSelectedCustomerIds([]);
      setSelectedCustomerObjects([]);
      setCustomerSearchText("");
      setSelectedTrainerId(null);
      setSelectedTrainerObject(null);
      setTrainerSearchText("");
      setBatchStatus("");
      setBatchStatusError("");
    };

    return (
      <div>
        <Row gutter={[16, 24]}>
          <Col span={8}>
            <CommonInputField
              label={`${mainType} Name`}
              required={true}
              onChange={(e) => {
                setBatchName(e.target.value);
                setBatchNameError(addressValidator(e.target.value));
              }}
              value={batchName}
              error={batchNameError}
              height={"35px"}
              labelFontSize={"11px"}
              labelMarginTop={"0.5px"}
              errorFontSize={"9.5px"}
            />
          </Col>

          <Col span={8}>
            <CommonSelectField
              label="Course"
              required={true}
              options={courseOptions}
              onChange={(e) => {
                setCourseId(e.target.value);
                setCourseIdError(selectValidator(e.target.value));
              }}
              value={courseId}
              error={courseIdError}
              height={"35px"}
              labelFontSize={"11px"}
              labelMarginTop={"0.5px"}
              errorFontSize={"9.5px"}
              loading={courseLoading}
            />
          </Col>

          <Col span={8}>
            <CommonMuiDatePicker
              label="Start Date"
              required={true}
              onChange={(value) => {
                setStartDate(value);
                setStartDateError(selectValidator(value));
              }}
              value={startDate}
              error={startDateError}
              height={"35px"}
              labelFontSize={"11px"}
              labelMarginTop={"0.5px"}
              errorFontSize={"9.5px"}
              allowAllDates={true}
            />
          </Col>

          <Col span={8}>
            <CommonMuiDatePicker
              label="End Date"
              required={true}
              onChange={(value) => {
                setEndDate(value);
                setEndDateError(selectValidator(value));
              }}
              value={endDate}
              error={endDateError}
              height={"35px"}
              labelFontSize={"11px"}
              labelMarginTop={"0.5px"}
              errorFontSize={"9.5px"}
              allowAllDates={true}
            />
          </Col>

          <Col span={8}>
            <CommonSelectField
              label="Batch Timing"
              required={true}
              options={[
                {
                  id: 1,
                  name: "Week Day",
                },
                {
                  id: 2,
                  name: "Week End",
                },
              ]}
              onChange={(e) => {
                setBatchTimingId(e.target.value);
                setBatchTimingIdError(selectValidator(e.target.value));
              }}
              value={batchTimingId}
              error={batchTimingIdError}
              height={"35px"}
              labelFontSize={"11px"}
              labelMarginTop={"0.5px"}
              errorFontSize={"9.5px"}
              allowAllDates={true}
            />
          </Col>

          <Col span={8}>
            <CommonMuiTimePicker
              label="Start Time"
              required={true}
              onChange={(value) => {
                setStartTime(value);
                setStartTimeError(selectValidator(value));
              }}
              value={startTime}
              error={startTimeError}
              height={"35px"}
              labelFontSize={"11px"}
              labelMarginTop={"0.5px"}
              errorFontSize={"9.5px"}
              allowAllDates={true}
            />
          </Col>

          <Col span={8}>
            <CommonMuiTimePicker
              label="End Time"
              required={true}
              onChange={(value) => {
                setEndTime(value);
                setEndTimeError(selectValidator(value));
              }}
              value={endTime}
              error={endTimeError}
              height={"35px"}
              labelFontSize={"11px"}
              labelMarginTop={"0.5px"}
              errorFontSize={"9.5px"}
              allowAllDates={true}
            />
          </Col>

          <Col span={8}>
            <CommonSelectField
              label="Region"
              required={true}
              options={regionOptions}
              onChange={(e) => {
                const value = e.target.value;
                setRegionId(value);
                setBranchId("");
                getBranchesData(value);
                setRegionError(selectValidator(value));
                if (value == 3) {
                  setBranchId(10);
                  setBranchIdError("");
                }
              }}
              value={regionId}
              error={regionError}
              height={"35px"}
              labelFontSize={"11px"}
              labelMarginTop={"0.5px"}
              errorFontSize={"9.5px"}
            />
          </Col>

          <Col span={8}>
            <CommonSelectField
              label="Branch"
              required={true}
              options={branchOptions}
              onChange={(e) => {
                setBranchId(e.target.value);
                setBranchIdError(selectValidator(e.target.value));
              }}
              value={branchId}
              error={branchIdError}
              height={"35px"}
              labelFontSize={"11px"}
              labelMarginTop={"0.5px"}
              errorFontSize={"9.5px"}
              disabled={regionId == 3}
            />
          </Col>

          <Col span={8}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div style={{ flex: 1 }}>
                <CommonCustomerSingleSelectField
                  label="Trainer"
                  // height="34px"
                  required={true}
                  options={mergedTrainersList}
                  value={selectedTrainerId}
                  inputValue={trainerSearchText}
                  onChange={handleTrainerSelect}
                  onInputChange={handleTrainerSearch}
                  onDropdownOpen={handleTrainerDropdownOpen}
                  onDropdownScroll={handleTrainerScroll}
                  loading={trainerSelectloading}
                  renderOption={renderTrainerOption}
                  error={selectedTrainerIdError}
                  disableClearable={false}
                  height={"35px"}
                  labelFontSize={"11px"}
                  labelMarginTop={"0.5px"}
                  errorFontSize={"9.5px"}
                />
              </div>
              {selectedTrainerId && (
                <Tooltip
                  placement="topLeft"
                  title="View Trainer Details"
                  trigger={["hover", "click"]}
                >
                  <FaRegEye
                    size={14}
                    style={{ flexShrink: 0 }}
                    className="trainers_action_icons"
                    onClick={() => {
                      console.log(
                        "selectedTrainerObject",
                        selectedTrainerObject,
                      );
                      setClickedTrainerDetails([selectedTrainerObject]);
                      setIsOpenTrainerDetailModal(true);
                    }}
                  />
                </Tooltip>
              )}
            </div>
          </Col>

          <Col span={8}>
            <CommonCustomerMultiSelectField
              label="Select Candidates"
              required={true}
              options={mergedCustomers}
              value={selectedCustomerIds}
              inputValue={customerSearchText}
              onChange={handleCustomerSelect}
              onInputChange={handleCustomerSearch}
              onDropdownOpen={handleCustomerDropdownOpen}
              onDropdownScroll={handleCustomerScroll}
              loading={customerSelectloading}
              showLabelStatus="Name"
              error={selectedCustomersError}
              disableClearable={false}
              height={"35px"}
              labelFontSize={"11px"}
              labelMarginTop={"1.5px"}
              errorFontSize={"9.5px"}
              disabled={selectedTrainerId == null || selectedTrainerId === ""}
            />
          </Col>

          <Col span={8}>
            <CommonSelectField
              label={`${mainType} Status`}
              required={true}
              options={[
                {
                  id: "Upcoming",
                  name: "Upcoming",
                },
                {
                  id: "Ongoing",
                  name: "Ongoing",
                },
                {
                  id: "Completed",
                  name: "Completed",
                },
              ]}
              onChange={(e) => {
                setBatchStatus(e.target.value);
                setBatchStatusError(selectValidator(e.target.value));
              }}
              value={batchStatus}
              error={batchStatusError}
              height={"35px"}
              labelFontSize={"11px"}
              labelMarginTop={"0.5px"}
              errorFontSize={"9.5px"}
            />
          </Col>
        </Row>

        {/* trainer fulldetails modal */}
        <Modal
          title={
            <span style={{ padding: "0px 24px" }}>Trainer Full Details</span>
          }
          open={isOpenTrainerDetailModal}
          onCancel={() => setIsOpenTrainerDetailModal(false)}
          footer={false}
          width="50%"
          className="trainerpaymentrequest_trainerfulldetails_modal"
        >
          {clickedTrainerDetails.map((item, index) => {
            return (
              <>
                <Row
                  gutter={16}
                  style={{ marginTop: "20px" }}
                  className="trainerpaymentrequest_addrequestdrawer_rowcontainer"
                >
                  <Col span={12}>
                    <Row>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <FaRegCircleUser size={15} color="gray" />
                          <p className="customerdetails_rowheading">HR Name</p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <EllipsisTooltip
                          text={item.hr_head ? item.hr_head : "-"}
                          smallText={true}
                        />
                      </Col>
                    </Row>

                    <Row style={{ marginTop: "12px" }}>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <FaRegCircleUser size={15} color="gray" />
                          <p className="customerdetails_rowheading">
                            Trainer Name
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <EllipsisTooltip
                          text={
                            item.name
                              ? `${item.name} (${
                                  item.trainer_code ? item.trainer_code : "-"
                                })`
                              : "-"
                          }
                          smallText={true}
                        />
                      </Col>
                    </Row>

                    <Row style={{ marginTop: "12px" }}>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <MdOutlineEmail size={15} color="gray" />
                          <p className="customerdetails_rowheading">Email</p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <EllipsisTooltip text={item.email} smallText={true} />
                      </Col>
                    </Row>

                    <Row style={{ marginTop: "12px" }}>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <IoCallOutline size={15} color="gray" />
                          <p className="customerdetails_rowheading">Mobile</p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">{item.mobile}</p>
                      </Col>
                    </Row>

                    <Row style={{ marginTop: "12px" }}>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <FaWhatsapp size={15} color="gray" />
                          <p className="customerdetails_rowheading">Whatsapp</p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">{item.whatsapp}</p>
                      </Col>
                    </Row>

                    <Row style={{ marginTop: "12px" }}>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <IoLocationOutline size={15} color="gray" />
                          <p className="customerdetails_rowheading">Location</p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">{item.location}</p>
                      </Col>
                    </Row>
                  </Col>

                  <Col span={12}>
                    <Row>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Technology
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <EllipsisTooltip
                          text={item.technology}
                          smallText={true}
                        />
                      </Col>
                    </Row>

                    <Row style={{ marginTop: "12px" }}>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Experience
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">
                          {item.overall_exp_year + " Years"}
                        </p>
                      </Col>
                    </Row>

                    <Row style={{ marginTop: "12px" }}>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Relevent Experience
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">
                          {item.relavant_exp_year + " Years"}
                        </p>
                      </Col>
                    </Row>

                    <Row style={{ marginTop: "12px" }}>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Avaibility Timing
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">
                          {item.availability_time
                            ? moment(item.availability_time, "HH:mm:ss").format(
                                "hh:mm A",
                              )
                            : "-"}
                        </p>
                      </Col>
                    </Row>

                    <Row style={{ marginTop: "12px" }}>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Secondary Timing
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <p className="customerdetails_text">
                          {item.secondary_time
                            ? moment(item.secondary_time, "HH:mm:ss").format(
                                "hh:mm A",
                              )
                            : "-"}
                        </p>
                      </Col>
                    </Row>

                    <Row style={{ marginTop: "12px" }}>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">Skills</p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <EllipsisTooltip
                          text={item.skills.map((item) => item.name).join(", ")}
                          smallText={true}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </>
            );
          })}
        </Modal>
      </div>
    );
  },
);

export default AddBatch;
