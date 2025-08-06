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
