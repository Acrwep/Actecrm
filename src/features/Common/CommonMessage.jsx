import React from "react";
import { message } from "antd";

export const CommonMessage = (msg, content) => {
  if (msg === "success") {
    message.success(content, 10);
  } else if (msg === "error") {
    message.error(content);
  } else {
    message.warning(content);
  }
};
