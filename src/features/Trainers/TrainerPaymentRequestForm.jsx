import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Row, Col, Rate, Skeleton } from "antd";
import CommonInputField from "../Common/CommonInputField";
import CommonSelectField from "../Common/CommonSelectField";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import "./styles.css";
import PhoneWithCountry from "../Common/PhoneWithCountry";
import {
  getAllBranches,
  getCustomersByTrainerId,
  getNonClaimBatches,
  getTrainerById,
  getTrainerPaymentRequestForm,
  insertTrainerPaymentRequest,
  sendTrainerPaymentRequestMail,
  updateTrainerPaymentRequestForm,
} from "../ApiService/action";
import {
  accountNumberValidator,
  addressValidator,
  formatToBackendIST,
  getCountryFromDialCode,
  googleSheetValidator,
  ifscValidator,
  nameValidator,
  selectValidator,
} from "../Common/Validation";
import CommonTextArea from "../Common/CommonTextArea";
import { CommonMessage } from "../Common/CommonMessage";
import { AiOutlineEdit } from "react-icons/ai";

const TrainerPaymentRequestForm = forwardRef(
  (
    {
      trainer_id,
      isTrainer = false,
      payment_master_id = null,
      setButtonLoading,
      onFormRefresh,
    },
    ref,
  ) => {
    const [trainerCode, setTrainerCode] = useState("");
    const [trainerName, setTrainerName] = useState("");
    const [trainerEmail, setTrainerEmail] = useState("");
    const [trainerCountryCode, setTrainerCountryCode] = useState("");
    const [trainerCountry, setTrainerCountry] = useState("in");
    const [trainerMobile, setTrainerMobile] = useState("");
    const [trainerLocation, setTrainerLocation] = useState("");
    const [lastTransactionBankId, setLastTransactionBankId] = useState(null);
    //commercial info useStates
    const [commercialType, setCommercialType] = useState("");
    const [commercialTypeError, setCommercialTypeError] = useState("");
    const [batchData, setBatchData] = useState([]);
    const [batchId, setBatchId] = useState(null);
    const [batchIdError, setBatchIdError] = useState("");
    const [totalPayable, setTotalPayable] = useState("");
    const [totalPayableError, setTotalPayableError] = useState("");
    //bank details usestates
    const [isBankEdit, setIsBankEdit] = useState(false);
    const [trainerBankId, setTrainerBankId] = useState(null);
    const [accountHolderName, setAccountHolderName] = useState("");
    const [accountHolderNameError, setAccountHolderNameError] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountNumberError, setAccountNumberError] = useState("");
    const [bankName, setBankName] = useState("");
    const [bankNameError, setBankNameError] = useState("");
    const [branchName, setBranchName] = useState("");
    const [branchNameError, setBranchNameError] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [ifscCodeError, setIfscCodeError] = useState("");
    //training details
    const [allBranchesData, setAllBranchesData] = useState([]);
    //student details
    const [studentsData, setStudentsData] = useState([]);

    //other usestates
    const [feedBack, setFeedBack] = useState("");
    const [validationTrigger, setValidationTrigger] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formFields, setFormFields] = useState([
      {
        customer_id: null,
        customer_id_error: "",
        customer_name: "",
        customer_mobile: "",
        customer_email: "",
        commercial: "",
        course_name: "",
        duration_in_hours: "",
        duration_error: "",
        training_mode: "",
        trainer_mode_error: "",
        branch_id: "",
        branch_error: "",
        study_material: "",
        study_material_error: "",
        assessment: "",
        assessment_error: "",
        placement_guidance: "",
        placement_guidance_error: "",
        attendance_type: "Screenshot",
        attendance_sheetlink: "",
        attendance_sheetlink_error: "",
        attendance_screenshot: "",
        attendance_screenshot_error: "",
        hr_rating: "",
        coordinator_rating: "",
        commercial_percentage: "",
        trainer_mapping_id: 0,
      },
    ]);

    useEffect(() => {
      if (trainer_id) {
        getTrainerData(trainer_id);
      }
    }, [trainer_id]);

    const getTrainerData = async (trainerId) => {
      setLoading(true);
      try {
        const response = await getTrainerById(trainerId);
        console.log("trainer details", response);
        const trainerDetails = response?.data?.data;
        setTrainerCode(trainerDetails?.trainer_code);
        setTrainerName(trainerDetails?.name);
        setTrainerEmail(trainerDetails.email);
        //mobile fetch
        setTrainerCountryCode(
          trainerDetails.mobile_phone_code
            ? trainerDetails.mobile_phone_code
            : "",
        );
        const selected_mobile_country = getCountryFromDialCode(
          `+${
            trainerDetails.mobile_phone_code
              ? trainerDetails.mobile_phone_code
              : ""
          }`,
        );
        setTrainerCountry(selected_mobile_country);
        setTrainerMobile(trainerDetails.mobile);
        //-----------
        // setTechnology(trainerDetails.technology_id);
        setTrainerLocation(trainerDetails.location);
        setLastTransactionBankId(trainerDetails?.trainer_bank_id);
        setAccountHolderName(trainerDetails.account_holder_name);
        setAccountNumber(trainerDetails.account_number);
        setBankName(trainerDetails.bank_name);
        setBranchName(trainerDetails.branch_name);
        setIfscCode(trainerDetails.ifsc_code);
      } catch (error) {
        console.log(error);
      } finally {
        getAllBranchesData(trainerId);
      }
    };

    const getAllBranchesData = async (trainerId) => {
      try {
        const response = await getAllBranches();
        console.log("all branches response", response);
        setAllBranchesData(response?.data?.result || []);
      } catch (error) {
        setAllBranchesData([]);
        console.log(error);
      } finally {
        if (payment_master_id) {
          getTrainerPaymentRequestFormData();
        } else {
          setLoading(false);
        }
      }
    };

    const getCustomerByTrainerIdData = async (
      trainerId,
      commercial_type,
      batchId = null,
    ) => {
      const payload = {
        ...(batchId ? { batch_id: batchId } : { trainer_id: trainerId }),
        commercial_type: commercial_type,
        ...(batchId && { batch_id: batchId }),
      };
      try {
        const response = await getCustomersByTrainerId(payload);
        console.log("get customers response", response);
        const fetchedStudents = response?.data?.data || [];
        setStudentsData(fetchedStudents);

        if (fetchedStudents.length > 0 && batchId) {
          const newFormFields = fetchedStudents.map((student) => ({
            customer_id: student.id,
            customer_id_error: "",
            customer_name: student.name || student.customer_name || "",
            customer_mobile: student.customer_mobile || "",
            customer_email: student.customer_email || "",
            commercial: student.commercial || "",
            course_name: student.course_name || "",
            duration_in_hours: student.duration_in_hours || "",
            duration_error: "",
            training_mode: student.training_mode || "",
            trainer_mode_error: "",
            branch_id: student.branch_id || "",
            branch_error: "",
            study_material: student.study_material || "",
            study_material_error: "",
            assessment: student.assessment || "",
            assessment_error: "",
            placement_guidance: student.placement_guidance || "",
            placement_guidance_error: "",
            attendance_type: "Screenshot",
            attendance_sheetlink: student.attendance_sheetlink || "",
            attendance_sheetlink_error: "",
            attendance_screenshot: student.attendance_screenshot || "",
            attendance_screenshot_error: "",
            hr_rating: student.hr_rating || "",
            coordinator_rating: student.coordinator_rating || "",
            commercial_percentage: student.commercial_percentage || "",
            trainer_mapping_id: student.trainer_mapping_id || 0,
          }));
          setFormFields(newFormFields);
        } else {
          setFormFields([
            {
              customer_id: null,
              customer_id_error: "",
              customer_name: "",
              customer_mobile: "",
              customer_email: "",
              commercial: "",
              course_name: "",
              duration_in_hours: "",
              duration_error: "",
              training_mode: "",
              trainer_mode_error: "",
              branch_id: "",
              branch_error: "",
              study_material: "",
              study_material_error: "",
              assessment: "",
              assessment_error: "",
              placement_guidance: "",
              placement_guidance_error: "",
              attendance_type: "Screenshot",
              attendance_sheetlink: "",
              attendance_sheetlink_error: "",
              attendance_screenshot: "",
              attendance_screenshot_error: "",
              hr_rating: "",
              coordinator_rating: "",
              commercial_percentage: "",
              trainer_mapping_id: 0,
            },
          ]);
        }
      } catch (error) {
        setStudentsData([]);
        console.log("get students error", error);
      }
    };

    const getTrainerPaymentRequestFormData = async () => {
      try {
        const response = await getTrainerPaymentRequestForm(payment_master_id);
        console.log("get trainer requst form response", response);
        const payment_details = response?.data?.data || null;
        if (payment_details) {
          //bank details
          setBankName(payment_details?.bank_name);
          setAccountNumber(payment_details?.account_number);
          setAccountHolderName(payment_details?.account_holder_name);
          setIfscCode(payment_details?.ifsc_code);
          setBranchName(payment_details?.branch_name);
          setCommercialType(payment_details?.commercial_type);
          console.log(payment_details?.students, "stuuuu");

          const updatedStudents = payment_details?.students?.map((item) => ({
            ...item,
            attendance_type: "Screenshot",
          }));

          setFormFields(updatedStudents);

          if (payment_details?.commercial_type == "Batch") {
            setTotalPayable(payment_details?.request_amount);
          } else {
            const request_amount = updatedStudents.reduce((sum, item) => {
              const value = parseFloat(item.commercial || 0);
              return sum + (isNaN(value) ? 0 : value);
            }, 0);

            setTotalPayable(request_amount);
          }
        }
      } catch (error) {
        console.log("get trainer requst form error", error);
      } finally {
        setLoading(false);
      }
    };

    const handleAdd = () => {
      setFormFields([
        ...formFields,
        {
          customer_id: null,
          customer_id_error: "",
          customer_name: "",
          customer_mobile: "",
          customer_email: "",
          commercial: "",
          course_name: "",
          duration_in_hours: "",
          duration_error: "",
          training_mode: "",
          trainer_mode_error: "",
          branch_id: "",
          branch_error: "",
          study_material: "",
          study_material_error: "",
          assessment: "",
          assessment_error: "",
          placement_guidance: "",
          placement_guidance_error: "",
          attendance_type: "Screenshot",
          attendance_sheetlink: "",
          attendance_sheetlink_error: "",
          attendance_screenshot: "",
          attendance_screenshot_error: "",
          hr_rating: "",
          coordinator_rating: "",
          commercial_percentage: "",
          trainer_mapping_id: 0,
        },
      ]);
    };

    const handleRemove = (index) => {
      const updatedFormFields = [...formFields];

      // remove row
      updatedFormFields.splice(index, 1);

      if (validationTrigger) {
        // recreate student map
        const studentMap = {};

        updatedFormFields.forEach((item, i) => {
          if (item.customer_id) {
            if (!studentMap[item.customer_id]) {
              studentMap[item.customer_id] = [];
            }
            studentMap[item.customer_id].push(i);
          }
        });

        // reset errors
        updatedFormFields.forEach((item) => {
          item.customer_id_error = selectValidator(item.customer_id);
        });

        // apply duplicate errors again
        Object.values(studentMap).forEach((indexes) => {
          if (indexes.length > 1) {
            indexes.forEach((i) => {
              updatedFormFields[i].customer_id_error =
                "already selected in another row";
            });
          }
        });
      }

      setFormFields(updatedFormFields);
    };

    const handleFormFields = (field, index, value) => {
      const updatedFormFields = [...formFields];
      updatedFormFields[index][field] = value;
      if (field === "customer_id") {
        const selectedCustomerData = studentsData.filter(
          (f) => f.id == updatedFormFields[index].customer_id,
        );
        console.log("selectedCustomerData", selectedCustomerData);

        if (selectedCustomerData.length >= 1) {
          updatedFormFields[index].trainer_mapping_id =
            selectedCustomerData[0].trainer_mapping_id;

          updatedFormFields[index].commercial_percentage =
            selectedCustomerData[0].commercial_percentage;

          updatedFormFields[index].commercial_percentage =
            selectedCustomerData[0].commercial_percentage;

          // updatedFormFields[index].class_percentage =
          //   selectedCustomerData[0].class_percentage;
        } else {
          updatedFormFields[index].trainer_mapping_id = 0;
          updatedFormFields[index].commercial = "";
        }

        const studentMap = {};

        updatedFormFields.forEach((item, i) => {
          if (item.customer_id) {
            if (!studentMap[item.customer_id]) {
              studentMap[item.customer_id] = [];
            }
            studentMap[item.customer_id].push(i);
          }
        });

        // reset all previous errors
        updatedFormFields.forEach((item) => {
          item.customer_id_error = selectValidator(item.customer_id);
        });

        // mark duplicates
        Object.values(studentMap).forEach((indexes) => {
          if (indexes.length > 1) {
            indexes.forEach((i) => {
              updatedFormFields[i].customer_id_error =
                "already selected in another row";
            });
          }
        });
      }

      if (field == "training_mode") {
        updatedFormFields[index].branch_id = null;
      }

      if (validationTrigger) {
        if (field == "customer_id") {
          updatedFormFields[index].customer_id_error = selectValidator(value);
        }
        if (field == "duration_in_hours") {
          updatedFormFields[index].duration_error = selectValidator(value);
        }
        if (field == "training_mode") {
          updatedFormFields[index].trainer_mode_error = selectValidator(value);
          updatedFormFields[index].branch_error =
            value == "Online"
              ? ""
              : selectValidator(updatedFormFields[index].branch_id);
        }
        if (field == "branch_id") {
          updatedFormFields[index].branch_error = selectValidator(value);
        }
        if (field == "study_material") {
          updatedFormFields[index].study_material_error =
            selectValidator(value);
        }
        if (field == "assessment") {
          updatedFormFields[index].assessment_error = selectValidator(value);
        }
        if (field == "placement_guidance") {
          updatedFormFields[index].placement_guidance_error =
            selectValidator(value);
        }
        if (field === "attendance_type") {
          updatedFormFields[index].attendance_sheetlink = "";
          updatedFormFields[index].attendance_screenshot = "";
          updatedFormFields[index].attendance_screenshot_error =
            isTrainer && value == "Screenshot"
              ? selectValidator(updatedFormFields[index].attendance_screenshot)
              : "";
          updatedFormFields[index].attendance_sheetlink_error =
            isTrainer && value == "Link"
              ? selectValidator(updatedFormFields[index].attendance_screenshot)
              : "";
        }
        if (field === "attendance_sheetlink") {
          updatedFormFields[index].attendance_sheetlink_error =
            googleSheetValidator(value);
        }
        if (field === "attendance_screenshot") {
          updatedFormFields[index].attendance_screenshot_error =
            selectValidator(value);
        }
      }
      setFormFields(updatedFormFields);
    };

    const getNonClaimBatchesData = async () => {
      try {
        const response = await getNonClaimBatches(trainer_id);
        console.log("non claim batches response", response);
        setBatchData(response?.data?.data || []);
      } catch (error) {
        console.log("non claim batch error", error);
      }
    };

    useImperativeHandle(ref, () => ({
      handlePaymentRequestFormSubmit,
    }));

    const handlePaymentRequestFormSubmit = async () => {
      setValidationTrigger(true);
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);

      const accountHolderNameValidate = isTrainer
        ? nameValidator(accountHolderName)
        : "";
      const accountNumberValidate = isTrainer
        ? accountNumberValidator(accountNumber)
        : "";
      const bankNameValidate = isTrainer ? nameValidator(bankName) : "";
      const branchNameValidate = isTrainer ? nameValidator(branchName) : "";
      const ifscCodeValidate = isTrainer ? ifscValidator(ifscCode) : "";
      const commercialTypeValidate = selectValidator(commercialType);
      const batchIdValidate = isTrainer
        ? ""
        : commercialType != "Batch"
          ? ""
          : selectValidator(batchId);
      const totalPayableValidate = isTrainer
        ? ""
        : commercialType != "Batch"
          ? ""
          : selectValidator(totalPayable);

      let checkFormFieldsErrors = [];
      if (formFields.length >= 1) {
        const validateFormFields = formFields.map((item) => {
          return {
            ...item,
            customer_id_error: selectValidator(item.customer_id),
            duration_error: isTrainer
              ? selectValidator(item.duration_in_hours)
              : "",
            trainer_mode_error: isTrainer
              ? ""
              : selectValidator(item.training_mode),
            branch_error:
              item.training_mode == "Online"
                ? ""
                : selectValidator(item.branch_id),
            study_material_error: isTrainer
              ? selectValidator(item.study_material)
              : "",
            assessment_error: isTrainer ? selectValidator(item.assessment) : "",
            placement_guidance_error: isTrainer
              ? selectValidator(item.placement_guidance)
              : "",
            attendance_sheetlink_error:
              item.attendance_type == "Link" && isTrainer
                ? googleSheetValidator(item.attendance_sheetlink)
                : "",
            attendance_screenshot_error:
              item.attendance_type == "Screenshot" && isTrainer
                ? selectValidator(item.attendance_screenshot)
                : "",
          };
        });

        checkFormFieldsErrors = validateFormFields.filter(
          (f) =>
            f.customer_id_error != "" ||
            f.duration_error != "" ||
            f.trainer_mode_error != "" ||
            f.branch_error != "" ||
            f.study_material_error != "" ||
            f.assessment_error != "" ||
            f.placement_guidance_error != "" ||
            f.attendance_sheetlink_error != "" ||
            f.attendance_screenshot_error != "",
        );

        // 🔥 DUPLICATE STUDENT CHECK
        const studentMap = {};

        validateFormFields.forEach((item, index) => {
          if (item.customer_id) {
            if (!studentMap[item.customer_id]) {
              studentMap[item.customer_id] = [];
            }
            studentMap[item.customer_id].push(index);
          }
        });

        Object.values(studentMap).forEach((indexes) => {
          if (indexes.length > 1) {
            indexes.forEach((i) => {
              validateFormFields[i].customer_id_error =
                "already selected in another row";
            });
          }
        });

        setFormFields(validateFormFields);
      }

      setAccountHolderNameError(accountHolderNameValidate);
      setAccountNumberError(accountNumberValidate);
      setBankNameError(bankNameValidate);
      setBranchNameError(branchNameValidate);
      setIfscCodeError(ifscCodeValidate);
      setCommercialTypeError(commercialTypeValidate);
      setBatchIdError(batchIdValidate);
      setTotalPayableError(totalPayableValidate);

      if (
        accountHolderNameValidate ||
        accountNumberValidate ||
        bankNameValidate ||
        branchNameValidate ||
        ifscCodeValidate ||
        commercialTypeValidate ||
        batchIdValidate ||
        totalPayableValidate ||
        checkFormFieldsErrors.length >= 1
      )
        return;

      setButtonLoading(true);

      const request_amount = formFields.reduce((sum, item) => {
        const value = parseFloat(item.commercial || 0);
        return sum + (isNaN(value) ? 0 : value);
      }, 0);

      if (isTrainer) {
        const updatePayload = {
          payment_master_id: payment_master_id,
          trainer_id: trainer_id,
          account_number: accountNumber,
          account_holder_name: accountHolderName,
          bank_name: bankName,
          ifsc_code: ifscCode,
          branch_name: branchName,
          feedback: feedBack,
          students: formFields,
          updated_date: formatToBackendIST(new Date()),
        };

        try {
          await updateTrainerPaymentRequestForm(updatePayload);
          setTimeout(() => {
            CommonMessage("success", "Request Sent Successfully");
            // Refresh the payment requests data
            setButtonLoading(false);
            onFormRefresh();
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
        const payload = {
          trainer_id: trainer_id,
          request_amount:
            commercialType == "Batch" ? totalPayable : request_amount,
          bank_id: lastTransactionBankId,
          commercial_type: commercialType,
          created_by: convertAsJson?.user_id,
          created_date: formatToBackendIST(new Date()),
          feedback: feedBack,
          students: formFields,
          email_link: `${
            import.meta.env.VITE_EMAIL_URL
          }/acknowledge-class-completion`,
          batch_id: batchId,
        };

        console.log("update payload", payload);
        // setButtonLoading(false);
        // return;

        try {
          const response = await insertTrainerPaymentRequest(payload);
          console.log("success response", response);
          setTimeout(() => {
            CommonMessage("success", "Form Sent to Trainer Successfully");
            const success_data = response?.data?.data;
            // Refresh the payment requests data
            setButtonLoading(false);
            handleSendFormLink(
              success_data?.trainer_id,
              success_data?.payment_master_id,
            );
            onFormRefresh();
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

    const handleSendFormLink = async (trainerId, paymentMasterId) => {
      const payload = {
        email: trainerEmail,
        link: `${
          import.meta.env.VITE_EMAIL_URL
        }/trainer-payment-claim/${trainerId}/${paymentMasterId}`,
        trainer_id: trainerId,
        payment_master_id: paymentMasterId,
      };

      try {
        await sendTrainerPaymentRequestMail(payload);
      } catch (error) {
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    if (loading) {
      return (
        <Skeleton
          active
          style={{ marginTop: "20px" }}
          paragraph={{ rows: 10 }}
        />
      );
    }

    return (
      <div>
        <p className="trainer_paymentrequestform_headings">Trainer Details</p>
        <Row
          gutter={[16, 22]}
          style={{ marginTop: "12px", marginBottom: "22px" }}
        >
          <Col
            xs={24}
            sm={24}
            md={12}
            className="trainer_paymentrequestform_five_col"
          >
            <CommonInputField
              label={"Trainer Id"}
              value={trainerCode}
              disabled={true}
            />
          </Col>

          <Col
            xs={24}
            sm={24}
            md={12}
            className="trainer_paymentrequestform_five_col"
          >
            <CommonInputField
              label={"Trainer Name"}
              value={trainerName}
              disabled={true}
            />
          </Col>

          <Col
            xs={24}
            sm={24}
            md={12}
            className="trainer_paymentrequestform_five_col"
          >
            <PhoneWithCountry
              label="Trainer Contact"
              onChange={(value) => {
                setTrainerMobile(value);
              }}
              selectedCountry={trainerCountry}
              countryCode={(code) => {
                setTrainerCountryCode(code);
              }}
              onCountryChange={(iso2) => {
                setTrainerCountry(iso2);
              }}
              value={trainerMobile}
              disabled={true}
              disableCountrySelect={true}
            />{" "}
          </Col>

          <Col
            xs={24}
            sm={24}
            md={12}
            className="trainer_paymentrequestform_five_col"
          >
            <CommonInputField
              label={"Email Id"}
              value={trainerEmail}
              disabled={true}
            />
          </Col>

          <Col
            xs={24}
            sm={24}
            md={12}
            className="trainer_paymentrequestform_five_col"
          >
            <CommonInputField
              label={"Location"}
              value={trainerLocation}
              disabled={true}
            />
          </Col>
        </Row>

        {/* <p className="trainer_paymentrequestform_headings">Bank Details</p> */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p className="trainer_paymentrequestform_headings">Bank Details</p>
          {isTrainer && (
            <div
              style={{
                display: "flex",
                gap: "4px",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => setIsBankEdit(true)}
            >
              <AiOutlineEdit />
              <p style={{ fontSize: "13px", fontWeight: 500 }}>Edit</p>
            </div>
          )}
        </div>
        <Row
          gutter={[16, 22]}
          style={{ marginTop: "12px", marginBottom: "22px" }}
        >
          <Col
            xs={24}
            sm={24}
            md={12}
            className="trainer_paymentrequestform_five_col"
          >
            <CommonInputField
              label={"Bank Name"}
              required={isTrainer ? true : false}
              onChange={(e) => {
                setBankName(e.target.value);
                if (validationTrigger) {
                  setBankNameError(nameValidator(e.target.value));
                }
              }}
              value={bankName}
              errorFontSize={"10px"}
              error={isTrainer ? bankNameError : ""}
              disabled={!isBankEdit}
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={12}
            className="trainer_paymentrequestform_five_col"
          >
            <CommonInputField
              label={"Account Holder Name"}
              required={isTrainer ? true : false}
              onChange={(e) => {
                setAccountHolderName(e.target.value);
                if (validationTrigger) {
                  setAccountHolderNameError(nameValidator(e.target.value));
                }
              }}
              value={accountHolderName}
              error={isTrainer ? accountHolderNameError : ""}
              errorFontSize={"10px"}
              disabled={!isBankEdit}
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={12}
            className="trainer_paymentrequestform_five_col"
          >
            <CommonInputField
              label={"Account Number"}
              required={isTrainer ? true : false}
              onChange={(e) => {
                setAccountNumber(e.target.value);
                if (validationTrigger) {
                  setAccountNumberError(accountNumberValidator(e.target.value));
                }
              }}
              value={accountNumber}
              error={isTrainer ? accountNumberError : ""}
              errorFontSize={"10px"}
              disabled={!isBankEdit}
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={12}
            className="trainer_paymentrequestform_five_col"
          >
            <CommonInputField
              label={"IFSC Code"}
              required={isTrainer ? true : false}
              onChange={(e) => {
                setIfscCode(e.target.value);
                if (validationTrigger) {
                  setIfscCodeError(ifscValidator(e.target.value));
                }
              }}
              value={ifscCode}
              error={isTrainer ? ifscCodeError : ""}
              errorFontSize={"10px"}
              disabled={!isBankEdit}
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={12}
            className="trainer_paymentrequestform_five_col"
          >
            <CommonInputField
              label={"Branch"}
              required={isTrainer ? true : false}
              onChange={(e) => {
                setBranchName(e.target.value);
                if (validationTrigger) {
                  setBranchNameError(nameValidator(e.target.value));
                }
              }}
              value={branchName}
              error={isTrainer ? branchNameError : ""}
              errorFontSize={"10px"}
              disabled={!isBankEdit}
            />
          </Col>
        </Row>

        <p className="trainer_paymentrequestform_headings">Commercial Info</p>
        <Row
          gutter={[16, 22]}
          style={{ marginTop: "12px", marginBottom: "22px" }}
        >
          <Col
            xs={24}
            sm={24}
            md={12}
            className="trainer_paymentrequestform_five_col"
          >
            <CommonSelectField
              label={"Commercial Type"}
              required={true}
              options={[
                { id: "Pay Per Head", name: "Pay Per Head" },
                { id: "Batch", name: "Batch" },
              ]}
              onChange={(e) => {
                const value = e.target.value;
                setCommercialType(value);
                setStudentsData([]);
                setTotalPayable("");
                setTotalPayableError("");
                setFormFields([
                  {
                    customer_id: null,
                    customer_id_error: "",
                    customer_name: "",
                    customer_mobile: "",
                    customer_email: "",
                    commercial: "",
                    course_name: "",
                    duration_in_hours: "",
                    duration_error: "",
                    training_mode: "",
                    trainer_mode_error: "",
                    branch_id: "",
                    branch_error: "",
                    study_material: "",
                    study_material_error: "",
                    assessment: "",
                    assessment_error: "",
                    placement_guidance: "",
                    placement_guidance_error: "",
                    attendance_type: "Screenshot",
                    attendance_sheetlink: "",
                    attendance_sheetlink_error: "",
                    attendance_screenshot: "",
                    attendance_screenshot_error: "",
                    hr_rating: "",
                    coordinator_rating: "",
                    commercial_percentage: "",
                    trainer_mapping_id: 0,
                  },
                ]);

                if (value == "Batch") {
                  getNonClaimBatchesData();
                } else {
                  setBatchId(null);
                  setBatchIdError("");
                  getCustomerByTrainerIdData(trainer_id, value, null);
                }
                if (validationTrigger) {
                  setCommercialTypeError(selectValidator(value));
                }
              }}
              value={commercialType}
              error={commercialTypeError}
              errorFontSize={"9px"}
              disabled={isTrainer}
            />
          </Col>

          {!isTrainer && commercialType == "Batch" && (
            <Col
              xs={24}
              sm={24}
              md={12}
              className="trainer_paymentrequestform_five_col"
            >
              <CommonSelectField
                label={"Select Batch"}
                required={true}
                options={batchData?.map((item) => ({
                  id: item.id,
                  name: item.batch_name,
                }))}
                // options={batchData}
                onChange={(e) => {
                  const value = e.target.value;
                  setBatchId(value);
                  getCustomerByTrainerIdData(null, commercialType, value);
                  if (validationTrigger) {
                    setBatchIdError(selectValidator(value));
                  }
                }}
                value={batchId}
                error={batchIdError}
                errorFontSize={"9px"}
              />
            </Col>
          )}

          <Col
            xs={24}
            sm={24}
            md={12}
            className="trainer_paymentrequestform_five_col"
          >
            <CommonInputField
              label={"Total Payable"}
              required={commercialType == "Batch" ? true : false}
              type={"number"}
              onChange={(e) => {
                setTotalPayable(e.target.value);
                if (validationTrigger) {
                  setTotalPayableError(selectValidator(e.target.value));
                }
              }}
              value={totalPayable}
              error={totalPayableError}
              errorFontSize={"9px"}
              disabled={
                isTrainer ? true : commercialType == "Batch" ? false : true
              }
            />
          </Col>
          <Col className="trainer_paymentrequestform_five_col"></Col>
          <Col className="trainer_paymentrequestform_five_col"></Col>
          <Col className="trainer_paymentrequestform_five_col"></Col>
        </Row>

        {formFields.map((item, index) => {
          return (
            <div
              key={index}
              className="trainer_paymentrequestform_dynamic_section"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p className="trainer_paymentrequestform_headings">
                  Student Details
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  {index === 0 &&
                    isTrainer == false &&
                    commercialType != "Batch" && (
                      <button
                        type="button"
                        className="trainer_paymentrequestform_add_button"
                        onClick={handleAdd}
                      >
                        Add
                      </button>
                    )}
                  {index > 0 &&
                    isTrainer == false &&
                    commercialType != "Batch" && (
                      <button
                        type="button"
                        className="trainer_paymentrequestform_remove_button"
                        onClick={() => handleRemove(index)}
                      >
                        Remove
                      </button>
                    )}
                </div>
              </div>
              <Row
                gutter={[16, 22]}
                style={{ marginTop: "9px", marginBottom: "22px" }}
              >
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  className="trainer_paymentrequestform_five_col"
                >
                  {payment_master_id ? (
                    <CommonInputField
                      label={"Name"}
                      value={item.customer_name}
                      onChange={(e) =>
                        handleFormFields("customer_name", index, e.target.value)
                      }
                      disabled={true}
                    />
                  ) : (
                    <CommonSelectField
                      label={"Student"}
                      required={true}
                      options={studentsData.filter(
                        (student) =>
                          student.id == item.customer_id ||
                          !formFields.some(
                            (f, i) =>
                              i !== index && f.customer_id == student.id,
                          ),
                      )}
                      value={item.customer_id}
                      onChange={(e) => {
                        const selectedStudent = studentsData.find(
                          (student) => student.id == e.target.value,
                        );

                        handleFormFields("customer_id", index, e.target.value);

                        handleFormFields(
                          "customer_mobile",
                          index,
                          selectedStudent?.customer_mobile || "",
                        );

                        handleFormFields(
                          "commercial",
                          index,
                          selectedStudent?.commercial || "",
                        );

                        handleFormFields(
                          "customer_email",
                          index,
                          selectedStudent?.customer_email || "",
                        );

                        handleFormFields(
                          "course_name",
                          index,
                          selectedStudent?.course_name || "",
                        );

                        if (commercialType != "Batch") {
                          // calculate total payable
                          const updatedFields = [...formFields];

                          updatedFields[index].commercial = Number(
                            selectedStudent?.commercial || 0,
                          );

                          const total = updatedFields.reduce((sum, item) => {
                            return sum + Number(item.commercial || 0);
                          }, 0);

                          setTotalPayable(total);
                        }
                      }}
                      error={item.customer_id_error}
                      errorFontSize={
                        item.customer_id_error &&
                        item.customer_id_error.length >= 20
                          ? "7.9px"
                          : "9px"
                      }
                      disabled={commercialType == "Batch"}
                      disableClearable={false}
                    />
                  )}
                </Col>
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  className="trainer_paymentrequestform_five_col"
                >
                  <CommonInputField
                    label={"Mobile"}
                    value={item.customer_mobile}
                    onChange={(e) =>
                      handleFormFields("customer_mobile", index, e.target.value)
                    }
                    disabled={true}
                  />
                </Col>
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  className="trainer_paymentrequestform_five_col"
                >
                  <CommonInputField
                    label={"Email"}
                    value={item.customer_email}
                    onChange={(e) =>
                      handleFormFields("customer_email", index, e.target.value)
                    }
                    disabled={true}
                  />
                </Col>
                {commercialType != "Batch" && (
                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    className="trainer_paymentrequestform_five_col"
                  >
                    <CommonInputField
                      label={"Commercial"}
                      value={item.commercial}
                      onChange={(e) =>
                        handleFormFields("commercial", index, e.target.value)
                      }
                      disabled={true}
                    />
                  </Col>
                )}
                <Col className="trainer_paymentrequestform_five_col"></Col>
              </Row>

              <p className="trainer_paymentrequestform_headings">
                Training Details
              </p>
              <Row
                gutter={[16, 22]}
                style={{ marginTop: "12px", marginBottom: "22px" }}
              >
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  className="trainer_paymentrequestform_five_col"
                >
                  <CommonInputField
                    label={"Course"}
                    value={item.course_name}
                    onChange={(e) =>
                      handleFormFields("course_name", index, e.target.value)
                    }
                    disabled={true}
                  />
                </Col>
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  className="trainer_paymentrequestform_five_col"
                >
                  <CommonInputField
                    label={"Duration IN Hours"}
                    required={isTrainer ? true : false}
                    placeholder={"20 - 25 hrs"}
                    value={item.duration_in_hours}
                    type={"number"}
                    onChange={(e) =>
                      handleFormFields(
                        "duration_in_hours",
                        index,
                        e.target.value,
                      )
                    }
                    error={item.duration_error}
                    errorFontSize={"9px"}
                    disabled={isTrainer ? false : true}
                  />
                </Col>
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  className="trainer_paymentrequestform_five_col"
                >
                  <CommonSelectField
                    label={"TR. Mode"}
                    required={true}
                    options={[
                      { id: "Online", name: "Online" },
                      { id: "Classroom", name: "Classroom" },
                    ]}
                    value={item.training_mode}
                    onChange={(e) =>
                      handleFormFields(
                        "training_mode",
                        index,
                        e?.target?.value || e,
                      )
                    }
                    error={item.trainer_mode_error}
                    disabled={isTrainer}
                  />
                </Col>

                {item.training_mode == "Classroom" && (
                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    className="trainer_paymentrequestform_five_col"
                  >
                    <CommonSelectField
                      label={"Branch"}
                      required={isTrainer ? true : false}
                      options={allBranchesData.filter((f) => f.name != "BDC")}
                      value={item.branch_id}
                      onChange={(e) =>
                        handleFormFields(
                          "branch_id",
                          index,
                          e?.target?.value || e,
                        )
                      }
                      error={item.branch_error}
                      disabled={isTrainer}
                    />
                  </Col>
                )}

                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  className="trainer_paymentrequestform_five_col"
                >
                  <CommonSelectField
                    label={"Study Material"}
                    required={isTrainer ? true : false}
                    options={[
                      { id: "Provided", name: "Provided" },
                      { id: "Not-Provided", name: "Not-Provided" },
                    ]}
                    value={item.study_material}
                    onChange={(e) =>
                      handleFormFields(
                        "study_material",
                        index,
                        e?.target?.value || e,
                      )
                    }
                    error={item.study_material_error}
                    errorFontSize={"9px"}
                    disabled={isTrainer ? false : true}
                  />
                </Col>
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  className="trainer_paymentrequestform_five_col"
                >
                  <CommonSelectField
                    label={"Assessment"}
                    required={isTrainer ? true : false}
                    options={[
                      { id: "Conducted", name: "Conducted" },
                      { id: "Not-Conducted", name: "Not-Conducted" },
                    ]}
                    value={item.assessment}
                    onChange={(e) =>
                      handleFormFields(
                        "assessment",
                        index,
                        e?.target?.value || e,
                      )
                    }
                    error={item.assessment_error}
                    errorFontSize={"9px"}
                    disabled={isTrainer ? false : true}
                  />
                </Col>
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  className="trainer_paymentrequestform_five_col"
                >
                  <CommonSelectField
                    label={"Placement Guidance"}
                    required={isTrainer ? true : false}
                    options={[
                      { id: "Given", name: "Given" },
                      { id: "Not-Given", name: "Not-Given" },
                    ]}
                    value={item.placement_guidance}
                    onChange={(e) =>
                      handleFormFields(
                        "placement_guidance",
                        index,
                        e?.target?.value || e,
                      )
                    }
                    error={item.placement_guidance_error}
                    errorFontSize={"9px"}
                    disabled={isTrainer ? false : true}
                  />{" "}
                </Col>
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  className="trainer_paymentrequestform_five_col"
                >
                  <CommonSelectField
                    label={"Attendance Type"}
                    required={isTrainer ? true : false}
                    options={[
                      { id: "Link", name: "Link" },
                      { id: "Screenshot", name: "Screenshot" },
                    ]}
                    value={item.attendance_type}
                    onChange={(e) =>
                      handleFormFields(
                        "attendance_type",
                        index,
                        e?.target?.value || e,
                      )
                    }
                    disabled={isTrainer ? false : true}
                  />
                </Col>
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  className="trainer_paymentrequestform_five_col"
                >
                  <p style={{ fontSize: "12px", color: "#333" }}>HR Ratings</p>
                  <Rate
                    value={item.hr_rating || 1}
                    onChange={(value) =>
                      handleFormFields("hr_rating", index, value)
                    }
                    style={{
                      fontSize: "15px",
                      color: "#f59e0b",
                      marginTop: "4px",
                    }}
                    allowHalf={true}
                    disabled={isTrainer ? false : true}
                  />
                </Col>
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  className="trainer_paymentrequestform_five_col"
                >
                  <p style={{ fontSize: "12px", color: "#333" }}>
                    Coordinator Ratings
                  </p>
                  <Rate
                    value={item?.coordinator_rating || 1}
                    onChange={(value) =>
                      handleFormFields("coordinator_rating", index, value)
                    }
                    style={{
                      fontSize: "15px",
                      color: "#f59e0b",
                      marginTop: "4px",
                    }}
                    allowHalf={true}
                    disabled={isTrainer ? false : true}
                  />
                </Col>
                {item.training_mode == "Online" ? (
                  <Col className="trainer_paymentrequestform_five_col"></Col>
                ) : (
                  ""
                )}
              </Row>

              <p className="trainer_paymentrequestform_headings">
                Upload Documents
              </p>
              <Row
                gutter={[16, 22]}
                style={{ marginTop: "12px", marginBottom: "22px" }}
              >
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  className="trainer_paymentrequestform_five_col"
                >
                  {item.attendance_type == "Link" ? (
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
                      disabled={isTrainer ? false : true}
                    />
                  ) : (
                    <div
                      style={{
                        marginTop: "20px",
                        ...(isTrainer
                          ? {}
                          : {
                              background: "#eff6ff",
                              pointerEvents: "none",
                              opacity: 0.8,
                            }),
                      }}
                    >
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
                    </div>
                  )}
                </Col>
              </Row>
            </div>
          );
        })}

        <p className="trainer_paymentrequestform_headings">Feedback</p>

        <Row style={{ marginTop: "12px" }}>
          <Col span={24}>
            <CommonTextArea
              label={""}
              textAreaStyle={{
                height: "100%",
                resize: "none",
                flex: 1,
              }}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
              placeholder="Enter remarks..."
              value={feedBack}
              onChange={(e) => {
                setFeedBack(e.target.value);
              }}
              error={""}
              disabled={isTrainer ? false : true}
            />{" "}
          </Col>
        </Row>
      </div>
    );
  },
);
export default TrainerPaymentRequestForm;
