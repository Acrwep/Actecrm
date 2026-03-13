import React, {
  useState,
  forwardRef,
  useEffect,
  useMemo,
  useImperativeHandle,
} from "react";
import { Row, Col, Tooltip, Button, Flex, Radio, Drawer, Modal } from "antd";
import { FaRegEye } from "react-icons/fa";
import { IoFilter } from "react-icons/io5";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import {
  selectValidator,
  addressValidator,
  emailValidator,
  formatToBackendIST,
} from "../Common/Validation";
import {
  checkTicketEmail,
  createTicket,
  getCustomerById,
  getCustomers,
  getTicketCategories,
  getTicketSubCategories,
  getTrainers,
  getUsers,
  sendNotification,
} from "../ApiService/action";
import CommonSelectField from "../Common/CommonSelectField";
import CommonInputField from "../Common/CommonInputField";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import moment from "moment";
import CommonCustomerSingleSelectField from "../Common/CommonCustomerSingleSelect";
import ParticularCustomerDetails from "../Customers/ParticularCustomerDetails";
import CommonSpinner from "../Common/CommonSpinner";
import { CommonMessage } from "../Common/CommonMessage";

const AddTicket = forwardRef(({ setButtonLoading, callgetTicketApi }, ref) => {
  const raisedByTypeOptions = [
    { id: "Customer", name: "Customer" },
    { id: "Trainer", name: "Trainer" },
    { id: "Others", name: "Others" },
  ];
  const [raisedByTypeId, setRaisedByTypeId] = useState("Customer");
  const [raisedByTypeIdError, setRaisedByTypeIdError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [categoryIdError, setCategoryIdError] = useState("");
  const [description, setDescription] = useState("");
  const [fileAttachmentBase64, setFileAttachmentBase64] = useState("");
  const [validationTrigger, setValidationTrigger] = useState(false);
  //manager, ra, and hr usestates
  const [allUsersList, setAllUsersList] = useState([]);
  const [managerId, setManagerId] = useState("");
  const [managerItem, setManagerItem] = useState("");
  const [managerIdError, setManagerIdError] = useState("");
  const [raId, setRaId] = useState("");
  const [hrId, setHrId] = useState("");
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

  const [clickedTrainerDetails, setClickedTrainerDetails] = useState([]);
  const [isOpenTrainerDetailModal, setIsOpenTrainerDetailModal] =
    useState(false);
  /* ---------------- CUSTOMER STATES ---------------- */
  const [customersData, setCustomersData] = useState([]);
  const [isOpenCustomerDetailsDrawer, setIsOpenCustomerDetailsDrawer] =
    useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerDetailsLoading, setCustomerDetailsLoading] = useState(false);
  // ✅ IMPORTANT: keep IDs & Objects separately
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomerIdError, setSelectedCustomerIdError] = useState(null);
  const [selectedCustomerObject, setSelectedCustomerObject] = useState(null);
  const [customerSearchText, setCustomerSearchText] = useState("");
  /* ---------------- PAGINATION ---------------- */
  const [customerPage, setCustomerPage] = useState(1);
  const [customerHasMore, setCustomerHasMore] = useState(true);
  const [customerSelectloading, setCustomerSelectloading] = useState(false);

  useEffect(() => {
    getTrainersData();
  }, []);

  const getCategoriesData = async () => {
    try {
      const response = await getTicketCategories();
      setCategoryOptions(response?.data?.data || []);
    } catch (error) {
      setCategoryOptions([]);
      console.log("categories error", error);
    } finally {
      getUsersData();
    }
  };

  const getUsersData = async () => {
    const payload = {
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getUsers(payload);
      console.log("users response", response);
      setAllUsersList(response?.data?.data?.data || []);
    } catch (error) {
      setAllUsersList([]);
      console.log("get all users error", error);
    } finally {
      getCustomersData(null);
    }
  };

  /* ---------------- FETCH TRAINERS ---------------- */
  const buildTrainerSearchPayload = (value) => {
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
      ...buildTrainerSearchPayload(searchvalue),
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
      getCategoriesData();
    }
  };

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
    } catch (error) {
      console.log("get customers error", error);
    } finally {
      setCustomerSelectloading(false);
      // const test_customers = [{ id: 12, name: "Speed" }];
      // setSelectedCustomerId(test_customers.map((c) => String(c.id)));
      // setSelectedCustomerObject(test_customers);
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
    const selectedId = event.target.value;
    const selectedObj = event.target.object; // ✅ DIRECT OBJECT
    setSelectedCustomerId(selectedId);
    setSelectedCustomerObject(selectedObj);

    if (validationTrigger) {
      setSelectedCustomerIdError(selectValidator(selectedId));
    }
    // 👇 show selected label in input
    setCustomerSearchText(selectedObj?.name || "");
  };

  /* ---------------- MERGED OPTIONS (CRITICAL) ---------------- */
  const mergedCustomers = useMemo(() => {
    const map = new Map();

    if (selectedCustomerObject) {
      map.set(selectedCustomerObject.id, selectedCustomerObject);
    }

    customersData.forEach((c) => map.set(c.id, c));

    return Array.from(map.values());
  }, [customersData, selectedCustomerObject]);

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
              <FaRegCircleUser size={15} style={{ color: "#5b69ca" }} />
              <span
                style={{ fontWeight: 600, fontSize: "14px", color: "#333" }}
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
  const getParticularCustomerDetails = async (customer_id) => {
    setCustomerDetailsLoading(true);
    try {
      const response = await getCustomerById(customer_id);
      const customer_details = response?.data?.data;
      console.log("customer full details", customer_details);
      setCustomerDetails(customer_details);
      setCustomerDetailsLoading(false);
      setIsOpenCustomerDetailsDrawer(true);
    } catch (error) {
      setCustomerDetailsLoading(false);
      console.log("getcustomer by id error", error);
      setCustomerDetails(null);
    }
  };

  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

  const handleSubmit = async () => {
    setValidationTrigger(true);
    const raisedByTypeValidate =
      raisedByTypeId == "Others" ? "" : selectValidator(raisedByTypeId);
    const titleValidate = addressValidator(title);
    const categoryIdValidate = selectValidator(categoryId);
    const managerIdValidate = selectValidator(managerId);

    let trainerIdValidate = "";
    let customerIdValidate = "";
    let RaAndHrValidate = "";

    if (raisedByTypeId == "Trainer") {
      trainerIdValidate = selectValidator(selectedTrainerId);
    } else {
      trainerIdValidate = "";
    }

    if (raisedByTypeId == "Customer") {
      customerIdValidate = selectValidator(selectedCustomerId);
    } else {
      customerIdValidate = "";
    }

    setRaisedByTypeIdError(raisedByTypeValidate);
    setSelectedTrainerIdError(trainerIdValidate);
    setSelectedCustomerIdError(customerIdValidate);
    setTitleError(titleValidate);
    setCategoryIdError(categoryIdValidate);
    setManagerIdError(managerIdValidate);

    if (
      raisedByTypeValidate ||
      trainerIdValidate ||
      customerIdValidate ||
      titleValidate ||
      categoryIdValidate ||
      managerIdValidate
    )
      return;

    if ((raId && !hrId) || (hrId && !raId)) {
      CommonMessage("error", "Either select both RA and HR or unselect both.");
      return;
    }

    setButtonLoading(true);
    const today = new Date();
    const getLoginUserDetails = localStorage.getItem("loginUserDetails");
    const convertAsJson = JSON.parse(getLoginUserDetails);

    const payload = {
      title: title,
      description: description,
      category_id: categoryId,
      priority: "High",
      attachments: [
        {
          base64string: fileAttachmentBase64,
        },
      ],
      raised_by_id:
        raisedByTypeId == "Customer"
          ? selectedCustomerId
          : raisedByTypeId == "Trainer"
            ? selectedTrainerId
            : "",
      raised_by_role: raisedByTypeId,
      manager_id: managerId,
      ra_id: raId,
      hr_id: hrId,
      assigned_to: convertAsJson?.user_id,
      created_at: formatToBackendIST(today),
    };
    try {
      await createTicket(payload);
      setTimeout(() => {
        handleSendNotification();
        callgetTicketApi();
        CommonMessage("success", "Created");
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      console.log("ticket create error", error);
    }
  };

  const handleSendNotification = async () => {
    const findCategory = categoryOptions.find((f) => f.id == categoryId);
    const today = new Date();
    const notifyIds = [managerId, raId, hrId];
    const payload = {
      user_ids: notifyIds.filter((f) => f != ""),
      title: "Ticket Assigned",
      message: {
        title: title,
        category_name: findCategory?.name || "",
        priority: "High",
        ticket_created_date: formatToBackendIST(today),
      },
      created_at: formatToBackendIST(today),
    };
    console.log("notification payload", payload);

    try {
      await sendNotification(payload);
    } catch (error) {
      console.log("send notification error", error);
    }
  };

  const formReset = () => {
    setIsOpenAddDrawer(false);
    setButtonLoading(false);
    setValidationTrigger(false);
    setTitle("");
    setTitleError("");
    setEmail("");
    setEmailError("");
    setCategoryId(null);
    setCategoryIdError("");
    setDescription("");
    setFileAttachmentBase64("");
  };

  return (
    <div className="customer_statusupdate_adddetailsContainer">
      <Row gutter={12}>
        <Col xs={24} sm={24} md={24} lg={8} style={{ marginTop: "20px" }}>
          <CommonSelectField
            label="Raised By Type"
            required={true}
            options={raisedByTypeOptions}
            onChange={(e) => {
              setRaisedByTypeId(e.target.value);
              if (e.target.value == "Others") {
                setSelectedCustomerId(null);
                setSelectedCustomerIdError("");
                setSelectedTrainerId(null);
                setSelectedTrainerIdError("");
              }
              if (validationTrigger) {
                setRaisedByTypeIdError(selectValidator(e.target.value));
              }
            }}
            value={raisedByTypeId}
            error={raisedByTypeIdError}
          />
        </Col>

        {raisedByTypeId == "Trainer" ? (
          <Col xs={24} sm={24} md={24} lg={8} style={{ marginTop: "20px" }}>
            <CommonCustomerSingleSelectField
              label="Trainer"
              labelMarginTop="1px"
              required={true}
              options={mergedTrainersList}
              value={selectedTrainerId}
              inputValue={trainerSearchText}
              onChange={handleTrainerSelect}
              onInputChange={handleTrainerSearch}
              onDropdownOpen={handleTrainerDropdownOpen}
              onDropdownScroll={handleTrainerScroll}
              loading={trainerSelectloading}
              error={selectedTrainerIdError}
              renderOption={renderTrainerOption}
              disableClearable={false}
            />
          </Col>
        ) : raisedByTypeId == "Customer" ? (
          <Col xs={24} sm={24} md={24} lg={8} style={{ marginTop: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div style={{ flex: 1 }}>
                <CommonCustomerSingleSelectField
                  label="Customer"
                  required={true}
                  options={mergedCustomers}
                  value={selectedCustomerId}
                  inputValue={customerSearchText}
                  onChange={handleCustomerSelect}
                  onInputChange={handleCustomerSearch}
                  onDropdownOpen={handleCustomerDropdownOpen}
                  onDropdownScroll={handleCustomerScroll}
                  loading={customerSelectloading}
                  showLabelStatus="Name"
                  error={selectedCustomerIdError}
                  disableClearable={false}
                />
              </div>
              {selectedCustomerId && (
                <>
                  {customerDetailsLoading ? (
                    <CommonSpinner color="#333" />
                  ) : (
                    <Tooltip
                      placement="top"
                      title="View Customer Details"
                      trigger={["hover", "click"]}
                    >
                      <FaRegEye
                        size={16}
                        className="trainers_action_icons"
                        onClick={() => {
                          getParticularCustomerDetails(selectedCustomerId);
                        }}
                      />
                    </Tooltip>
                  )}
                </>
              )}
            </div>
          </Col>
        ) : (
          ""
        )}

        <Col xs={24} sm={24} md={24} lg={8} style={{ marginTop: "20px" }}>
          <CommonInputField
            label="Title"
            required={true}
            onChange={(e) => {
              setTitle(e.target.value);
              if (validationTrigger) {
                setTitleError(addressValidator(e.target.value));
              }
            }}
            value={title}
            error={titleError}
          />
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={8}
          style={{ marginTop: raisedByTypeId == "Others" ? "20px" : "30px" }}
        >
          <CommonSelectField
            label="Category"
            required={true}
            options={categoryOptions}
            onChange={(e) => {
              setCategoryId(e.target.value);
              if (validationTrigger) {
                setCategoryIdError(selectValidator(e.target.value));
              }
            }}
            value={categoryId}
            error={categoryIdError}
          />
        </Col>

        <Col xs={24} sm={24} md={24} lg={8} style={{ marginTop: "30px" }}>
          <CommonSelectField
            label="Manager"
            required={true}
            options={allUsersList}
            onChange={(e) => {
              setManagerId(e.target.value);
              setManagerItem(e.target.option);
              setManagerIdError(selectValidator(e.target.value));
            }}
            value={managerId}
            error={managerIdError}
          />
        </Col>

        <Col xs={24} sm={24} md={24} lg={8} style={{ marginTop: "30px" }}>
          <CommonSelectField
            label="RA"
            required={false}
            options={allUsersList}
            onChange={(e) => {
              setRaId(e.target.value);
            }}
            value={raId}
            error={""}
            disableClearable={false}
          />
        </Col>

        <Col xs={24} sm={24} md={24} lg={8} style={{ marginTop: "30px" }}>
          <CommonSelectField
            label="HR"
            required={false}
            options={allUsersList}
            onChange={(e) => {
              setHrId(e.target.value);
            }}
            value={hrId}
            error={""}
            disableClearable={false}
          />
        </Col>

        <Col xs={24} sm={24} md={24} lg={8} style={{ marginTop: "30px" }}>
          <CommonInputField
            label="Description"
            required={false}
            multiline={true}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            value={description}
          />
        </Col>

        <Col
          xs={24}
          sm={24}
          md={24}
          lg={8}
          style={{
            marginTop: "30px",
            color: "rgba(0,0,0,0.88)",
          }}
        >
          <ImageUploadCrop
            label="File Attachment"
            aspect={1}
            maxSizeMB={1}
            required={false}
            value={fileAttachmentBase64}
            onChange={(base64) => setFileAttachmentBase64(base64)}
            onErrorChange={""} // ✅ pass setter directly
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
                        <p className="customerdetails_rowheading">Technology</p>
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
                        <p className="customerdetails_rowheading">Experience</p>
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

      {/* customer fulldetails drawer */}
      <Drawer
        title="Customer Details"
        open={isOpenCustomerDetailsDrawer}
        onClose={() => {
          setIsOpenCustomerDetailsDrawer(false);
          setCustomerDetails(null);
          //   setPaymentValidationTrigger(false);
        }}
        width="50%"
        style={{ position: "relative" }}
      >
        {isOpenCustomerDetailsDrawer ? (
          <ParticularCustomerDetails
            customerId={customerDetails?.id}
            isCustomerPage={true}
          />
        ) : (
          ""
        )}
      </Drawer>
    </div>
  );
});

export default AddTicket;
