import React, { useState } from "react";
import { Row, Col, Timeline, Modal } from "antd";
import { LuCircleCheck } from "react-icons/lu";
import { BsStopCircle } from "react-icons/bs";
import { FaRegCircleXmark } from "react-icons/fa6";
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import { IoIosGitPullRequest } from "react-icons/io";
import { FaRegEye } from "react-icons/fa";
import moment from "moment";
import PrismaZoom from "react-prismazoom";

export default function TicketHistory({ data = [] }) {
  const [isOpenAttachmentModal, setIsOpenAttachmentModal] = useState(false);
  const [attachmentScreenshotBase64, setAttachmentScreenshotBase64] =
    useState("");

  const items = data.map((item) => ({
    key: item.id,
    dot:
      item.status == "Assigned" ||
      item.status == "Closed" ||
      item.status == "Created" ? (
        <LuCircleCheck size={16} style={{ color: "green" }} />
      ) : item.status == "Hold" ? (
        <BsStopCircle size={16} style={{ color: "#ffa502" }} />
      ) : item.status == "Close Request" ? (
        <IoIosGitPullRequest color="#1e90ff" />
      ) : item.status.includes("Awaiting") ||
        item.status.includes("Passedout") ? (
        <PiClockCounterClockwiseBold size={18} style={{ color: "gray" }} />
      ) : undefined,
    label: (
      <span style={{ whiteSpace: "nowrap" }}>
        {item.status == "Created" ? "Ticket Created" : item.status}
      </span>
    ),
    children: (
      <>
        {item.status === "Assigned" ? (
          <>
            <div>
              <p className="customer_history_updateddate">
                {moment(item.created_date).format("DD/MM/YYYY hh:mm A")}
              </p>
              <p className="customer_history_updateddate">
                Updated By:{" "}
                <span style={{ color: "gray" }}>{item.update_by_name}</span>
              </p>
            </div>

            <p className="customer_history_comments">{item.details}</p>
          </>
        ) : item.status === "Hold" ? (
          <>
            <div>
              <p className="customer_history_updateddate">
                {moment(item.created_date).format("DD/MM/YYYY hh:mm A")}
              </p>
              <p className="customer_history_updateddate">
                Updated By:{" "}
                <span style={{ color: "gray" }}>{item.update_by_name}</span>
              </p>
            </div>

            <p className="customer_history_comments">
              Comments: {item.details}
            </p>
          </>
        ) : item.status === "Close Request" ? (
          <>
            <div>
              <p className="customer_history_updateddate">
                {moment(item.created_date).format("DD/MM/YYYY hh:mm A")}
              </p>
              <p className="customer_history_updateddate">
                Updated By:{" "}
                <span style={{ color: "gray" }}>{item.update_by_name}</span>
              </p>
            </div>

            <button
              className="customer_history_viewproofbutton"
              onClick={() => {
                setAttachmentScreenshotBase64(item.details);
                setIsOpenAttachmentModal(true);
              }}
            >
              <FaRegEye size={16} /> View Attachment
            </button>
          </>
        ) : (
          <div>
            <p className="customer_history_updateddate">
              {moment(item.created_date).format("DD/MM/YYYY hh:mm A")}
            </p>
            <p className="customer_history_updateddate">
              Updated By:{" "}
              <span style={{ color: "gray" }}>{item.update_by_name}</span>
            </p>
          </div>
        )}
      </>
    ),
  }));

  return (
    <div style={{ marginTop: "30px" }}>
      <Timeline mode="left" items={items} />

      <Modal
        title="Attachment"
        open={isOpenAttachmentModal}
        onCancel={() => {
          setIsOpenAttachmentModal(false);
          setAttachmentScreenshotBase64("");
        }}
        footer={false}
        width="32%"
        className="customer_paymentscreenshot_modal"
      >
        <div style={{ overflow: "hidden", maxHeight: "100vh" }}>
          <PrismaZoom>
            {attachmentScreenshotBase64 ? (
              <img
                src={`data:image/png;base64,${attachmentScreenshotBase64}`}
                alt="payment screenshot"
                className="customer_paymentscreenshot_image"
              />
            ) : (
              "-"
            )}
          </PrismaZoom>
        </div>
      </Modal>
    </div>
  );
}
