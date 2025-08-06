import React from "react";
import { Space, Spin, Switch } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const CommonSpinner = () => {
  return (
    <Space>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Spin
          indicator={<LoadingOutlined spin />}
          size={20}
          style={{ color: "white" }}
        />
      </div>
    </Space>
  );
};
export default CommonSpinner;
