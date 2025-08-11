// src/api/axiosclient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8000", // Your FastAPI backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
