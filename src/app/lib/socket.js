"use client";

import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    // If same origin, no URL needed.
    // If your API is on a different domain in prod, set NEXT_PUBLIC_SOCKET_URL and use it here.
    const url = process.env.NEXT_PUBLIC_SOCKET_URL;

    socket = io(url || undefined, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: false, // we'll connect manually once we have a token
    });
  }

  return socket;
}
