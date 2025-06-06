import axios from "axios";

const API_URL = "https://morningjoycoffee-8807d101e92a.herokuapp.com/api"; // Change this to your backend URL if deployed

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});