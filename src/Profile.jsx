import { useEffect, useState } from "react";
import { ref, get, update } from "firebase/database";
import { auth } from "./firebase";
import { db } from "./firebase";

export default function Profile({ onBack }) {
  const uid = auth.currentUser.uid;
<<<<<<< HEAD
  const [profile, setProfile] = useState(null);
  const [photo, setPhoto] = useState("");
=======

  const [profile, setProfile] = useState(null);
  const [photo, setPhoto] = useState("");
  const [saving, setSaving] = useState(false);
>>>>>>> 71c2677 (Update)

  useEffect(() => {
    const loadProfile = async () => {
      const snap = await get(ref(db, `users/${uid}`));
<<<<<<< HEAD
      setProfile(snap.val());
      setPhoto(snap.val()?.photo || "");
    };
=======
      const data = snap.val();
      setProfile(data);
      setPhoto(data?.photo || "");
    };

>>>>>>> 71c2677 (Update)
    loadProfile();
  }, [uid]);

  const saveProfile = async () => {
<<<<<<< HEAD
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
=======
    setSaving(true);

    await update(ref(db, `users/${uid}`), {
      photo
    });

    setSaving(false);
  };

  if (!profile) {
    return (
      <div className="app">
        <div className="header">
          <span>PROFILE</span>
        </div>
        <div className="profile-body">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="app">

      <div className="header">
        <span>PROFILE</span>
        <button onClick={onBack}>BACK</button>
      </div>

      <div className="profile-body">

        <div className="profile-card">

          <div className="profile-info">
            <div className="profile-field">
              <label>USERNAME</label>
              <div className="profile-value">
                {profile.username}
              </div>
            </div>

            <div className="profile-field">
              <label>EMAIL</label>
              <div className="profile-value">
                {profile.email}
              </div>
            </div>
          </div>

          <div className="photo-section">
            <label>PROFILE IMAGE URL</label>

            <input
              value={photo}
              onChange={e => setPhoto(e.target.value)}
              placeholder="Paste image URL"
            />

            {photo && (
              <div className="image-preview">
                <img src={photo} alt="profile preview" />
              </div>
            )}
          </div>

          <div className="profile-actions">
            <button
              className="primary-btn"
              onClick={saveProfile}
              disabled={saving}
            >
              {saving ? "SAVING..." : "SAVE"}
            </button>

            <button
              className="secondary-btn"
              onClick={onBack}
            >
              BACK
            </button>
          </div>

          <button
            className="logout-btn"
            onClick={() => {
              auth.signOut();
              window.location.reload();
            }}
          >
            LOGOUT
          </button>

        </div>

      </div>

    </div>
  );
}
>>>>>>> 71c2677 (Update)
