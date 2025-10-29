// C:\project-mgt\lib\api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "", // empty = same origin (local)
  withCredentials: true, // include cookies for auth
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
