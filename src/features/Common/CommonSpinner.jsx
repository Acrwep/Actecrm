import React from "react";
import { Space, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const CommonSpinner = ({ color = "white", size = 20 }) => {
  return (
    <Space>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Spin
          indicator={
            <LoadingOutlined
              spin
              style={{
                fontSize: size,
                color,
              }}
            />
          }
        />
      </div>
    </Space>
  );
};

export default CommonSpinner;
