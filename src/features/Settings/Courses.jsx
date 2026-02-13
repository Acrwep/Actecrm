import React, { useState, useEffect } from "react";
import { Row, Col, Flex, Tooltip, Radio, Button, Modal, Upload } from "antd";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { useDispatch, useSelector } from "react-redux";
import CommonTable from "../Common/CommonTable";
import CommonSpinner from "../Common/CommonSpinner";
import CommonInputField from "../Common/CommonInputField";
import { addressValidator, selectValidator } from "../Common/Validation";
import {
  createTechnology,
  deleteTechnology,
  getTechnologies,
  updateBulkTechnology,
  updateTechnology,
} from "../ApiService/action";
import { storeSettingsCourseList } from "../Redux/Slice";
import * as XLSX from "xlsx";
import moment from "moment";
import ExcelLogo from "../../assets/excel_logo.png";
import { CommonMessage } from "../Common/CommonMessage";
import { IoCloseCircleOutline } from "react-icons/io5";
import CommonDeleteModal from "../Common/CommonDeleteModal";
import EllipsisTooltip from "../Common/EllipsisTooltip";

const { Dragger } = Upload;

export default function Courses() {
  const dispatch = useDispatch();
  const courseData = useSelector((state) => state.settingscourselist);

  const [searchValue, setSearchValue] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  //add course modal
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [courseNameError, setCourseNameError] = useState("");
  const [price, setPrice] = useState(0);
  const [priceError, setPriceError] = useState("");
  const [offerPrice, setOfferPrice] = useState(0);
  const [brouchures, setBrouchures] = useState("");
  const [syllabus, setSyllabus] = useState("");
  //delete modal
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  //update modal
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState(false);
  const [xlsxArray, setXlsxArray] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [excelErrors, setExcelErrors] = useState([]);
  const [bulkUploadErrorModal, setBulkUploadErrorModal] = useState(false);

  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const columns = [
    { title: "Name", key: "name", dataIndex: "name", width: 200 },
    {
      title: "Price",
      key: "price",
      dataIndex: "price",
      width: 160,
      render: (text) => {
        return (
          <p>{`${Number(text).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}</p>
        );
      },
    },
    {
      title: "Offer Price",
      key: "offer_price",
      dataIndex: "offer_price",
      width: 160,
      render: (text) => {
        return (
          <p>{`${Number(text).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}</p>
        );
      },
    },
    {
      title: "Brouchures",
      key: "brouchures",
      dataIndex: "brouchures",
      width: 200,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Syllabus",
      key: "syllabus",
      dataIndex: "syllabus",
      width: 200,
      render: (text) => {
        return <EllipsisTooltip text={text} />;
      },
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      width: 130,
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            <AiOutlineEdit
              size={20}
              className="trainers_action_icons"
              onClick={() => handleEdit(record)}
            />

            <RiDeleteBinLine
              color="#d32f2f"
              size={19}
              className="trainers_action_icons"
              onClick={() => {
                setCourseId(record.id);
                setIsOpenDeleteModal(true);
              }}
            />
          </div>
        );
      },
    },
  ];

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    setTimeout(() => {
      getCourseData(e.target.value);
    }, 300);
  };

  const handlePaginationChange = ({ page, limit }) => {
    setPagination({
      page: page,
      limit: limit,
    });
  };

  const getCourseData = async (searchvalue) => {
    setLoading(true);
    const payload = {
      ...(searchvalue && { name: searchvalue }),
    };
    try {
      const response = await getTechnologies(payload);
      dispatch(storeSettingsCourseList(response?.data?.data || []));
    } catch (error) {
      dispatch(storeSettingsCourseList([]));
      console.log("response status error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    const nameValidate = addressValidator(courseName);
    const priceValidate = selectValidator(price);

    setCourseNameError(nameValidate);
    setPriceError(priceValidate);

    if (nameValidate || priceValidate) return;

    const payload = {
      ...(courseId && { id: courseId }),
      course_name: courseName,
      price: price,
      offer_price: offerPrice,
      brouchures: brouchures,
      syllabus: syllabus,
    };
    setButtonLoading(true);

    if (courseId) {
      try {
        await updateTechnology(payload);
        CommonMessage("success", "Course Updated");
        setTimeout(() => {
          setButtonLoading(false);
          formReset();
          getCourseData(searchValue);
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
        await createTechnology(payload);
        CommonMessage("success", "Course Created");
        setTimeout(() => {
          setButtonLoading(false);
          formReset();
          getCourseData(searchValue);
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

  const handleEdit = (item) => {
    setCourseId(item.id);
    setCourseName(item.name);
    setPrice(item.price);
    setOfferPrice(item.offer_price);
    setBrouchures(item.brouchures);
    setSyllabus(item.syllabus);
    setIsOpenAddModal(true);
  };

  const handleDelete = async () => {
    setButtonLoading(true);
    try {
      await deleteTechnology(courseId);
      CommonMessage("success", "Course Deleted");
      setTimeout(() => {
        setButtonLoading(false);
        formReset();
        getCourseData(searchValue);
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

  //---------excel sheet handling-----------------
  const handleXlsx = ({ file }) => {
    console.log("fileee", file);
    const allowedTypes = [
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "text/csv", // .csv
    ];

    const isValidExcel =
      allowedTypes.includes(file.type) || /\.(xls|xlsx|csv)$/i.test(file.name);

    if (file.status === "uploading" || file.status === "removed") {
      setXlsxArray([]);
      return;
    }

    if (isValidExcel) {
      CommonMessage("success", "File uploaded");
      const reader = new FileReader();

      reader.onload = (evt) => {
        const arrayBuffer = evt.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const data = rawData.filter(
          (row) =>
            Array.isArray(row) &&
            row.some(
              (cell) =>
                cell !== undefined &&
                cell !== null &&
                cell !== "" &&
                cell !== " ",
            ),
        );
        console.log("shetttt", data);
        setExcelData(data);
      };
      reader.readAsArrayBuffer(file);
      setXlsxArray([file]);
    } else {
      setXlsxArray([]);
      setExcelData([]);
      CommonMessage("error", "Only .xls, .xlsx, or .csv files are accepted");
    }
  };

  const downloadCSV = () => {
    const datasss = [
      {
        id: 1,
        name: "Fullstack Development",
        price: "45000.00",
        offer_price: "0.00",
      },
      { id: 2, name: "Software Testing", price: null, offer_price: null },
      { id: 3, name: "Data Science", price: null, offer_price: null },
      { id: 4, name: "Data Analytics", price: null, offer_price: null },
      { id: 5, name: "Cloud Computing", price: null, offer_price: null },
      { id: 6, name: "UI-UX", price: null, offer_price: null },
    ];

    // Step 1: Convert objects to rows
    const rows = courseData.map((item) => [
      item.id || "",
      item.name || "",
      item.price || "",
      item.offer_price || "",
      item.brouchures || "",
      item.syllabus || "",
    ]);

    // Step 2: Add header row
    const data = [
      ["Id", "Name", "Price", "Offer Price", "Brouchures", "Syllabus"],
      ...rows,
    ];

    // Step 3: Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Step 4: Make header bold
    ["A1", "B1", "C1"].forEach((cell) => {
      if (worksheet[cell]) {
        worksheet[cell].s = {
          font: { bold: true },
        };
      }
    });

    // Step 5: Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Step 6: Download file
    XLSX.writeFile(workbook, "Courses.xlsx", {
      bookType: "xlsx",
      cellStyles: true,
    });
  };

  const handleBulkUploadSubmit = async () => {
    if (!excelData || excelData.length <= 1) {
      CommonMessage("error", "Please upload .xls or .xlsx or .csv");
      return;
    }

    const header = excelData[0];
    const rows = excelData.slice(1);
    let error = [];

    const idIndex = header.indexOf("Id");
    const nameIndex = header.indexOf("Name");
    const priceIndex = header.indexOf("Price");
    const offerPriceIndex = header.indexOf("Offer Price");
    const brochuresIndex = header.indexOf("Brouchures");
    const syllabusIndex = header.indexOf("Syllabus");

    // ✅ Header validation
    if (idIndex === -1) error.push({ error: "Id column is required", row: 1 });
    if (nameIndex === -1)
      error.push({ error: "Name column is required", row: 1 });
    if (priceIndex === -1)
      error.push({ error: "Price column is required", row: 1 });
    if (offerPriceIndex === -1)
      error.push({ error: "Offer Price column is required", row: 1 });
    if (brochuresIndex === -1)
      error.push({ error: "Brouchures column is required", row: 1 });
    if (syllabusIndex === -1)
      error.push({ error: "Syllabus column is required", row: 1 });

    console.log("errosss", error);

    // stop if header error
    if (error.length) {
      setExcelErrors(error);
      setBulkUploadErrorModal(true);
      return;
    }

    // ✅ Row validation
    // ✅ Row validation
    rows.forEach((row, rowIndex) => {
      const rowNum = rowIndex + 2;

      const Id = row[idIndex];
      const name = row[nameIndex];
      const price = row[priceIndex];
      const offerPrice = row[offerPriceIndex];

      if (Id !== undefined && Id !== null && Id !== "" && isNaN(Number(Id))) {
        error.push({ error: "Id must be numeric", row: rowNum });
      }

      // Name required
      if (!name || String(name).trim() === "") {
        error.push({ error: "Name is required", row: rowNum });
      }

      // ✅ Price optional — but must be number if present
      if (
        price !== undefined &&
        price !== null &&
        price !== "" &&
        isNaN(Number(price))
      ) {
        error.push({ error: "Price must be numeric", row: rowNum });
      }

      // ✅ Offer Price optional — but must be number if present
      if (
        offerPrice !== undefined &&
        offerPrice !== null &&
        offerPrice !== "" &&
        isNaN(Number(offerPrice))
      ) {
        error.push({ error: "Offer Price must be numeric", row: rowNum });
      }
    });

    console.log("errosss", error);

    setExcelErrors(error);

    if (error.length) {
      setBulkUploadErrorModal(true);
      return;
    }

    // ✅ Convert payload
    const payload = convertAsPayloadType(excelData);
    console.log("payloaddd", payload);

    setButtonLoading(true);
    try {
      await updateBulkTechnology(payload);
      setTimeout(() => {
        CommonMessage("success", "Updated Successfully");
        setButtonLoading(false);
        setIsOpenUpdateModal(false);
        formReset();
        getCourseData(searchValue);
      }, 300);
    } catch (err) {
      setButtonLoading(false);
      console.log("bulk search error", err);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later",
      );
    }

    setLoading(false);
  };

  const convertAsPayloadType = (excelData) => {
    const header = excelData[0];

    const idIndex = header.indexOf("Id");
    const nameIndex = header.indexOf("Name");
    const priceIndex = header.indexOf("Price");
    const offerPriceIndex = header.indexOf("Offer Price");
    const brochuresIndex = header.indexOf("Brouchures");
    const syllabusIndex = header.indexOf("Syllabus");

    const rows = excelData.slice(1);

    const courses = rows.map((row) => ({
      course_id: row[idIndex] || "",
      course_name: row[nameIndex] || "",
      price:
        row[priceIndex] !== "" && !isNaN(row[priceIndex])
          ? Number(row[priceIndex])
          : null,
      offer_price:
        row[offerPriceIndex] !== "" && !isNaN(row[offerPriceIndex])
          ? Number(row[offerPriceIndex])
          : null,
      brouchures: row[brochuresIndex] || "",
      syllabus: row[syllabusIndex] || "",
    }));

    return { courses };
  };

  const formReset = () => {
    setIsOpenAddModal(false);
    setButtonLoading(false);
    setIsOpenDeleteModal(false);
    setCourseId(null);
    setCourseName("");
    setCourseNameError("");
    setPrice(0);
    setPriceError("");
    setOfferPrice(0);
    setBrouchures("");
    setSyllabus("");
    setIsOpenUpdateModal(false);
    setXlsxArray([]);
    setExcelData([]);
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12}>
          <div
            className="leadmanager_filterContainer"
            style={{ position: "relative" }}
          >
            <CommonOutlinedInput
              label={"Search By Name"}
              width="40%"
              height="33px"
              labelFontSize="12px"
              icon={
                searchValue ? (
                  <div
                    className="users_filter_closeIconContainer"
                    onClick={() => {
                      setSearchValue("");
                      setPagination({
                        page: 1,
                      });
                      getCourseData(null);
                    }}
                  >
                    <IoIosClose size={11} />
                  </div>
                ) : (
                  <CiSearch size={16} />
                )
              }
              labelMarginTop="-1px"
              style={{
                padding: searchValue ? "0px 26px 0px 0px" : "0px 8px 0px 0px",
              }}
              onChange={handleSearch}
              value={searchValue}
            />
          </div>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={12}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <button
            className="leadmanager_addleadbutton"
            onClick={() => {
              setIsOpenAddModal(true);
            }}
          >
            Add Course
          </button>

          <button
            className="leadmanager_addleadbutton"
            onClick={() => {
              setIsOpenUpdateModal(true);
            }}
          >
            Update Course
          </button>
        </Col>
      </Row>

      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 1000 }}
          columns={columns}
          dataSource={courseData}
          dataPerPage={10}
          loading={loading}
          checkBox="false"
          size="small"
          className="questionupload_table"
          onPaginationChange={handlePaginationChange} // callback to fetch new data
          limit={pagination.limit} // page size
          page_number={pagination.page} // current page
          totalPageNumber={pagination.total} // total rows
        />
      </div>

      <Modal
        title={courseId ? "Update Course" : "Create Course"}
        open={isOpenAddModal}
        onCancel={formReset}
        width="35%"
        footer={[
          <Button
            key="cancel"
            onClick={formReset}
            className="leads_coursemodal_cancelbutton"
          >
            Cancel
          </Button>,

          buttonLoading ? (
            <Button
              key="create"
              type="primary"
              className="leads_coursemodal_loading_createbutton"
            >
              <CommonSpinner />
            </Button>
          ) : (
            <Button
              key="create"
              type="primary"
              onClick={handleSubmit}
              className="leads_coursemodal_createbutton"
            >
              {courseId ? "Update" : "Create"}
            </Button>
          ),
        ]}
      >
        <div style={{ marginTop: "20px" }}>
          <CommonInputField
            label="Course Name"
            required={true}
            onChange={(e) => {
              setCourseName(e.target.value);
              setCourseNameError(addressValidator(e.target.value));
            }}
            value={courseName}
            error={courseNameError}
          />
        </div>
        <div style={{ marginTop: "30px" }}>
          <CommonInputField
            label="Price"
            required={true}
            onChange={(e) => {
              setPrice(e.target.value);
              setPriceError(selectValidator(e.target.value));
            }}
            value={price}
            error={priceError}
            type="number"
          />
        </div>

        <div style={{ marginTop: "30px" }}>
          <CommonInputField
            label="Offer Price"
            required={false}
            onChange={(e) => {
              setOfferPrice(e.target.value);
            }}
            value={offerPrice}
            error=""
          />
        </div>

        <div style={{ marginTop: "30px" }}>
          <CommonInputField
            label="Brouchures Link"
            required={false}
            onChange={(e) => {
              setBrouchures(e.target.value);
            }}
            value={brouchures}
            error={""}
          />
        </div>

        <div style={{ marginTop: "30px", marginBottom: "20px" }}>
          <CommonInputField
            label="Syllabus"
            required={false}
            onChange={(e) => {
              setSyllabus(e.target.value);
            }}
            value={syllabus}
            error={""}
          />
        </div>
      </Modal>

      {/* delete Modal */}
      <CommonDeleteModal
        open={isOpenDeleteModal}
        onCancel={formReset}
        content="Are you sure want to delete the course?"
        loading={buttonLoading}
        onClick={handleDelete}
      />

      {/* bulk upload modal */}
      <Modal
        title="Update Course"
        open={isOpenUpdateModal}
        onCancel={formReset}
        footer={[
          <div className="bulksearch_bulkmodal_footerContainer">
            <Button
              className="bulksearch_bulkmodal_footercancel_button"
              onClick={formReset}
            >
              Cancel
            </Button>
            {buttonLoading ? (
              <Button
                className="courses_bulkmodal_footer_updatecourses_button"
                style={{ opacity: "0.7", cursor: "default" }}
              >
                <CommonSpinner />
              </Button>
            ) : (
              <Button
                className="courses_bulkmodal_footer_updatecourses_button"
                onClick={handleBulkUploadSubmit}
              >
                Update Course
              </Button>
            )}
          </div>,
        ]}
      >
        <div
          className="bulksearch_bulkupload_templateContainer"
          style={{ marginTop: "16px", marginBottom: "20px" }}
        >
          <img src={ExcelLogo} style={{ width: "30px" }} />
          <p className="bulksearch_templateheading">Course Sheet</p>
          <p className="bulksearch_templatetext">
            you can download the existing course file.
          </p>
          <button
            className="bulksearch_templatedownload_button"
            onClick={downloadCSV}
          >
            Download
          </button>
        </div>

        <Dragger
          multiple={false}
          className="bulksearch_bulkmodal_upload"
          beforeUpload={(file) => {
            console.log(file);
            return false; // Prevent auto-upload
          }}
          maxCount={1}
          onChange={handleXlsx}
          fileList={xlsxArray}
        >
          <img src={ExcelLogo} className="bulksearch_excelicon" />
          <p className="bulksearch_bulkmodal_dragtext">
            Drag&Drop file here or{" "}
            <span className="bulksearch_bulkmodal_choosefile">Choose file</span>
          </p>
        </Dragger>
        <div className="bulksearch_excelsupportContainer">
          <p>Supported format: XLS,XLSX,CSV</p>
          <p>Maximum size: 25MB</p>
        </div>
      </Modal>

      {/* error modal */}
      <Modal
        open={bulkUploadErrorModal}
        onCancel={() => {
          setBulkUploadErrorModal(false);
        }}
        footer={false}
        title="Error"
        zIndex={1000}
      >
        {excelErrors.map((item, index) => {
          return (
            <React.Fragment key={index}>
              <div className="bulksearch_bulkerrorContainer">
                <IoCloseCircleOutline size={18} color="red" />
                <p style={{ fontSize: "13px" }}>
                  {item.error}{" "}
                  <span
                    style={{ color: "#0056b3", fontWeight: 600 }}
                  >{`[row: ${item.row}]`}</span>
                </p>
              </div>
            </React.Fragment>
          );
        })}
      </Modal>
    </div>
  );
}
