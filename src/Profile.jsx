import { useEffect, useState } from "react";
import { ref, get, update } from "firebase/database";
import { auth } from "./firebase";
import { db } from "./firebase";

export default function Profile({ onBack }) {
  const uid = auth.currentUser.uid;
  const [profile, setProfile] = useState(null);
  const [photo, setPhoto] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const snap = await get(ref(db, `users/${uid}`));
      setProfile(snap.val());
      setPhoto(snap.val()?.photo || "");
    };
    loadProfile();
  }, [uid]);

  const saveProfile = async () => {
    await update(ref(db, `users/${uid}`), {
      photo
    });
    alert("Profile updated");
  };

  if (!profile) return <div>Loading…</div>;

  return (
    <div className="profile">
      <h2>My Profile</h2>

      <p><b>Username:</b> {profile.username}</p>
      <p><b>Email:</b> {profile.email}</p>

      <input
        placeholder="Profile image URL"
        value={photo}
        onChange={e => setPhoto(e.target.value)}
      />

      {photo && (
        <img
          src={photo}
          alt="profile"
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            marginTop: 10
          }}
        />
      )}

      <br /><br />

      <button onClick={saveProfile}>Save</button>
      <button onClick={onBack}>Back</button>
      <br /><br />
      <button
  style={{ marginTop: 20, opacity: 0.6 }}
  onClick={() => {
    auth.signOut();
    window.location.reload();
  }}
>
  Logout
</button>


    </div>
    
  );
}
