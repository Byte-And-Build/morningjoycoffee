// app/hooks/useSocketAuth.js
"use client";

import { useEffect, useRef } from "react";
import { getSocket } from "../lib/socket";

export function useSocketAuth(token) {
  const authedRef = useRef(false);

  useEffect(() => {
    const socket = getSocket();
    if (!token) return;

    if (!socket.connected) socket.connect();

    // Only auth once per token/session
    if (!authedRef.current) {
      socket.emit("auth", token);
      authedRef.current = true;
    }

    return () => {
      // optional: keep socket alive across pages
      // If you want to disconnect when user logs out, handle that in AuthProvider/logout
    };
  }, [token]);
}