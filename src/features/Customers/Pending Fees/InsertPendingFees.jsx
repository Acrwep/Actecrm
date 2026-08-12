import React, {
  useState,
  forwardRef,
  useEffect,
  useImperativeHandle,
} from "react";
import { Row, Col, Divider, Collapse, Modal, Skeleton } from "antd";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import { FaRegUser } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineDateRange } from "react-icons/md";
import { BsGenderMale, BsGenderFemale } from "react-icons/bs";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegAddressCard } from "react-icons/fa6";
import { LuCircleUser } from "react-icons/lu";
import { GiReceiveMoney } from "react-icons/gi";
import { FaRegCircleXmark } from "react-icons/fa6";
import { BsPatchCheckFill } from "react-icons/bs";
import CommonInputField from "../../Common/CommonInputField";
import CommonSelectField from "../../Common/CommonSelectField";
import CommonMuiDatePicker from "../../Common/CommonMuiDatePicker";
import ImageUploadCrop from "../../Common/ImageUploadCrop";
import {
  priceValidator,
  selectValidator,
  calculateThreePercentAmount,
  getBalanceAmount,
  validateConvenienceFee,
  formatToBackendIST,
  getConvenienceFees,
} from "../../Common/Validation";
import {
  customerDuePayment,
  getBanks,
  getCustomerById,
  getCustomersPaymentHistory,
  inserCustomerTrack,
  viewPaymentInvoice,
} from "../../ApiService/action";
import PrismaZoom from "react-prismazoom";
import moment from "moment";
import { CommonMessage } from "../../Common/CommonMessage";
import CommonGroupedSelectField from "../../Common/CommonGroupedSelectField";
import EllipsisTooltip from "../../Common/EllipsisTooltip";
import CommonInvoiceViewer from "../../Common/CommonInvoiceViewer";

