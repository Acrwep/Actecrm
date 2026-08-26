import React, {
  useState,
  useEffect,
  useMemo,
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
  getTrainers,
  insertTrainerPaymentDirectlyToPaid,
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
import CommonCustomerSingleSelectField from "../Common/CommonCustomerSingleSelect";
import CommonMuiDatePicker from "../Common/CommonMuiDatePicker";

const TrainerPaymentDirectPaid = forwardRef(
  ({ payment_master_id = null, setButtonLoading, onFormRefresh }, ref) => {
    const [trainerCountryCode, setTrainerCountryCode] = useState("");
    const [trainerCountry, setTrainerCountry] = useState("in");
    //trainer select field states
    /* ---------------- Trainer STATES ---------------- */
    const [trainersDataList, setTrainersDataList] = useState([]);
    // ✅ IMPORTANT: keep IDs & Objects separately
    const [selectedTrainerId, setSelectedTrainerId] = useState(null);
    const [selectedTrainerIdError, setSelectedTrainerIdError] = useState("");
    const [selectedTrainerObject, setSelectedTrainerObject] = useState(null);
    const [trainerSearchText, setTrainerSearchText] = useState("");
    /* ---------------- PAGINATION ---------------- */
    const [trainerPage, setTrainerPage] = useState(1);
    const [trainerHasMore, setTrainerHasMore] = useState(true);
    const [trainerSelectloading, setTrainerSelectloading] = useState(false);

    //commercial info useStates
    const [commercialType, setCommercialType] = useState("");
    const [commercialTypeError, setCommercialTypeError] = useState("");
    const [batchData, setBatchData] = useState([]);
    const [batchId, setBatchId] = useState(null);
    const [batchIdError, setBatchIdError] = useState("");
    const [totalPayable, setTotalPayable] = useState("");
    const [totalPayableError, setTotalPayableError] = useState("");
    //bank details usestates
    const [accountHolderName, setAccountHolderName] = useState("");
    const [accountHolderNameError, setAccountHolderNameError] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountNumberError, setAccountNumberError] = useState("");
    const [bankName, setBankName] = useState("");
    const [bankNameError, setBankNameError] = useState("");
    const [branchName, setBranchName] = useState("");
    const [branchNameError, setBranchNameError] = useState("");
    const [accountType, setAccountType] = useState("");
    const [accountTypeError, setAccountTypeError] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [ifscCodeError, setIfscCodeError] = useState("");
    //training details
    const [allBranchesData, setAllBranchesData] = useState([]);
    //student details
    const [studentsData, setStudentsData] = useState([]);
    //payment details usestates
    const [paymentDate, setPaymentDate] = useState(null);
    const [paymentDateError, setPaymentDateError] = useState("");
    const [paymentMode, setPaymentMode] = useState("");
    const [paymentModeError, setPaymentModeError] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [transactionIdError, setTransactionIdError] = useState("");
    //other usestates
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
      getTrainersData();
      getAllBranchesData();
    }, []);

    const getAllBranchesData = async (trainerId) => {
      try {
        const response = await getAllBranches();
        console.log("all branches response", response);
        setAllBranchesData(response?.data?.result || []);
      } catch (error) {
        setAllBranchesData([]);
        console.log(error);
      } finally {
        setLoading(false);
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

    /* ---------------- FETCH TRAINERS ---------------- */
    const getTrainersData = async (searchvalue, pageNumber = 1) => {
      setTrainerSelectloading(true);
      const payload = {
        // status: "Verified",
        keyword: searchvalue,
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
        setLoading(false);
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
      if (validationTrigger) {
        setSelectedTrainerIdError(selectValidator(selectedId));
      }
      formReset();
      if (selectedId) {
        const selectedObj = event.target.object;
        console.log("selectedObj", selectedObj);
        setSelectedTrainerId(selectedId);
        setSelectedTrainerObject(selectedObj);
        setTrainerSearchText(selectedObj?.name || "");
        //mobile fetch
        setTrainerCountryCode(
          selectedObj.mobile_phone_code ? selectedObj.mobile_phone_code : "",
        );
        const selected_mobile_country = getCountryFromDialCode(
          `+${
            selectedObj.mobile_phone_code ? selectedObj.mobile_phone_code : ""
          }`,
        );
        setTrainerCountry(selected_mobile_country);
        //fetch account details
        setAccountHolderName(selectedObj.account_holder_name);
        setAccountNumber(selectedObj.account_number);
        setBankName(selectedObj.bank_name);
        setBranchName(selectedObj.branch_name);
        setAccountType(selectedObj.account_type);
        setIfscCode(selectedObj.ifsc_code);
      } else {
        setSelectedTrainerId(null);
        setSelectedTrainerObject(null);
        setTrainerSearchText("");
        getTrainersData(null, 1);
      }
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
          updatedFormFields[index].attendance_screenshot_error = "";
          updatedFormFields[index].attendance_sheetlink_error = "";
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
        const response = await getNonClaimBatches(selectedTrainerId);
        console.log("non claim batches response", response);
        setBatchData(response?.data?.data || []);
      } catch (error) {
        console.log("non claim batch error", error);
      }
    };

    useImperativeHandle(ref, () => ({
      handleInsertTrainerPaymentDirectlyToPaid,
    }));

    const handleInsertTrainerPaymentDirectlyToPaid = async () => {
      setValidationTrigger(true);
      const getLoginUserDetails = localStorage.getItem("loginUserDetails");
      const convertAsJson = JSON.parse(getLoginUserDetails);

      const trainerIdValidate = selectValidator(selectedTrainerId);
      const accountHolderNameValidate = nameValidator(accountHolderName);
      const accountNumberValidate = accountNumberValidator(accountNumber);
      const bankNameValidate = nameValidator(bankName);
      const branchNameValidate = nameValidator(branchName);
      const accountTypeValidate = nameValidator(accountType);
      const ifscCodeValidate = ifscValidator(ifscCode);
      const commercialTypeValidate = selectValidator(commercialType);
      const batchIdValidate =
        commercialType != "Batch" ? "" : selectValidator(batchId);
      const totalPayableValidate =
        commercialType != "Batch" ? "" : selectValidator(totalPayable);
      const paymentDateValidate = selectValidator(paymentDate);
      const paymentModeValidate = selectValidator(paymentMode);
      const transactionIdValidate = selectValidator(transactionId);

      let checkFormFieldsErrors = [];
      if (formFields.length >= 1) {
        const validateFormFields = formFields.map((item) => {
          return {
            ...item,
            customer_id_error: selectValidator(item.customer_id),
            duration_error: "",
            trainer_mode_error: selectValidator(item.training_mode),
            branch_error:
              item.training_mode == "Online"
                ? ""
                : selectValidator(item.branch_id),
            study_material_error: "",
            assessment_error: "",
            placement_guidance_error: "",
            attendance_sheetlink_error: "",
            attendance_screenshot_error: "",
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

      setSelectedTrainerIdError(trainerIdValidate);
      setAccountHolderNameError(accountHolderNameValidate);
      setAccountNumberError(accountNumberValidate);
      setBankNameError(bankNameValidate);
      setBranchNameError(branchNameValidate);
      setAccountTypeError(accountTypeValidate);
      setIfscCodeError(ifscCodeValidate);
      setCommercialTypeError(commercialTypeValidate);
      setBatchIdError(batchIdValidate);
      setTotalPayableError(totalPayableValidate);
      setPaymentDateError(paymentDateValidate);
      setPaymentModeError(paymentModeValidate);
      setTransactionIdError(transactionIdValidate);

      if (
        trainerIdValidate ||
        accountHolderNameValidate ||
        accountNumberValidate ||
        bankNameValidate ||
        branchNameValidate ||
        accountTypeValidate ||
        ifscCodeValidate ||
        commercialTypeValidate ||
        batchIdValidate ||
        totalPayableValidate ||
        checkFormFieldsErrors.length >= 1 ||
        paymentDateValidate ||
        paymentModeValidate ||
        transactionIdValidate
      ) {
        CommonMessage("error", "Please fill in all mandatory fields.");
        return;
      }

      setButtonLoading(true);

      const request_amount = formFields.reduce((sum, item) => {
        const value = parseFloat(item.commercial || 0);
        return sum + (isNaN(value) ? 0 : value);
      }, 0);

      const payload = {
        trainer_id: selectedTrainerId,
        request_amount:
          commercialType == "Batch" ? totalPayable : request_amount,
        bank_id: selectedTrainerObject?.trainer_bank_id || null,
        commercial_type: commercialType,
        created_by: convertAsJson?.user_id,
        created_date: formatToBackendIST(new Date()),
        feedback: "",
        students: formFields,
        batch_id: batchId,
        account_number: accountNumber,
        account_holder_name: accountHolderName,
        bank_name: bankName,
        ifsc_code: ifscCode,
        branch_name: branchName,
        account_type: accountType,
        paid_amount: commercialType == "Batch" ? totalPayable : request_amount,
        transaction_id: transactionId,
        payment_mode: paymentMode,
        paid_date: formatToBackendIST(paymentDate),
        paid_by: convertAsJson?.user_id,
      };

      console.log("update payload", payload);
      // setButtonLoading(false);
      // return;

      try {
        const response = await insertTrainerPaymentDirectlyToPaid(payload);
        console.log("success response", response);
        setTimeout(() => {
          CommonMessage("success", "Payment Added Successfully");
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
    };

    const formReset = () => {
      setBankName("");
      setBankNameError("");
      setAccountHolderName("");
      setAccountHolderNameError("");
      setAccountNumber("");
      setAccountNumberError("");
      setBranchName("");
      setBranchNameError("");
      setAccountType("");
      setAccountTypeError("");
      setIfscCode("");
      setIfscCodeError("");
      setCommercialType("");
      setBatchId("");
      setTotalPayable("");
      setStudentsData([]);
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
            {/* <CommonInputField
              label={"Trainer Id"}
              value={trainerCode}
              disabled={true}
            /> */}
            <CommonCustomerSingleSelectField
              label="Trainer"
              height="32px"
              labelMarginTop="-1px"
              required={false}
              options={mergedTrainersList}
              value={selectedTrainerId}
              inputValue={trainerSearchText}
              onChange={handleTrainerSelect}
              onInputChange={handleTrainerSearch}
              onDropdownOpen={handleTrainerDropdownOpen}
              onDropdownScroll={handleTrainerScroll}
              loading={trainerSelectloading}
              // renderOption={renderTrainerOption}
              error={selectedTrainerIdError}
              disableClearable={false}
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
              value={selectedTrainerObject?.name || ""}
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
              selectedCountry={trainerCountry}
              countryCode={(code) => {
                setTrainerCountryCode(code);
              }}
              onCountryChange={(iso2) => {
                setTrainerCountry(iso2);
              }}
              value={selectedTrainerObject?.mobile || ""}
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
              value={selectedTrainerObject?.email || ""}
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
              value={selectedTrainerObject?.location || ""}
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
              required={true}
              onChange={(e) => {
                setBankName(e.target.value);
                if (validationTrigger) {
                  setBankNameError(nameValidator(e.target.value));
                }
              }}
              value={bankName}
              errorFontSize={"10px"}
              error={bankNameError}
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
              required={true}
              onChange={(e) => {
                setAccountHolderName(e.target.value);
                if (validationTrigger) {
                  setAccountHolderNameError(nameValidator(e.target.value));
                }
              }}
              value={accountHolderName}
              error={accountHolderNameError}
              errorFontSize={"10px"}
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
              required={true}
              onChange={(e) => {
                setAccountNumber(e.target.value);
                if (validationTrigger) {
                  setAccountNumberError(accountNumberValidator(e.target.value));
                }
              }}
              value={accountNumber}
              error={accountNumberError}
              errorFontSize={"10px"}
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
              required={true}
              onChange={(e) => {
                setBranchName(e.target.value);
                if (validationTrigger) {
                  setBranchNameError(nameValidator(e.target.value));
                }
              }}
              value={branchName}
              error={branchNameError}
              errorFontSize={"10px"}
            />
          </Col>

          <Col
            xs={24}
            sm={24}
            md={12}
            className="trainer_paymentrequestform_five_col"
          >
            <CommonSelectField
              label="Account Type"
              required={true}
              options={[
                {
                  id: "Savings",
                  name: "Savings",
                },
                {
                  id: "Current",
                  name: "Current",
                },
              ]}
              onChange={(e) => {
                setAccountType(e.target.value);
                if (validationTrigger) {
                  setAccountTypeError(selectValidator(e.target.value));
                }
              }}
              value={accountType}
              error={accountTypeError}
              errorFontSize={"10px"}
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
              required={true}
              onChange={(e) => {
                setIfscCode(e.target.value);
                if (validationTrigger) {
                  setIfscCodeError(ifscValidator(e.target.value));
                }
              }}
              value={ifscCode}
              error={ifscCodeError}
              errorFontSize={"10px"}
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
                  getCustomerByTrainerIdData(selectedTrainerId, value, null);
                }
                if (validationTrigger) {
                  setCommercialTypeError(selectValidator(value));
                }
              }}
              value={commercialType}
              error={commercialTypeError}
              errorFontSize={"9px"}
              disabled={!selectedTrainerId}
            />
          </Col>

          {commercialType == "Batch" && (
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
              disabled={commercialType == "Batch" ? false : true}
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
                  {index === 0 && commercialType != "Batch" && (
                    <button
                      type="button"
                      className="trainer_paymentrequestform_add_button"
                      onClick={handleAdd}
                    >
                      Add
                    </button>
                  )}
                  {index > 0 && commercialType != "Batch" && (
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
                    required={false}
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
                      required={true}
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
                    required={false}
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
                    required={false}
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
                    required={false}
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
                    required={false}
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
                    />
                  ) : (
                    <div
                      style={{
                        marginTop: "20px",
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

        <p className="trainer_paymentrequestform_headings">Payment Details</p>

        <Row gutter={12} style={{ marginTop: "12px", marginBottom: "40px" }}>
          <Col span={5}>
            <CommonMuiDatePicker
              label={"Payment Date"}
              required={true}
              onChange={(value) => {
                setPaymentDate(value);
                if (validationTrigger) {
                  setPaymentDateError(selectValidator(value));
                }
              }}
              value={paymentDate}
              error={paymentDateError}
            />
          </Col>
          <Col span={5}>
            <CommonSelectField
              label={"Payment Mode"}
              required={true}
              options={[
                { id: "Bank - NEFT/IMPS", name: "Bank - NEFT/IMPS" },
                { id: "UPI", name: "UPI" },
              ]}
              onChange={(e) => {
                setPaymentMode(e.target.value);
                if (validationTrigger) {
                  setPaymentModeError(selectValidator(e.target.value));
                }
              }}
              value={paymentMode}
              error={paymentModeError}
            />
          </Col>
          <Col span={5}>
            <CommonInputField
              label={"Reference Id"}
              required={true}
              onChange={(e) => {
                setTransactionId(e.target.value);
                if (validationTrigger) {
                  setTransactionIdError(selectValidator(e.target.value));
                }
              }}
              value={transactionId}
              error={transactionIdError}
              errorFontSize={"10px"}
            />
          </Col>
        </Row>
      </div>
    );
  },
);
export default TrainerPaymentDirectPaid;
