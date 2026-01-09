import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Row, Col, Tooltip, Drawer, Modal } from "antd";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import CommonSelectField from "../Common/CommonSelectField";
import CommonInputField from "../Common/CommonInputField";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import CommonCustomerSelectField from "../Common/CommonCustomerSelect";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { FaRegEye } from "react-icons/fa";
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

const AddTrainerPaymentRequest = forwardRef(
  (
    {
      trainersData,
      editRequestItem,
      setButtonLoading,
      callgetTrainerPaymentsApi,
    },
    ref
  ) => {
    //select trainer usestates
    const [trainerId, setTrainerId] = useState(null);
    const [trainerIdError, setTrainerIdError] = useState("");
    const [trainerType, setTrainerType] = useState("");
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
    const [streamId, setStreamId] = useState("");
    const [streamIdError, setStreamIdError] = useState("");
    const attendanceStatusOptions = [
      { id: "V Completed", name: "V Completed" },
      { id: "ST SHT INC", name: "ST SHT INC" },
      { id: "Class Not Completed", name: "Class Not Completed" },
    ];
    const [attendanceStatusId, setAttendanceStatusId] = useState("");
    const [attendanceStatusIdError, setAttendanceStatusIdError] = useState("");
    const attendanceTypeOptions = [
      { id: "Link", name: "Link" },
      { id: "Screenshot", name: "Screenshot" },
    ];
    const [attendanceType, setAttendanceType] = useState("Link");
    const [attendanceTypeError, setAttendanceTypeError] = useState("");
    const [attendanceScreenShotBase64, setAttendanceScreenShotBase64] =
      useState("");
    const [
      attendanceScreenShotBase64Error,
      setAttendanceScreenShotBase64Error,
    ] = useState("");
    const [attendanceSheetLink, setAttendanceSheetLink] = useState("");
    const [attendanceSheetLinkError, setAttendanceSheetLinkError] =
      useState("");
    const [commercial, setCommercial] = useState(null);
    const [commercialError, setCommercialError] = useState();
    const [commercialPercentage, setCommercialPercentage] = useState("");
    const [daysTakenToPay, setDaysTakenToPay] = useState("");
    const [deadLineDate, setDeadLineDate] = useState(null);
    const [customersData, setCustomersData] = useState([]);
    const [customerId, setCustomerId] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedCustomerError, setSelectedCustomerError] = useState("");
    const [customerSearchText, setCustomerSearchText] = useState("");
    const [requestComments, setRequsetComments] = useState("");
    const [requestCommentsError, setRequsetCommentsError] = useState("");
    const [isOpenCustomerDetailsDrawer, setIsOpenCustomerDetailsDrawer] =
      useState(false);
    const [customerDetails, setCustomerDetails] = useState(null);
    const [validationTrigger, setValidationTrigger] = useState(false);
    //customer pagination
    const [customerPage, setCustomerPage] = useState(1);
    const [customerHasMore, setCustomerHasMore] = useState(true);
    const [customerSelectloading, setCustomerSelectloading] = useState(false);
    const [candidateIdError, setCandidateIdError] = useState("");

    useEffect(() => {
      getCustomersData(null, 1);
    }, []);

    useEffect(() => {
      if (editRequestItem) {
        setBillRaiseDate(editRequestItem.bill_raisedate);
        setStreamId(editRequestItem.streams);
        setAttendanceStatusId(editRequestItem.attendance_status);
        setAttendanceSheetLink(editRequestItem.attendance_sheetlink);
        setAttendanceScreenShotBase64(editRequestItem.attendance_screenshot);
        if (editRequestItem.attendance_sheetlink) {
          setAttendanceType("Link");
        } else {
          setAttendanceType("Screenshot");
        }
        setTrainerId(editRequestItem.trainer_id);
        setDaysTakenToPay(editRequestItem.days_taken_topay);
        setDeadLineDate(editRequestItem.deadline_date);
        getParticularCustomerDetails(editRequestItem.customer_email, true);
      } else {
        formReset();
      }
    }, [editRequestItem]);

    const buildCustomerSearchPayload = (value) => {
      if (!value) return {};

      const trimmed = value.trim();

      // Email
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return { email: trimmed };
      }

      // Mobile (6–15 digits)
      if (/^\d{6,15}$/.test(trimmed)) {
        return { mobile: trimmed };
      }

      // Name
      return { name: trimmed };
    };

    const getCustomersData = async (searchvalue, pageNumber = 1) => {
      setCustomerSelectloading(true);

      const searchPayload = buildCustomerSearchPayload(searchvalue);

      const payload = {
        ...searchPayload,
        user_ids: null,
        page: pageNumber,
        limit: 10,
      };

      try {
        const response = await getCustomers(payload);
        const customers = response?.data?.data?.customers || [];
        const pagination = response?.data?.data?.pagination;

        setCustomersData((prev) =>
          pageNumber == 1 ? customers : [...prev, ...customers]
        );

        setCustomerHasMore(pageNumber < pagination.totalPages);
        setCustomerPage(pageNumber);
      } catch (error) {
        console.log("get customers error", error);
      } finally {
        setCustomerSelectloading(false);
      }
    };

    const getDayDifference = (inputDate) => {
      const today = new Date();
      const given = new Date(inputDate);

      // normalize both to UTC midnight
      const utcToday = Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      const utcGiven = Date.UTC(
        given.getFullYear(),
        given.getMonth(),
        given.getDate()
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

    //onchange customer select
    const handleCustomerSearch = (value) => {
      setCustomerSearchText(value);
      setCustomerPage(1);
      setCustomerHasMore(true);
      setCustomersData([]);
      getCustomersData(value, 1);
    };

    // ✅ Select option
    const handleCustomerSelect = (event, option) => {
      if (!option) return;

      setSelectedCustomer(option);
      if (validationTrigger) {
        setSelectedCustomerError(selectValidator(option));
      }
      setCustomerId(option.id);
      getParticularCustomerDetails(option.email);
    };

    // ⬇ Load first page when opened
    const handleCustomerDropdownOpen = () => {
      if (customersData.length === 0) getCustomersData(null, 1);
    };

    // ⬇ Infinite scroll
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

    const getParticularCustomerDetails = async (
      customerEmail,
      isEdit = false
    ) => {
      const payload = {
        email: customerEmail ? customerEmail : selectedCustomer.email,
      };
      try {
        const response = await getCustomers(payload);
        const customer_details = response?.data?.data?.customers[0];
        console.log("customer full details", customer_details);
        setCustomerDetails(customer_details);
        if (customerEmail) {
          setIsOpenCustomerDetailsDrawer(false);
        } else {
          setIsOpenCustomerDetailsDrawer(true);
        }
        if (isEdit) {
          setSelectedCustomer(customer_details);
        }
        //mapping trainer details
        if (customer_details.trainer_verified_date) {
          setTrainerId(customer_details?.trainer_id ?? null);
          setTrainerIdError("");
          setCommercial(customer_details?.commercial ?? "");
          setCommercialPercentage(
            customer_details?.commercial_percentage !== null &&
              customer_details?.commercial_percentage !== undefined &&
              customer_details?.commercial_percentage !== ""
              ? customer_details.commercial_percentage
              : ""
          );
        } else if (customerEmail) {
          setTrainerId(null);
          if (validationTrigger) {
            setTrainerIdError(" is required");
          }
          setCommercial("");
          setCommercialPercentage("");
          CommonMessage("error", "Trainer not Assigned or Verified Yet");
        }
      } catch (error) {
        console.log("getcustomer by id error", error);
        setCustomerDetails(null);
      }
    };

    useImperativeHandle(ref, () => ({
      handleRequestSubmit,
    }));

    const handleRequestSubmit = async () => {
      setValidationTrigger(true);
      const raiseDateValidate = selectValidator(billRaiseDate);
      const streamValidate = selectValidator(streamId);
      const attendanceStatusIdValidate = selectValidator(attendanceStatusId);
      const attendanceTypeValidate = selectValidator(attendanceType);
      const trainerValidate = selectValidator(trainerId);
      let attendanceSheetValidate;
      let attendanceScreenshotValidate;

      if (attendanceType == "Link") {
        attendanceSheetValidate = addressValidator(attendanceSheetLink);
        attendanceScreenshotValidate = "";
      } else {
        attendanceSheetValidate = "";
        attendanceScreenshotValidate = selectValidator(
          attendanceScreenShotBase64
        );
      }

      setBillRaiseDateError(raiseDateValidate);
      setStreamIdError(streamValidate);
      setAttendanceStatusIdError(attendanceStatusIdValidate);
      setAttendanceTypeError(attendanceTypeValidate);
      setAttendanceSheetLinkError(attendanceSheetValidate);
      setAttendanceScreenShotBase64Error(attendanceScreenshotValidate);
      setTrainerIdError(trainerValidate);

      if (
        raiseDateValidate ||
        streamValidate ||
        attendanceStatusIdValidate ||
        attendanceTypeValidate ||
        attendanceSheetValidate ||
        attendanceScreenshotValidate ||
        trainerValidate
      )
        return;

      setButtonLoading(true);
      const today = new Date();
      const payload = {
        ...(editRequestItem && { id: editRequestItem.id }),
        bill_raisedate: moment(billRaiseDate).format("YYYY-MM-DD"),
        streams: streamId,
        attendance_status: attendanceStatusId,
        ...(attendanceType == "Link"
          ? { attendance_sheetlink: attendanceSheetLink }
          : { attendance_screenshot: attendanceScreenShotBase64 }),
        customer_id: selectedCustomer.id,
        trainer_id: trainerId,
        request_amount: commercial,
        commercial_percentage: commercialPercentage,
        days_taken_topay: daysTakenToPay,
        deadline_date: moment(deadLineDate).format("YYYY-MM-DD"),
        status: "Requested",
        created_date: formatToBackendIST(today),
      };
      console.log("payloaddd", payload);
      // setButtonLoading(false);
      // return;

      if (editRequestItem) {
        try {
          await updateTrainerPaymentRequest(payload);
          setTimeout(() => {
            CommonMessage("success", "Updated Successfully");
            formReset();
            // Refresh the payment requests data
            callgetTrainerPaymentsApi();
          }, 300);
        } catch (error) {
          setButtonLoading(false);
          CommonMessage(
            "error",
            error?.response?.data?.details ||
              "Something went wrong. Try again later"
          );
        }
      } else {
        try {
          await insertTrainerPaymentRequest(payload);
          setTimeout(() => {
            CommonMessage("success", "Requested Successfully");
            formReset();
            // Refresh the payment requests data
            callgetTrainerPaymentsApi();
          }, 300);
        } catch (error) {
          setButtonLoading(false);
          CommonMessage(
            "error",
            error?.response?.data?.message ||
              "Something went wrong. Try again later"
          );
        }
      }
    };

    const formReset = () => {
      setButtonLoading(false);
      setBillRaiseDate(null);
      setBillRaiseDateError("");
      setStreamId("");
      setStreamIdError("");
      setAttendanceStatusId("");
      setAttendanceStatusIdError("");
      setAttendanceType("Link");
      setAttendanceTypeError("");
      setAttendanceScreenShotBase64("");
      setAttendanceScreenShotBase64Error("");
      setAttendanceSheetLink("");
      setAttendanceSheetLinkError("");
      setCommercial("");
      setCommercialError("");
      setCommercialPercentage("");
      setTrainerId(null);
      setTrainerIdError("");
      setDaysTakenToPay("");
      setDeadLineDate(null);
      setCustomerId(null);
      setCustomerSearchText("");
      setSelectedCustomer(null);
      setSelectedCustomerError("");
    };

    return (
      <div>
        <Row gutter={16} style={{ marginTop: "14px" }}>
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
            <CommonSelectField
              label="Streams"
              options={streamOptions}
              required={true}
              onChange={(e) => {
                setStreamId(e.target.value);
                if (validationTrigger) {
                  setStreamIdError(selectValidator(e.target.value));
                }
              }}
              value={streamId}
              error={streamIdError}
            />
          </Col>

          <Col span={8}>
            <CommonSelectField
              label="Attendance Status"
              options={attendanceStatusOptions}
              required={true}
              onChange={(e) => {
                setAttendanceStatusId(e.target.value);
                if (validationTrigger) {
                  setAttendanceStatusIdError(selectValidator(e.target.value));
                }
              }}
              value={attendanceStatusId}
              error={attendanceStatusIdError}
              errorFontSize={"10px"}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={8}>
            <CommonSelectField
              label="Attendance Type"
              required={true}
              options={attendanceTypeOptions}
              onChange={(e) => {
                setAttendanceType(e.target.value);
                if (validationTrigger) {
                  setAttendanceTypeError(selectValidator(e.target.value));
                }
              }}
              value={attendanceType}
              error={attendanceTypeError}
            />
          </Col>
          <Col span={8}>
            {attendanceType == "Link" ? (
              <CommonInputField
                label="Attendance Sheet Link"
                required={true}
                onChange={(e) => {
                  setAttendanceSheetLink(e.target.value);
                  if (validationTrigger) {
                    setAttendanceSheetLinkError(
                      addressValidator(e.target.value)
                    );
                  }
                }}
                value={attendanceSheetLink}
                error={attendanceSheetLinkError}
                errorFontSize={"9px"}
              />
            ) : (
              <>
                <ImageUploadCrop
                  label="Attendance Screenshot"
                  aspect={1}
                  maxSizeMB={1}
                  required={true}
                  value={attendanceScreenShotBase64}
                  onChange={(base64) => setAttendanceScreenShotBase64(base64)}
                  onErrorChange={setAttendanceScreenShotBase64Error} // ✅ pass setter directly
                />
                {attendanceScreenShotBase64Error && validationTrigger ? (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#d32f2f",
                      marginTop: 4,
                    }}
                  >
                    {`Attendance Screenshot ${attendanceScreenShotBase64Error}`}
                  </p>
                ) : (
                  ""
                )}
              </>
            )}
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
                <CommonCustomerSelectField
                  label="Select Customer"
                  required={true}
                  options={customersData}
                  value={selectedCustomer}
                  onChange={handleCustomerSelect}
                  onInputChange={handleCustomerSearch}
                  onDropdownOpen={handleCustomerDropdownOpen}
                  onDropdownScroll={handleCustomerScroll}
                  loading={customerSelectloading}
                  showLabelStatus="Name"
                  onBlur={() => {
                    getCustomersData(null, 1);
                  }}
                  error={selectedCustomerError}
                />
              </div>
              {selectedCustomer && (
                <Tooltip
                  placement="top"
                  title="View Customer Details"
                  trigger={["hover", "click"]}
                >
                  <FaRegEye
                    size={16}
                    className="trainers_action_icons"
                    onClick={() => getParticularCustomerDetails(null)}
                  />
                </Tooltip>
              )}
            </div>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: "30px" }}>
          <Col span={8}>
            <CommonOutlinedInput
              label="Commercial"
              type="number"
              required={true}
              onChange={(e) => {
                setCommercial(e.target.value);
                if (validationTrigger) {
                  setCommercialError(selectValidator(e.target.value));
                }
              }}
              value={commercial}
              error={commercialError}
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
                commercialPercentage !== "" ? String(commercialPercentage) : ""
              }
              disabled={true}
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
                  onChange={(e) => {
                    setTrainerId(e.target.value);
                    if (validationTrigger) {
                      setTrainerIdError(selectValidator(e.target.value));
                    }
                    // getCustomerByTrainerIdData(e.target.value, 0);
                  }}
                  value={trainerId}
                  error={trainerIdError}
                  disabled={true}
                />
              </div>
              {trainerId && (
                <Tooltip
                  placement="top"
                  title="View Trainer Details"
                  trigger={["hover", "click"]}
                >
                  <FaRegEye
                    size={16}
                    className="trainers_action_icons"
                    onClick={() => {
                      const clickedTrainer = trainersData.filter(
                        (f) => f.id == trainerId
                      );
                      console.log("clickedTrainer", clickedTrainer);
                      setTrainerType(
                        clickedTrainer.length >= 1 &&
                          clickedTrainer[0].trainer_type
                          ? clickedTrainer[0].trainer_type
                          : ""
                      );
                      setClickedTrainerDetails(clickedTrainer);
                      setIsOpenTrainerDetailModal(true);
                    }}
                  />
                </Tooltip>
              )}
            </div>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px" }}>
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
          {/* <Col span={8}>
            <CommonInputField
              label="Comments"
              required={true}
              multiline={true}
              onChange={(e) => {
                setRequsetComments(e.target.value);
                setRequsetCommentsError(addressValidator(e.target.value));
              }}
              value={requestComments}
              error={requestCommentsError}
            />
          </Col> */}
        </Row>

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
          title="Trainer Full Details"
          open={isOpenTrainerDetailModal}
          onCancel={() => setIsOpenTrainerDetailModal(false)}
          footer={false}
          width="50%"
        >
          {clickedTrainerDetails.map((item, index) => {
            return (
              <Row gutter={16} style={{ marginTop: "20px" }}>
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
                              "hh:mm A"
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
                              "hh:mm A"
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
            );
          })}
        </Modal>
      </div>
    );
  }
);

export default AddTrainerPaymentRequest;
