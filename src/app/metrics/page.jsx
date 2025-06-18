"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import styles from "../../app/page.module.css";
import Image from "next/image";
import Logo from "../../app/assets/Logo.png";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const socket = io(
  process.env.NODE_ENV === "development"
    ? "http://localhost:5050"
    : "https://morningjoycoffee-8807d101e92a.herokuapp.com",
  { transports: ["websocket"] }
);

export default function MetricsPage() {
  const { token } = useAuth();
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [todaySummary, setTodaySummary] = useState({ totalOrders: 0, totalRevenue: 0 });
  const [topSelling, setTopSelling] = useState({
    day: null,
    week: null,
    month: null,
  });
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [deleteUserModal, setDeleteUserModal] = useState(null);

  useEffect(() => {
    socket.on("online-count", setLiveVisitors);
    return () => socket.off("online-count", setLiveVisitors);
  }, []);

  useEffect(() => {
    const fetchTodaySummary = async () => {
      try {
        const res = await fetch("/api/metrics/today-summary");
        const data = await res.json();
        setTodaySummary(data);
      } catch (err) {
        console.error("Failed to fetch today's summary:", err);
      }
    };

    fetchTodaySummary();
  }, []);

  useEffect(() => {
    const fetchTopSelling = async () => {
      try {
        const res = await fetch("/api/metrics/top-selling");
        const data = await res.json();
        setTopSelling(data);
      } catch (err) {
        console.error("Failed to fetch top selling items", err);
      }
    };

    fetchTopSelling();
  }, []);

  useEffect(() => {
  if (!token) return; // ⛔ Don't fetch if token is not yet loaded

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.warn("Non-array user response:", data);
        setUsers([]); // fallback if unauthorized
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  };

  fetchUsers();
}, [token]);

const saveUserChanges = async () => {
  await fetch(`/api/users/${editUser._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(editUser),
  });
  setEditUser(null);
  toast.success("User Updated!")
};

const deleteUser = async (id) => {
  await fetch(`/api/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  setUsers(users.filter(u => u._id !== id));
  setDeleteUserModal(null);  
  toast.success("User Deleted!")
};

  const renderTop = (label, item) => (
    <div className={styles.horizContainer}>
      {item && item.name !== "None" ? (
        <div className={styles.vertContainer} style={{justifyContent: "flex-start"}}>
          <h3 className={styles.drinkName}>{label}</h3>
          <Image src={Logo} alt={item.name} width={100} height={100} content="contain"/>
          <p className={styles.ingrediants}>{item.name}</p>
          <p>Sold: {item.count}</p>
        </div>
      ) : (
        <div className={styles.vertContainer} style={{justifyContent: "flex-start"}}>
          <h3 className={styles.drinkName}>{label}</h3>
          <p className={styles.ingrediants}>No sales</p>
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.page} style={{ justifyContent: "flex-start" }}>
      <div className={styles.vertContainer} style={{paddingLeft: ".5rem", paddingRight: ".5rem"}}>
        <div className={styles.horizWrapper}>
          <Image src={Logo} width={80} height={80} alt="Logo" content="contain" />
          <h1 className={styles.heading}>Metrics</h1>
          <div className={styles.visitorContainer}>
            <h2 className={styles.ingrediants}>Live Visitors:</h2>
            <p className={styles.drinkName}>{liveVisitors}</p>
          </div>
        </div>
          <h2>Top Selling Items</h2>
        <div className={styles.horizWrapperInset} style={{alignItems: "flex-start"}}>
          {renderTop("Today", topSelling.day)}
          {renderTop("This Week", topSelling.week)}
          {renderTop("This Month", topSelling.month)}
        </div>
        <div className={styles.horizWrapperInset}>
          <div className={styles.vertContainer} style={{flex: 1}}>
            <h2 className={styles.drinkName}>Orders Today</h2>
            <p>{todaySummary.totalOrders}</p>
          </div>
            <div className={styles.vertContainer} style={{flex: 1}}>
              <h2 className={styles.drinkName}>Revenue Today</h2>
              <p>${(todaySummary.totalRevenue / 100).toFixed(2)}</p>
            </div>
          </div>
          <h2>Supplies Levels</h2>
          <div className={styles.vertContainerInset}>
            <span>Coming Soon...</span>
          </div>
          <h2>Users</h2>
            <div className={styles.vertContainerInset} style={{maxHeight: "175px", overflowY: "auto", alignItems: "center", padding: ".5rem", justifyContent: "flex-start"}}>
              {users.map(user => (
                <div key={user._id} className={styles.vertContainerInset} style={{minHeight: "50px", padding: ".25rem", marginBottom: "1rem", overflowX: "auto", overflowY: "hidden", justifyContent: "flex-start"}}>
                  <div key={user._id} className={styles.horizWrapper} style={{gap: "1rem", textAlign: "left", justifyContent: "flex-start", paddingLeft: ".5rem"}}>
                  <p style={{flex: "1"}}>{user.email}</p>
                  <p style={{flex: "1"}}>Role: {user.role}</p>
                  <p style={{flex: "1"}}>Rewards: {user.rewards}</p>
                  <button className={styles.btnsSmall} style={{maxWidth: "100px"}} onClick={() => setEditUser(user)}>Edit</button>
                  <button className={styles.btnsSmall} style={{maxWidth: "100px"}} onClick={() => setDeleteUserModal(user)}>Delete</button>
                  </div>
                </div>
              ))}
              
          </div>
        </div>
        {editUser && (
          <div className={styles.overlay}>
            <div className={styles.modal}>
              <h3 className={styles.heading}>Edit User</h3>
              <div className={styles.horizWrapper}>
                <span>email: </span>
                <input id="userEmail" className={styles.userInput} value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} />
              </div>
              <div className={styles.horizWrapper}>
                <span>Rewards: </span>
                <input id="rewardsAmount" className={styles.userInput} type="number" value={editUser.rewards} onChange={e => setEditUser({ ...editUser, rewards: +e.target.value })} />
              </div>
              <div className={styles.horizWrapper}>
              <span>Role:</span>
              <select value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                <option value="Customer">Customer</option>
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </select>
              </div>
              <div className={styles.horizWrapper}>
                <button className={styles.btns} onClick={saveUserChanges}>Save</button>
                <button className={styles.btns} onClick={() => setEditUser(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {deleteUserModal && (
          <div className={styles.overlay}>
            <div className={styles.modal}>
              <h3 className={styles.heading}>Delete User</h3>
              <div className={styles.horizWrapper}>
                <span>email: </span>
                <input readOnly id="userEmail" className={styles.userLabel} value={deleteUserModal.email} />
              </div>
              <div className={styles.horizWrapper}>
                <span>Rewards: </span>
                <input readOnly id="rewardsAmount" className={styles.userLabel} type="number" value={deleteUserModal.rewards} />
              </div>
              <div className={styles.horizWrapper}>
                <button className={styles.btns} onClick={() => deleteUser(deleteUserModal._id)}>Delete</button>
                <button className={styles.btns} onClick={() => setDeleteUserModal(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
