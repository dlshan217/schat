import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { ref, get, runTransaction, update } from "firebase/database";
import { auth, db } from "./firebase";

const themes = [
  { id: "yellow", label: "Butter", className: "theme-butter" },
  { id: "pink", label: "Blush", className: "theme-blush" },
  { id: "green", label: "Mint", className: "theme-mint" },
];

export default function Profile({ onBack }) {
  const uid = auth.currentUser?.uid;
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoError, setPhotoError] = useState(false);
  const [status, setStatus] = useState("");
  const [statusExpire, setStatusExpire] = useState("");
  const [expiryChoice, setExpiryChoice] = useState("never");
  const [theme, setTheme] = useState("yellow");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!uid) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const snapshot = await get(ref(db, `users/${uid}`));
        if (!mounted) return;
        if (!snapshot.exists()) {
          setNotice("We couldn't find your profile yet.");
          setNoticeType("error");
          return;
        }
        const data = snapshot.val();
        const expired = data.statusExpire && Number(data.statusExpire) <= Date.now();
        const remainingMinutes = (Number(data.statusExpire) - Date.now()) / 60000;
        setProfile(data);
        setUsername(data.username || "");
        setPhoto(data.photo || "");
        setStatus(expired ? "" : data.status || "");
        setStatusExpire(expired ? "" : data.statusExpire || "");
        setExpiryChoice(expired || !data.statusExpire ? "never" : remainingMinutes > 45 ? "60" : "30");
        setTheme(themes.some(item => item.id === data.theme) ? data.theme : "yellow");
      } catch {
        if (mounted) {
          setNotice("Couldn't load your profile. Check your connection and try again.");
          setNoticeType("error");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [uid]);

  const setStatusDuration = minutes => {
    setStatusExpire(minutes ? Date.now() + minutes * 60000 : "");
    setExpiryChoice(minutes ? String(minutes) : "never");
    setNotice("");
  };

  const save = async event => {
    event.preventDefault();
    const normalizedPhoto = photo.trim();
    const normalizedStatus = status.trim();

    if (normalizedPhoto) {
      try {
        const parsed = new URL(normalizedPhoto);
        if (parsed.protocol !== "https:") throw new Error("Invalid image URL");
      } catch {
        setNotice("Use a valid HTTPS link for your profile image.");
        setNoticeType("error");
        return;
      }
    }
    if (normalizedStatus.length > 160) {
      setNotice("Your status must be 160 characters or fewer.");
      setNoticeType("error");
      return;
    }
    const normalizedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,24}$/.test(normalizedUsername)) {
      setNotice("Username must be 3–24 letters, numbers, or underscores.");
      setNoticeType("error");
      return;
    }

    setSaving(true);
    setNotice("");
    const oldUsername = profile.username || "";
    let claimedNewUsername = false;
    let profileUpdated = false;
    try {
      if (normalizedUsername !== oldUsername) {
        const claim = await runTransaction(ref(db, `usernames/${normalizedUsername}`), current => current == null || current === uid ? uid : undefined, { applyLocally: false });
        if (!claim.committed) throw new Error("That username is already taken.");
        claimedNewUsername = true;
      }
      const updates = {
        username: normalizedUsername,
        photo: normalizedPhoto,
        status: normalizedStatus,
        statusExpire: normalizedStatus ? statusExpire : "",
        theme,
      };
      await update(ref(db, `users/${uid}`), updates);
      profileUpdated = true;
      setProfile(current => ({ ...current, ...updates }));
      setUsername(normalizedUsername);
      if (oldUsername && oldUsername !== normalizedUsername) {
        await runTransaction(ref(db, `usernames/${oldUsername}`), current => current === uid ? null : undefined).catch(() => {});
      }
      setPhoto(normalizedPhoto);
      setPhotoError(false);
      setStatus(normalizedStatus);
      setStatusExpire(updates.statusExpire);
      setNotice("Profile saved.");
      setNoticeType("success");
    } catch {
      if (claimedNewUsername && !profileUpdated) {
        await runTransaction(ref(db, `usernames/${normalizedUsername}`), current => current === uid ? null : undefined).catch(() => {});
      }
      setNotice("Couldn't save your changes. The username may already be taken.");
      setNoticeType("error");
    } finally {
      setSaving(false);
    }
  };

  const copyUID = async () => {
    try {
      await navigator.clipboard.writeText(uid);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setNotice("Clipboard access isn't available in this browser.");
      setNoticeType("error");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      setNotice("Couldn't sign out. Please try again.");
      setNoticeType("error");
    }
  };

  if (loading) return <div className="loading">Loading your profile…</div>;
  if (!uid || !profile) {
    return (
      <div className="page">
        <div className="topbar"><button className="btn" onClick={onBack}>Back</button><span>Profile</span></div>
        <main className="main"><div className="card profile-empty"><h1>Profile unavailable</h1><p>{notice || "Sign in again to view your profile."}</p><button className="btn btn-pink" onClick={logout}>Sign out</button></div></main>
      </div>
    );
  }

  const initials = (username || profile.email || "S").slice(0, 1).toUpperCase();
  const previewPhoto = photo.trim();

  return (
    <div className="page profile-page">
      <div className="topbar">
        <div className="brand-lockup"><span className="brand-glyph">s.</span><span>SCHAT<span className="brand-period">.</span></span></div>
        <button className="btn btn-pink" onClick={logout}>Sign out</button>
      </div>

      <main className="main profile-main">
        <header className="profile-heading">
          <span className="eyebrow">YOUR SPACE</span>
          <h1>Your profile<span className="brand-period">.</span></h1>
          <p>A few details to make this feel like yours.</p>
        </header>

        <form className="profile-layout" onSubmit={save}>
          <aside className="card profile-summary">
            <div className="profile-avatar-frame">
              {previewPhoto && !photoError
                ? <img className="profile-avatar-image" src={previewPhoto} alt="Profile preview" onError={() => setPhotoError(true)} />
                : <div className="profile-avatar-fallback">{initials}</div>}
            </div>
            <h2>{username || "Schat user"}</h2>
            <p className="profile-email">{profile.email || auth.currentUser?.email || "Email unavailable"}</p>
            {status.trim() && <div className="profile-status"><span className="status-dot" />{status}</div>}
            <button type="button" className="btn profile-copy" onClick={copyUID}>{copied ? "Copied ✓" : "Copy user ID"}</button>
            <div className="profile-account-meta"><span>ACCOUNT</span><strong>{auth.currentUser?.providerData?.[0]?.providerId === "google.com" ? "Google" : "Email"}</strong></div>
          </aside>

          <div className="profile-settings">
            <section className="card profile-section">
              <div className="profile-section-heading"><div><span className="eyebrow">01 / ABOUT YOU</span><h2>Profile details</h2></div><span className="profile-section-icon">✳</span></div>
              <label className="field-label" htmlFor="profile-username">Username</label>
              <input id="profile-username" className="input" autoCapitalize="none" autoCorrect="off" maxLength={24} value={username} onChange={event => { setUsername(event.target.value); setNotice(""); }} />
              <p className="field-hint">Your username must be unique. We’ll confirm availability when you save.</p>
              <label className="field-label" htmlFor="profile-status">Status</label>
              <input id="profile-status" className="input" placeholder="What are you up to?" maxLength={160} value={status} onChange={event => { setStatus(event.target.value); setNotice(""); }} />
              <div className="status-tools"><span className="field-hint">Clear it after</span><div className="choice-row">
                {[{ label: "Never", minutes: 0, id: "never" }, { label: "30 min", minutes: 30, id: "30" }, { label: "1 hour", minutes: 60, id: "60" }].map(option => <button key={option.label} type="button" className={`choice-chip ${expiryChoice === option.id ? "selected" : ""}`} onClick={() => setStatusDuration(option.minutes)}>{option.label}</button>)}
              </div></div>

              <label className="field-label" htmlFor="profile-photo">Profile image URL</label>
              <input id="profile-photo" className="input" type="url" inputMode="url" placeholder="https://…" maxLength={2048} value={photo} onChange={event => { setPhoto(event.target.value); setPhotoError(false); setNotice(""); }} />
              <p className="field-hint">Use a direct HTTPS image link. Leave it blank to use your initials.</p>
            </section>

            <section className="card profile-section">
              <div className="profile-section-heading"><div><span className="eyebrow">02 / LITTLE DETAILS</span><h2>Chat color</h2></div><span className="profile-section-icon">◒</span></div>
              <div className="theme-options" role="radiogroup" aria-label="Chat color">
                {themes.map(item => <button key={item.id} type="button" role="radio" aria-checked={theme === item.id} className={`theme-option ${theme === item.id ? "selected" : ""}`} onClick={() => setTheme(item.id)}><span className={`theme-swatch ${item.className}`} /><span>{item.label}</span>{theme === item.id && <span className="theme-check">✓</span>}</button>)}
              </div>
              <div className={`chat-preview ${theme}`}><span>you</span><span className="preview-bubble">this is your chat vibe ✨</span></div>
            </section>

            <section className="profile-account-row">
              <div><span className="eyebrow">ACCOUNT</span><p>Your email is used for sign-in.</p></div>
              <button type="button" className="btn btn-pink" onClick={logout}>Sign out</button>
            </section>

            <div className="profile-save-row">
              <div className={`save-notice ${noticeType}`} role="status">{notice}</div>
              <button className="btn btn-primary profile-save" type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
