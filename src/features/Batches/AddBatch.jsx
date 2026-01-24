import React, {
  useState,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
} from "react";
import { Row, Col } from "antd";
import CommonInputField from "../Common/CommonInputField";
import {
  selectValidator,
  addressValidator,
  formatToBackendIST,
} from "../Common/Validation";
import CommonSelectField from "../Common/CommonSelectField";
import {
  createBatch,
  getBranches,
  getCustomers,
  updateBatch,
} from "../ApiService/action";
import CommonCustomerMultiSelectField from "../Common/CommonCustomerSelect";
import { CommonMessage } from "../Common/CommonMessage";

const AddBatch = forwardRef(
  (
    { regionOptions, editBatchItem, callgetBatchesApi, setButtonLoading },
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

    /* ---------------- CUSTOMER STATES ---------------- */
    const [customersData, setCustomersData] = useState([]);

    // ✅ IMPORTANT: keep IDs & Objects separately
    const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
    const [selectedCustomerObjects, setSelectedCustomerObjects] = useState([]);

    const [selectedCustomerError, setSelectedCustomerError] = useState("");
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
        const response = await getCustomers(payload);
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

      setSelectedCustomerError(selectedIds.length ? "" : "is required");
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
      const customersValidate = selectValidator(selectedCustomerIds);

      setBatchNameError(batchNameValidate);
      setRegionError(regionIdValidate);
      setBranchIdError(branchIdValidate);
      setSelectedCustomerError(customersValidate);

      if (
        batchNameValidate ||
        regionIdValidate ||
        branchIdValidate ||
        customersValidate
      )
        return;

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
        trainer_id: null,
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
      setSelectedCustomerError("");
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
            <CommonCustomerMultiSelectField
              label="Select Customer"
              required
              options={mergedCustomers}
              value={selectedCustomerIds}
              inputValue={customerSearchText}
              onChange={handleCustomerSelect}
              onInputChange={handleCustomerSearch}
              onDropdownOpen={handleCustomerDropdownOpen}
              onDropdownScroll={handleCustomerScroll}
              loading={customerSelectloading}
              showLabelStatus="Name"
              error={selectedCustomerError}
              disableClearable={false}
            />
          </Col>
        </Row>
      </div>
    );
  },
);

export default AddBatch;
