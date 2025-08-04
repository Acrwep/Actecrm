import React, { useState } from "react";
import { Col, Row, Drawer, Rate } from "antd";
import "./styles.css";
import CommonInputField from "../Common/CommonInputField";
import { nameValidator, selectValidator } from "../Common/Validation";
import CommonSelectField from "../Common/CommonSelectField";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { SiWhatsapp } from "react-icons/si";
import CommonDatePicker from "../Common/CommonDatePicker";
import CommonTextArea from "../Common/CommonTextArea";
import CommonTable from "../Common/CommonTable";
import { CiSearch } from "react-icons/ci";
import { FiFilter } from "react-icons/fi";
import CommonDnd from "../Common/CommonDnd";
import CommonDoubleDatePicker from "../Common/CommonDoubleDatePicker";

export default function LeadManager() {
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [date, setDate] = useState(null);
  const [countryId, setCountryId] = useState(null);
  const [countryIdError, setCountryIdError] = useState("");
  const [nxtFollowupDate, setNxtFollowupDate] = useState(null);
  const [nxtFollowupDateError, setNxtFollowupDateError] = useState(null);

  const [defaultColumns, setDefaultColumns] = useState([
    { title: "Registered Name", isChecked: true },
    { title: "Registered Email", isChecked: true },
    { title: "Registered Mobile", isChecked: true },
    { title: "State", isChecked: true },
    { title: "City ", isChecked: true },
  ]);

  const [columns, setColumns] = useState([
    { title: "Registered Name", key: "name", dataIndex: "name" },
    { title: "Registered Email", key: "email", dataIndex: "email" },
    { title: "Registered Mobile", key: "mobile", dataIndex: "mobile" },
    { title: "State", key: "state", dataIndex: "state" },
    { title: "City ", key: "city", dataIndex: "city" },
  ]);

  const nonChangeColumns = [
    { title: "Registered Name", key: "name", dataIndex: "name" },
    { title: "Registered Email", key: "email", dataIndex: "email" },
    { title: "Registered Mobile", key: "mobile", dataIndex: "mobile" },
    { title: "State", key: "state", dataIndex: "state" },
    { title: "City ", key: "city", dataIndex: "city" },
  ];

  const leadData = [
    {
      id: 1,
      name: "xyz",
      email: "balaji@gmail.com",
      mobile: "986788872",
      state: "State Not Available",
      city: "City Not Available",
    },
  ];

  const formReset = () => {
    setIsOpenAddDrawer(false);
    setIsOpenFilterDrawer(false);
    setName("");
    setNameError("");
    setCountryId(null);
  };

  const handleSubmit = () => {
    const countryValidate = selectValidator(countryId);

    setCountryIdError(countryValidate);

    if (countryValidate) return;
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="leadmanager_filterContainer">
            <CommonOutlinedInput
              label="Search"
              width="36%"
              height="34px"
              labelFontSize="12px"
              icon={<CiSearch size={16} />}
              labelMarginTop="-1px"
            />
            <CommonDoubleDatePicker />
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
          }}
        >
          <button
            className="leadmanager_addleadbutton"
            onClick={() => {
              setIsOpenAddDrawer(true);
            }}
          >
            Add Lead
          </button>
          <FiFilter
            size={20}
            color="#5b69ca"
            style={{ marginLeft: "12px", cursor: "pointer" }}
            onClick={() => setIsOpenFilterDrawer(true)}
          />
        </Col>
      </Row>

      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 600 }}
          columns={columns}
          dataSource={leadData}
          dataPerPage={10}
          // loading={tableLoading}
          checkBox="false"
          size="small"
          className="questionupload_table"
        />
      </div>
      <Drawer
        title="Add Lead"
        open={isOpenAddDrawer}
        onClose={formReset}
        width="50%"
        style={{ position: "relative" }}
      >
        <p className="addleaddrawer_headings">Basic Information</p>
        <Row gutter={16}>
          <Col span={8}>
            <CommonInputField
              label="Candidate Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(nameValidator(e.target.value));
              }}
              error={nameError}
              required={true}
            />
          </Col>
          <Col span={8}>
            <CommonInputField label="Email" required={true} />
          </Col>
          <Col span={8}>
            <CommonInputField label="Mobile Number" required={true} />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px", marginBottom: "30px" }}>
          <Col span={8}>
            <CommonOutlinedInput
              label="Whatsapp Number"
              icon={<SiWhatsapp color="#39AE41" />}
              required={true}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Candidate Location"
              options={[]}
              required={true}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Country"
              value={countryId}
              onChange={(event) => {
                console.log("eee", event.target.value);
                setCountryId(event.target.value);
                setCountryIdError(selectValidator(event.target.value));
              }}
              options={[
                { id: 1, name: "India" },
                { id: 2, name: "Australia" },
              ]}
              error={countryIdError}
              required={true}
            />
          </Col>
        </Row>

        <p className="addleaddrawer_headings">Course Details</p>
        <Row gutter={16}>
          <Col span={8}>
            <CommonInputField label="Primary Course" required={true} />
          </Col>
          <Col span={8}>
            <CommonInputField label="Fees" required={true} />
          </Col>
          <Col span={8}>
            <CommonSelectField label="Training Mode" required={true} />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px", marginBottom: "30px" }}>
          <Col span={8}>
            <CommonSelectField label="Priority" options={[]} required={true} />
          </Col>
          <Col span={8}>
            <CommonSelectField
              label="Lead Source"
              options={[]}
              required={true}
            />
          </Col>
        </Row>

        <p className="addleaddrawer_headings">Sales Information</p>

        <Row gutter={16}>
          <Col span={8}>
            <CommonSelectField label="Lead Status" />
          </Col>
          <Col span={8}>
            <CommonSelectField label="Response Status" />
          </Col>
          <Col span={8}>
            <CommonDatePicker
              placeholder="Next Follow-Up Date"
              onChange={(value) => {
                setNxtFollowupDate(value);
                setNxtFollowupDateError(selectValidator(value));
              }}
              value={nxtFollowupDate}
              allowClear={true}
              error={nxtFollowupDateError}
              labelFontSize="14px"
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px", marginBottom: "30px" }}>
          <Col span={8}>
            <CommonDatePicker
              placeholder="Expected Date Join"
              onChange={(value) => setDate(value)}
              value={date}
              allowClear={true}
            />
          </Col>
          <Col span={8}>
            <CommonSelectField label="Branch Name" />
          </Col>
          <Col span={8}>
            <CommonSelectField label="Batch Track" />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: "30px", marginBottom: "30px" }}>
          <Col span={8}>
            <p className="leadmanager_ratinglabel">Lead Quality Rating</p>
            <Rate allowHalf />
          </Col>
          <Col span={16}>
            <CommonTextArea label="Comments" />
          </Col>
        </Row>

        <div className="leadmanager_submitlead_buttoncontainer">
          <button
            className="leadmanager_submitleadbutton"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </Drawer>

      {/* table filter drawer */}

      <Drawer
        title="Manage Table"
        open={isOpenFilterDrawer}
        onClose={formReset}
        width="35%"
        className="leadmanager_tablefilterdrawer"
        style={{ position: "relative" }}
      >
        <Row>
          <Col span={24}>
            <div className="leadmanager_tablefiler_container">
              <CommonDnd
                data={defaultColumns}
                setDefaultColumns={setDefaultColumns}
              />
            </div>
          </Col>
        </Row>
        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            <button
              className="leadmanager_tablefilter_applybutton"
              onClick={() => {
                const reorderedColumns = defaultColumns
                  .filter((item) => item.isChecked) // only include checked items
                  .map((defaultItem) =>
                    nonChangeColumns.find(
                      (col) => col.title.trim() === defaultItem.title.trim()
                    )
                  )
                  .filter(Boolean); // remove unmatched/null entries

                console.log("Reordered Columns:", reorderedColumns);

                setColumns(reorderedColumns);
                setIsOpenFilterDrawer(false);
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
