import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Row,
  Col,
  Tooltip,
  Drawer,
  Modal,
  Divider,
  Button,
  Flex,
  Radio,
  Switch,
} from "antd";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import CommonSelectField from "../Common/CommonSelectField";
import CommonInputField from "../Common/CommonInputField";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import CommonCustomerSelectField from "../Common/CommonCustomerSelect";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { FaRegEye } from "react-icons/fa";
import { IoFilter } from "react-icons/io5";
import { LuIndianRupee } from "react-icons/lu";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import "./styles.css";
import { CommonMessage } from "../Common/CommonMessage";
import {
  getCustomers,
  getCustomersByTrainerId,
  insertTrainerPaymentRequest,
  updateTrainerPaymentRequest,
} from "../ApiService/action";
import ParticularCustomerDetails from "../Customers/ParticularCustomerDetails";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import moment from "moment";
import {
  addressValidator,
  formatToBackendIST,
  selectValidator,
} from "../Common/Validation";
import CommonSpinner from "../Common/CommonSpinner";
import PrismaZoom from "react-prismazoom";

const AddTrainerPaymentRequest = forwardRef(
  (
    {
      trainersData,
      editRequestItem,
      setButtonLoading,
      callgetTrainerPaymentsApi,
    },
    ref,
  ) => {
    //select trainer usestates
    const [isTrainerSelectFocused, setIsTrainerSelectFocused] = useState(false);
    const [trainerFilterType, setTrainerFilterType] = useState(1);
    const [trainerId, setTrainerId] = useState(null);
    const [trainerIdError, setTrainerIdError] = useState("");
    const [clickedTrainerDetails, setClickedTrainerDetails] = useState([]);
    const [isOpenTrainerDetailModal, setIsOpenTrainerDetailModal] =
      useState(false);
    const [billRaiseDate, setBillRaiseDate] = useState(null);
    const [billRaiseDateError, setBillRaiseDateError] = useState(null);
    const streamOptions = [
      { id: "Online", name: "Online" },
      { id: "Chennai", name: "Chennai" },
      { id: "Bangalore", name: "Bangalore" },
    ];
    const attendanceStatusOptions = [
      { id: "V Completed", name: "V Completed" },
      { id: "ST SHT INC", name: "ST SHT INC" },
      { id: "Class Not Completed", name: "Class Not Completed" },
    ];
    const attendanceTypeOptions = [
      { id: "Link", name: "Link" },
      { id: "Screenshot", name: "Screenshot" },
    ];
    const [daysTakenToPay, setDaysTakenToPay] = useState("");
    const [deadLineDate, setDeadLineDate] = useState(null);
    const [customersData, setCustomersData] = useState([]);
    const [isOpenCustomerDetailsDrawer, setIsOpenCustomerDetailsDrawer] =
      useState(false);
    const [customerDetails, setCustomerDetails] = useState(null);
    const [customerDetailsLoading, setCustomerDetailsLoading] = useState(false);
    const [validationTrigger, setValidationTrigger] = useState(false);
    //form fields
    const [formFields, setFormFields] = useState([
      {
        streams: null,
        streams_error: "",
        attendance_status: null,
        attendance_status_error: "",
        attendanceType: "Link",
        attendance_sheetlink: "",
        attendance_sheetlink_error: "",
        attendance_screenshot: "",
        attendance_screenshot_error: "",
        customerId: null,
        customerIdError: null,
        class_percentage: "",
        balance_amount: "",
        google_review: "",
        linkedin_review: "",
        commercial: "",
        commercial_percentage: "",
        trainer_mapping_id: 0,
      },
    ]);
    const [isDisContinued, setIsDisContinued] = useState(false);
    const [requestAmount, setRequestAmount] = useState("");
    const [requestAmountError, setRequestAmountError] = useState("");
    //review  usestates
    const [isOpenReviewModal, setIsOpenReviewModal] = useState(false);
    const [reviewScreenshot, setReviewScreenshot] = useState("");
    const [reviewType, setReviewType] = useState("");

    useEffect(() => {
      if (editRequestItem) {
        console.log("editRequestItem", editRequestItem);
        setBillRaiseDate(editRequestItem.bill_raisedate);
        setTrainerId(editRequestItem.trainer_id);
        const updateStudentsData = editRequestItem.students.map((item) => {
          return {
            ...item,
            attendanceType: item.attendance_sheetlink ? "Link" : "Screenshot",
            customerId: item.customer_id,
          };
        });
        console.log("updateStudentsData", updateStudentsData);
        setFormFields(updateStudentsData);
        getCustomerByTrainerIdData(editRequestItem.trainer_id);
        const clickedTrainer = trainersData.filter(
          (f) => f.id == editRequestItem.trainer_id,
        );
        console.log("clickedTrainer", clickedTrainer);
        setClickedTrainerDetails(clickedTrainer);
        setDaysTakenToPay(editRequestItem.days_taken_topay);
        setDeadLineDate(editRequestItem.deadline_date);
      }
    }, []);

    const getDayDifference = (inputDate) => {
      const today = new Date();
      const given = new Date(inputDate);

      // normalize both to UTC midnight
      const utcToday = Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );

      const utcGiven = Date.UTC(
        given.getFullYear(),
        given.getMonth(),
        given.getDate(),
      );

      const diffTime = utcToday - utcGiven; // today - past date
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return diffDays < 0 ? 0 : diffDays;
    };

    const addWorkingDays = (startDate, workingDays) => {
      let date = new Date(startDate);
      let addedDays = 0;

      while (addedDays < workingDays) {
        date.setDate(date.getDate() + 1);

        const day = date.getDay();
        // 0 = Sunday, 6 = Saturday

        if (day !== 0 && day !== 6) {
          addedDays++;
        }
      }

      return date;
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

    const handleTrainerId = (e) => {
      setTrainerId(e.target.value);
      const clickedTrainer = trainersData.filter((f) => f.id == e.target.value);
      console.log("clickedTrainer", clickedTrainer);
      setClickedTrainerDetails(clickedTrainer);
      setTrainerIdError(selectValidator(e.target.value));
      getCustomerByTrainerIdData(e.target.value);
      //formfields
      const updateFormfields = formFields.map((item) => {
        return { ...item, customerId: "" };
      });
      setFormFields(updateFormfields);
    };

    const getCustomerByTrainerIdData = async (trainer_id) => {
      try {
        const response = await getCustomersByTrainerId(trainer_id);
        console.log("get customers response", response);
        setCustomersData(response?.data?.data || []);
      } catch (error) {
        setCustomersData([]);
        console.log("get students error", error);
      }
    };

    const addFormFields = () => {
      const obj = {
        streams: null,
        streamsError: "",
        attendance_status: null,
        attendance_status_error: "",
        attendanceType: "Link",
        attendance_sheetlink: "",
        attendance_sheetlink_error: "",
        attendance_screenshot: "",
        attendance_screenshot_error: "",
        customerId: null,
        customerIdError: null,
        class_percentage: "",
        balance_amount: "",
        google_review: "",
        linkedin_review: "",
        commercial: "",
        commercial_percentage: "",
        trainer_mapping_id: 0,
      };

      setFormFields([...formFields, obj]);
    };

    const handleFormFields = (field, index, value) => {
      const updatedDetails = [...formFields];
      // update value
      updatedDetails[index][field] = value;

      if (field === "streams") {
        updatedDetails[index].streams_error = selectValidator(value);
      }
      if (field === "attendance_status") {
        updatedDetails[index].attendance_status_error = selectValidator(value);
      }
      if (field === "attendanceType") {
        updatedDetails[index].attendance_sheetlink = "";
        updatedDetails[index].attendance_screenshot = "";
        updatedDetails[index].attendance_screenshot_error = selectValidator(
          updatedDetails[index].attendance_screenshot,
        );
      }
      if (field === "attendance_sheetlink") {
        updatedDetails[index].attendance_sheetlink_error =
          selectValidator(value);
      }
      if (field === "attendance_screenshot") {
        updatedDetails[index].attendance_screenshot_error =
          selectValidator(value);
      }

      if (field === "customerId") {
        const selectedCustomerData = customersData.filter(
          (f) => f.id == updatedDetails[index].customerId,
        );
        console.log("selectedCustomerData", selectedCustomerData);

        if (selectedCustomerData.length >= 1) {
          updatedDetails[index].trainer_mapping_id =
            selectedCustomerData[0].trainer_mapping_id;

          updatedDetails[index].commercial = selectedCustomerData[0].commercial;

          updatedDetails[index].commercial_percentage =
            selectedCustomerData[0].commercial_percentage;

          updatedDetails[index].class_percentage =
            selectedCustomerData[0].class_percentage;

          updatedDetails[index].balance_amount =
            selectedCustomerData[0].balance_amount;

          updatedDetails[index].google_review =
            selectedCustomerData[0].google_review;

          updatedDetails[index].linkedin_review =
            selectedCustomerData[0].linkedin_review;
        } else {
          updatedDetails[index].trainer_mapping_id = 0;
          updatedDetails[index].commercial = "";
        }

        const customerMap = {};

        updatedDetails.forEach((item, i) => {
          if (item.customerId) {
            if (!customerMap[item.customerId]) {
              customerMap[item.customerId] = [];
            }
            customerMap[item.customerId].push(i);
          }
        });

        // reset all previous errors
        updatedDetails.forEach((item) => {
          item.customerIdError = selectValidator(item.customerId);
        });

        // mark duplicates
        Object.values(customerMap).forEach((indexes) => {
          if (indexes.length > 1) {
            indexes.forEach((i) => {
              updatedDetails[i].customerIdError =
                "already selected in another row";
            });
          }
        });
      }

      updatedDetails[index][field] = value;
      console.log("updatedDetails", updatedDetails);
      setFormFields(updatedDetails);
    };

    const removeFormFields = (index) => {
      if (formFields.length >= 2) {
        let data = [...formFields];
        data.splice(index, 1);
        setFormFields(data);
      } else {
        CommonMessage("warning", "At least one customer should be added");
      }
    };

    useImperativeHandle(ref, () => ({
      handleRequestSubmit,
    }));

    const handleRequestSubmit = async () => {
      setValidationTrigger(true);
      const raiseDateValidate = selectValidator(billRaiseDate);
      const trainerIdValidate = selectValidator(trainerId);
      let requestAmountValidate = "";

      if (isDisContinued) {
        requestAmountValidate = selectValidator(requestAmount);
      } else {
        requestAmountValidate = "";
      }

      let checkFormFieldsErrors = [];
      if (formFields.length >= 1) {
        const validateFormFields = formFields.map((item) => {
          return {
            ...item,
            streams_error: selectValidator(item.streams),
            attendance_status_error: selectValidator(item.attendance_status),
            attendance_sheetlink_error:
              item.attendanceType == "Link"
                ? selectValidator(item.attendance_sheetlink)
                : "",
            attendance_screenshot_error:
              item.attendanceType == "Screenshot"
                ? selectValidator(item.attendance_screenshot)
                : "",
            customerIdError: selectValidator(item.customerId),
          };
        });

        checkFormFieldsErrors = validateFormFields.filter(
          (f) =>
            f.streams_error != "" ||
            f.attendance_status_error != "" ||
            f.attendance_sheetlink_error != "" ||
            f.attendance_screenshot_error != "" ||
            f.customerIdError != "",
        );

        // 🔥 DUPLICATE CUSTOMER CHECK
        const customerMap = {};

        validateFormFields.forEach((item, index) => {
          if (item.customerId) {
            if (!customerMap[item.customerId]) {
              customerMap[item.customerId] = [];
            }
            customerMap[item.customerId].push(index);
          }
        });

        Object.values(customerMap).forEach((indexes) => {
          if (indexes.length > 1) {
            indexes.forEach((i) => {
              validateFormFields[i].customerIdError =
                "already selected in another row";
            });
          }
        });

        setFormFields(validateFormFields);
      }

      setBillRaiseDateError(raiseDateValidate);
      setTrainerIdError(trainerIdValidate);
      setRequestAmountError(requestAmountValidate);

      if (
        raiseDateValidate ||
        trainerIdValidate ||
        requestAmountValidate ||
        checkFormFieldsErrors.length >= 1
      )
        return;

      setButtonLoading(true);
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);

      const request_amount = formFields.reduce((sum, item) => {
        const value = parseFloat(item.commercial || 0);
        return sum + (isNaN(value) ? 0 : value);
      }, 0);

      const payload = {
        bill_raisedate: moment(billRaiseDate).format("YYYY-MM-DD"),
        trainer_id: trainerId,
        request_amount: isDisContinued ? requestAmount : request_amount,
        days_taken_topay: daysTakenToPay,
        deadline_date: moment(deadLineDate).format("YYYY-MM-DD"),
        created_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
        students: formFields,
        created_date: formatToBackendIST(today),
      };
      console.log("payloaddd", payload);

      if (editRequestItem) {
        const editPayload = {
          trainer_payment_id: editRequestItem.id,
          bill_raisedate: billRaiseDate,
          students: formFields,
        };

        try {
          await updateTrainerPaymentRequest(editPayload);
          setTimeout(() => {
            CommonMessage("success", "Updated Successfully");
            // Refresh the payment requests data
            callgetTrainerPaymentsApi();
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
          await insertTrainerPaymentRequest(payload);
          setTimeout(() => {
            CommonMessage("success", "Requested Successfully");
            // Refresh the payment requests data
            setButtonLoading(false);
            callgetTrainerPaymentsApi();
          }, 300);
        } catch (error) {
          setButtonLoading(false);
          CommonMessage(
            "error",
            error?.response?.data?.message ||
              "Something went wrong. Try again later",
          );
        }
      }
    };

    const keepOnlyIndex = (arr, index) => {
      return arr.filter((_, i) => i === index);
    };

    return (
      <div>
        <Row
          gutter={16}
          className="trainerpaymentrequest_addrequestdrawer_rowcontainer"
          style={{ marginTop: "14px" }}
        >
          <Col span={8}>
            <CommonMuiDatePicker
              label="Bill Raise Date"
              required={true}
              onChange={(value) => {
                setBillRaiseDate(value);
                console.log("raise date", value);
                const days_taken = getDayDifference(value);
                console.log("days_taken", days_taken);
                setDaysTakenToPay(days_taken);
                const deadline = addWorkingDays(value, 14);
                console.log("deadline", deadline);
                setDeadLineDate(deadline);
                if (validationTrigger) {
                  setBillRaiseDateError(selectValidator(value));
                }
              }}
              value={billRaiseDate}
              error={billRaiseDateError}
              disablePreviousDates={false}
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
                  disabled={editRequestItem ? true : false}
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
          <Col span={8}>
            <CommonInputField
              label="Days Taken To Pay"
              required={true}
              onChange={(e) => {
                const input = e.target.value;

                // Allow numbers, decimal point, or empty string
                if (!/^\d*\.?\d*$/.test(input)) return;

                setDaysTakenToPay(input);
              }}
              value={daysTakenToPay}
              error={""}
              disabled={true}
            />
          </Col>
        </Row>

        <Row
          gutter={16}
          className="trainerpaymentrequest_addrequestdrawer_rowcontainer"
          style={{ marginTop: "30px" }}
        >
          <Col span={8}>
            <CommonMuiDatePicker
              label="Deadline Date"
              required={true}
              onChange={(value) => {
                setDeadLineDate(value);
              }}
              value={deadLineDate}
              error={""}
              disablePreviousDates={true}
              disabled={true}
            />
          </Col>
        </Row>

        <Row
          gutter={16}
          className="trainerpaymentrequest_addrequestdrawer_rowcontainer"
          style={{ marginTop: "30px", alignItems: "center" }}
        >
          <Col span={12}>
            <p style={{ fontWeight: 600, fontSize: "15px" }}>
              Add Customer Details
            </p>
          </Col>
          <Col
            span={12}
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            {editRequestItem || isDisContinued ? (
              ""
            ) : (
              <button
                className="leadmanager_addleadbutton"
                onClick={addFormFields}
              >
                Add
              </button>
            )}
          </Col>
        </Row>

        {formFields.map((item, index) => {
          return (
            <>
              <Row
                gutter={16}
                className="trainerpaymentrequest_addrequestdrawer_rowcontainer"
                style={{ marginTop: "20px" }}
              >
                <Col span={8}>
                  {editRequestItem ? (
                    <div>
                      <p className="trainerpaymentrequest_editrequest_customername_label">
                        Customer Name
                      </p>

                      <div className="trainerpaymentrequest_editrequest_customername_container">
                        <div style={{ width: "85%" }}>
                          <EllipsisTooltip
                            text={item.customer_name ? item.customer_name : ""}
                            smallText={true}
                          />
                        </div>
                        <Tooltip
                          placement="top"
                          title="View Customer Details"
                          trigger={["hover", "click"]}
                        >
                          <FaRegEye
                            size={14}
                            className="trainers_action_icons"
                            onClick={() =>
                              getParticularCustomerDetails(item.customer_email)
                            }
                          />
                        </Tooltip>
                        {/* <FaRegEye size={14} /> */}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <CommonSelectField
                          label="Customer"
                          required={true}
                          options={customersData}
                          onChange={(e) => {
                            handleFormFields(
                              "customerId",
                              index,
                              e.target.value,
                            );
                          }}
                          value={item.customerId}
                          error={item.customerIdError}
                          errorFontSize={"10px"}
                          disableClearable={false}
                        />
                      </div>
                      {item.customerId && (
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
                                  const selectedCustomerData =
                                    customersData.filter(
                                      (f) => f.id == item.customerId,
                                    );
                                  getParticularCustomerDetails(
                                    selectedCustomerData.customer_email,
                                  );
                                }}
                              />
                            </Tooltip>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </Col>

                <Col span={8}>
                  <CommonOutlinedInput
                    label="Commercial"
                    type="number"
                    required={true}
                    onChange={(e) =>
                      handleFormFields("commercial", index, e.target.value)
                    }
                    value={item.commercial}
                    error={""}
                    icon={<LuIndianRupee size={16} />}
                    disabled={true}
                  />
                </Col>

                <Col span={8}>
                  <CommonInputField
                    label="Commercial %"
                    type="number"
                    required={true}
                    value={
                      item.commercial_percentage !== ""
                        ? String(item.commercial_percentage)
                        : ""
                    }
                    disabled={true}
                  />
                </Col>
              </Row>

              <div
                className="trainerpaymentrequest_badge_rowcotainer"
                style={{
                  marginBottom:
                    item.customerId && item.attendanceType == "Screenshot"
                      ? "70px"
                      : item.customerId
                        ? "60px"
                        : "0px",
                }}
              >
                <div
                  className={
                    item.customerId
                      ? "trainerpaymentrequest_badge_viewcotainer"
                      : "trainerpaymentrequest_badge_hiddencotainer"
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flex: 1,
                    }}
                  >
                    <div className="trainerpaymentrequest_balanceamount_badge" />
                    <p className="customer_trainer_onboardcount_badgecount">
                      Balance Amount{" "}
                      <span style={{ fontWeight: 600 }}>
                        {"₹" + item.balance_amount}
                      </span>{" "}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "6px",
                      flex: 1,
                    }}
                  >
                    <div className="trainerpaymentrequest_classpercentage_badge" />
                    <p className="customer_trainer_onboardcount_badgecount">
                      Class Percentage{" "}
                      <span style={{ fontWeight: 600 }}>
                        {item.class_percentage
                          ? parseFloat(item.class_percentage) + "%"
                          : "0" + "%"}
                      </span>{" "}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flex: 1,
                    }}
                  >
                    <div className="trainerpaymentrequest_google_badge" />
                    <p className="customer_trainer_onboardcount_badgecount">
                      G-Review{" "}
                      <span style={{ fontWeight: 600 }}>
                        {item.google_review ? "Collected" : "Not Collected"}
                      </span>{" "}
                    </p>
                    {item.google_review ? (
                      <FaRegEye
                        size={12}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setIsOpenReviewModal(true);
                          setReviewType("Google Review");
                          setReviewScreenshot(item.google_review);
                        }}
                      />
                    ) : (
                      ""
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flex: 1,
                    }}
                  >
                    <div className="trainerpaymentrequest_linkedin_badge" />
                    <p className="customer_trainer_onboardcount_badgecount">
                      L-Review{" "}
                      <span style={{ fontWeight: 600 }}>
                        <span style={{ fontWeight: 600 }}>
                          {item.linkedin_review ? "Collected" : "Not Collected"}
                        </span>{" "}
                      </span>{" "}
                    </p>
                    {item.linkedin_review ? (
                      <FaRegEye
                        size={12}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setIsOpenReviewModal(true);
                          setReviewType("Linkedin Review");
                          setReviewScreenshot(item.linkedin_review);
                        }}
                      />
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>

              <Row
                gutter={16}
                className="trainerpaymentrequest_addrequestdrawer_rowcontainer"
                style={{ marginTop: "30px" }}
              >
                <Col span={8}>
                  <CommonSelectField
                    label="Attendance Status"
                    options={attendanceStatusOptions}
                    required={true}
                    onChange={(e) =>
                      handleFormFields(
                        "attendance_status",
                        index,
                        e.target.value,
                      )
                    }
                    value={item.attendance_status}
                    error={item.attendance_status_error}
                    errorFontSize={"10px"}
                  />
                </Col>

                <Col span={8}>
                  <CommonSelectField
                    label="Attendance Type"
                    required={true}
                    options={attendanceTypeOptions}
                    onChange={(e) =>
                      handleFormFields("attendanceType", index, e.target.value)
                    }
                    value={item.attendanceType}
                    error={""}
                  />
                </Col>

                <Col span={8}>
                  {item.attendanceType == "Link" ? (
                    <CommonInputField
                      label="Attendance Sheet Link"
                      required={true}
                      onChange={(e) =>
                        handleFormFields(
                          "attendance_sheetlink",
                          index,
                          e.target.value,
                        )
                      }
                      value={item.attendance_sheetlink}
                      error={item.attendance_sheetlink_error}
                      errorFontSize={"9px"}
                    />
                  ) : (
                    <>
                      <ImageUploadCrop
                        label="Attendance Screenshot"
                        aspect={1}
                        maxSizeMB={1}
                        required={true}
                        value={item.attendance_screenshot}
                        onChange={(base64) =>
                          handleFormFields(
                            "attendance_screenshot",
                            index,
                            base64,
                          )
                        }
                        onErrorChange={(error) =>
                          handleFormFields(
                            "attendance_screenshot_error",
                            index,
                            error,
                          )
                        } // ✅ pass setter directly
                      />
                      {item.attendance_screenshot_error ? (
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#d32f2f",
                            marginTop: 4,
                          }}
                        >
                          {`Attendance Screenshot ${item.attendance_screenshot_error}`}
                        </p>
                      ) : (
                        ""
                      )}
                    </>
                  )}
                </Col>
              </Row>

              <Row
                gutter={16}
                className="trainerpaymentrequest_addrequestdrawer_rowcontainer"
                style={{
                  marginTop:
                    item.attendanceType == "Screenshot" ? "20px" : "30px",
                  marginBottom: item.streams_error ? "30px" : "0px",
                }}
              >
                <Col span={8}>
                  <CommonSelectField
                    label="Streams"
                    options={streamOptions}
                    required={true}
                    onChange={(e) =>
                      handleFormFields("streams", index, e.target.value)
                    }
                    value={item.streams}
                    error={item.streams_error}
                  />
                </Col>

                {editRequestItem ? (
                  ""
                ) : (
                  <Col span={8}>
                    <div
                      style={{
                        marginTop: "10px",
                        display: "flex",
                        gap: "6px",
                        alignItems: "center",
                      }}
                    >
                      <p className="leads_serverrequired_label">Discontinued</p>
                      <Switch
                        style={{ color: "#333" }}
                        checked={isDisContinued}
                        onChange={(checked) => {
                          setIsDisContinued(checked);
                          if (checked == true) {
                            const result = keepOnlyIndex(formFields, index);
                            setFormFields(result);
                          }
                        }}
                        className="leads_serverrequired_switch"
                      />
                    </div>
                  </Col>
                )}

                <Col span={8}>
                  {isDisContinued ? (
                    <CommonInputField
                      label="Request Amount"
                      required={true}
                      onChange={(e) => {
                        const input = e.target.value;

                        // Allow numbers, decimal point, or empty string
                        if (!/^\d*\.?\d*$/.test(input)) return;

                        setRequestAmount(input);
                        setRequestAmountError(selectValidator(input));
                      }}
                      value={requestAmount}
                      error={requestAmountError}
                    />
                  ) : (
                    <>
                      {editRequestItem ? (
                        ""
                      ) : (
                        <Button
                          className="trainerpaymentrequest_addrequestdrawer_deletebutton"
                          onClick={() => {
                            removeFormFields(index);
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </>
                  )}
                </Col>
              </Row>

              {isDisContinued ? (
                <Row
                  gutter={16}
                  className="trainerpaymentrequest_addrequestdrawer_rowcontainer"
                  style={{ marginTop: "30px" }}
                >
                  <Col span={8}>
                    {editRequestItem ? (
                      ""
                    ) : (
                      <Button
                        className="trainerpaymentrequest_addrequestdrawer_deletebutton"
                        onClick={() => {
                          removeFormFields(index);
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </Col>
                </Row>
              ) : (
                ""
              )}

              <Divider className="customer_statusupdate_divider" />
            </>
          );
        })}

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
                <Divider className="customer_statusupdate_divider" />

                <p className="trainerpaymentrequest_traineraccountdetails_text">
                  Account Details
                </p>

                <Row
                  gutter={16}
                  style={{ marginTop: "20px" }}
                  className="trainerpaymentrequest_addrequestdrawer_rowcontainer"
                >
                  <Col span={12}>
                    <Row>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Account Holder Name
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <EllipsisTooltip
                          text={
                            item.account_holder_name
                              ? item.account_holder_name
                              : "-"
                          }
                          smallText={true}
                        />
                      </Col>
                    </Row>

                    <Row style={{ marginTop: "12px" }}>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Account Number
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <EllipsisTooltip
                          text={item.account_number ? item.account_number : "-"}
                          smallText={true}
                        />
                      </Col>
                    </Row>

                    <Row style={{ marginTop: "12px" }}>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            IFSC Code
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <EllipsisTooltip
                          text={item.ifsc_code ? item.ifsc_code : "-"}
                          smallText={true}
                        />
                      </Col>
                    </Row>
                  </Col>

                  <Col span={12}>
                    <Row>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Bank Name
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <EllipsisTooltip
                          text={item.bank_name ? item.bank_name : "-"}
                          smallText={true}
                        />
                      </Col>
                    </Row>

                    <Row style={{ marginTop: "12px" }}>
                      <Col span={12}>
                        <div className="customerdetails_rowheadingContainer">
                          <p className="customerdetails_rowheading">
                            Branch Name
                          </p>
                        </div>
                      </Col>
                      <Col span={12}>
                        <EllipsisTooltip
                          text={item.branch_name ? item.branch_name : "-"}
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

        {/* review screenshot modal */}
        <Modal
          title={reviewType}
          open={isOpenReviewModal}
          onCancel={() => {
            setIsOpenReviewModal(false);
            setReviewScreenshot("");
            setReviewType("");
          }}
          footer={false}
          width="32%"
          className="customer_paymentscreenshot_modal"
        >
          <div style={{ overflow: "hidden", maxHeight: "100vh" }}>
            <PrismaZoom>
              {reviewScreenshot ? (
                <img
                  src={`data:image/png;base64,${reviewScreenshot}`}
                  alt="payment screenshot"
                  className="customer_paymentscreenshot_image"
                />
              ) : (
                "-"
              )}
            </PrismaZoom>
          </div>
        </Modal>
      </div>
    );
  },
);

export default AddTrainerPaymentRequest;
