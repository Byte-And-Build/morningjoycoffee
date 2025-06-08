import axios from "axios";

// Dynamically set baseURL based on environment
const API_URL =
  process.env.NODE_ENV === "development"
    ? ""
    : "https://morningjoycoffee-8807d101e92a.herokuapp.com/";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});