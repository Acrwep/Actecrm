import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Row, Col, Steps, Button, Checkbox, Select, Tooltip } from "antd";
import { PiPhoneCallFill } from "react-icons/pi";
import { LuNotepadText } from "react-icons/lu";
import { IoCaretDownSharp } from "react-icons/io5";
import { FaPhoneAlt } from "react-icons/fa";
import CommonTextArea from "../Common/CommonTextArea";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import {
  getAllBranches,
  getBatches,
  getBatchTrack,
  getCustomerById,
  inserCustomerTrack,
  updateCustomerStatus,
  verifyCustomer,
} from "../ApiService/action";
import { CommonMessage } from "../Common/CommonMessage";
import {
  addressValidator,
  formatToBackendIST,
  selectValidator,
} from "../Common/Validation";
import CommonSpinner from "../Common/CommonSpinner";
import CommonSelectField from "../Common/CommonSelectField";
import CommonInputField from "../Common/CommonInputField";

const { Step } = Steps;

const StudentVerify = forwardRef(
  (
    { customer_details, callgetCustomersApi, setIsStatusUpdateDrawerLoading },
    ref,
  ) => {
    const [customerDetails, setCustomerDetails] = useState(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [welcomeCallStatus, setWelcomeCallStatus] = useState("");
    const [welcomeCallStatusError, setWelcomeCallStatusError] = useState("");
    const [explainedNext, setExplainedNext] = useState("");
    const [explainedNextError, setExplainedNextError] = useState("");
    const [verifiedContactDetails, setVerifiedContactDetails] = useState("");
    const [verifiedContactDetailsError, setVerifiedContactDetailsError] =
      useState("");
    //requirement verification usestates
    const [preferredBatchOptions, setPreferredBatchOptions] = useState([]);
    const [preferredBatch, setPreferredBatch] = useState(null);
    const [preferredBatchError, setPreferredBatchError] = useState("");
    const [batchTimingOptions, setBatchTimingOptions] = useState([]);
    const [batchTiming, setBatchTiming] = useState(null);
    const [batchTimingError, setBatchTimingError] = useState("");
    const [studentVerifyProofBase64, setStudentVerifyProofBase64] =
      useState("");
    const [modeOfClass, setModeOfClass] = useState("");
    const [modeOfClassError, setModeOfClassError] = useState("");
    const [placeOfService, setPlaceOfService] = useState("");
    const [placeOfServiceError, setPlaceOfServiceError] = useState("");
    const [allBranchesData, setAllBranchesData] = useState([]);
    const languagesKnownOptions = [
      { id: "English", name: "English" },
      { id: "Hindi", name: "Hindi" },
      { id: "Tamil", name: "Tamil" },
      { id: "Telugu", name: "Telugu" },
      { id: "Malayalam", name: "Malayalam" },
      { id: "Kannada", name: "Kannada" },
    ];
    const [languagesKnown, setLanguagesKnown] = useState([]);
    const [languagesKnownError, setLanguagesKnownError] = useState("");
    const [studentVerifyProofError, setStudentVerifyProofError] = useState("");
    const [studentVerifyComments, setStudentVerifyComments] = useState("");
    const [studentVerifyCommentsError, setStudentVerifyCommentsError] =
      useState("");
    //trainer fixation
    const [trainerFixationStatus, setTrainerFixationStatus] = useState(null);
    const [buttonLoading, setButtonLoading] = useState(false);
    const [fixationButtonLoading, setFixationButtonLoading] = useState(false);
    const [courseVerified, setCourseVerified] = useState("");
    const [courseVerifiedError, setCourseVerifiedError] = useState("");

    const prev = () => setStepIndex(stepIndex - 1);

    useEffect(() => {
      console.log("customer_details", customer_details);
      setWelcomeCallStatus(customer_details?.welcome_call_status === 1 ? 1 : 2);
      setExplainedNext(customer_details?.explained_next_process === 1 ? 1 : 2);
      setVerifiedContactDetails(
        customer_details?.verified_contactdetails_and_expectation === 1 ? 1 : 2,
      );
      //requirement Verification
      setPreferredBatch(customer_details?.batch_track_id);
      setBatchTiming(customer_details?.batch_timing_id);
      setModeOfClass(customer_details?.mode_of_class);
      setPlaceOfService(customer_details?.place_of_service);
      setLanguagesKnown(customer_details?.preferred_language ?? []);
      setStudentVerifyComments(customer_details?.customer_comments);
      setStudentVerifyProofBase64(
        customer_details?.customer_proof_communication,
      );
      setCourseVerified(customer_details?.technology_verified === 1 ? 1 : "");
      //trainer fixation
      setTrainerFixationStatus(
        customer_details?.trainer_fixation_call === 1 ? 1 : 2,
      );
      setCustomerDetails(customer_details);
    }, [customer_details]);

    useEffect(() => {
      getBatchTrackData();
    }, []);

    const getBatchTrackData = async () => {
      try {
        const response = await getBatchTrack();
        setPreferredBatchOptions(response?.data?.result || []);
      } catch (error) {
        setPreferredBatchOptions([]);
        console.log("response status error", error);
      } finally {
        setTimeout(() => {
          getBatchTimingData();
        }, 300);
      }
    };

    const getBatchTimingData = async () => {
      try {
        const response = await getBatches();
        console.log("batches response", response);
        setBatchTimingOptions(response?.data?.data || []);
      } catch (error) {
        setBatchTimingOptions([]);
        console.log("batch error", error);
      } finally {
        setTimeout(() => {
          getAllBranchesData();
        }, 300);
      }
    };

    const getAllBranchesData = async () => {
      try {
        const response = await getAllBranches();
        const branchData = response?.data?.result || [];

        const branchOrder = [
          "BDC",
          "Velachery",
          "Anna Nagar",
          "OMR",
          "Porur",
          "Thambaram",
          "Electronic city",
          "BTM Layout",
          "Rajaji Nagar",
          "Marathahalli",
          "Maraimalai Nagar",
          "Hebbal",
        ];

        const sortedBranches = [...branchData].sort(
          (a, b) => branchOrder.indexOf(a.name) - branchOrder.indexOf(b.name),
        );

        setAllBranchesData(sortedBranches);
      } catch (error) {
        setAllBranchesData([]);
        console.log("get all branches error", error);
      }
    };

    const getParticularCustomerDetails = async () => {
      try {
        const response = await getCustomerById(customer_details?.id);
        console.log("particular customer response", response);
        const particular_customer_details = response?.data?.data;
        setCustomerDetails(particular_customer_details);
      } catch (error) {
        console.log("getcustomer by id error", error);
        setCustomerDetails(null);
      } finally {
        setButtonLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      handleStudentVerify,
    }));

    const handleWelcomeCallDetails = async () => {
      const welcomeCallStatusValidate = selectValidator(welcomeCallStatus);
      const explainedNextValidate = selectValidator(explainedNext);
      const verifiedContactDetailsValidate = selectValidator(
        verifiedContactDetails,
      );

      setWelcomeCallStatusError(welcomeCallStatusValidate);
      setExplainedNextError(explainedNextValidate);
      setVerifiedContactDetailsError(verifiedContactDetailsValidate);

      if (
        welcomeCallStatusValidate ||
        explainedNextValidate ||
        verifiedContactDetailsValidate
      )
        return;

      const initialWelcomeCallStatus =
        customerDetails?.welcome_call_status === 1 ? 1 : 2;
      const initialExplainedNext =
        customerDetails?.explained_next_process === 1 ? 1 : 2;
      const initialVerifiedContactDetails =
        customerDetails?.verified_contactdetails_and_expectation === 1 ? 1 : 2;

      if (
        welcomeCallStatus == initialWelcomeCallStatus &&
        explainedNext == initialExplainedNext &&
        verifiedContactDetails == initialVerifiedContactDetails
      ) {
        CommonMessage("warning", "No changes made to update");
        return;
      }

      setButtonLoading(true);
      const payload = {
        customer_id: customerDetails?.id,
        proof_communication: customerDetails?.customer_proof_communication,
        comments: customerDetails?.customer_comments,
        is_satisfied: false,
        welcome_call_status: welcomeCallStatus == 1 ? 1 : 0,
        explained_next_process: explainedNext == 1 ? 1 : 0,
        verified_contactdetails_and_expectation:
          verifiedContactDetails == 1 ? 1 : 0,
        technology_verified: customerDetails?.technology_verified,
        preferred_language: customerDetails?.preferred_language,
        batch_track_id: customerDetails?.batch_track_id,
        batch_timing_id: customerDetails?.batch_timing_id,
        mode_of_class: customerDetails?.mode_of_class,
        place_of_service: customerDetails?.place_of_service,
        trainer_fixation_call: customerDetails?.trainer_fixation_call,
      };

      const changedFields = {};
      const welcomeCallOptions = [
        { id: 1, name: "Completed" },
        { id: 2, name: "Pending" },
      ];
      const yesNoOptions = [
        { id: 1, name: "Yes" },
        { id: 2, name: "No" },
      ];
      const verifiedOptions = [
        { id: 1, name: "Verified" },
        { id: 2, name: "Not Verified" },
      ];

      const getName = (options, val) => {
        const found = options.find((o) => String(o.id) === String(val));
        return found ? found.name : val;
      };

      if (welcomeCallStatus != initialWelcomeCallStatus) {
        changedFields["welcome_call_status"] = {
          previous_value: getName(welcomeCallOptions, initialWelcomeCallStatus),
          new_value: getName(welcomeCallOptions, welcomeCallStatus),
        };
      }
      if (explainedNext != initialExplainedNext) {
        changedFields["explained_next_process"] = {
          previous_value: getName(yesNoOptions, initialExplainedNext),
          new_value: getName(yesNoOptions, explainedNext),
        };
      }
      if (verifiedContactDetails != initialVerifiedContactDetails) {
        changedFields["verified_contactdetails_and_expectation"] = {
          previous_value: getName(
            verifiedOptions,
            initialVerifiedContactDetails,
          ),
          new_value: getName(verifiedOptions, verifiedContactDetails),
        };
      }

      try {
        await verifyCustomer(payload);

        const getloginUserDetails = localStorage.getItem("loginUserDetails");
        const converAsJson = getloginUserDetails
          ? JSON.parse(getloginUserDetails)
          : null;

        const trackPayload = {
          customers: [
            {
              customer_id: customerDetails?.id,
              status: "Welcome Call Details Updated",
              details: changedFields,
              status_date: formatToBackendIST(new Date()),
              updated_by: converAsJson?.user_id || "",
            },
          ],
        };
        await inserCustomerTrack(trackPayload);

        CommonMessage("success", "Welcome Call Details Updated Successfully");
        getParticularCustomerDetails();
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleTrainerFixation = async () => {
      const initialTrainerFixationStatus =
        customerDetails?.trainer_fixation_call === 1 ? 1 : 2;

      if (trainerFixationStatus == initialTrainerFixationStatus) {
        CommonMessage("warning", "No changes made to update");
        return;
      }
      setButtonLoading(true);
      const payload = {
        customer_id: customerDetails?.id,
        proof_communication: customerDetails?.customer_proof_communication,
        comments: customerDetails?.customer_comments,
        is_satisfied: 1,
        welcome_call_status: customerDetails?.welcome_call_status,
        explained_next_process: customerDetails?.explained_next_process,
        verified_contactdetails_and_expectation:
          customerDetails?.verified_contactdetails_and_expectation,
        technology_verified: courseVerified == 1 ? 1 : 0,
        preferred_language: customerDetails?.preferred_language,
        batch_track_id: customerDetails?.batch_track_id,
        batch_timing_id: customerDetails?.batch_timing_id,
        mode_of_class: customerDetails?.mode_of_class,
        place_of_service: customerDetails?.place_of_service,
        trainer_fixation_call: trainerFixationStatus == 1 ? 1 : 0,
      };

      const changedFields = {};
      const trainerFixationStatusOptions = [
        { id: 1, name: "Completed" },
        { id: 2, name: "Pending" },
      ];

      const getName = (options, val) => {
        const found = options.find((o) => String(o.id) === String(val));
        return found ? found.name : val;
      };

      if (trainerFixationStatus != initialTrainerFixationStatus) {
        changedFields["trainer_fixation_call"] = {
          previous_value: getName(
            trainerFixationStatusOptions,
            initialTrainerFixationStatus,
          ),
          new_value: getName(
            trainerFixationStatusOptions,
            trainerFixationStatus,
          ),
        };
      }

      try {
        await verifyCustomer(payload);

        const getloginUserDetails = localStorage.getItem("loginUserDetails");
        const converAsJson = getloginUserDetails
          ? JSON.parse(getloginUserDetails)
          : null;

        const trackPayload = {
          customers: [
            {
              customer_id: customerDetails?.id,
              status: "Trainer Fixation Details Updated",
              details: changedFields,
              status_date: formatToBackendIST(new Date()),
              updated_by: converAsJson?.user_id || "",
            },
          ],
        };
        await inserCustomerTrack(trackPayload);

        CommonMessage(
          "success",
          "Trainer Fixation Details Updated Successfully",
        );
        getParticularCustomerDetails();
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleStudentVerify = async () => {
      const preferredBatchValidate = selectValidator(preferredBatch);
      const batchTimingValidate = selectValidator(batchTiming);
      const modeOfClassValidate = selectValidator(modeOfClass);
      const placeOfServiceValidate = selectValidator(placeOfService);
      const languagesKnownValidate = selectValidator(languagesKnown);
      const commentValidate = addressValidator(studentVerifyComments);
      const studentVerifyProofValidate = selectValidator(
        studentVerifyProofBase64,
      );
      const courseVerifiedValidate =
        courseVerified == 1 ? "" : " is not verified";

      setPreferredBatchError(preferredBatchValidate);
      setBatchTimingError(batchTimingValidate);
      setModeOfClassError(modeOfClassValidate);
      setPlaceOfServiceError(placeOfServiceValidate);
      setStudentVerifyProofError(studentVerifyProofValidate);
      setStudentVerifyCommentsError(commentValidate);
      setCourseVerifiedError(courseVerifiedValidate);
      setLanguagesKnownError(languagesKnownValidate);

      if (
        preferredBatchValidate ||
        batchTimingValidate ||
        modeOfClassValidate ||
        placeOfServiceValidate ||
        studentVerifyProofValidate ||
        commentValidate ||
        courseVerifiedValidate ||
        languagesKnownValidate
      )
        return;

      const initialPreferredBatch = customerDetails?.batch_track_id;
      const initialBatchTiming = customerDetails?.batch_timing_id;
      const initialModeOfClass = customerDetails?.mode_of_class;
      const initialPlaceOfService = customerDetails?.place_of_service;
      const initialComments = customerDetails?.customer_comments;
      const initialProof = customerDetails?.customer_proof_communication;
      const initialCourseVerified =
        customerDetails?.technology_verified === 1 ? 1 : "";

      let initialLanguages = customerDetails?.preferred_language || [];
      if (typeof initialLanguages === "string") {
        try {
          initialLanguages = JSON.parse(initialLanguages);
        } catch (e) {
          initialLanguages = [];
        }
      }

      const oldLangStr = Array.isArray(initialLanguages)
        ? initialLanguages.join(", ")
        : "";
      const newLangStr = Array.isArray(languagesKnown)
        ? languagesKnown.join(", ")
        : "";

      if (
        preferredBatch == initialPreferredBatch &&
        batchTiming == initialBatchTiming &&
        modeOfClass == initialModeOfClass &&
        placeOfService == initialPlaceOfService &&
        studentVerifyComments == initialComments &&
        studentVerifyProofBase64 == initialProof &&
        courseVerified == initialCourseVerified &&
        oldLangStr === newLangStr
      ) {
        CommonMessage("warning", "No changes made to update");
        return;
      }

      setButtonLoading(true);

      const payload = {
        customer_id: customerDetails?.id,
        proof_communication: studentVerifyProofBase64,
        comments: studentVerifyComments,
        is_satisfied: 1,
        welcome_call_status: customerDetails?.welcome_call_status,
        explained_next_process: customerDetails?.explained_next_process,
        verified_contactdetails_and_expectation:
          customerDetails?.verified_contactdetails_and_expectation,
        technology_verified: courseVerified == 1 ? 1 : 0,
        preferred_language: languagesKnown,
        batch_track_id: preferredBatch,
        batch_timing_id: batchTiming,
        mode_of_class: modeOfClass,
        place_of_service: placeOfService,
        trainer_fixation_call: customerDetails?.trainer_fixation_call,
      };

      const changedFields = {};
      const getName = (options, val) => {
        const found = options.find((o) => String(o.id) === String(val));
        return found ? found.name : val;
      };

      if (oldLangStr !== newLangStr) {
        changedFields["preferred_language"] = {
          previous_value: oldLangStr || "Empty",
          new_value: newLangStr || "Empty",
        };
      }

      if (preferredBatch != initialPreferredBatch) {
        changedFields["preferred_batch"] = {
          previous_value:
            getName(preferredBatchOptions, initialPreferredBatch) || "Empty",
          new_value: getName(preferredBatchOptions, preferredBatch) || "Empty",
        };
      }
      if (batchTiming != initialBatchTiming) {
        changedFields["batch_timing"] = {
          previous_value:
            getName(batchTimingOptions, initialBatchTiming) || "Empty",
          new_value: getName(batchTimingOptions, batchTiming) || "Empty",
        };
      }
      const modeOfClassOptions = [
        { id: 1, name: "Online" },
        { id: 2, name: "Classroom" },
      ];
      if (modeOfClass != initialModeOfClass) {
        changedFields["mode_of_training"] = {
          previous_value:
            getName(modeOfClassOptions, initialModeOfClass) || "Empty",
          new_value: getName(modeOfClassOptions, modeOfClass) || "Empty",
        };
      }
      if (placeOfService != initialPlaceOfService) {
        changedFields["place_of_service"] = {
          previous_value:
            getName(allBranchesData, initialPlaceOfService) || "Empty",
          new_value: getName(allBranchesData, placeOfService) || "Empty",
        };
      }
      if (studentVerifyComments != initialComments) {
        changedFields["comments"] = {
          previous_value: initialComments || "Empty",
          new_value: studentVerifyComments || "Empty",
        };
      }
      if (courseVerified != initialCourseVerified) {
        const verifyOptions = [
          { id: 1, name: "Verified" },
          { id: 2, name: "Not Verified" },
        ];
        changedFields["verify_course"] = {
          previous_value:
            getName(verifyOptions, initialCourseVerified) || "Empty",
          new_value: getName(verifyOptions, courseVerified) || "Empty",
        };
      }

      if (studentVerifyProofBase64 !== initialProof) {
        changedFields["proof_communication"] = {
          previous_value: initialProof || "",
          new_value: studentVerifyProofBase64 || "",
        };
      }

      try {
        await verifyCustomer(payload);

        const getloginUserDetails = localStorage.getItem("loginUserDetails");
        const converAsJson = getloginUserDetails
          ? JSON.parse(getloginUserDetails)
          : null;

        if (Object.keys(changedFields).length > 0) {
          const trackPayload = {
            customers: [
              {
                customer_id: customerDetails?.id,
                status:
                  customerDetails?.status === "Awaiting Verify"
                    ? "Student Verified"
                    : "Requirement Verification Details Updated",
                details: changedFields,
                status_date: formatToBackendIST(new Date()),
                updated_by: converAsJson?.user_id || "",
              },
            ],
          };
          await inserCustomerTrack(trackPayload);
        }
        CommonMessage("success", "Updated Successfully");

        if (customerDetails?.status === "Awaiting Verify") {
          setTimeout(async () => {
            const getloginUserDetails =
              localStorage.getItem("loginUserDetails");
            const converAsJson = JSON.parse(getloginUserDetails);

            const payload = {
              customer_ids: [
                {
                  customer_id: customerDetails.id,
                  status: "Awaiting Trainer",
                  updated_at: formatToBackendIST(new Date()),
                  updated_by: converAsJson?.user_id || "",
                },
              ],
            };
            try {
              await updateCustomerStatus(payload);
              callgetCustomersApi();
              setTimeout(() => {
                handleSecondCustomerTrack("Awaiting Trainer");
              }, 300);
            } catch (error) {
              CommonMessage(
                "error",
                error?.response?.data?.message ||
                  "Something went wrong. Try again later",
              );
            }
          }, 300);
        }
      } catch (error) {
        setButtonLoading(false);
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

      const studentVerifiedDetails = {
        comments: studentVerifyComments,
        proof_communication: studentVerifyProofBase64,
      };

      const payload = {
        customers: [
          {
            customer_id: customerDetails.id,
            status: updatestatus,
            updated_by:
              converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
            status_date: formatToBackendIST(today),
            details: studentVerifiedDetails,
          },
        ],
      };

      try {
        await inserCustomerTrack(payload);
        setTimeout(() => {
          callgetCustomersApi();
        }, 300);
      } catch (error) {
        console.log("customer track error", error);
      }
    };

    const handleSecondCustomerTrack = async (updatestatus) => {
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
      } catch (error) {
        console.log("customer track error", error);
      }
    };

    return (
      <>
        <div className="customer_statusupdate_adddetailsContainer">
          <Steps current={stepIndex} size="small">
            <Step
              title={
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "13px",
                  }}
                >
                  Welcome Call
                  <PiPhoneCallFill
                    size={18}
                    style={{ marginLeft: 6 }}
                    color="#2d4191"
                  />
                </span>
              }
            />
            <Step
              title={
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "13px",
                  }}
                >
                  Requirement Verification
                  <LuNotepadText
                    color="#2d4191"
                    size={18}
                    style={{ marginLeft: 6 }}
                  />
                </span>
              }
            />
            <Step
              title={
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "13px",
                  }}
                >
                  Trainer Fixation
                  <FaPhoneAlt
                    color="#2d4191"
                    size={18}
                    style={{ marginLeft: 6 }}
                  />
                </span>
              }
            />
          </Steps>

          {/* <p className="customer_statusupdate_adddetails_heading">
            Add Details
          </p> */}

          {stepIndex == 0 && (
            <Row
              gutter={[12, 24]}
              style={{ marginTop: "20px", marginBottom: "30px" }}
            >
              <Col span={12}>
                <CommonSelectField
                  label={"Welcome Call Status"}
                  required={true}
                  options={[
                    { id: 1, name: "Completed" },
                    { id: 2, name: "Pending" },
                  ]}
                  onChange={(e) => {
                    setWelcomeCallStatus(e.target.value);
                    setWelcomeCallStatusError(selectValidator(e.target.value));
                  }}
                  value={welcomeCallStatus}
                  error={welcomeCallStatusError}
                  height={"33px"}
                  labelFontSize={"11px"}
                  labelMarginTop={"0px"}
                  errorFontSize="9px"
                />
              </Col>
              <Col span={12}>
                <CommonSelectField
                  label={"Explained Next Step"}
                  required={true}
                  options={[
                    { id: 1, name: "Yes" },
                    { id: 2, name: "No" },
                  ]}
                  onChange={(e) => {
                    setExplainedNext(e.target.value);
                    setExplainedNextError(selectValidator(e.target.value));
                  }}
                  value={explainedNext}
                  error={explainedNextError}
                  height={"33px"}
                  labelFontSize={"11px"}
                  labelMarginTop={"0px"}
                  errorFontSize="9px"
                />
              </Col>
              <Col span={12}>
                <CommonSelectField
                  label={"Verify Contact & Expectations"}
                  required={true}
                  options={[
                    { id: 1, name: "Verified" },
                    { id: 2, name: "Not Verified" },
                  ]}
                  onChange={(e) => {
                    setVerifiedContactDetails(e.target.value);
                    setVerifiedContactDetailsError(
                      selectValidator(e.target.value),
                    );
                  }}
                  value={verifiedContactDetails}
                  error={verifiedContactDetailsError}
                  height={"33px"}
                  labelFontSize={"11px"}
                  labelMarginTop={"0px"}
                  errorFontSize="9px"
                />
              </Col>
            </Row>
          )}

          {/* requirement verification */}
          {stepIndex == 1 && (
            <Row gutter={[12, 24]} style={{ marginTop: "20px" }}>
              <Col span={8}>
                <CommonInputField
                  label={"Course Name"}
                  value={customerDetails?.course_name}
                  height={"33px"}
                  labelFontSize={"11px"}
                  labelMarginTop={"0px"}
                  errorFontSize="9px"
                  error={courseVerifiedError}
                  disabled={true}
                  endAdornment={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginRight: "0px",
                      }}
                    >
                      <Tooltip title="Verify Course">
                        <Checkbox
                          checked={courseVerified === 1}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setCourseVerified(isChecked ? 1 : 2);
                            setCourseVerifiedError(
                              isChecked ? "" : " is not verified",
                            );
                          }}
                        ></Checkbox>
                      </Tooltip>
                    </div>
                  }
                />
              </Col>
              <Col span={8}>
                <CommonSelectField
                  label="Preferred Batch"
                  required={true}
                  options={preferredBatchOptions}
                  onChange={(e) => {
                    setPreferredBatch(e.target.value);
                    setPreferredBatchError(selectValidator(e.target.value));
                  }}
                  value={preferredBatch}
                  error={preferredBatchError}
                  height={"33px"}
                  labelFontSize={"11px"}
                  labelMarginTop={"0px"}
                  errorFontSize="9px"
                />
              </Col>
              <Col span={8}>
                <CommonSelectField
                  label="Batch Timing"
                  required={true}
                  options={batchTimingOptions}
                  onChange={(e) => {
                    setBatchTiming(e.target.value);
                    setBatchTimingError(selectValidator(e.target.value));
                  }}
                  value={batchTiming}
                  error={batchTimingError}
                  height={"33px"}
                  labelFontSize={"11px"}
                  labelMarginTop={"0px"}
                  errorFontSize="9px"
                />
              </Col>
              <Col span={8}>
                <CommonSelectField
                  label="Mode of Training"
                  options={[
                    { id: 1, name: "Online" },
                    { id: 2, name: "Classroom" },
                  ]}
                  onChange={(e) => {
                    const value = e.target.value;
                    setModeOfClass(value);
                    if (value == 1) {
                      setPlaceOfService(10);
                      setPlaceOfServiceError("");
                    } else {
                      setPlaceOfService(null);
                    }
                    setModeOfClassError(selectValidator(value));
                  }}
                  value={modeOfClass}
                  error={modeOfClassError}
                  height={"33px"}
                  labelFontSize={"11px"}
                  labelMarginTop={"0px"}
                  errorFontSize="9px"
                />
              </Col>
              <Col span={8}>
                <CommonSelectField
                  label="Place Of Service"
                  required={true}
                  options={
                    modeOfClass == 2
                      ? allBranchesData.filter(
                          (b) =>
                            b.name.toLowerCase() !== "bdc" &&
                            b.name.toLowerCase() !== "virtual",
                        )
                      : allBranchesData
                  }
                  onChange={(e) => {
                    setPlaceOfService(e.target.value);
                    setPlaceOfServiceError(selectValidator(e.target.value));
                  }}
                  value={placeOfService}
                  error={placeOfServiceError}
                  height={"33px"}
                  labelFontSize={"11px"}
                  labelMarginTop={"0px"}
                  errorFontSize={"9px"}
                  disabled={modeOfClass == 1}
                />
              </Col>
              <Col span={8}>
                <div style={{ position: "relative", height: "auto" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Select
                        className={
                          languagesKnown.length <= 0 && !languagesKnownError
                            ? "trainer_certificate_field"
                            : languagesKnown.length >= 1 && !languagesKnownError
                              ? "trainer_certificate_multiselect_two"
                              : languagesKnown.length <= 0 &&
                                  languagesKnownError
                                ? "trainer_certificate_field_error"
                                : "trainer_certificate_field"
                        }
                        style={{ width: "100%", height: "33px" }}
                        suffixIcon={
                          <IoCaretDownSharp color="rgba(0,0,0,0.54)" />
                        }
                        mode="multiple"
                        placeholder={"Select Language"}
                        allowClear
                        showSearch
                        value={languagesKnown}
                        onChange={(value) => {
                          setLanguagesKnown(value);
                          setLanguagesKnownError(selectValidator(value));
                        }}
                        status={languagesKnownError ? "error" : ""}
                        optionLabelProp="label"
                        filterOption={(input, option) =>
                          option.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      >
                        {languagesKnownOptions.map((item) => {
                          const itemValue = item.id;
                          const itemLabel = item.name;
                          return (
                            <Select.Option
                              key={itemValue}
                              value={itemValue}
                              label={itemLabel}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  textWrap: "wrap",
                                }}
                              >
                                <Checkbox
                                  checked={languagesKnown.includes(itemValue)}
                                  style={{ marginRight: 8 }}
                                  className="common_antdmultiselect_checkbox"
                                />
                                {itemLabel}
                              </div>
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </div>
                  </div>
                  {languagesKnownError && (
                    <p className="trainer_skills_error">
                      Languages {languagesKnownError}
                    </p>
                  )}
                </div>
              </Col>
              <Col span={24}>
                <CommonTextArea
                  label="Comments"
                  required={true}
                  onChange={(e) => {
                    setStudentVerifyComments(e.target.value);
                    setStudentVerifyCommentsError(
                      addressValidator(e.target.value),
                    );
                  }}
                  value={studentVerifyComments}
                  error={studentVerifyCommentsError}
                />

                <div style={{ marginTop: "40px", marginBottom: "20px" }}>
                  <ImageUploadCrop
                    label="Proof Communication"
                    aspect={1}
                    maxSizeMB={1}
                    required={true}
                    value={studentVerifyProofBase64}
                    onChange={(base64) => setStudentVerifyProofBase64(base64)}
                    onErrorChange={setStudentVerifyProofError}
                  />
                  {studentVerifyProofError && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#d32f2f",
                        marginTop: 4,
                      }}
                    >
                      {`Proof Screenshot ${studentVerifyProofError}`}
                    </p>
                  )}
                </div>
              </Col>
            </Row>
          )}

          {stepIndex == 2 && (
            <Row
              gutter={[12, 24]}
              style={{ marginTop: "20px", marginBottom: "30px" }}
            >
              <Col span={9}>
                <CommonSelectField
                  label={"Trainer Fixation Call"}
                  required={true}
                  options={[
                    { id: 1, name: "Completed" },
                    { id: 2, name: "Pending" },
                  ]}
                  onChange={(e) => {
                    setTrainerFixationStatus(e.target.value);
                  }}
                  value={trainerFixationStatus}
                  error={""}
                  height={"33px"}
                  labelFontSize={"11px"}
                  labelMarginTop={"0px"}
                  errorFontSize="9px"
                />
              </Col>
            </Row>
          )}
        </div>

        <div className="leadmanager_tablefiler_footer">
          <div
            className="leadmanager_submitlead_buttoncontainer"
            style={{ gap: "12px" }}
          >
            {stepIndex > 0 && (
              <Button onClick={prev} className="customer_stepperbuttons">
                Previous
              </Button>
            )}
            <>
              {buttonLoading ? (
                <button className={"users_adddrawer_loadingcreatebutton"}>
                  <CommonSpinner />
                </button>
              ) : (
                <button
                  className={"users_adddrawer_createbutton"}
                  onClick={
                    stepIndex === 0
                      ? handleWelcomeCallDetails
                      : stepIndex == 1
                        ? handleStudentVerify
                        : handleTrainerFixation
                  }
                >
                  Update
                </button>
              )}
            </>

            {stepIndex < 2 && (
              <>
                {fixationButtonLoading ? (
                  <Button
                    className={
                      stepIndex == 2
                        ? "customer_complete_loadingpassedoutbutton"
                        : "customer_stepperbuttons"
                    }
                  >
                    <CommonSpinner />
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setStepIndex(stepIndex + 1);
                    }}
                    className={"customer_stepperbuttons"}
                  >
                    Next
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </>
    );
  },
);
export default StudentVerify;
