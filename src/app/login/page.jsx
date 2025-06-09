'use client';
import { useState, useEffect } from "react";
import { Logo } from "../assets/Logo.png"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../../app/context/AuthContext";
import styles from "../../app/page.module.css";

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/profile");
    }
  }, [user]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error("Login failed:", error);
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <Image src={Logo} alt="Logo" width={200} height={100} className={styles.logo} />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.input}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.input}
      />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Image src="/images/Logo.png" alt="Logo" width={100} height={50} />
          <div className={styles.buttonGroup}>
            <button className={styles.buttons} onClick={handleLogin}>LOGIN</button>
            <button className={styles.buttons} onClick={() => router.push("/register")}>REGISTER</button>
            <button className={styles.btns} onClick={() => router.push("/forgotpassword")}>
              Forgot Password?
            </button>
          </div>
        </>
      )}
    </div>
  );
}
