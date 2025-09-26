import React from "react";
import axios from "axios";
import { Modal, Button } from "antd";
import "../Common/commonstyles.css";

let isModalVisible = false;
let modalInstance = null; // Track modal instance for manual control

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const AccessToken = localStorage.getItem("AccessToken");
    if (AccessToken) {
      const expired = isTokenExpired(AccessToken);
      if (expired === true) {
        ShowModal();
        return Promise.reject(new Error("Token is expired"));
      }
      config.headers.Authorization = `Bearer ${AccessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const isTokenExpired = (token) => {
  if (!token) return true; // No token means it's "expired"

  try {
    // split the token into parts
    const payloadBase64 = token.split(".")[1];

    // decode the base64 payload
    const decodedPayload = JSON.parse(atob(payloadBase64));

    // get the current time in seconds
    const currentTime = Date.now() / 1000;

    // check if the token has expired
    return decodedPayload.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

const handleSessionModal = () => {
  const event = new Event("tokenExpireUpdated");
  window.dispatchEvent(event);
  if (modalInstance) {
    modalInstance.destroy(); // Manually close the modal
    modalInstance = null;
  }
  isModalVisible = false;
};

const ShowModal = () => {
  if (isModalVisible) {
    return; // Don't open a new modal if one is already visible
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
      <div className="sessionmodal_okbuttonContainer">
        <Button className="sessionmodal_okbutton" onClick={handleSessionModal}>
          OK
        </Button>
      </div>,
    ],
  });

  return;
};

//login api
export const LoginApi = async (payload) => {
  try {
    const response = await api.post("/api/login", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

// users api's
export const createUser = async (payload) => {
  try {
    const response = await api.post("/api/addUser", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getUsers = async (payload) => {
  try {
    const response = await api.get("/api/getUsers", { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (payload) => {
  try {
    const response = await api.put("/api/updateUser", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

// trainer api's
export const createTechnology = async (payload) => {
  try {
    const response = await api.post("/api/addTechnologies", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getTechnologies = async (payload) => {
  try {
    const response = await api.get("/api/getTechnologies", {
      params: payload,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getBatches = async (payload) => {
  try {
    const response = await api.get("/api/getBatches", { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getExperience = async (payload) => {
  try {
    const response = await api.get("/api/getExperience", { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getTrainers = async (payload) => {
  try {
    const response = await api.post("/api/getTrainers", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getTrainerById = async (trainer_id) => {
  try {
    const response = await api.get(
      `/api/getTrainerById?trainer_id=${trainer_id}`
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const createTrainer = async (payload) => {
  try {
    const response = await api.post("/api/addTrainer", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateTrainer = async (payload) => {
  try {
    const response = await api.put("/api/updateTrainer", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const trainerStatusUpdate = async (payload) => {
  try {
    const response = await api.put("/api/updateStatus", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendTrainerFormEmail = async (payload) => {
  try {
    const response = await api.post("/api/sendMail", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

// lead api's
export const getAllAreas = async (payload) => {
  try {
    const response = await api.get("/api/getAreas", { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const createArea = async (payload) => {
  try {
    const response = await api.post("/api/insertArea", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getTrainingMode = async (payload) => {
  try {
    const response = await api.get("/api/getTrainingMode", { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getPriority = async (payload) => {
  try {
    const response = await api.get("/api/getPriority", { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getLeadType = async (payload) => {
  try {
    const response = await api.get("/api/getLeadType", { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getLeadStatus = async (payload) => {
  try {
    const response = await api.get("/api/getStatus", { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getLeadResponseStatus = async (payload) => {
  try {
    const response = await api.get("/api/getResponseStatus", {
      params: payload,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getRegions = async (payload) => {
  try {
    const response = await api.get("/api/getRegion", { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getBranches = async (payload) => {
  try {
    const response = await api.get("/api/getBranches", { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getBatchTrack = async (payload) => {
  try {
    const response = await api.get("/api/getBatchTrack", { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const createLead = async (payload) => {
  try {
    const response = await api.post("/api/insertLead", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateLead = async (payload) => {
  try {
    const response = await api.put("/api/updateLead", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getLeads = async (payload) => {
  try {
    const response = await api.post("/api/getLeads", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getLeadAndFollowupCount = async () => {
  try {
    const response = await api.get("/api/getLeadCount");
    return response;
  } catch (error) {
    throw error;
  }
};

export const getLeadFollowUps = async (payload) => {
  try {
    const response = await api.get("/api/getLeadFollowUps", {
      params: payload,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateFollowUp = async (payload) => {
  try {
    const response = await api.put("/api/updateFollowUp", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const leadPayment = async (payload) => {
  try {
    const response = await api.post("/api/createPayment", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendPaymentInvoiceByEmail = async (payload) => {
  try {
    const response = await api.post("/api/sendInvoicePdf", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

// customers api's
export const getCustomers = async (payload) => {
  try {
    const response = await api.post("/api/getCustomers", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getPendingFeesCustomers = async (payload) => {
  try {
    const response = await api.post("/api/pendingFeesList", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getPendingFeesCustomersCount = async (payload) => {
  try {
    const response = await api.get("/api/getPendingFeesCount", {
      params: payload,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendCustomerFormEmail = async (payload) => {
  try {
    const response = await api.post("/api/sendCustomerMail", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendCustomerWelcomeEmail = async (payload) => {
  try {
    const response = await api.post("/api/sendWelcomeMail", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendCustomerPaymentVerificationEmail = async (payload) => {
  try {
    const response = await api.post("/api/sendPaymentMail", payload);
    return response;
  } catch (error) {
    throw error;
  }
};
export const getCustomerById = async (customer_id) => {
  try {
    const response = await api.get(
      `/api/getCustomerById?customer_id=${customer_id}`
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateCustomer = async (payload) => {
  try {
    const response = await api.put("/api/updateCustomer", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateCustomerStatus = async (payload) => {
  try {
    const response = await api.put("/api/updateCustomerStatus", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const inserCustomerTrack = async (payload) => {
  try {
    const response = await api.post("/api/insertCusTrack", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const verifyCustomerPayment = async (payload) => {
  try {
    const response = await api.put("/api/verifyPayment", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const rejectCustomerPayment = async (payload) => {
  try {
    const response = await api.put("/api/paymentReject", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const viewPaymentInvoice = async (payload) => {
  try {
    const response = await api.post("/api/viewInvoicePdf", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateCustomerPaymentTransaction = async (payload) => {
  try {
    const response = await api.put("/api/updatePayment", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const verifyCustomer = async (payload) => {
  try {
    const response = await api.put("/api/verifyStudent", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const assignTrainerForCustomer = async (payload) => {
  try {
    const response = await api.post("/api/trainerAssign", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getAssignTrainerHistoryForCustomer = async (payload) => {
  try {
    const response = await api.get("/api/getTrainerHistory", {
      params: payload,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCustomerByTrainerId = async (payload) => {
  try {
    const response = await api.get("/api/getCusByTrainer", {
      params: payload,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const verifyTrainerForCustomer = async (payload) => {
  try {
    const response = await api.put("/api/verifyTrainer", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const rejectTrainerForCustomer = async (payload) => {
  try {
    const response = await api.put("/api/rejectTrainer", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const classScheduleForCustomer = async (payload) => {
  try {
    const response = await api.put("/api/classSchedule", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateClassGoingForCustomer = async (payload) => {
  try {
    const response = await api.put("/api/updateClassGiong", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updatefeedbackForCustomer = async (payload) => {
  try {
    const response = await api.put("/api/updateReview", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const generateCertForCustomer = async (payload) => {
  try {
    const response = await api.post("/api/generateCertificate", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const viewCertForCustomer = async (payload) => {
  try {
    const response = await api.get("/api/getCertificate", { params: payload });
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendCustomerCertificate = async (payload) => {
  try {
    const response = await api.post("/api/sendCustomerCertificate", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCustomerFullHistory = async (customerid) => {
  try {
    const response = await api.get(
      `/api/getCustomerHistory?customer_id=${customerid}`
    );
    return response;
  } catch (error) {
    throw error;
  }
};

//payment api's
export const customerDuePayment = async (payload) => {
  try {
    const response = await api.post("/api/partPayment", payload);
    return response;
  } catch (error) {
    throw error;
  }
};
