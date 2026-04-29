import React from "react";
import { Modal, Button } from "antd";
import "../Common/commonstyles.css";

let isModalVisible = false;
let modalInstance = null;

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    const currentTime = Date.now() / 1000;
    return decodedPayload.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

export const handleSessionModal = () => {
  const event = new Event("tokenExpireUpdated");
  window.dispatchEvent(event);

  // Trigger socket disconnect and state cleanup
  const logoutEvent = new Event("manualLogout");
  window.dispatchEvent(logoutEvent);

  if (modalInstance) {
    modalInstance.destroy();
    modalInstance = null;
  }
  isModalVisible = false;
};


export const ShowModal = () => {
  if (isModalVisible) {
    return;
  }

  isModalVisible = true;

  modalInstance = Modal.warning({
    title: "Session Expired",
    centered: true,
    content: "Your session has expired. Please log in again.",
    onOk() {
      handleSessionModal();
    },
    onCancel() {
      handleSessionModal();
    },
    onClose() {
      handleSessionModal();
    },
    footer: [
      <div className="sessionmodal_okbuttonContainer" key="footer">
        <Button className="sessionmodal_okbutton" onClick={handleSessionModal}>
          OK
        </Button>
      </div>,
    ],
  });
};
