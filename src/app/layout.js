import { Geist, Geist_Mono, Quicksand, Sour_Gummy } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../app/context/CartContext";
import { AuthProvider } from "../app/context/AuthContext";
import NavBar from "../app/components/NavBar";
import { ToastContainer } from "react-toastify";
import SocketBridge from "../app/components/SocketBridge";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

const sourGummy = Sour_Gummy({
  variable: "--font-sourGummy",
  subsets: ["latin"],
});


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Morning Joy Coffee",
  description: "App developed by Byte and Build",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${quicksand.variable} ${sourGummy.variable}`}>
        <AuthProvider>
          <CartProvider>
            <SocketBridge />
            {children}
            <NavBar />
            <ToastContainer position="top-right" autoClose={2000} />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
