import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Row, Col, Switch, Divider, Checkbox } from "antd";
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
  getBanks,
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
  mobileValidator,
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

    const [selectedRA, setSelectedRA] = useState(null);
    const [paymentDate, setPaymentDate] = useState(null);
    const [paymentDateError, setPaymentDateError] = useState("");
    const [placeOfPayment, setPlaceOfPayment] = useState(null);
    const [placeOfPaymentError, setPlaceOfPaymentError] = useState("");
    const [placeOfService, setPlaceOfService] = useState("");
    const [placeOfServiceError, setPlaceOfServiceError] = useState("");
    const [placeOfBranch, setPlaceOfBranch] = useState("");
    const [placeOfBranchError, setPlaceOfBranchError] = useState("");
    const paymentModeOptions = [
      { id: 1, name: "Cash" },
      { id: 11, name: "Card (POS)" },
      { id: 4, name: "UPI" },
      { id: 5, name: "Razorpay" },
      { id: 12, name: "Bank" },
    ];
    const [paymentMode, setPaymentMode] = useState(null);
    const [paymentModeError, setPaymentModeError] = useState(null);
    const [transactionToOptions, setTransactionToOptions] = useState([]);
    const [transactionTo, setTransactionTo] = useState(null);
    const [transactionToError, setTransactionToError] = useState(null);
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
    const [placementSupport, setPlacementSupport] = useState(null);
    const [placementSupportError, setPlacementSupportError] = useState("");
    const [serverRequired, setServerRequired] = useState(false);
    //gst invoice details
    const [isGstInvoice, setIsGstInvoice] = useState(false);
    const [contactPerson, setContactPerson] = useState("");
    const [contactPersonError, setContactPersonError] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [companyNameError, setCompanyNameError] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [contactNumberError, setContactNumberError] = useState("");
    const [gstNumber, setGstNumber] = useState("");
    const [gstNumberError, setGstNumberError] = useState("");
    const [gstLocation, setGstLocation] = useState("");
    const [gstLocationError, setGstLocationError] = useState("");
    const [gstAddress, setGstAddress] = useState("");
    const [gstAddressError, setGstAddressError] = useState("");

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

      const selectedBank = transactionToOptions.find(
        (item) => item.id == transactionTo,
      );
      let conve_fees = 0;
      if (selectedBank && selectedBank.is_convenience) {
        conve_fees = ((isNaN(value) ? 0 : value) * 3) / 100;
        setConvenienceFees(conve_fees.toFixed(2));
      } else {
        setConvenienceFees(0);
      }

      const actualPaid = (isNaN(value) ? 0 : value) - conve_fees;

      if (actualPaid < amt || isNaN(value) || input == "" || input == null) {
        setIsShowDueDate(true);
      } else {
        setIsShowDueDate(false);
        setDueDate(null);
        setDueDateError("");
      }

      setBalanceAmount(getBalanceAmount(isNaN(amt) ? 0 : amt, actualPaid));

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
        e.target.value === "0%" ? 0 : 18,
      );
      if (isNaN(amnt)) {
        setAmount("");
      } else {
        setAmount(parseFloat(amnt));
      }

      const conve_fees = parseFloat(convenienceFees) || 0;
      const actualPaid = (parseFloat(paidNow) || 0) - conve_fees;

      //handle balance amount
      if (
        actualPaid < amnt ||
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
      setBalanceAmount(getBalanceAmount(isNaN(amnt) ? 0 : amnt, actualPaid));
    };

    const handlePaymentMode = (e) => {
      const value = e.target.value;
      setPaymentMode(value);
      console.log("taxType", taxType);
      getBanksData(value);
      const amnt = calculateAmount(
        parseFloat(subTotal),
        taxType === "0%" || taxType === "" || taxType === null ? 0 : 18,
      );
      setAmount(amnt);

      if (paymentValidationTrigger) {
        setPaymentModeError(selectValidator(value));
      }

      const actualPaid = parseFloat(paidNow) || 0;

      //handle balance amount
      if (
        actualPaid < amnt ||
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
      setBalanceAmount(getBalanceAmount(isNaN(amnt) ? 0 : amnt, actualPaid));

      // Reset transaction to and convenience fees
      setTransactionTo(null);
      setConvenienceFees(0);
    };

    const getBanksData = async (paymentmode_id) => {
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);
      const user_id = converAsJson?.user_id;
      const regionId =
        user_id?.startsWith("HUB") || user_id?.startsWith("CHN") ? 2 : 3;

      try {
        const response = await getBanks(regionId, paymentmode_id);
        console.log("get banks response", response);
        setTransactionToOptions(response?.data?.data || []);
      } catch (error) {
        setTransactionToOptions([]);
        console.log("get banks error", error);
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
      const placeOfPaymentValidate = selectValidator(placeOfPayment);
      const placeOfServiceValidate = selectValidator(placeOfService);
      const placeOfBranchValidate =
        placeOfService == 10 ? "" : selectValidator(placeOfBranch);
      const batchTimingValidate = selectValidator(customerBatchTimingId);
      const placementSupportValidate = selectValidator(placementSupport);
      //gst invoice
      const contactPersonValidate = isGstInvoice
        ? addressValidator(contactPerson)
        : "";
      const companyNameValidate = isGstInvoice
        ? addressValidator(companyName)
        : "";
      const contactNumberValidate = isGstInvoice
        ? addressValidator(contactPerson)
        : "";
      const gstNumberValidate = isGstInvoice ? addressValidator(gstNumber) : "";
      const gstLocationValidate = isGstInvoice
        ? addressValidator(gstLocation)
        : "";
      const gstAddressValidate = isGstInvoice
        ? addressValidator(gstAddress)
        : "";

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
      setPlaceOfPaymentError(placeOfPaymentValidate);
      setPlaceOfServiceError(placeOfServiceValidate);
      setPlaceOfBranchError(placeOfBranchValidate);
      setPaymentScreenShotError(screenshotValidate);
      setDueDateError(dueDateValidate);
      setCustomerBatchTimingIdError(batchTimingValidate);
      setPlacementSupportError(placementSupportValidate);
      setContactPersonError(contactPersonValidate);
      setCompanyNameError(companyNameValidate);
      setContactNumberError(contactNumberValidate);
      setGstNumberError(gstNumberValidate);
      setGstLocationError(gstLocationValidate);
      setGstAddressError(gstAddressValidate);

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
        placeOfPaymentValidate ||
        placeOfServiceValidate ||
        placeOfBranchValidate ||
        screenshotValidate ||
        dueDateValidate ||
        batchTimingValidate ||
        placementSupportValidate ||
        contactPersonValidate ||
        companyNameValidate ||
        contactNumberValidate ||
        gstNumberValidate ||
        gstLocationValidate ||
        gstAddressValidate
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
        tax_type: taxType === "18%" ? "GST (18%)" : "No Tax",
        gst_percentage: taxType === "0%" ? "0%" : "18%",
        gst_amount: parseFloat(gstAmount).toFixed(2),
        total_amount: amount,
        convenience_fees: convenienceFees,
        paymode_id: paymentMode,
        bank_id: transactionTo,
        paid_amount: paidNow,
        payment_screenshot: paymentScreenShotBase64,
        payment_status: "Verify Pending",
        next_due_date: dueDate ? formatToBackendIST(dueDate) : null,
        date_of_joining: formatToBackendIST(paymentDate),
        ra_id: selectedRA,
        created_date: formatToBackendIST(today),
        paid_date: formatToBackendIST(paymentDate),
        place_of_payment: placeOfPayment,
        place_of_service: placeOfService,
        place_of_branch: placeOfBranch,
        enrolled_course: customerCourseId,
        batch_track_id: customerBatchTrackId,
        batch_timing_id: customerBatchTimingId,
        place_of_supply: "",
        state_code: "",
        contact_person: isGstInvoice ? contactPerson : "",
        gst_number: isGstInvoice ? gstNumber : "",
        company_name: isGstInvoice ? companyName : "",
        contact_number: isGstInvoice ? contactNumber : "",
        location: isGstInvoice ? gstLocation : "",
        gst_address: isGstInvoice ? gstAddress : "",
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
            Fees Details
          </p>
          <Row
            gutter={16}
            className="leadmanager_paymentdetails_drawer_rowdiv"
            style={{ marginTop: "20px", marginBottom: "30px" }}
          >
            <Col span={8}>
              <CommonInputField
                label="Course Fees"
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
                // options={[
                //   { id: 1, name: "GST (18%)" },
                //   { id: 2, name: "SGST (18%)" },
                //   { id: 3, name: "IGST (18%)" },
                //   { id: 4, name: "VAT (18%)" },
                //   { id: 5, name: "No Tax" },
                // ]}
                options={[
                  { id: "18%", name: "18%" },
                  { id: "0%", name: "0%" },
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
              {/* <CommonInputField
                label="Total Amount"
                required={true}
                disabled
                value={amount}
                height={"36px"}
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
              /> */}
              <CommonInputField
                label="Tax Amount"
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
                required={true}
                value={amount && subTotal ? (amount - subTotal).toFixed(2) : 0}
                error={""}
                height={"36px"}
                fontSize={"12px"}
                errorFontSize={"9px"}
                disabled={true}
              />
            </Col>
          </Row>

          <Divider className="leadmanger_paymentdrawer_divider" />
          <p
            className="leadmanager_paymentdetails_drawer_heading"
            id="leadmanager_paymentdetails_paymentinfo_heading"
          >
            Calculation's
          </p>

          <Row
            gutter={[16, 22]}
            className="leadmanager_paymentdetails_drawer_rowdiv"
            style={{ marginTop: "20px", marginBottom: "30px" }}
          >
            <Col span={8}>
              <CommonInputField
                label="Total Fees Amount"
                required={true}
                disabled
                value={amount}
                height={"36px"}
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
              />
            </Col>
            <Col span={8}>
              <CommonInputField
                label="Total Paid Amount"
                required={true}
                disabled
                value={paidNow || 0}
                height={"36px"}
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
              />
            </Col>
            <Col span={8}>
              <CommonInputField
                label="Total Pending"
                required={true}
                disabled
                value={balanceAmount !== undefined ? balanceAmount : 0}
                height={"36px"}
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
              />
            </Col>
            <Col span={8}>
              <CommonInputField
                label="Fees"
                required={true}
                disabled
                value={
                  taxType === "18%"
                    ? (
                        (parseFloat(paidNow || 0) -
                          parseFloat(convenienceFees || 0)) /
                        1.18
                      ).toFixed(2)
                    : (
                        parseFloat(paidNow || 0) -
                        parseFloat(convenienceFees || 0)
                      ).toFixed(2)
                }
                height={"36px"}
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
              />
            </Col>
            <Col span={8}>
              <CommonInputField
                label="TAX"
                required={true}
                disabled
                value={
                  taxType === "18%"
                    ? (
                        ((parseFloat(paidNow || 0) -
                          parseFloat(convenienceFees || 0)) *
                          18) /
                        118
                      ).toFixed(2)
                    : 0
                }
                height={"36px"}
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
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
          <Divider className="leadmanger_paymentdrawer_divider" />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p
              className="leadmanager_paymentdetails_drawer_heading"
              id="leadmanager_paymentdetails_paymentinfo_heading"
              style={{ marginBottom: 0 }}
            >
              Transaction Details
            </p>
            <Checkbox
              checked={isGstInvoice}
              onChange={(e) => setIsGstInvoice(e.target.checked)}
              style={{ fontSize: "12px" }}
            >
              GST Invoice
            </Checkbox>
          </div>

          <Row
            gutter={16}
            className="leadmanager_paymentdetails_drawer_rowdiv"
            style={{ marginTop: "20px" }}
          >
            <Col span={8}>
              <CommonSelectField
                label="Payment Mode"
                required={true}
                options={paymentModeOptions}
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
              {/* <CommonInputField
                label="Convenience fees"
                required={true}
                value={convenienceFees}
                disabled={true}
                type="number"
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
              /> */}
              <CommonSelectField
                label={"Transaction To"}
                required={true}
                options={transactionToOptions?.map((item) => ({
                  id: item.id,
                  name: item.bank_name,
                }))}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setTransactionTo(selectedId);

                  // Null the received amount
                  setPaidNow("");
                  setConvenienceFees(0);

                  const amt = parseFloat(amount) || 0;
                  const actualPaid = 0;

                  setIsShowDueDate(true);

                  setBalanceAmount(getBalanceAmount(amt, actualPaid));

                  if (paymentValidationTrigger) {
                    setTransactionToError(selectValidator(selectedId));
                  }
                }}
                value={transactionTo}
                height={"36px"}
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
                errorFontSize="9px"
              />
            </Col>
            <Col span={8}>
              <CommonInputField
                label="Received"
                labelFontSize={"11px"}
                labelMarginTop={"1px"}
                required={true}
                onChange={handlePaidNow}
                value={paidNow}
                error={paidNowError}
                errorFontSize="9px"
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
            {/* <Col span={8}>
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
            </Col> */}

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

            <Col span={8}>
              <ImageUploadCrop
                label="Proof Upload"
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
          {/* 
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
          </Row> */}
          {isGstInvoice && (
            <>
              <Divider className="leadmanger_paymentdrawer_divider" />
              <p className="leadmanager_paymentdetails_drawer_heading">
                GST Invoice Details
              </p>

              <Row
                gutter={[16, 30]}
                style={{ marginTop: "20px" }}
                className="leadmanager_paymentdetails_drawer_rowdiv"
              >
                <Col span={8}>
                  <CommonInputField
                    label={"Contact Person"}
                    required={true}
                    labelMarginTop={"1px"}
                    labelFontSize={"11px"}
                    onChange={(e) => {
                      setContactPerson(e.target.value);
                      if (paymentValidationTrigger) {
                        setContactPersonError(addressValidator(e.target.value));
                      }
                    }}
                    value={contactPerson}
                    error={contactPersonError}
                    errorFontSize={"9px"}
                  />
                </Col>
                <Col span={8}>
                  <CommonInputField
                    label={"Company Name"}
                    required={true}
                    labelMarginTop={"1px"}
                    labelFontSize={"11px"}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (paymentValidationTrigger) {
                        setCompanyNameError(addressValidator(e.target.value));
                      }
                    }}
                    value={companyName}
                    error={companyNameError}
                    errorFontSize={"9px"}
                  />
                </Col>
                <Col span={8}>
                  <CommonInputField
                    label={"Contact Number"}
                    required={true}
                    labelMarginTop={"1px"}
                    labelFontSize={"11px"}
                    onChange={(e) => {
                      setContactNumber(e.target.value);
                      if (paymentValidationTrigger) {
                        setContactNumberError(mobileValidator(e.target.value));
                      }
                    }}
                    value={contactNumber}
                    error={contactNumberError}
                    errorFontSize={"9px"}
                  />
                </Col>
                <Col span={8}>
                  <CommonInputField
                    label={"GST Number"}
                    required={true}
                    labelMarginTop={"1px"}
                    labelFontSize={"11px"}
                    onChange={(e) => {
                      setGstNumber(e.target.value);
                      if (paymentValidationTrigger) {
                        setGstNumberError(addressValidator(e.target.value));
                      }
                    }}
                    value={gstNumber}
                    error={gstNumberError}
                    errorFontSize={"9px"}
                  />
                </Col>
                <Col span={8}>
                  <CommonInputField
                    label={"Loaction"}
                    required={true}
                    labelMarginTop={"1px"}
                    labelFontSize={"11px"}
                    onChange={(e) => {
                      setGstLocation(e.target.value);
                      if (paymentValidationTrigger) {
                        setGstLocationError(addressValidator(e.target.value));
                      }
                    }}
                    value={gstLocation}
                    error={gstLocationError}
                    errorFontSize={"9px"}
                  />
                </Col>
                <Col span={8}>
                  <CommonInputField
                    label={"Address"}
                    required={true}
                    labelMarginTop={"1px"}
                    labelFontSize={"11px"}
                    onChange={(e) => {
                      setGstAddress(e.target.value);
                      if (paymentValidationTrigger) {
                        setGstAddressError(addressValidator(e.target.value));
                      }
                    }}
                    value={gstAddress}
                    error={gstAddressError}
                    errorFontSize={"9px"}
                  />
                </Col>
              </Row>
            </>
          )}

          <Divider className="leadmanger_paymentdrawer_divider" />

          <p className="leadmanager_paymentdetails_drawer_heading">
            Customer Details
          </p>

          <Row
            gutter={[16, 30]}
            style={{ marginTop: "20px", marginBottom: "50px" }}
            className="leadmanager_paymentdetails_drawer_rowdiv"
          >
            <Col span={8}>
              <CommonSelectField
                width="100%"
                label="Mode of Class"
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
                label="Place Of Service"
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
