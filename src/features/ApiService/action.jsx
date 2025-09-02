import React from "react";
import axios from "axios";

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
      config.headers.Authorization = `Bearer ${AccessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
export const getTechnologies = async (payload) => {
  try {
    const response = await api.get("/api/getTechnologies", { params: payload });
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

export const sendLeadInvoiceEmail = async (payload) => {
  try {
    const response = await api.post("/api/sendInvoice", payload);
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

export const sendCustomerFormEmail = async (payload) => {
  try {
    const response = await api.post("/api/sendCustomerMail", payload);
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

export const verifyCustomerPayment = async (payload) => {
  try {
    const response = await api.put("/api/verifyPayment", payload);
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
