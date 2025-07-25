import React, { useState } from "react";
import CommonTable from "../Common/CommonTable";
import { Row, Col, Drawer } from "antd";
import { FiFilter } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonSelectField from "../Common/CommonSelectField";
import CommonDnd from "../Common/CommonDnd";

export default function LeadFollowUp() {
  const [dateFilterOptions, setDateFilterOptions] = useState([
    { id: 1, name: "Today" },
    { id: 2, name: "Caryy Over" },
  ]);
  const [dateFilter, setDateFilter] = useState(1);
  const [isOpenFilterDrawer, setIsOpenFilterDrawer] = useState(false);
  const [defaultColumns, setDefaultColumns] = useState([
    { title: "Lead Id", isChecked: true },
    { title: "Next Follow Up", isChecked: true },
    { title: "Name", isChecked: true },
    { title: "Mobile", isChecked: true },
    { title: "Course ", isChecked: true },
    { title: "Fees ", isChecked: true },
    { title: "Last Update ", isChecked: true },
    { title: "Recent Comments", isChecked: true },
    { title: "Sale Rating ", isChecked: true },
    { title: "PQ Rating ", isChecked: true },
  ]);

  const [columns, setColumns] = useState([
    { title: "Lead Id", key: "id", dataIndex: "id" },
    { title: "Next Follow Up", key: "nextfollowup", dataIndex: "nextfollowup" },
    { title: "Name", key: "name", dataIndex: "name" },
    { title: "Mobile", key: "mobile", dataIndex: "mobile" },
    { title: "Course ", key: "course", dataIndex: "course" },
    { title: "Fees ", key: "fees", dataIndex: "fees" },
    { title: "Last Update", key: "lastupdate", dataIndex: "lastupdate" },
    { title: "Recent Comments", key: "comments", dataIndex: "comments" },
    { title: "Sale Rating", key: "rating", dataIndex: "rating" },
    { title: "PQ Rating", key: "pqrating", dataIndex: "pqrating" },
  ]);

  const nonChangeColumns = [
    { title: "Lead Id", key: "id", dataIndex: "id" },
    { title: "Next Follow Up", key: "nextfollowup", dataIndex: "nextfollowup" },
    { title: "Name", key: "name", dataIndex: "name" },
    { title: "Mobile", key: "mobile", dataIndex: "mobile" },
    { title: "Course ", key: "course", dataIndex: "course" },
    { title: "Fees ", key: "fees", dataIndex: "fees" },
    { title: "Last Update", key: "lastupdate", dataIndex: "lastupdate" },
    { title: "Recent Comments", key: "comments", dataIndex: "comments" },
    { title: "Sale Rating", key: "rating", dataIndex: "rating" },
    { title: "PQ Rating", key: "pqrating", dataIndex: "pqrating" },
  ];

  const followUpData = [
    {
      id: 1,
      name: "Balaji",
      nextfollowup: "25/07/2025",
      mobile: "9786564561",
      course: "Full Statck",
      fees: "22000",
      lastupdate: "21/07/2025",
      comments: "",
      rating: "",
      pqrating: "",
    },
  ];

  const formReset = () => {
    setIsOpenFilterDrawer(false);
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="leadmanager_filterContainer">
            <CommonOutlinedInput
              label="Search"
              width="36%"
              height="33px"
              labelFontSize="12px"
              icon={<CiSearch size={16} />}
              labelMarginTop="-1px"
            />
            <CommonSelectField
              label="Select"
              height="39px"
              style={{ width: "36%" }}
              labelFontSize="12px"
              options={dateFilterOptions}
              value={dateFilter}
              labelMarginTop="-1px"
              valueMarginTop="-6px"
              downArrowIconTop="43%"
              fontSize="13px"
              onChange={(e) => {
                setDateFilter(e.target.value);
              }}
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
          }}
        >
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
          scroll={{ x: 1600 }}
          columns={columns}
          dataSource={followUpData}
          dataPerPage={10}
          // loading={tableLoading}
          checkBox="false"
          size="small"
          className="questionupload_table"
        />
      </div>

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
