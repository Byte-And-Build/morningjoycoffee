'use client';
import { useState, useEffect } from "react";
import Logo from "../assets/Logo.webp"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../../app/context/AuthContext";
import styles from "../../app/page.module.css";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      console.error("Registration Failed:", error);
      toast.error("Registration Failed:", error)
    }
    setLoading(false);
  };

  return (
    <div className={styles.page} style={{justifyContent:'center', display:'flex'}}>
      <ToastContainer position="top-right" autoClose={2000}/>
      <Image src={Logo} alt="Logo" width={200} height={200} content="contain"/>
      <div className={styles.vertContainer} style={{overflow: "hidden", flexGrow:'0'}}>
      <form className={styles.vertContainer}>
    <input
        type="name"
        placeholder="Name/Nickname"
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
      </form>
      {loading ? (
        <div className={styles.vertContainer}>
          <Image src={Logo} alt="Logo" width={150} height={150} content="contain"/>
          <div>Loading...</div>
        </div>
      ) : (
          <div className={styles.horizContainer} style={{maxHeight:'fit-content', maxWidth:'50%', boxShadow:'none'}}>
            <button className={styles.btns} onClick={handleRegister}>REGISTER</button>
          </div>
      )}
      </div>
       <strong><Link className={styles.itemDetails} href="/login"> Already a member? Login here!</Link></strong>
       <p style={{fontSize:'10px', textAlign:'center'}}>We do not collect, share, or sell your information. We are not interested in it.<br></br>This is strictly for logging into this app only.</p>
    </div>
  );
}
