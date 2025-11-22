'use client';
import { useState, useEffect } from "react";
import Logo from "../assets/Logo.webp"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../../app/context/AuthContext";
import styles from "../../app/page.module.css";

export default function LoginPage() {
  const { user, register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/profile");
    }
  }, [user]);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (error) {
      console.error("Register failed:", error);
    }
    setLoading(false);
  };

  return (
    <div className={styles.page} style={{overflow: "hidden"}}>
      <Image src={Logo} alt="Logo" width={200} height={200} content="contain"/>
      <div className={styles.vertContainer} style={{overflow: "hidden"}}>
      <div className={styles.vertContainer}>
    <input
        type="name"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.userInput}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.userInput}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.userInput}
      />
      </div>
      {loading ? (
        <div className={styles.vertContainer}>
          <Image src={Logo} alt="Logo" width={150} height={150} content="contain"/>
          <div>Loading...</div>
        </div>
      ) : (
          <div className={styles.vertContainer} style={{paddingLeft: "1rem", paddingRight: "1rem"}}>
            <button className={styles.btns} onClick={handleRegister}>REGISTER</button>
            <button className={styles.btns} onClick={() => router.push("/login")}>LOGIN</button>
          </div>
      )}
      </div>
    </div>
  );
}
