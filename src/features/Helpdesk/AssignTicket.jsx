import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  getUsers,
  ticketTrack,
  updateTicketStatus,
} from "../ApiService/action";
import CommonSelectField from "../Common/CommonSelectField";
import { formatToBackendIST, selectValidator } from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import ImageUploadCrop from "../Common/ImageUploadCrop";

const AssignTicket = forwardRef(
  (
    { drawerStatus, ticketDetails, setButtonLoading, callgetTicketsApi },
    ref,
  ) => {
    const [allUsersList, setAllUsersList] = useState([]);
    const [userId, setUserId] = useState("");
    const [userIdError, setUserIdError] = useState("");
    const [attachmentBase64, setAttachmentBase64] = useState("");
    const [attachmentBase64Error, setAttachmentBase64Error] = useState("");

    useEffect(() => {
      getUsersData();
    }, []);

    const getUsersData = async () => {
      const payload = {
        page: 1,
        limit: 1000,
      };
      try {
        const response = await getUsers(payload);
        console.log("users response", response);
        setAllUsersList(response?.data?.data?.data || []);
      } catch (error) {
        setAllUsersList([]);
        console.log("get all users error", error);
      }
    };

    useImperativeHandle(ref, () => ({
      handleTicketTrack,
    }));

    const handleTicketTrack = async () => {
      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);
      console.log("getloginUserDetails", converAsJson);

      setButtonLoading(true);

      const payload = {
        ticket_id: ticketDetails?.ticket_id ?? null,
        assigned_to: userId,
        status: drawerStatus == "Assign Ticket" ? "Assigned" : "Close Request",
        created_date: formatToBackendIST(today),
        details:
          drawerStatus == "Assign Ticket"
            ? `Ticket Assigned to ${userId} (${converAsJson?.user_name ?? ""})`
            : attachmentBase64,
        updated_by:
          converAsJson && converAsJson.user_id ? converAsJson.user_id : 0,
      };
      console.log("payloaddd", payload);

      try {
        await ticketTrack(payload);
        setTimeout(() => {
          CommonMessage("success", "Updated");
          handleTicketStatus();
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later",
        );
      }
    };

    const handleTicketStatus = async () => {
      const today = new Date();

      const payload = {
        ticket_id: ticketDetails?.ticket_id ?? null,
        status: drawerStatus == "Assign Ticket" ? "Assigned" : "Close Request",
        updated_at: formatToBackendIST(today),
      };

      try {
        await updateTicketStatus(payload);
        setButtonLoading(false);
        callgetTicketsApi();
      } catch (error) {
        console.log("update ticker status error", error);
      }
    };

    return (
      <div className="customer_statusupdate_adddetailsContainer">
        <p className="customer_statusupdate_adddetails_heading">Add Details</p>

        {drawerStatus == "Assign Ticket" ? (
          <div style={{ marginTop: "20px" }}>
            <CommonSelectField
              label="Select User"
              required={true}
              options={allUsersList}
              onChange={(e) => {
                setUserId(e.target.value);
                setUserIdError(selectValidator(e.target.value));
              }}
              value={userId}
              error={userIdError}
            />
          </div>
        ) : (
          <div style={{ marginTop: "30px" }}>
            <ImageUploadCrop
              label="Attachment"
              aspect={1}
              maxSizeMB={1}
              required={true}
              value={attachmentBase64}
              onChange={(base64) => setAttachmentBase64(base64)}
              onErrorChange={setAttachmentBase64Error}
            />

            {attachmentBase64Error && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#d32f2f",
                  marginTop: 4,
                }}
              >
                {`Attachment ${attachmentBase64Error}`}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);
export default AssignTicket;