const InsertPendingFees = forwardRef(
  (
    {
      selectedCustomerDetails,
      setButtonLoading,
      callgetCustomersApi,
      isViewOnly = false,
    },
    ref,
  ) => {
    const [collapseDefaultKey, setCollapseDefaultKey] = useState(["1"]);
    const [pendingAmount, setPendingAmount] = useState();
    const [payAmount, setPayAmount] = useState("");
    const [duplicatePayAmount, setDuplicatePayAmount] = useState("");
    const [payAmountError, setPayAmountError] = useState("");
    const paymentModeOptions = [
      { id: 1, name: "Cash" },
      { id: 11, name: "Card (POS)" },
      { id: 4, name: "UPI" },
      { id: 5, name: "Razorpay" },
      { id: 12, name: "Bank" },
    ];
    const [paymentMode, setPaymentMode] = useState("");
    const [paymentModeError, setPaymentModeError] = useState("");
    const [transactionToOptions, setTransactionToOptions] = useState([]);
    const [transactionTo, setTransactionTo] = useState(null);
    const [transactionToError, setTransactionToError] = useState(null);
    const convenienceFeesStatusOptions = [
      { id: 1, name: "Inclusive With Pay Amount" },
      { id: 2, name: "Exclusive With Pay Amount" },
    ];
    const [convenienceFeesStatus, setConvenienceFeesStatus] = useState(null);
    const [convenienceFeesStatusError, setConvenienceFeesStatusError] =
      useState("");
    const [convenienceFees, setConvenienceFees] = useState("");
    const [convenienceFeesError, setConvenienceFeesError] = useState("");
    const [paymentDate, setPaymentDate] = useState(null);
    const [paymentDateError, setPaymentDateError] = useState(null);
    const [paymentScreenShotBase64, setPaymentScreenShotBase64] = useState("");
    const [paymentScreenShotError, setPaymentScreenShotError] = useState("");
    const [paymentValidationTrigger, setPaymentValidationTrigger] =
      useState(false);
    const [balanceAmount, setBalanceAmount] = useState();
    const [isShowDueDate, setIsShowDueDate] = useState(true);
    const [dueDate, setDueDate] = useState(null);
    const [dueDateError, setDueDateError] = useState("");
    const [isOpenPaymentScreenshotModal, setIsOpenPaymentScreenshotModal] =
      useState(false);
    const [transactionScreenshot, setTransactionScreenshot] = useState("");
    const [customerDetails, setCustomerDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    //payment api usestates
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [invoiceHtmlContent, setInvoiceHtmlContent] = useState("");
    const [isOpenViewInvoiceModal, setIsOpenViewInvoiceModal] = useState(false);

    useEffect(() => {
      setLoading(true);
      getParticularCustomerDetails();
    }, []);

    const getParticularCustomerDetails = async () => {
      try {
        const response = await getCustomerById(
          selectedCustomerDetails?.id || selectedCustomerDetails?.customer_id,
        );
        console.log("particular customer response", response);
        const customer_details = response?.data?.data;
        setCustomerDetails(customer_details);
        setPendingAmount(parseFloat(customer_details?.balance_amount));
        setBalanceAmount(parseFloat(customer_details?.balance_amount));
      } catch (error) {
        console.log("getcustomer by id error", error);
        setCustomerDetails(null);
      } finally {
        setTimeout(() => {
          getPaymentHistoryData();
        }, 200);
      }
    };

    const getPaymentHistoryData = async () => {
      try {
        const response = await getCustomersPaymentHistory(
          selectedCustomerDetails?.lead_id,
        );
        console.log("particular customer payment history", response);
        setPaymentDetails(response?.data?.data || null);
      } catch (error) {
        setPaymentDetails(null);
        console.log("particular customer payment history error", error);
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      handlePaymentSubmit,
    }));

    const handlePaidNow = (e) => {
      const input = e.target.value;

      // Allow numbers, decimal point, or empty string
      if (!/^\d*\.?\d*$/.test(input)) return;

      // Keep the input as string
      setPayAmount(input);

      const value = parseFloat(input); // parse for calculations
      const amt = parseFloat(pendingAmount);

      const selectedBank = transactionToOptions?.find(
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

      if (actualPaid < amt || isNaN(value) || input === "" || input === null) {
        setIsShowDueDate(true);
      } else {
        setIsShowDueDate(false);
        setDueDate(null);
        setDueDateError("");
      }

      setBalanceAmount(getBalanceAmount(isNaN(amt) ? 0 : amt, actualPaid));

      if (paymentValidationTrigger) {
        setPayAmountError(
          priceValidator(isNaN(value) ? 0 : value, parseFloat(amt)),
        );
      }
    };

    const handlePaymentMode = (e) => {
      const value = e.target.value;
      setPaymentMode(value);
      getBanksData(value);
      setConvenienceFeesStatus(null);
      setConvenienceFees(0);

      if (paymentValidationTrigger) {
        setPaymentModeError(selectValidator(value));
      }

      //handle balance amount
      if (
        payAmount < pendingAmount ||
        isNaN(payAmount) ||
        payAmount == "" ||
        payAmount == null
      ) {
        setIsShowDueDate(true);
      } else {
        setIsShowDueDate(false);
        setDueDate(null);
        setDueDateError("");
      }
      setBalanceAmount(
        getBalanceAmount(
          isNaN(pendingAmount) ? 0 : pendingAmount,
          isNaN(payAmount) ? 0 : payAmount,
        ),
      );
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

    // const handleConvenienceFeesStatus = (e) => {
    //   const value = e.target.value;
    //   setConvenienceFeesStatus(value);
    //   setConvenienceFees(0);
    //   setConvenienceFeesStatusError(selectValidator(value));
    //   // -------------inclusive--------------
    //   if (value == 1) {
    //     setPayAmount(duplicatePayAmount);
    //     const threePercentAmount =
    //       calculateThreePercentAmount(duplicatePayAmount);
    //     console.log("threePercentAmount", threePercentAmount);

    //     //handle balance amount
    //     const pay = parseFloat(duplicatePayAmount); // parse for calculations
    //     const amt = parseFloat(pendingAmount);

    //     if (
    //       pay < amt ||
    //       isNaN(pay) ||
    //       duplicatePayAmount === "" ||
    //       duplicatePayAmount === null
    //     ) {
    //       setIsShowDueDate(true);
    //     } else {
    //       setIsShowDueDate(false);
    //       setDueDate(null);
    //       setDueDateError("");
    //     }

    //     setBalanceAmount(
    //       getBalanceAmount(isNaN(amt) ? 0 : amt, isNaN(pay) ? 0 : pay)
    //     );
    //   }
    //   // -------------exclusive--------------
    //   if (value == 2 && (paymentMode == 2 || paymentMode == 5)) {
    //     setConvenienceFeesError("");
    //     const threePercentAmount =
    //       calculateThreePercentAmount(duplicatePayAmount);
    //     setConvenienceFees(threePercentAmount);
    //     //handle payamount
    //     const updatePayAmount = duplicatePayAmount - threePercentAmount;
    //     setPayAmount(updatePayAmount);

    //     //handle balance amount
    //     const pay = parseFloat(updatePayAmount); // parse for calculations
    //     const amt = parseFloat(pendingAmount);

    //     if (pay < amt || isNaN(pay) || input === "" || input === null) {
    //       setIsShowDueDate(true);
    //     } else {
    //       setIsShowDueDate(false);
    //       setDueDate(null);
    //       setDueDateError("");
    //     }

    //     setBalanceAmount(
    //       getBalanceAmount(isNaN(amt) ? 0 : amt, isNaN(pay) ? 0 : pay)
    //     );
    //   }
    // };

    // const handleConvenienceFees = (e) => {
    //   const input = e.target.value;

    //   // Allow numbers, decimal point, or empty string
    //   if (!/^\d*\.?\d*$/.test(input)) return;

    //   // Keep the input as string
    //   setConvenienceFees(input);
    //   setConvenienceFeesError(validateConvenienceFee(payAmount, input));
    // };

    const handlePaymentSubmit = async () => {
      setPaymentValidationTrigger(true);
      const paymentTypeValidate = selectValidator(paymentMode);
      const paymentDateValidate = selectValidator(paymentDate);
      const transactionToValidate = selectValidator(transactionTo);
      const payAmountValidate = priceValidator(
        parseInt(payAmount),
        parseInt(pendingAmount),
      );

      const screenshotValidate = selectValidator(paymentScreenShotBase64);
      let dueDateValidate;

      if (isShowDueDate) {
        dueDateValidate = selectValidator(dueDate);
      } else {
        dueDateValidate = "";
      }

      setPaymentModeError(paymentTypeValidate);
      setPayAmountError(payAmountValidate);
      setPaymentDateError(paymentDateValidate);
      setTransactionToError(transactionToValidate);
      setPaymentScreenShotError(screenshotValidate);
      setDueDateError(dueDateValidate);

      if (
        paymentTypeValidate ||
        payAmountValidate ||
        paymentDateValidate ||
        screenshotValidate ||
        transactionToValidate ||
        dueDateValidate
      )
        return;

      setButtonLoading(true);

      const today = new Date();

      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);

      const payload = {
        payment_master_id: paymentDetails?.id,
        invoice_date: formatToBackendIST(paymentDate),
        paid_amount: payAmount,
        convenience_fees: convenienceFees,
        balance_amount: balanceAmount,
        paymode_id: paymentMode,
        bank_id: transactionTo,
        payment_screenshot: paymentScreenShotBase64,
        payment_status: "Verify Pending",
        next_due_date: dueDate ? formatToBackendIST(dueDate) : null,
        created_date: formatToBackendIST(today),
        paid_date: formatToBackendIST(paymentDate),
        collected_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
      };

      console.log("payload", payload);
      try {
        await customerDuePayment(payload);
        setTimeout(() => {
          CommonMessage("success", "Payment Added");
          handleCustomerTrack("Part Payment Added");
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        console.log("part payment error", error);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleCustomerTrack = async (updatestatus) => {
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);
      console.log("getloginUserDetails", converAsJson);

      const payload = {
        customers: [
          {
            customer_id: customerDetails.id,
            status: updatestatus,
            updated_by:
              converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
            status_date: formatToBackendIST(today),
          },
        ],
      };

      try {
        await inserCustomerTrack(payload);
        setTimeout(() => {
          setButtonLoading(false);
          callgetCustomersApi();
        }, 300);
      } catch (error) {
        console.log("customer track error", error);
      }
    };

    const handleViewIncoice = async (transactionId) => {
      console.log(paymentDetails, transactionId);

      const findTrans =
        paymentDetails?.payment_trans?.find((f) => f.id === transactionId) ??
        null;

      console.log("findTrans", findTrans);

      const payload = {
        email:
          customerDetails && customerDetails.email ? customerDetails.email : "",
        name:
          customerDetails && customerDetails.name ? customerDetails.name : "",
        mobile:
          customerDetails && customerDetails.phone ? customerDetails.phone : "",
        convenience_fees: findTrans?.convenience_fees || "",
        gst_amount: paymentDetails?.gst_amount ? paymentDetails.gst_amount : "",
        gst_percentage: paymentDetails?.gst_percentage
          ? parseFloat(paymentDetails.gst_percentage)
          : "",
        invoice_date: findTrans?.invoice_date
          ? moment(findTrans.invoice_date).format("DD-MM-YYYY")
          : "",
        invoice_number: findTrans?.invoice_number || "",
        paid_amount: findTrans?.amount || "",
        payment_mode: findTrans?.payment_mode || "",
        total_amount: paymentDetails?.total_amount
          ? paymentDetails.total_amount
          : "",
        balance_amount:
          findTrans.balance_amount != undefined ||
          findTrans.balance_amount != null
            ? parseFloat(findTrans?.balance_amount).toFixed(2)
            : "",
        course_name:
          customerDetails && customerDetails.course_name
            ? customerDetails.course_name
            : "",
        sub_total:
          customerDetails && customerDetails.primary_fees
            ? customerDetails.primary_fees
            : "",
        place_of_supply:
          customerDetails && customerDetails.place_of_supply
            ? customerDetails.place_of_supply
            : "",
        address:
          customerDetails && customerDetails.address
            ? customerDetails.address
            : "",
        state_code:
          customerDetails && customerDetails.state_code
            ? customerDetails.state_code
            : "",
        gst_number:
          customerDetails && customerDetails.gst_number
            ? customerDetails.gst_number
            : "",
        invoice_type:
          customerDetails && customerDetails.invoice_type
            ? customerDetails.invoice_type
            : "",
      };
      console.log("payload", payload);
      // return;
      try {
        const response = await viewPaymentInvoice(payload);
        console.log("view invoice response", response);
        const htmlTemplate = response?.data?.data;
        setInvoiceHtmlContent(htmlTemplate);
        setIsOpenViewInvoiceModal(true);
      } catch (error) {
        console.log("error", error);
        CommonMessage(
          "error",
          error?.response?.data?.message ||
            "Something went wrong. Try again later",
        );
      }
    };

    return (
      <div>
        {loading ? (
          <div style={{ padding: "20px" }}>
            <div className="customer_profileContainer">
              <Skeleton.Avatar active size={90} shape="circle" />
              <div style={{ marginLeft: "20px", flex: 1 }}>
                <Skeleton
                  active
                  paragraph={{ rows: 2 }}
                  title={{ width: 150 }}
                />
              </div>
            </div>

            <Row gutter={16} style={{ marginTop: "30px" }}>
              <Col span={12}>
                {[1, 2, 3, 4].map((i) => (
                  <Row key={i} style={{ marginTop: i === 1 ? "0" : "12px" }}>
                    <Col span={12}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "80%" }}
                      />
                    </Col>
                    <Col span={12}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "100%" }}
                      />
                    </Col>
                  </Row>
                ))}
              </Col>
              <Col span={12}>
                {[1, 2, 3, 4].map((i) => (
                  <Row key={i} style={{ marginTop: i === 1 ? "0" : "12px" }}>
                    <Col span={12}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "80%" }}
                      />
                    </Col>
                    <Col span={12}>
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: "100%" }}
                      />
                    </Col>
                  </Row>
                ))}
              </Col>
            </Row>

            <div
              className="customerdetails_coursecard"
              style={{ marginTop: "30px" }}
            >
              <div className="customerdetails_coursecard_headercontainer">
                <Skeleton.Input active size="small" style={{ width: 150 }} />
              </div>
              <div
                className="customerdetails_coursecard_contentcontainer"
                style={{ padding: "20px" }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Row
                        key={i}
                        style={{ marginTop: i === 1 ? "0" : "12px" }}
                      >
                        <Col span={12}>
                          <Skeleton.Input
                            active
                            size="small"
                            style={{ width: "80%" }}
                          />
                        </Col>
                        <Col span={12}>
                          <Skeleton.Input
                            active
                            size="small"
                            style={{ width: "100%" }}
                          />
                        </Col>
                      </Row>
                    ))}
                  </Col>
                  <Col span={12}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Row
                        key={i}
                        style={{ marginTop: i === 1 ? "0" : "12px" }}
                      >
                        <Col span={12}>
                          <Skeleton.Input
                            active
                            size="small"
                            style={{ width: "80%" }}
                          />
                        </Col>
                        <Col span={12}>
                          <Skeleton.Input
                            active
                            size="small"
                            style={{ width: "100%" }}
                          />
                        </Col>
                      </Row>
                    ))}
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="customer_statusupdate_drawer_profileContainer">
              {customerDetails && customerDetails.profile_image ? (
                <img
                  src={customerDetails.profile_image}
                  className="cutomer_profileimage"
                />
              ) : (
                <FaRegUser size={50} color="#333" />
              )}

              <div>
                <p className="customer_nametext">
                  {" "}
                  {customerDetails && customerDetails.name
                    ? customerDetails.name
                    : "-"}
                </p>
                <p className="customer_coursenametext">
                  {" "}
                  {customerDetails && customerDetails.course_name
                    ? customerDetails.course_name
                    : "-"}
                </p>
              </div>
            </div>

            <Row
              gutter={16}
              style={{ marginTop: "20px", padding: "0px 0px 0px 24px" }}
            >
              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <FaRegAddressCard size={15} color="gray" />
                      <p className="customerdetails_rowheading">Student Id</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip
                      text={
                        customerDetails && customerDetails.student_id
                          ? customerDetails.student_id
                          : "-"
                      }
                      smallText={true}
                    />
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <FaRegCircleUser size={15} color="gray" />
                      <p className="customerdetails_rowheading">Name</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip
                      text={
                        customerDetails && customerDetails.name
                          ? customerDetails.name
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
                        customerDetails && customerDetails.email
                          ? customerDetails.email
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
                      {customerDetails && customerDetails.phone
                        ? customerDetails.phone
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
                      {customerDetails && customerDetails.whatsapp
                        ? customerDetails.whatsapp
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      {customerDetails && customerDetails.gender === "Male" ? (
                        <BsGenderMale size={15} color="gray" />
                      ) : (
                        <BsGenderFemale size={15} color="gray" />
                      )}
                      <p className="customerdetails_rowheading">Gender</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.gender
                        ? customerDetails.gender
                        : "-"}
                    </p>
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
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.current_location
                        ? customerDetails.current_location
                        : "-"}
                    </p>
                  </Col>
                </Row>
              </Col>

              <Col span={12}>
                <Row>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">
                        Lead Executive
                      </p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {`${
                        customerDetails && customerDetails.lead_assigned_to_id
                          ? customerDetails.lead_assigned_to_id
                          : "-"
                      } (${
                        customerDetails && customerDetails.lead_assigned_to_name
                          ? customerDetails.lead_assigned_to_name
                          : "-"
                      })`}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Course</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <EllipsisTooltip
                      text={
                        customerDetails && customerDetails.course_name
                          ? customerDetails.course_name
                          : "-"
                      }
                      smallText={true}
                    />
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
                      {customerDetails && customerDetails.branch_name
                        ? customerDetails.branch_name
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
                      {customerDetails && customerDetails.batch_tracking
                        ? customerDetails.batch_tracking
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Batch Type</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails && customerDetails.batch_timing
                        ? customerDetails.batch_timing
                        : "-"}
                    </p>
                  </Col>
                </Row>

                <Row style={{ marginTop: "12px" }}>
                  <Col span={12}>
                    <div className="customerdetails_rowheadingContainer">
                      <p className="customerdetails_rowheading">Server</p>
                    </div>
                  </Col>
                  <Col span={12}>
                    <p className="customerdetails_text">
                      {customerDetails &&
                      customerDetails.is_server_required !== undefined
                        ? customerDetails.is_server_required === 1
                          ? "Required"
                          : "Not Required"
                        : "-"}
                    </p>
                  </Col>
                </Row>
              </Col>
            </Row>
            {/* <Divider className="customer_statusupdate_divider" />

            <div style={{ padding: "0px 24px" }}>
              <div className="customerdetails_coursecard">
                <div className="customerdetails_coursecard_headercontainer">
                  <p>Fees Details</p>
                </div>

                <div className="customerdetails_coursecard_contentcontainer">
                  <Row>
                    <Col span={12}>
                      <Row>
                        <Col span={12}>
                          <div className="customerdetails_rowheadingContainer">
                            <p className="customerdetails_rowheading">Fees</p>
                          </div>
                        </Col>
                        <Col span={12}>
                          <p
                            className="customerdetails_text"
                            style={{ fontWeight: 700 }}
                          >
                            {customerDetails && customerDetails.primary_fees
                              ? "₹" + customerDetails.primary_fees
                              : "-"}
                          </p>
                        </Col>
                      </Row>

                      <Row style={{ marginTop: "12px" }}>
                        <Col span={12}>
                          <div className="customerdetails_rowheadingContainer">
                            <p className="customerdetails_rowheading">
                              Gst Amount
                            </p>
                          </div>
                        </Col>
                        <Col span={12}>
                          <p
                            className="customerdetails_text"
                            style={{ fontWeight: 700 }}
                          >
                            {paymentDetails?.gst_amount ? (
                              <>
                                ₹{paymentDetails.gst_amount}{" "}
                                <span style={{ fontSize: "11px" }}>
                                  ({paymentDetails.tax_type || "-"})
                                </span>
                              </>
                            ) : (
                              "-"
                            )}
                          </p>
                        </Col>
                      </Row>

                      <Row style={{ marginTop: "12px" }}>
                        <Col span={12}>
                          <div className="customerdetails_rowheadingContainer">
                            <p className="customerdetails_rowheading">
                              Total Fees
                            </p>
                          </div>
                        </Col>
                        <Col span={12}>
                          <p
                            className="customerdetails_text"
                            style={{ fontWeight: 700 }}
                          >
                            {paymentDetails && paymentDetails.total_amount
                              ? "₹" + paymentDetails.total_amount
                              : "-"}
                          </p>
                        </Col>
                      </Row>
                    </Col>

                    <Col span={12}>
                      <Row>
                        <Col span={12}>
                          <div className="customerdetails_rowheadingContainer">
                            <p className="customerdetails_rowheading">
                              Total Paid Amount
                            </p>
                          </div>
                        </Col>
                        <Col span={12}>
                          <p
                            className="customerdetails_text"
                            style={{
                              fontWeight: 700,
                              color: "#3c9111",
                            }}
                          >
                            {customerDetails &&
                            customerDetails.paid_amount !== undefined &&
                            customerDetails.paid_amount !== null
                              ? "₹" + customerDetails.paid_amount
                              : "-"}
                          </p>
                        </Col>
                      </Row>

                      <Row style={{ marginTop: "12px" }}>
                        <Col span={12}>
                          <div className="customerdetails_rowheadingContainer">
                            <p className="customerdetails_rowheading">
                              Balance Amount
                            </p>
                          </div>
                        </Col>
                        <Col span={12}>
                          <p
                            className="customerdetails_text"
                            style={{ color: "#d32f2f", fontWeight: 700 }}
                          >
                            {customerDetails &&
                            customerDetails.balance_amount !== undefined &&
                            customerDetails.balance_amount !== null
                              ? "₹" + customerDetails.balance_amount
                              : "-"}
                          </p>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </div>
              </div>
            </div> */}

            <Divider className="customer_statusupdate_divider" />

            <p className="leadmanager_paymentdetails_drawer_heading">
              Transaction History
            </p>

            <div style={{ padding: "0px 24px" }}>
              {paymentDetails && paymentDetails.payment_trans.length >= 1 ? (
                <div style={{ marginTop: "12px", marginBottom: "20px" }}>
                  <Collapse
                    activeKey={collapseDefaultKey}
                    onChange={(keys) => setCollapseDefaultKey(keys)}
                    className="customer_updatepayment_history_collapse"
                  >
                    {paymentDetails.payment_trans.map((item, index) => (
                      <Collapse.Panel
                        key={index + 1} // unique key
                        header={
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: "100%",
                              fontSize: "13px",
                              alignItems: "center",
                            }}
                          >
                            <span>
                              Transaction Details -{" "}
                              <span style={{ fontWeight: "500" }}>
                                {moment(item.invoice_date).format("DD/MM/YYYY")}
                              </span>
                            </span>
                            {item.payment_status === "Verify Pending" ? (
                              <div className="customer_trans_statustext_container">
                                <PiClockCounterClockwiseBold
                                  size={16}
                                  color="gray"
                                />
                                <p style={{ color: "gray", fontWeight: 500 }}>
                                  Waiting for Verify
                                </p>
                              </div>
                            ) : item.payment_status === "Rejected" ? (
                              <div className="customer_trans_statustext_container">
                                <FaRegCircleXmark color="#d32f2f" />
                                <p
                                  style={{ color: "#d32f2f", fontWeight: 500 }}
                                >
                                  Rejected
                                </p>
                              </div>
                            ) : (
                              <div className="customer_trans_statustext_container">
                                <BsPatchCheckFill color="#3c9111" />
                                <p
                                  style={{ color: "#3c9111", fontWeight: 500 }}
                                >
                                  Verified
                                </p>
                              </div>
                            )}
                          </div>
                        }
                      >
                        <div style={{ padding: "0px 12px" }}>
                          <table className="transaction-details-table">
                            <tbody>
                              <tr>
                                <td>Paid Date</td>
                                <td className="text-right">
                                  {moment(item.invoice_date).format(
                                    "DD/MM/YYYY",
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <td>Transaction Mode</td>
                                <td className="text-right">
                                  {item.payment_mode}
                                </td>
                              </tr>
                              <tr>
                                <td>Transaction To</td>
                                <td className="text-right">
                                  {item?.bank_name || "-"}
                                </td>
                              </tr>
                              <tr>
                                <td>Fees</td>
                                <td className="text-right">
                                  {item.fees ? `₹${item?.fees}` : "-"}
                                </td>
                              </tr>
                              <tr>
                                <td>GST(18%)</td>
                                <td className="text-right">
                                  {item.gst_amount
                                    ? `₹${item?.gst_amount}`
                                    : "-"}
                                </td>
                              </tr>
                              <tr>
                                <td>Total Fee Paid</td>
                                <td className="text-right">
                                  {item.amount ? `₹${item?.amount}` : "-"}
                                </td>
                              </tr>
                              <tr>
                                <td>Convenience Fees</td>
                                <td className="text-right">
                                  {item.convenience_fees
                                    ? `₹${item?.convenience_fees}`
                                    : "-"}
                                </td>
                              </tr>
                              <tr>
                                <td className="font-bold">Received Amount</td>
                                <td className="text-right text-success font-bold">
                                  {"₹" + item.paid_amount}
                                </td>
                              </tr>
                              {isViewOnly &&
                              item.payment_status == "Verified" ? (
                                <tr>
                                  <td>Invoice</td>
                                  <td className="text-right">
                                    <button
                                      className="customer_history_viewproofbutton btn-icon text-primary"
                                      onClick={() =>
                                        handleViewIncoice(item?.id ?? "0")
                                      }
                                    >
                                      <FaRegEye
                                        size={14}
                                        style={{
                                          marginRight: "4px",
                                          verticalAlign: "middle",
                                        }}
                                      />{" "}
                                      <span style={{ verticalAlign: "middle" }}>
                                        View Payment Invoice
                                      </span>
                                    </button>
                                  </td>
                                </tr>
                              ) : (
                                <tr>
                                  <td>Nxt Due Date</td>
                                  <td className="text-right">
                                    {item.next_due_date
                                      ? moment(item.next_due_date).format(
                                          "DD/MM/YYYY",
                                        )
                                      : "-"}
                                  </td>
                                </tr>
                              )}
                              <tr>
                                <td>Payment Screenshot</td>
                                <td className="text-right">
                                  <button
                                    className="pendingcustomer_paymentscreenshot_viewbutton btn-icon text-primary"
                                    onClick={() => {
                                      setIsOpenPaymentScreenshotModal(true);
                                      setTransactionScreenshot(
                                        item.payment_screenshot,
                                      );
                                    }}
                                  >
                                    <FaRegEye
                                      size={14}
                                      style={{
                                        marginRight: "4px",
                                        verticalAlign: "middle",
                                      }}
                                    />{" "}
                                    <span style={{ verticalAlign: "middle" }}>
                                      View screenshot
                                    </span>
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {item.payment_status == "Rejected" && (
                          <>
                            <Divider className="customer_statusupdate_divider" />
                            <div style={{ padding: "0px 12px 6px 12px" }}>
                              <Row>
                                <Col span={24}>
                                  <Row>
                                    <Col span={6}>
                                      <div className="customerdetails_rowheadingContainer">
                                        <p
                                          className="customerdetails_rowheading"
                                          style={{ color: "#d32f2f" }}
                                        >
                                          Rejection Reason:
                                        </p>
                                      </div>
                                    </Col>
                                    <Col span={18}>
                                      <p className="customerdetails_text">
                                        {item.reason}
                                      </p>
                                    </Col>
                                  </Row>
                                </Col>
                              </Row>
                            </div>
                          </>
                        )}
                      </Collapse.Panel>
                    ))}
                  </Collapse>
                </div>
              ) : (
                <p className="customer_trainerhistory_nodatatext">
                  No Data found
                </p>
              )}
            </div>

            {!isViewOnly && (
              <>
                <Divider className="leadmanger_paymentdrawer_divider" />
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
                      value={
                        paymentDetails && paymentDetails.primary_fees
                          ? paymentDetails.primary_fees
                          : "-"
                      }
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
                      value={
                        paymentDetails.tax_type.includes("18%") ? "18%" : "0%"
                      }
                      error={""}
                      height={"36px"}
                      fontSize={"12px"}
                      errorFontSize={"9px"}
                      disabled={true}
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
                      value={paymentDetails?.gst_amount}
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
                      value={paymentDetails?.total_amount || ""}
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
                      value={(
                        parseFloat(paymentDetails?.paid_amount || 0) +
                        (parseFloat(payAmount || 0) -
                          parseFloat(convenienceFees || 0))
                      ).toFixed(2)}
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
                        paymentDetails.tax_type.includes("18%")
                          ? (
                              (parseFloat(payAmount || 0) -
                                parseFloat(convenienceFees || 0)) /
                              1.18
                            ).toFixed(2)
                          : (
                              parseFloat(payAmount || 0) -
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
                        paymentDetails.tax_type.includes("18%")
                          ? (
                              ((parseFloat(payAmount || 0) -
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

                        setPayAmount("");
                        setConvenienceFees(0);

                        const amt = parseFloat(pendingAmount) || 0;
                        const actualPaid = 0;

                        setIsShowDueDate(true);

                        setBalanceAmount(getBalanceAmount(amt, actualPaid));

                        if (paymentValidationTrigger) {
                          setTransactionToError(selectValidator(selectedId));
                        }
                      }}
                      value={transactionTo}
                      error={transactionToError}
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
                      value={payAmount}
                      error={payAmountError}
                      errorFontSize="9px"
                      type="number"
                    />
                  </Col>
                </Row>

                <Row
                  gutter={16}
                  className="leadmanager_paymentdetails_drawer_rowdiv"
                  style={{ marginTop: "40px", marginBottom: "30px" }}
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
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#d32f2f",
                          marginTop: 4,
                        }}
                      >
                        {`Payment Screenshot ${paymentScreenShotError}`}
                      </p>
                    )}
                  </Col>
                </Row>
              </>
            )}

            <Modal
              title="Payment Screenshot"
              open={isOpenPaymentScreenshotModal}
              onCancel={() => setIsOpenPaymentScreenshotModal(false)}
              footer={false}
              width="32%"
              className="customer_paymentscreenshot_modal"
            >
              <div style={{ overflow: "hidden", maxHeight: "100vh" }}>
                <PrismaZoom>
                  {transactionScreenshot ? (
                    <img
                      src={`data:image/png;base64,${transactionScreenshot}`}
                      alt="payment screenshot"
                      className="customer_paymentscreenshot_image"
                    />
                  ) : (
                    "-"
                  )}
                </PrismaZoom>
              </div>
            </Modal>

            {/* invoice view modal */}
            <Modal
              open={isOpenViewInvoiceModal}
              onCancel={() => {
                setIsOpenViewInvoiceModal(false);
              }}
              footer={false}
              width="64%"
              style={{ marginBottom: "20px" }}
              zIndex={1100}
              centered
            >
              <CommonInvoiceViewer
                htmlTemplate={invoiceHtmlContent}
                candidateName={
                  customerDetails && customerDetails.name
                    ? customerDetails.name
                    : "-"
                }
              />
            </Modal>
          </>
        )}
      </div>
    );
  },
);

export default InsertPendingFees;
