import axios from "axios";

const API_URL = "http://localhost:5050/api"; // Change this to your backend URL if deployed

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});