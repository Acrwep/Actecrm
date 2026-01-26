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
  getCustomers,
  updateBatch,
} from "../ApiService/action";
import CommonCustomerMultiSelectField from "../Common/CommonCustomerSelect";
import { CommonMessage } from "../Common/CommonMessage";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import moment from "moment";

const AddBatch = forwardRef(
  (
    {
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
    const [regionId, setRegionId] = useState(null);
    const [regionError, setRegionError] = useState("");
    const [branchOptions, setBranchOptions] = useState([]);
    const [branchId, setBranchId] = useState(null);
    const [branchIdError, setBranchIdError] = useState("");

    /* ---------------- Trainer STATES ---------------- */
    const [trainerId, setTrainerId] = useState(null);
    const [trainerFilterType, setTrainerFilterType] = useState(1);
    const [isTrainerSelectFocused, setIsTrainerSelectFocused] = useState(false);
    const [clickedTrainerDetails, setClickedTrainerDetails] = useState([]);
    const [isOpenTrainerDetailModal, setIsOpenTrainerDetailModal] =
      useState(false);
    /* ---------------- CUSTOMER STATES ---------------- */
    const [customersData, setCustomersData] = useState([]);

    // ✅ IMPORTANT: keep IDs & Objects separately
    const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
    const [selectedCustomerObjects, setSelectedCustomerObjects] = useState([]);
    const [customerSearchText, setCustomerSearchText] = useState("");

    /* ---------------- PAGINATION ---------------- */
    const [customerPage, setCustomerPage] = useState(1);
    const [customerHasMore, setCustomerHasMore] = useState(true);
    const [customerSelectloading, setCustomerSelectloading] = useState(false);

    /* ---------------- INITIAL LOAD ---------------- */
    useEffect(() => {
      getCustomersData(null, 1);
    }, []);

    /* ---------------- SEARCH PAYLOAD ---------------- */
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

    /* ---------------- FETCH CUSTOMERS ---------------- */
    const getCustomersData = async (searchvalue, pageNumber = 1) => {
      setCustomerSelectloading(true);

      const payload = {
        ...buildCustomerSearchPayload(searchvalue),
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

        if (editBatchItem) {
          console.log("editBatchItem", editBatchItem);
          setBatchName(editBatchItem?.batch_name ?? "");
          setRegionId(editBatchItem?.region_id ?? null);
          setBranchId(editBatchItem?.branch_id ?? null);
          setTrainerId(editBatchItem?.trainer_id);
          getBranchesData(editBatchItem?.region_id ?? null);
          setSelectedCustomerIds(
            editBatchItem?.customers.map((c) => String(c.id)),
          );
          setSelectedCustomerObjects(editBatchItem?.customers);
        }
      } catch (error) {
        console.log("get customers error", error);
      } finally {
        setCustomerSelectloading(false);
        // const test_customers = [{ id: 12, name: "Speed" }];
        // setSelectedCustomerIds(test_customers.map((c) => String(c.id)));
        // setSelectedCustomerObjects(test_customers);
      }
    };

    /* ---------------- FETCH BRANCHES ---------------- */
    const getBranchesData = async (regionid) => {
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
            setBranchId(branch_data[0]?.id);
          }
        } else {
          setBranchOptions([]);
        }
      } catch (error) {
        setBranchOptions([]);
        console.log("branch error", error);
      }
    };

    const handleTrainerId = (e) => {
      setTrainerId(e.target.value);
      const clickedTrainer = trainersData.filter((f) => f.id == e.target.value);
      console.log("clickedTrainer", clickedTrainer);
      setClickedTrainerDetails(clickedTrainer);
    };

    /* ---------------- SEARCH HANDLER ---------------- */
    const handleCustomerSearch = (value) => {
      setCustomerSearchText(value);
      setCustomerPage(1);
      setCustomerHasMore(true);
      setCustomersData([]);
      getCustomersData(value, 1);
    };

    /* ---------------- SELECT HANDLER (KEY FIX) ---------------- */
    const handleCustomerSelect = (event) => {
      const selectedIds = event.target.value || [];

      setSelectedCustomerIds(selectedIds);

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
        getCustomersData(null, 1);
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
        getCustomersData(customerSearchText, customerPage + 1);
      }
    };

    useImperativeHandle(ref, () => ({
      handleBatchCreate,
    }));

    const handleBatchCreate = async () => {
      console.log("Batch Create Triggered");
      const batchNameValidate = addressValidator(batchName);
      const regionIdValidate = selectValidator(regionId);
      const branchIdValidate = regionId == 3 ? "" : selectValidator(branchId);

      setBatchNameError(batchNameValidate);
      setRegionError(regionIdValidate);
      setBranchIdError(branchIdValidate);

      if (batchNameValidate || regionIdValidate || branchIdValidate) return;

      setButtonLoading(true);
      const today = new Date();
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);

      const updateCustomerIds = selectedCustomerIds.map((c) => {
        return { customer_id: parseInt(c) };
      });
      const payload = {
        ...(editBatchItem && { batch_id: editBatchItem?.batch_id }),
        batch_name: batchName,
        trainer_id: trainerId,
        region_id: regionId,
        branch_id: branchId,
        customers: updateCustomerIds,
        created_by: convertAsJson?.user_id,
        created_date: formatToBackendIST(today),
      };
      console.log("create batch payload", payload);
      // return;

      if (editBatchItem) {
        try {
          await updateBatch(payload);
          CommonMessage("success", "Updated");
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
          CommonMessage("success", "Batch Created");
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
      setRegionId(null);
      setRegionError("");
      setBranchId(null);
      setBranchIdError("");
      setSelectedCustomerIds([]);
      setSelectedCustomerObjects([]);
      setCustomerSearchText("");
    };

    return (
      <div>
        <Row gutter={16}>
          <Col span={12}>
            <CommonInputField
              label="Batch Name"
              value={batchName}
              onChange={(e) => {
                setBatchName(e.target.value);
                setBatchNameError(addressValidator(e.target.value));
              }}
              error={batchNameError}
              required
            />
          </Col>

          <Col span={12}>
            <CommonSelectField
              label="Region"
              required
              options={regionOptions}
              value={regionId}
              onChange={(e) => {
                setRegionId(e.target.value);
                setBranchId("");
                getBranchesData(e.target.value);
                setRegionError(selectValidator(e.target.value));
              }}
              error={regionError}
            />
          </Col>

          {regionId != 3 && (
            <Col span={12} style={{ marginTop: "30px" }}>
              <CommonSelectField
                label="Branch"
                required
                options={branchOptions}
                value={branchId}
                onChange={(e) => {
                  setBranchId(e.target.value);
                  setBranchIdError(selectValidator(e.target.value));
                }}
                error={branchIdError}
              />
            </Col>
          )}

          <Col span={12} style={{ marginTop: "30px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div style={{ flex: 1 }}>
                <CommonSelectField
                  label="Trainer"
                  required={false}
                  options={trainersData}
                  onChange={handleTrainerId}
                  value={trainerId}
                  error={""}
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
                  disableClearable={false}
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
                      }}
                    >
                      <IoFilter size={16} />
                    </Button>
                  </Tooltip>
                </Flex>
              </div>
              {trainerId && (
                <Tooltip
                  placement="top"
                  title="View Trainer Details"
                  trigger={["hover", "click"]}
                >
                  <FaRegEye
                    size={17}
                    className="trainers_action_icons"
                    onClick={() => setIsOpenTrainerDetailModal(true)}
                  />
                </Tooltip>
              )}
            </div>
          </Col>

          <Col span={12} style={{ marginTop: "30px" }}>
            <CommonCustomerMultiSelectField
              label="Select Customer"
              required={false}
              options={mergedCustomers}
              value={selectedCustomerIds}
              inputValue={customerSearchText}
              onChange={handleCustomerSelect}
              onInputChange={handleCustomerSearch}
              onDropdownOpen={handleCustomerDropdownOpen}
              onDropdownScroll={handleCustomerScroll}
              loading={customerSelectloading}
              showLabelStatus="Name"
              error={""}
              disableClearable={false}
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
