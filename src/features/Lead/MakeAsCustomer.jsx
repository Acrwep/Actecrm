import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Row, Col, Switch, Divider } from "antd";
import { Country, State } from "country-state-city";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { SlGlobe } from "react-icons/sl";
import EllipsisTooltip from "../Common/EllipsisTooltip";
import CommonSelectField from "../Common/CommonSelectField";
import CommonInputField from "../Common/CommonInputField";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import CommonGroupedSelectField from "../Common/CommonGroupedSelectField";
import {
  leadPayment,
  sendCustomerFormEmail,
  sendCustomerPaymentVerificationEmail,
  sendCustomerWelcomeEmail,
} from "../ApiService/action";
import {
  addressValidator,
  calculateAmount,
  formatToBackendIST,
  getBalanceAmount,
  getConvenienceFees,
  priceValidator,
  selectValidator,
} from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import { useSelector } from "react-redux";

const MakeAsCustomer = forwardRef(
  (
    {
      clickedLeadItem,
      raUsers,
      allBranchesData,
      setButtonLoading,
      callgetLeadsApi,
    },
    ref,
  ) => {
    const courseOptions = useSelector((state) => state.courselist);

    const [customerJoiningDate, setCustomerJoiningDate] = useState(null);
    const [customerJoiningDateError, setCustomerJoiningDateError] =
      useState(null);
    const [selectedRA, setSelectedRA] = useState(null);
    const [paymentDate, setPaymentDate] = useState(null);
    const [paymentDateError, setPaymentDateError] = useState("");
    const [placeOfPayment, setPlaceOfPayment] = useState(null);
    const [placeOfPaymentError, setPlaceOfPaymentError] = useState("");
    const [placeOfService, setPlaceOfService] = useState("");
    const [placeOfServiceError, setPlaceOfServiceError] = useState("");
    const [placeOfBranch, setPlaceOfBranch] = useState("");
    const [placeOfBranchError, setPlaceOfBranchError] = useState("");
    const [paymentMode, setPaymentMode] = useState(null);
    const [paymentModeError, setPaymentModeError] = useState(null);
    const [subTotal, setSubTotal] = useState();
    const [convenienceFees, setConvenienceFees] = useState("");
    const [taxType, setTaxType] = useState("");
    const [taxTypeError, setTaxTypeError] = useState("");
    const [amount, setAmount] = useState();
    const [paidNow, setPaidNow] = useState("");
    const [paidNowError, setPaidNowError] = useState("");
    const [paymentScreenShotBase64, setPaymentScreenShotBase64] = useState("");
    const [paymentScreenShotError, setPaymentScreenShotError] = useState("");
    const [paymentValidationTrigger, setPaymentValidationTrigger] =
      useState(false);
    const [balanceAmount, setBalanceAmount] = useState();
    const [isShowDueDate, setIsShowDueDate] = useState(true);
    const [dueDate, setDueDate] = useState(null);
    const [dueDateError, setDueDateError] = useState("");
    const [customerCourseId, setCustomerCourseId] = useState(null);
    const batchTrackOptions = [
      {
        id: 1,
        name: "Normal",
      },
      {
        id: 2,
        name: "Fastrack",
      },
      {
        id: 3,
        name: "Custom",
      },
    ];
    const [customerBatchTrackId, setCustomerBatchTrackId] = useState(null);
    const batchTimingOptions = [
      {
        id: 1,
        name: "Week Day",
      },
      {
        id: 2,
        name: "Week End",
      },
      {
        id: 3,
        name: "Fast Track",
      },
    ];
    const [customerBatchTimingId, setCustomerBatchTimingId] = useState(null);
    const [customerBatchTimingIdError, setCustomerBatchTimingIdError] =
      useState("");
    const [currentLocation, setCurrentLocation] = useState("");
    const [currentLocationError, setCurrentLocationError] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [customerAddressError, setCustomerAddressError] = useState("");
    const [gstNumber, setGstNumber] = useState("");
    const [placementSupport, setPlacementSupport] = useState(null);
    const [placementSupportError, setPlacementSupportError] = useState("");
    const [serverRequired, setServerRequired] = useState(false);

    useEffect(() => {
      console.log("allBranchesData", allBranchesData);
      setSubTotal(parseFloat(clickedLeadItem.primary_fees));
      setAmount(parseFloat(clickedLeadItem.primary_fees));
      setBalanceAmount(parseFloat(clickedLeadItem.primary_fees));
      setCustomerCourseId(clickedLeadItem.primary_course_id);
      setCustomerBatchTrackId(clickedLeadItem.batch_track_id);
    }, []);

    //onchange functions
    const getCountryName = (countryCode) => {
      let countryName = "";
      const countries = Country.getAllCountries();

      const findCountry = countries.find((f) => f.isoCode == countryCode);

      if (findCountry) {
        countryName = findCountry.name;
      } else {
        countryName = "";
      }
      return countryName;
    };

    const getStateName = (countryCode, stateCode) => {
      const stateList = State.getStatesOfCountry(countryCode);
      const updateSates = stateList.map((s) => {
        return { ...s, id: s.isoCode };
      });

      let stateName = "";

      const findState = updateSates.find((f) => f.id == stateCode);
      if (findState) {
        stateName = findState.name;
      } else {
        stateName = "";
      }
      return stateName;
    };

    const handleSelectRA = async (e) => {
      const value = e.target.value;
      console.log("selected raaa", value);

      setSelectedRA(value);
    };

    const handlePaidNow = (e) => {
      const input = e.target.value;

      // Allow numbers, decimal point, or empty string
      if (!/^\d*\.?\d*$/.test(input)) return;

      setPaidNow(input); // store as string for user input

      const value = parseFloat(input); // parse for calculations
      const amt = parseFloat(amount);

      if (value < amt || isNaN(value) || input == "" || input == null) {
        setIsShowDueDate(true);
      } else {
        setIsShowDueDate(false);
        setDueDate(null);
        setDueDateError("");
      }

      setBalanceAmount(
        getBalanceAmount(isNaN(amt) ? 0 : amt, isNaN(value) ? 0 : value),
      );

      if (paymentMode == 2 || paymentMode == 5 || paymentMode == 10) {
        const conve_fees = getConvenienceFees(isNaN(value) ? 0 : value);
        setConvenienceFees(conve_fees);
      } else {
        setConvenienceFees(0);
      }

      if (paymentValidationTrigger) {
        setPaidNowError(
          priceValidator(isNaN(value) ? 0 : value, parseFloat(amt)),
        );
      }
    };

    const handleTaxType = (e) => {
      setTaxType(e.target.value);
      if (paymentValidationTrigger) {
        setTaxTypeError(selectValidator(e.target.value));
      }
      const amnt = calculateAmount(
        parseFloat(subTotal),
        e.target.value == 5 ? 0 : 18,
      );
      if (isNaN(amnt)) {
        setAmount("");
      } else {
        setAmount(parseFloat(amnt));
      }

      //handle balance amount
      if (
        paidNow < amnt ||
        isNaN(paidNow) ||
        paidNow == "" ||
        paidNow == null
      ) {
        setIsShowDueDate(true);
      } else {
        setIsShowDueDate(false);
        setDueDate(null);
        setDueDateError("");
      }
      setBalanceAmount(
        getBalanceAmount(isNaN(amnt) ? 0 : amnt, isNaN(paidNow) ? 0 : paidNow),
      );
    };

    const handlePaymentMode = (value) => {
      setPaymentMode(value);
      console.log("taxType", taxType);
      const amnt = calculateAmount(
        parseFloat(subTotal),
        taxType == 5 || taxType == "" || taxType == null ? 0 : 18,
      );
      setAmount(amnt);

      if (paymentValidationTrigger) {
        setPaymentModeError(selectValidator(value));
      }

      //handle balance amount
      if (
        paidNow < amnt ||
        isNaN(paidNow) ||
        paidNow === "" ||
        paidNow === null
      ) {
        setIsShowDueDate(true);
      } else {
        setIsShowDueDate(false);
        setDueDate(null);
        setDueDateError("");
      }
      setBalanceAmount(
        getBalanceAmount(isNaN(amnt) ? 0 : amnt, isNaN(paidNow) ? 0 : paidNow),
      );

      //handle convenience fees
      if (value == 2 || value == 5 || value == 10) {
        const conve_fees = getConvenienceFees(paidNow ? paidNow : 0);
        setConvenienceFees(conve_fees);
      } else {
        setConvenienceFees(0);
      }
    };

    useImperativeHandle(ref, () => ({
      handlePaymentSubmit,
    }));

    const handlePaymentSubmit = async () => {
      setPaymentValidationTrigger(true);
      const taxTypeValidate = selectValidator(taxType);
      const paymentTypeValidate = selectValidator(paymentMode);
      const paymentDateValidate = selectValidator(paymentDate);
      const customerJoiningDateValidate = selectValidator(customerJoiningDate);
      const placeOfPaymentValidate = selectValidator(placeOfPayment);
      const placeOfServiceValidate = selectValidator(placeOfService);
      const placeOfBranchValidate =
        placeOfService == 10 ? "" : selectValidator(placeOfBranch);
      const batchTimingValidate = selectValidator(customerBatchTimingId);
      const currentLocationValidate = addressValidator(currentLocation);
      const customerAddressValidate = addressValidator(customerAddress);
      const placementSupportValidate = selectValidator(placementSupport);

      console.log("eeeee", paidNow, amount);
      const paidNowValidate = priceValidator(
        parseInt(paidNow),
        parseInt(amount),
      );

      const screenshotValidate = selectValidator(paymentScreenShotBase64);
      let dueDateValidate;

      if (isShowDueDate) {
        dueDateValidate = selectValidator(dueDate);
      } else {
        dueDateValidate = "";
      }

      setTaxTypeError(taxTypeValidate);
      setPaymentModeError(paymentTypeValidate);
      setPaidNowError(paidNowValidate);
      setPaymentDateError(paymentDateValidate);
      setCustomerJoiningDateError(customerJoiningDateValidate);
      setPlaceOfPaymentError(placeOfPaymentValidate);
      setPlaceOfServiceError(placeOfServiceValidate);
      setPlaceOfBranchError(placeOfBranchValidate);
      setPaymentScreenShotError(screenshotValidate);
      setDueDateError(dueDateValidate);
      setCustomerBatchTimingIdError(batchTimingValidate);
      setCurrentLocationError(currentLocationValidate);
      setCustomerAddressError(customerAddressValidate);
      setPlacementSupportError(placementSupportValidate);

      if (
        paymentTypeValidate ||
        paidNowValidate ||
        paymentDateValidate ||
        placeOfPaymentValidate ||
        screenshotValidate
      ) {
        setTimeout(() => {
          const container = document.getElementById(
            "leadmanager_paymentdetails_paymentinfo_heading",
          );
          container.scrollIntoView({ behavior: "smooth" });
        }, 200);
      }

      if (taxTypeValidate) {
        setTimeout(() => {
          const container = document.getElementById(
            "leadmanager_paymentdetails_heading",
          );
          container.scrollIntoView({ behavior: "smooth" });
        }, 200);
      }

      if (
        paymentTypeValidate ||
        paidNowValidate ||
        taxTypeValidate ||
        paymentDateValidate ||
        customerJoiningDateValidate ||
        placeOfPaymentValidate ||
        placeOfServiceValidate ||
        placeOfBranchValidate ||
        screenshotValidate ||
        dueDateValidate ||
        batchTimingValidate ||
        currentLocationValidate ||
        customerAddressValidate ||
        placementSupportValidate
      )
        return;

      setButtonLoading(true);

      const today = new Date();

      // Step 2: Calculate GST on discounted amount
      const gstAmount = amount - subTotal;

      console.log("GST Amount:", gstAmount);

      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);

      const payload = {
        lead_id: clickedLeadItem.id,
        invoice_date: formatToBackendIST(paymentDate),
        tax_type:
          taxType == 1
            ? "GST (18%)"
            : taxType == 2
              ? "SGST (18%)"
              : taxType == 3
                ? "IGST (18%)"
                : taxType == 4
                  ? "VAT (18%)"
                  : "No Tax",
        gst_percentage: taxType == 5 ? "0%" : "18%",
        gst_amount: parseFloat(gstAmount).toFixed(2),
        total_amount: amount,
        convenience_fees: convenienceFees,
        paymode_id: paymentMode,
        paid_amount: paidNow,
        payment_screenshot: paymentScreenShotBase64,
        payment_status: "Verify Pending",
        next_due_date: dueDate ? formatToBackendIST(dueDate) : null,
        date_of_joining: formatToBackendIST(customerJoiningDate),
        ra_id: selectedRA,
        created_date: formatToBackendIST(today),
        paid_date: formatToBackendIST(paymentDate),
        place_of_payment: placeOfPayment,
        place_of_service: placeOfService,
        place_of_branch: placeOfBranch,
        enrolled_course: customerCourseId,
        batch_track_id: customerBatchTrackId,
        batch_timing_id: customerBatchTimingId,
        place_of_supply: currentLocation,
        address: customerAddress,
        state_code: "",
        gst_number: gstNumber,
        placement_support: placementSupport,
        is_server_required: serverRequired,
        updated_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
      };

      console.log("payment payload", payload);

      try {
        const response = await leadPayment(payload);
        console.log("lead payment response", response);
        const createdCustomerDetails = response?.data?.data;
        CommonMessage("success", "Created as a Customer");
        setTimeout(() => {
          setButtonLoading(false);
          callgetLeadsApi();
          // if (import.meta.env.PROD) {
          handleSendCustomerFormLink(createdCustomerDetails);
          // }
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.message ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleSendCustomerFormLink = async (customerDetails) => {
      const payload = {
        email: customerDetails.email,
        link: `${import.meta.env.VITE_EMAIL_URL}/customer-registration/${
          customerDetails.insertId
        }`,
        customer_id: customerDetails.insertId,
      };

      try {
        await sendCustomerFormEmail(payload);
      } catch (error) {
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      } finally {
        setTimeout(() => {
          handleSendWelcomeEmail(customerDetails);
        }, 300);
      }
    };

    const handleSendWelcomeEmail = async (customerDetails) => {
      const payload = {
        email: customerDetails.email,
        name: customerDetails.name,
      };

      try {
        await sendCustomerWelcomeEmail(payload);
      } catch (error) {
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      } finally {
        setTimeout(() => {
          handleSendPaymentVerificationEmail(customerDetails);
        }, 300);
      }
    };

    const handleSendPaymentVerificationEmail = async (customerDetails) => {
      const payload = {
        email: customerDetails.email,
        name: customerDetails.name,
      };

      try {
        await sendCustomerPaymentVerificationEmail(payload);
      } catch (error) {
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    return (
      <div>
        <p className="leadfollowup_leaddetails_heading">Lead Details</p>
        <Row gutter={16} style={{ padding: "0px 0px 0px 24px" }}>
          <Col span={12}>
            <Row>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <FaRegCircleUser size={15} color="gray" />
                  <p className="customerdetails_rowheading">Name</p>
                </div>
              </Col>
              <Col span={12}>
                <EllipsisTooltip
                  text={
                    clickedLeadItem && clickedLeadItem.name
                      ? clickedLeadItem.name
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
                <EllipsisTooltip
                  text={
                    clickedLeadItem && clickedLeadItem.email
                      ? clickedLeadItem.email
                      : "-"
                  }
                  smallText={true}
                />
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
                <p className="customerdetails_text">
                  {clickedLeadItem && clickedLeadItem.phone
                    ? clickedLeadItem.phone
                    : "-"}
                </p>
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
                <p className="customerdetails_text">
                  {clickedLeadItem && clickedLeadItem.whatsapp
                    ? clickedLeadItem.whatsapp
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <SlGlobe size={15} color="gray" />
                  <p className="customerdetails_rowheading">Country</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {clickedLeadItem && clickedLeadItem.country
                    ? getCountryName(clickedLeadItem.country)
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <IoLocationOutline size={15} color="gray" />
                  <p className="customerdetails_rowheading">Area</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {clickedLeadItem && clickedLeadItem.area_id
                    ? clickedLeadItem.area_id
                    : "-"}
                </p>
              </Col>
            </Row>
          </Col>

          <Col span={12}>
            <Row>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Course</p>
                </div>
              </Col>
              <Col span={12}>
                <EllipsisTooltip
                  text={
                    clickedLeadItem && clickedLeadItem.primary_course
                      ? clickedLeadItem.primary_course
                      : "-"
                  }
                  smallText={true}
                />
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Course Fees</p>
                </div>
              </Col>
              <Col span={12}>
                <p
                  className="customerdetails_text"
                  style={{ color: "#333", fontWeight: 700 }}
                >
                  {clickedLeadItem && clickedLeadItem.primary_fees
                    ? "₹" + clickedLeadItem.primary_fees
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Branch</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {clickedLeadItem && clickedLeadItem.branch_name
                    ? clickedLeadItem.branch_name
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Batch Track</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {clickedLeadItem && clickedLeadItem.batch_track
                    ? clickedLeadItem.batch_track
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Lead Status</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {clickedLeadItem && clickedLeadItem.lead_status
                    ? clickedLeadItem.lead_status
                    : "-"}
                </p>
              </Col>
            </Row>

            <Row style={{ marginTop: "12px" }}>
              <Col span={12}>
                <div className="customerdetails_rowheadingContainer">
                  <p className="customerdetails_rowheading">Lead Executive</p>
                </div>
              </Col>
              <Col span={12}>
                <p className="customerdetails_text">
                  {`${
                    clickedLeadItem && clickedLeadItem.lead_assigned_to_id
                      ? clickedLeadItem.lead_assigned_to_id
                      : "-"
                  } (${
                    clickedLeadItem && clickedLeadItem.lead_assigned_to_name
                      ? clickedLeadItem.lead_assigned_to_name
                      : "-"
                  })`}
                </p>
              </Col>
            </Row>
          </Col>
        </Row>

        <Divider className="leadmanger_paymentdrawer_divider" />

        <>
          <p
            className="leadmanager_paymentdetails_drawer_heading"
            id="leadmanager_paymentdetails_heading"
          >
            Payment Details
          </p>
          <Row
            gutter={16}
            className="leadmanager_paymentdetails_drawer_rowdiv"
            style={{ marginTop: "20px", marginBottom: "30px" }}
          >
            <Col span={8}>
              <CommonInputField
                label="Fees"
                required={true}
                type="number"
                value={subTotal}
                disabled={true}
                height={"36px"}
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
              />
            </Col>
            <Col span={8}>
              <CommonSelectField
                label="Tax Type"
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
                required={true}
                options={[
                  { id: 1, name: "GST (18%)" },
                  { id: 2, name: "SGST (18%)" },
                  { id: 3, name: "IGST (18%)" },
                  { id: 4, name: "VAT (18%)" },
                  { id: 5, name: "No Tax" },
                ]}
                onChange={handleTaxType}
                value={taxType}
                error={taxTypeError}
                height={"36px"}
                fontSize={"12px"}
                errorFontSize={"9px"}
              />
            </Col>
            <Col span={8}>
              <CommonInputField
                label="Total Amount"
                required={true}
                disabled
                value={amount}
                height={"36px"}
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
              />
            </Col>
          </Row>

          <Divider className="leadmanger_paymentdrawer_divider" />

          <p
            className="leadmanager_paymentdetails_drawer_heading"
            id="leadmanager_paymentdetails_paymentinfo_heading"
          >
            Payment Info
          </p>

          <Row
            gutter={16}
            className="leadmanager_paymentdetails_drawer_rowdiv"
            style={{ marginTop: "20px" }}
          >
            <Col span={8}>
              <CommonInputField
                label="Pay Amount"
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
                required={true}
                onChange={handlePaidNow}
                value={paidNow}
                error={paidNowError}
                errorFontSize="9px"
              />
            </Col>
            <Col span={8}>
              <CommonGroupedSelectField
                label="Payment Mode"
                onChange={handlePaymentMode}
                value={paymentMode}
                error={paymentModeError}
                height={"36px"}
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
                errorFontSize="9px"
              />
            </Col>
            <Col span={8}>
              <CommonInputField
                label="Convenience fees"
                required={true}
                value={convenienceFees}
                disabled={true}
                type="number"
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
              />
            </Col>
          </Row>

          <Row
            gutter={16}
            className="leadmanager_paymentdetails_drawer_rowdiv"
            style={{ marginTop: "40px" }}
          >
            <Col span={8}>
              <CommonMuiDatePicker
                label="Payment Date"
                required={true}
                onChange={(value) => {
                  setPaymentDate(value);
                  if (paymentValidationTrigger) {
                    setPaymentDateError(selectValidator(value));
                  }
                }}
                value={paymentDate}
                error={paymentDateError}
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
                errorFontSize={"9px"}
              />
            </Col>
            <Col span={8}>
              <CommonSelectField
                label="Place of Payment"
                required={true}
                options={[
                  { id: "Tamil Nadu", name: "Tamil Nadu" },
                  { id: "Out of TN", name: "Out of TN" },
                  { id: "Out of IND", name: "Out of IND" },
                ]}
                onChange={(e) => {
                  setPlaceOfPayment(e.target.value);
                  if (paymentValidationTrigger) {
                    setPlaceOfPaymentError(selectValidator(e.target.value));
                  }
                }}
                value={placeOfPayment}
                error={placeOfPaymentError}
                height={"36px"}
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
                errorFontSize={"9px"}
              />
            </Col>
            <Col span={8}>
              <ImageUploadCrop
                label="Payment Screenshot"
                aspect={1}
                maxSizeMB={1}
                required={true}
                value={paymentScreenShotBase64}
                onChange={(base64) => setPaymentScreenShotBase64(base64)}
                onErrorChange={setPaymentScreenShotError} // ✅ pass setter directly
              />
              {paymentScreenShotError && (
                <p style={{ fontSize: "10px", color: "#d32f2f", marginTop: 4 }}>
                  {`Payment Screenshot ${paymentScreenShotError}`}
                </p>
              )}
            </Col>
          </Row>

          <Divider className="leadmanger_paymentdrawer_divider" />

          <p className="leadmanager_paymentdetails_drawer_heading">
            Balance Amount Details
          </p>

          <Row
            gutter={16}
            style={{ marginTop: "20px", marginBottom: "30px" }}
            className="leadmanager_paymentdetails_drawer_rowdiv"
          >
            <Col span={8}>
              <CommonInputField
                label="Balance Amount"
                required={true}
                value={balanceAmount}
                disabled={true}
                type="number"
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
                errorFontSize={"9px"}
              />
            </Col>
            {isShowDueDate ? (
              <Col span={8}>
                <CommonMuiDatePicker
                  label="Next Due Date"
                  required={true}
                  onChange={(value) => {
                    setDueDate(value);
                    setDueDateError(selectValidator(value));
                  }}
                  value={dueDate}
                  error={dueDateError}
                  disablePreviousDates={true}
                  labelFontSize={"11px"}
                  labelMarginTop={"1px"}
                  errorFontSize={"9px"}
                />
              </Col>
            ) : (
              ""
            )}
          </Row>

          <Divider className="leadmanger_paymentdrawer_divider" />

          <p className="leadmanager_paymentdetails_drawer_heading">
            Add Customer Details
          </p>

          <Row
            gutter={[16, 30]}
            style={{ marginTop: "20px", marginBottom: "50px" }}
            className="leadmanager_paymentdetails_drawer_rowdiv"
          >
            <Col span={8}>
              <CommonMuiDatePicker
                label="Customer Joining Date"
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
                required={true}
                onChange={(value) => {
                  console.log("vallll", value);
                  setCustomerJoiningDate(value);
                  if (paymentValidationTrigger) {
                    setCustomerJoiningDateError(selectValidator(value));
                  }
                }}
                value={customerJoiningDate}
                error={customerJoiningDateError}
                errorFontSize={"9px"}
                disablePreviousDates={false}
              />
            </Col>

            <Col span={8}>
              <CommonSelectField
                width="100%"
                label="Place Of Service"
                labelMarginTop={"1px"}
                labelFontSize={"11px"}
                options={[
                  { id: 1, name: "Online" },
                  { id: 2, name: "Classroom" },
                ]}
                onChange={(e) => {
                  const value = e.target.value;
                  setPlaceOfService(value);
                  if (value == 1) {
                    setPlaceOfBranch(10);
                    setPlaceOfBranchError("");
                  } else {
                    setPlaceOfBranch(null);
                  }
                  if (paymentValidationTrigger) {
                    setPlaceOfServiceError(selectValidator(value));
                  }
                }}
                value={placeOfService}
                error={placeOfServiceError}
                errorFontSize={"9px"}
              />
            </Col>

            <Col span={8}>
              <CommonSelectField
                width="100%"
                label="Place Of Branch"
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
                options={allBranchesData}
                onChange={(e) => {
                  setPlaceOfBranch(e.target.value);
                  if (paymentValidationTrigger) {
                    setPlaceOfBranchError(selectValidator(e.target.value));
                  }
                }}
                value={placeOfBranch}
                error={placeOfBranchError}
                errorFontSize={"9px"}
                disabled={placeOfService == 1}
              />
            </Col>

            <Col span={8}>
              <CommonSelectField
                width="100%"
                label="Select RA"
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
                options={raUsers}
                onChange={handleSelectRA}
                value={selectedRA}
                disableClearable={false}
              />
            </Col>

            <Col span={8}>
              <CommonSelectField
                label="Course"
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
                required={true}
                options={courseOptions}
                value={customerCourseId}
                disabled={true}
              />
            </Col>
            <Col span={8}>
              <CommonSelectField
                label="Batch Track"
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
                required={true}
                options={batchTrackOptions}
                value={customerBatchTrackId}
                disabled={true}
              />
            </Col>
            <Col span={8}>
              <CommonSelectField
                label="Batch Type"
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
                required={true}
                options={batchTimingOptions}
                onChange={(e) => {
                  setCustomerBatchTimingId(e.target.value);
                  if (paymentValidationTrigger) {
                    setCustomerBatchTimingIdError(
                      selectValidator(e.target.value),
                    );
                  }
                }}
                value={customerBatchTimingId}
                error={customerBatchTimingIdError}
                errorFontSize={"9px"}
              />
            </Col>

            <Col span={8}>
              <CommonInputField
                label="Customer Current State"
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
                required={true}
                onChange={(e) => {
                  setCurrentLocation(e.target.value);
                  if (paymentValidationTrigger) {
                    setCurrentLocationError(addressValidator(e.target.value));
                  }
                }}
                value={currentLocation}
                error={currentLocationError}
                errorFontSize="9px"
              />
            </Col>
            <Col span={8}>
              <CommonInputField
                label="Address"
                labelFontSize={"11px"}
                labelMarginTop={"1.5px"}
                required={true}
                multiline={true}
                // rows={1}
                onChange={(e) => {
                  const formatted = e.target.value;
                  setCustomerAddress(formatted);

                  if (paymentValidationTrigger) {
                    setCustomerAddressError(addressValidator(formatted));
                  }
                }}
                value={customerAddress}
                error={customerAddressError}
                errorFontSize={"9px"}
              />
            </Col>
            <Col span={8}>
              <CommonInputField
                label="GST No"
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
                required={false}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setGstNumber(value);
                }}
                value={gstNumber}
              />
            </Col>

            <Col span={8}>
              <CommonSelectField
                label="Placement Support"
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
                required={true}
                options={[
                  { id: "Need", name: "Need" },
                  { id: "Not Need", name: "Not Need" },
                ]}
                onChange={(e) => {
                  setPlacementSupport(e.target.value);
                  if (paymentValidationTrigger) {
                    setPlacementSupportError(selectValidator(e.target.value));
                  }
                }}
                value={placementSupport}
                error={placementSupportError}
                errorFontSize={"9px"}
              />
            </Col>

            <Col span={8}>
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  gap: "6px",
                  alignItems: "center",
                }}
              >
                <p className="leads_serverrequired_label">Server Required</p>
                <Switch
                  style={{ color: "#333" }}
                  checked={serverRequired}
                  onChange={(checked) => {
                    setServerRequired(checked);
                  }}
                  className="leads_serverrequired_switch"
                />
              </div>
            </Col>
          </Row>
        </>
      </div>
    );
  },
);

export default MakeAsCustomer;
