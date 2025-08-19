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
