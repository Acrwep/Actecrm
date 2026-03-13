import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  getUsers,
  sendNotification,
  ticketTrack,
  updateTicketStatus,
} from "../ApiService/action";
import CommonSelectField from "../Common/CommonSelectField";
import {
  addressValidator,
  formatToBackendIST,
  selectValidator,
} from "../Common/Validation";
import { CommonMessage } from "../Common/CommonMessage";
import ImageUploadCrop from "../Common/ImageUploadCrop";
import moment from "moment";

const AssignTicket = forwardRef(
  (
    { drawerStatus, ticketDetails, setButtonLoading, callgetTicketsApi },
    ref,
  ) => {
    const [allUsersList, setAllUsersList] = useState([]);
    const [raId, setRaId] = useState("");
    const [raIdError, setRaIdError] = useState("");
    const [raItem, setRaItem] = useState("");
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
      const raIdValidate =
        drawerStatus == "Close Request"
          ? addressValidator(attachmentBase64)
          : selectValidator(raId);

      setRaIdError(raIdValidate);

      if (raIdValidate) return;

      const today = new Date();
      const getloginUserDetails = localStorage.getItem("loginUserDetails");
      const converAsJson = JSON.parse(getloginUserDetails);
      console.log("getloginUserDetails", converAsJson);

      const findUser = allUsersList.find((f) => f.user_id == raId);
      console.log("findUser", findUser);

      setButtonLoading(true);

      const payload = {
        ticket_id: ticketDetails?.ticket_id ?? null,
        ...(drawerStatus && drawerStatus == "Assign Ticket"
          ? { assigned_to: raId }
          : {}),
        status: drawerStatus == "Assign Ticket" ? "Assigned" : "Close Request",
        created_date: formatToBackendIST(today),
        details:
          drawerStatus == "Assign Ticket"
            ? `Ticket Assigned to ${raItem?.user_id || ""}-${raItem?.user_name ?? ""}`
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
        ...(drawerStatus && drawerStatus == "Assign Ticket"
          ? { ra_id: raId }
          : {}),
        status: drawerStatus == "Assign Ticket" ? "Assigned" : "Close Request",
        updated_at: formatToBackendIST(today),
      };

      try {
        await updateTicketStatus(payload);
        setButtonLoading(false);
        handleSendNotification();
        callgetTicketsApi();
      } catch (error) {
        console.log("update ticker status error", error);
      }
    };

    const handleSendNotification = async () => {
      const today = new Date();
      const payload = {
        user_ids: [raId],
        title: "Ticket Assigned",
        message: {
          title:
            ticketDetails && ticketDetails.title ? ticketDetails.title : "-",
          category_name:
            ticketDetails && ticketDetails.category_name
              ? ticketDetails.category_name
              : "-",
          priority:
            ticketDetails && ticketDetails.priority
              ? ticketDetails.priority
              : "-",
          ticket_created_date:
            ticketDetails && ticketDetails.created_at
              ? moment(ticketDetails.created_at).format("YYYY-MM-DD")
              : "-",
        },
        created_at: formatToBackendIST(today),
      };
      try {
        await sendNotification(payload);
      } catch (error) {
        console.log("send notification error", error);
      }
    };

    return (
      <div className="customer_statusupdate_adddetailsContainer">
        <p className="customer_statusupdate_adddetails_heading">Add Details</p>

        {drawerStatus == "Assign Ticket" ? (
          <>
            <div style={{ marginTop: "20px" }}>
              <CommonSelectField
                label="Select User"
                required={true}
                options={allUsersList}
                onChange={(e) => {
                  setRaId(e.target.value);
                  setRaItem(e.target.option);
                  setRaIdError(selectValidator(e.target.value));
                }}
                value={raId}
                error={raIdError}
              />
            </div>
          </>
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
