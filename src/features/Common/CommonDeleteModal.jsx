import React from "react";
import { Modal, Button } from "antd";
import { MdDelete } from "react-icons/md";
import "./commonstyles.css";
import CommonSpinner from "./CommonSpinner";

export default function CommonDeleteModal({
  open,
  content,
  onCancel,
  onClick,
  loading,
}) {
  return (
    <div>
      <Modal
        open={open}
        onCancel={onCancel}
        footer={false}
        closable={false}
        width={420}
      >
        <div className="common_deletemodalContainer">
          <div className="common_deletemodal_iconContainer">
            <MdDelete size={21} color="#db2728" />
          </div>

          <p className="common_deletemodal_confirmdeletetext">Confirm Delete</p>

          <p className="common_deletemodal_text">{content}</p>

          <div className="common_deletemodal_footerContainer">
            <Button
              className="common_deletemodal_cancelbutton"
              onClick={onCancel}
            >
              No
            </Button>
            {loading ? (
              <Button
                className="common_deletemodal_loading_deletebutton"
                type="primary"
              >
                <CommonSpinner />
              </Button>
            ) : (
              <Button
                className="common_deletemodal_deletebutton"
                onClick={onClick}
                type="primary"
              >
                Yes
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
