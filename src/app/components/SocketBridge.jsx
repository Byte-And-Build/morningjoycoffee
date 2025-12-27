"use client";

import { useAuth } from "../context/AuthContext";
import { useSocketAuth } from "../hooks/useSocketAuth";

export default function SocketBridge() {
  const { token } = useAuth();
  useSocketAuth(token);
  return null;
}
