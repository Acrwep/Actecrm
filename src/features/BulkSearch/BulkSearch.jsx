import React, { useState, useEffect } from "react";
import { Row, Col, Upload, Modal, Button, Flex, Tooltip, Radio } from "antd";
import { useNavigate } from "react-router-dom";
import CommonSelectField from "../Common/CommonSelectField";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import ExcelLogo from "../../assets/excel_logo.png";
import { IoIosClose } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { IoFilter } from "react-icons/io5";
import { IoCloseCircleOutline } from "react-icons/io5";
import { DownloadOutlined } from "@ant-design/icons";
import CommonTable from "../Common/CommonTable";
import * as XLSX from "xlsx";
import { CommonMessage } from "../Common/CommonMessage";
import { emailValidator, mobileValidator } from "../Common/Validation";
import "./styles.css";
import { bulkSearch } from "../ApiService/action";
import moment from "moment";
import DownloadTableAsCSV from "../Common/DownloadTableAsCSV";
import { useSelector } from "react-redux";

const { Dragger } = Upload;

export default function BulkSearch() {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState(1);
  const [statusId, setStatusId] = useState("");
  const [bulkUploadModal, setBulkUploadModal] = useState(false);
  const [bulkUploadErrorModal, setBulkUploadErrorModal] = useState(false);
  const [uploadFile, setUploadFile] = useState();
  const [xlsxArray, setXlsxArray] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [excelErrors, setExcelErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  //permissions
  const permissions = useSelector((state) => state.userpermissions);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const columns = [
    { title: "Candidate Name", key: "name", dataIndex: "name", width: 180 },
    { title: "Email", key: "email", dataIndex: "email", width: 220 },
    { title: "Mobile", key: "mobile", dataIndex: "mobile" },
    { title: "Lead Source", key: "lead_type", dataIndex: "lead_type" },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (text) => {
        return (
          <>
            <p
              style={{
                color:
                  text === "On Progress"
                    ? "rgba(255 179 7)"
                    : text === "Success"
                    ? "#3c9111"
                    : "",
                fontWeight: text === "Not found" ? 400 : 600,
              }}
            >
              {text}
            </p>
          </>
        );
      },
    },
    {
      title: "Lead Executive",
      key: "lead_by",
      dataIndex: "lead_by",
      width: 180,
      render: (text, record) => {
        return <p>{`${record.lead_by_id} - ${text}`}</p>;
      },
    },
    {
      title: "Created At",
      key: "created_on",
      dataIndex: "created_on",
      render: (text) => {
        return <p>{text ? moment(text).format("DD/MM/YYYY") : "-"}</p>;
      },
    },
  ];

  const [data, setData] = useState([]);
  const [duplicateData, setDuplicateData] = useState([]);

  useEffect(() => {
    if (permissions.length >= 1) {
      if (!permissions.includes("Bulk Search Page")) {
        navigate("/dashboard");
        return;
      }
    }
  }, [permissions]);

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
      setUploadFile(file);
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
                cell !== " "
            )
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

  const handleBulkUploadSubmit = async () => {
    if (xlsxArray.length <= 0) {
      CommonMessage("error", "Please upload .xls or .xlsx or .csv");
      return;
    }
    const header = excelData[0];
    let updateExcelData = [...excelData];
    let error = [];
    const mobileIndex = header.indexOf("Mobile");
    const emailIndex = header.indexOf("Email");

    if (mobileIndex == -1) {
      error.push({ error: "Mobile column is required", row: 1 });
    }

    if (emailIndex == -1) {
      error.push({ error: "Email column is required", row: 1 });
    }

    excelData.slice(1).forEach((row, rowIndex) => {
      const raw_mobile = row[mobileIndex];
      const raw_email = row[emailIndex];
      const rowNum = rowIndex + 2; // because header is row 1

      const hasMobile =
        raw_mobile !== undefined && raw_mobile !== null && raw_mobile !== "";
      const hasEmail =
        raw_email !== undefined && raw_email !== null && raw_email !== "";

      // If both empty
      if (!hasMobile && !hasEmail) {
        error.push({
          error: `Either Mobile or Email is required`,
          row: rowNum,
        });
        return; // skip validation below
      }

      // If Mobile exists
      if (hasMobile) {
        const mobile = raw_mobile.toString();
        const mobileValidate = mobileValidator(mobile);
        updateExcelData[rowIndex + 1].mobile = mobile;
        if (mobileValidate) {
          error.push({
            error: `Mobile ${mobileValidate}`,
            row: rowNum,
          });
        }
      }

      // If Email exists
      if (hasEmail) {
        const email = raw_email.toString();
        const emailValidate = emailValidator(email);
        updateExcelData[rowIndex + 1].email = email;
        if (emailValidate) {
          error.push({
            error: `Email ${emailValidate}`,
            row: rowNum,
          });
        }
      }
    });

    console.log("errrrrr", error);
    console.log("resultttt", updateExcelData);
    setExcelErrors(error);

    if (error.length >= 1) {
      setBulkUploadErrorModal(true);
    } else {
      setBulkUploadErrorModal(false);
      const payload = convertAsPayloadType(updateExcelData);

      console.log("bulk upload payloadd", payload);
      setLoading(true);
      try {
        const response = await bulkSearch(payload);
        setData(response?.data?.data || []);
        setDuplicateData(response?.data?.data || []);
        setBulkUploadModal(false);
        setTimeout(() => {
          setLoading(false);
        }, 300);
      } catch (error) {
        setData([]);
        setDuplicateData([]);
        setLoading(false);
        console.log("blk serach error", error);
      }
    }
  };

  const downloadCSV = () => {
    // Step 1: Define data
    const data = [["Mobile", "Email"], []];

    // Step 2: Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Step 3: Apply bold style to header row
    const headerCells = ["A1", "B1"];
    headerCells.forEach((cell) => {
      if (!worksheet[cell]) return;
      worksheet[cell].s = {
        font: { bold: true },
      };
    });

    // Step 4: Create workbook and append the styled sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Step 5: Write file with styles
    XLSX.writeFile(workbook, "Bulk_Search.xlsx", {
      bookType: "xlsx",
      cellStyles: true,
    });
  };

  const convertAsPayloadType = (excelData) => {
    const rows = excelData.slice(1);

    const users_data = rows.map((row) => {
      return {
        mobile: row.mobile ? row.mobile : "",
        email: row.email ? row.email : "",
      };
    });

    return { users_data };
  };

  const handlePaginationChange = ({ page, limit }) => {
    setPagination({
      page: page,
      limit: limit,
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    const filterData = duplicateData.filter((f) => {
      const statusMatch = statusId ? f.status === statusId : true; // ✅ only check if statusId exists
      const typeMatch =
        filterType == 1
          ? f.mobile.includes(value)
          : filterType == 2
          ? f.name.toLowerCase().includes(value.toLowerCase())
          : filterType == 3
          ? f.email.includes(value)
          : true; // ✅ only check if filterType == 1
      return statusMatch && typeMatch;
    });
    setData(filterData);
  };

  const formReset = () => {
    setBulkUploadModal(false);
    setExcelData([]);
    setXlsxArray([]);
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={10}>
          <Row gutter={16}>
            <Col span={12}>
              <div className="overallduecustomers_filterContainer">
                {/* Search Input */}
                <CommonOutlinedInput
                  label={
                    filterType == 1
                      ? "Search By Mobile"
                      : filterType == 2
                      ? "Search By Name"
                      : filterType == 3
                      ? "Search by Email"
                      : filterType == 4
                      ? "Search by Course"
                      : ""
                  }
                  width="100%"
                  height="33px"
                  labelFontSize="12px"
                  icon={
                    searchValue ? (
                      <div
                        className="users_filter_closeIconContainer"
                        onClick={() => {
                          setSearchValue("");
                          const filterData = duplicateData.filter((f) => {
                            const statusMatch = statusId
                              ? f.status == statusId
                              : true; // ✅ only check if statusId exists
                            return statusMatch;
                          });
                          setData(filterData);
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
                    borderTopRightRadius: "0px",
                    borderBottomRightRadius: "0px",
                    padding: searchValue
                      ? "0px 26px 0px 0px"
                      : "0px 8px 0px 0px",
                  }}
                  onChange={handleSearch}
                  value={searchValue}
                />
                {/* Filter Button */}
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
                          value={filterType}
                          onChange={(e) => {
                            setFilterType(e.target.value);
                            if (searchValue === "") {
                              return;
                            } else {
                              setSearchValue("");
                              const filterData = duplicateData.filter((f) => {
                                const statusMatch = statusId
                                  ? f.status == statusId
                                  : true; // ✅ only check if statusId exists
                                return statusMatch;
                              });
                              setData(filterData);
                            }
                          }}
                        >
                          <Radio
                            value={1}
                            style={{ marginTop: "6px", marginBottom: "12px" }}
                          >
                            Search by Mobile
                          </Radio>
                          <Radio value={2} style={{ marginBottom: "12px" }}>
                            Search by Name
                          </Radio>
                          <Radio value={3} style={{ marginBottom: "12px" }}>
                            Search by Email
                          </Radio>
                        </Radio.Group>
                      }
                    >
                      <Button className="users_filterbutton">
                        <IoFilter size={18} />
                      </Button>
                    </Tooltip>
                  </Flex>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <CommonSelectField
                width="90%"
                height="35px"
                label="Select Status"
                labelMarginTop="0px"
                labelFontSize="13px"
                options={[
                  { id: "Success", name: "Success" },
                  { id: "On Progress", name: "On Progress" },
                  { id: "Not found", name: "Not found" },
                ]}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log(value);
                  setStatusId(value);

                  const filterData = duplicateData.filter((f) => {
                    const statusMatch = value ? f.status == value : true; // ✅ only check if statusId exists
                    const typeMatch =
                      filterType == 1
                        ? f.mobile.includes(searchValue)
                        : filterType == 2
                        ? f.name
                            .toLowerCase()
                            .includes(searchValue.toLowerCase())
                        : filterType == 3
                        ? f.email.includes(searchValue)
                        : true; // ✅ only check if filterType == 1
                    return statusMatch && typeMatch;
                  });

                  setData(filterData);
                }}
                value={statusId}
                disableClearable={false}
              />
            </Col>
          </Row>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={14}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <button
            className="leadmanager_addleadbutton"
            onClick={() => {
              setBulkUploadModal(true);
            }}
          >
            Upload
          </button>
          {permissions.includes("Download Access") && (
            <Tooltip placement="top" title="Download">
              <Button
                className="bulksearch_download_button"
                onClick={() => {
                  const today = new Date();
                  DownloadTableAsCSV(
                    data,
                    columns,
                    `${moment(today).format("DD-MM-YYYY")} Bulk Search.csv`
                  );
                }}
              >
                <DownloadOutlined className="download_icon" />
              </Button>
            </Tooltip>
          )}
        </Col>
      </Row>

      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 1000 }}
          columns={columns}
          dataSource={data}
          dataPerPage={10}
          loading={loading}
          checkBox="false"
          size="small"
          onPaginationChange={handlePaginationChange} // callback to fetch new data
          limit={pagination.limit} // page size
          page_number={pagination.page} // current page
          totalPageNumber={pagination.total} // total rows
          // paginationStatus={false}
          className="bulksearch_table"
        />{" "}
      </div>

      {/* bulk upload modal */}
      <Modal
        title="Upload file"
        open={bulkUploadModal}
        onCancel={formReset}
        footer={[
          <div className="bulksearch_bulkmodal_footerContainer">
            <Button
              className="bulksearch_bulkmodal_footercancel_button"
              onClick={formReset}
            >
              Cancel
            </Button>
            <Button
              className="bulksearch_bulkmodal_footerimport_button"
              onClick={handleBulkUploadSubmit}
            >
              Import
            </Button>
          </div>,
        ]}
      >
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
        <div className="bulksearch_bulkupload_templateContainer">
          <img src={ExcelLogo} style={{ width: "30px" }} />
          <p className="bulksearch_templateheading">Template</p>
          <p className="bulksearch_templatetext">
            you can download template as starting point for your own file.
          </p>
          <button
            className="bulksearch_templatedownload_button"
            onClick={downloadCSV}
          >
            Download
          </button>
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
