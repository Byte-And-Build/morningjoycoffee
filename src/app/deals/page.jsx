'use client';
import styles from "../../app/page.module.css";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; // still works
import { api } from '../utils/api';

export default function DealsPage() {
  const [menuImageUrl, setMenuImageUrl] = useState(null);
  const { user } = useAuth(); // assumed working from context

  useEffect(() => {
    const fetchMenuImage = async () => {
      try {
        const { data } = await api.get('/api/menu/image');
        setMenuImageUrl(data.url);
      } catch (err) {
        console.error('Failed to fetch menu image', err);
      }
    };
    fetchMenuImage();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      try {
        await api.post('/api/menu/image', { base64 });
        setMenuImageUrl(base64);
        alert('Menu image updated!');
      } catch (err) {
        console.error('Upload failed', err);
        alert('Upload failed');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.page}>
      <div className={styles.vertContainer}>
        <h1 className={styles.heading}>Seasonal Menu</h1>
        {menuImageUrl ? (
          <img src={menuImageUrl} alt="Seasonal Menu" className={styles.dealsImage} />
        ) : (
          <p className="text-lg text-gray-600">Loading menu...</p>
        )}

        {user?.role === 'Admin' && (
          <div style={{display: "flex", flexDirection: "row", width: "100%"}}>
            <label className={styles.btns} htmlFor="menu">
              Upload New Menu
              <input
                id="menu"
                type="file"
                accept="image/*"
                className={styles.hidden}
                onChange={handleUpload}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
