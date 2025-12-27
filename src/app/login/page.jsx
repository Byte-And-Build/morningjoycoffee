'use client';
import { useState, useEffect } from "react";
import Logo from "../assets/Logo.webp"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../../app/context/AuthContext";
import styles from "../../app/page.module.css";
import { toast } from "react-toastify";
import Link from "next/link";

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
      toast.error("Login failed")
      console.error("Login failed:", error);
    }
    setLoading(false);
  };

  return (
    <div className={styles.page} style={{justifyContent:'center', display:'flex'}}>
      <Image src={Logo} alt="Logo" width={200} height={200} content="contain"/>
      <div className={styles.vertContainer} style={{overflow: "hidden", flexGrow:'0', padding:'1rem'}}>
      <form className={styles.vertContainer}> 
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.userInput}
        style={{minWidth:'500px'}}
      />
      <input
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.userInput}
        style={{minWidth:'500px'}}
      />
      </form>
      {loading ? (
        <div className={styles.vertContainer}>
          <Image src={Logo} alt="Logo" width={150} height={150} content="contain"/>
          <div>Loading...</div>
        </div>
      ) : (
        <div className={styles.vertContainer}>
          <div className={styles.horizContainer} style={{boxShadow:'none'}}>
            <button className={styles.btns} onClick={handleLogin}>LOGIN</button>
          </div>
          <button className={styles.btns} onClick={() => router.push("/forgotpassword")}>
              Forgot Password?
          </button>
        </div>
      )}
      </div>
      <strong><Link className={styles.itemDetails} href="/register"> Not a member? Register here!</Link></strong>
    </div>
  );
}
