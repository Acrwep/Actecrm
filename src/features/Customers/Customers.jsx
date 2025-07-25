import React from "react";
import { Row, Col } from "antd";
import { CiSearch } from "react-icons/ci";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import CommonDatePicker from "../Common/CommonDatePicker";
import CommonDoubleDatePicker from "../Common/CommonDoubleDatePicker";

export default function Customers() {
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
          {/* <FiFilter
            size={20}
            color="#5b69ca"
            style={{ marginLeft: "12px", cursor: "pointer" }}
            onClick={() => setIsOpenFilterDrawer(true)}
          /> */}
        </Col>
      </Row>
    </div>
  );
}
