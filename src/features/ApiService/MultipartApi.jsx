import React from "react";
import axios from "axios";
import { isTokenExpired, ShowModal } from "./SessionHandler";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "multipart/form-data",
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
  },
);


//courses's api's
export const insertCourse = async (payload) => {
  try {
    const response = await api.post("/api/insertCourse", payload);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateCourse = async (payload) => {
  try {
    const response = await api.put("/api/updateCourse", payload);
    return response;
  } catch (error) {
    throw error;
  }
};
