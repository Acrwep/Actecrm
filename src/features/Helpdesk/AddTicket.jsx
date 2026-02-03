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
  getCustomers,
  getTicketCategories,
  getTicketSubCategories,
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

const AddTicket = forwardRef(
  ({ trainersData, setButtonLoading, callgetTicketApi }, ref) => {
    const raisedByTypeOptions = [
      { id: "Customer", name: "Customer" },
      { id: "Trainer", name: "Trainer" },
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
    const [subCategoryOptions, setSubCategoryOptions] = useState([]);
    const [subCategoryId, setSubCategoryId] = useState("");
    const [subCategoryIdError, setSubCategoryIdError] = useState("");
    const typeOptions = [
      { id: "Change", name: "Change" },
      { id: "Issue", name: "Issue" },
      { id: "Request", name: "Request" },
      { id: "Complaint", name: "Complaint" },
      { id: "Others", name: "Others" },
    ];
    const [typeId, setTypeId] = useState("");
    const [typeIdError, setTypeIdError] = useState("");
    const [description, setDescription] = useState("");
    const [fileAttachmentBase64, setFileAttachmentBase64] = useState("");
    const [validationTrigger, setValidationTrigger] = useState(false);
    //trainer select usestates
    const [trainerFilterType, setTrainerFilterType] = useState(1);
    const [isTrainerSelectFocused, setIsTrainerSelectFocused] = useState(false);
    const [trainerId, setTrainerId] = useState(null);
    const [trainerIdError, setTrainerIdError] = useState("");
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
    const [selectedCustomerIdError, setSelectedCustomerIdError] =
      useState(null);
    const [selectedCustomerObject, setSelectedCustomerObject] = useState(null);
    const [customerSearchText, setCustomerSearchText] = useState("");
    /* ---------------- PAGINATION ---------------- */
    const [customerPage, setCustomerPage] = useState(1);
    const [customerHasMore, setCustomerHasMore] = useState(true);
    const [customerSelectloading, setCustomerSelectloading] = useState(false);

    useEffect(() => {
      getCategoriesData();
    }, []);

    const getCategoriesData = async () => {
      try {
        const response = await getTicketCategories();
        setCategoryOptions(response?.data?.data || []);
      } catch (error) {
        setCategoryOptions([]);
        console.log("categories error", error);
      } finally {
        setTimeout(() => {
          getSubCategoriesData();
        }, 300);
      }
    };

    const getSubCategoriesData = async () => {
      try {
        const response = await getTicketSubCategories();
        setSubCategoryOptions(response?.data?.data || []);
      } catch (error) {
        setSubCategoryOptions([]);
        console.log("sub categories error", error);
      } finally {
        setTimeout(() => {
          getCustomersData(null);
        }, 300);
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

    const handleTrainerId = (e) => {
      setTrainerId(e.target.value);
      const clickedTrainer = trainersData.filter((f) => f.id == e.target.value);
      console.log("clickedTrainer", clickedTrainer);
      setClickedTrainerDetails(clickedTrainer);
      setTrainerIdError(selectValidator(e.target.value));
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

    const getParticularCustomerDetails = async (customerEmail) => {
      setCustomerDetailsLoading(true);
      const payload = {
        email: customerEmail,
      };
      try {
        const response = await getCustomers(payload);
        const customer_details = response?.data?.data?.customers[0];
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
      const raisedByTypeValidate = selectValidator(raisedByTypeId);
      const titleValidate = addressValidator(title);
      const categoryIdValidate = selectValidator(categoryId);
      const subCategoryIdValidate = selectValidator(subCategoryId);
      const typeIdValidate = selectValidator(typeId);

      let trainerIdValidate = "";
      let customerIdValidate = "";

      if (raisedByTypeId == "Trainer") {
        trainerIdValidate = selectValidator(trainerId);
      } else {
        trainerIdValidate = "";
      }

      if (raisedByTypeId == "Customer") {
        customerIdValidate = selectValidator(selectedCustomerId);
      } else {
        customerIdValidate = "";
      }

      setRaisedByTypeIdError(raisedByTypeValidate);
      setTrainerIdError(trainerIdValidate);
      setSelectedCustomerIdError(customerIdValidate);
      setTitleError(titleValidate);
      setCategoryIdError(categoryIdValidate);
      setSubCategoryIdError(subCategoryIdValidate);
      setTypeIdError(typeIdValidate);

      if (
        raisedByTypeValidate ||
        trainerIdValidate ||
        customerIdValidate ||
        titleValidate ||
        categoryIdValidate ||
        subCategoryIdValidate ||
        typeIdValidate
      )
        return;

      setButtonLoading(true);
      const today = new Date();

      const payload = {
        title: title,
        description: description,
        category_id: categoryId,
        sub_category_id: subCategoryId,
        priority: null,
        type: typeId,
        attachments: fileAttachmentBase64,
        raised_by_id:
          raisedByTypeId == "Customer" ? selectedCustomerId : trainerId,
        raised_by_role: raisedByTypeId,
        created_at: formatToBackendIST(today),
      };
      try {
        await createTicket(payload);
        setTimeout(() => {
          callgetTicketApi();
          CommonMessage("success", "Created");
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        console.log("ticket create error", error);
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
      setSubCategoryId(null);
      setSubCategoryIdError("");
      setTypeId("");
      setTypeIdError("");
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
                    required={true}
                    options={trainersData}
                    onChange={handleTrainerId}
                    value={trainerId}
                    error={trainerIdError}
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
                    disabled={false}
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
          ) : (
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
                            getParticularCustomerDetails(
                              selectedCustomerObject.email,
                            );
                          }}
                        />
                      </Tooltip>
                    )}
                  </>
                )}
              </div>
            </Col>
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
          <Col xs={24} sm={24} md={24} lg={8} style={{ marginTop: "30px" }}>
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
              label="Sub Category"
              required={true}
              options={subCategoryOptions}
              onChange={(e) => {
                setSubCategoryId(e.target.value);
                if (validationTrigger) {
                  setSubCategoryIdError(selectValidator(e.target.value));
                }
              }}
              value={subCategoryId}
              error={subCategoryIdError}
            />
          </Col>

          <Col xs={24} sm={24} md={24} lg={8} style={{ marginTop: "30px" }}>
            <CommonSelectField
              label="Type"
              required={true}
              options={typeOptions}
              onChange={(e) => {
                setTypeId(e.target.value);
                if (validationTrigger) {
                  setTypeIdError(selectValidator(e.target.value));
                }
              }}
              value={typeId}
              error={typeIdError}
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
              marginTop: subCategoryIdError ? "40px" : "30px",
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

export default AddTicket;
