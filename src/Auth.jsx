import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { ref, get, runTransaction, set } from "firebase/database";
import LeftAnimation from "./LeftAnimation";
import { auth, db, provider } from "./firebase";

export default function Auth({ onAuth, authenticatedUser = null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [googleUser, setGoogleUser] = useState(authenticatedUser);
  const [usernameAvailability, setUsernameAvailability] = useState("idle");

  const claimUsername = async (candidate, uid) => {
    const result = await runTransaction(
      ref(db, `usernames/${candidate}`),
      current => current == null || current === uid ? uid : undefined,
      { applyLocally: false }
    );
    return result.committed;
  };

  const releaseUsername = async (candidate, uid) => {
    if (!candidate) return;
    await runTransaction(ref(db, `usernames/${candidate}`), current => current === uid ? null : undefined);
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!authenticatedUser) return;
    setGoogleUser(authenticatedUser);
    setMode("google-username");
    const suggestion = (authenticatedUser.displayName || "user").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24);
    setUsername(suggestion.length >= 3 ? suggestion : "user");
  }, [authenticatedUser?.uid]);

  useEffect(() => {
    const candidate = username.trim().toLowerCase();
    if (mode !== "google-username" || !googleUser) {
      setUsernameAvailability("idle");
      return;
    }
    if (!/^[a-z0-9_]{3,24}$/.test(candidate)) {
      setUsernameAvailability(candidate ? "invalid" : "idle");
      return;
    }
    let current = true;
    setUsernameAvailability("checking");
    const timer = window.setTimeout(async () => {
      try {
        const snapshot = await get(ref(db, `usernames/${candidate}`));
        if (current) setUsernameAvailability(!snapshot.exists() || snapshot.val() === googleUser.uid ? "available" : "taken");
      } catch {
        if (current) setUsernameAvailability("unavailable");
      }
    }, 250);
    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [mode, username, googleUser?.uid]);

  // EMAIL AUTH
  const submit = async () => {
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!email || !password || !username) {
          throw new Error("Fill all fields");
        }

        const normalizedUsername = username.trim().toLowerCase();
        if (!/^[a-z0-9_]{3,24}$/.test(normalizedUsername)) {
          throw new Error("Username must be 3–24 characters: letters, numbers, or underscores");
        }
        if (password.length < 8) throw new Error("Password must be at least 8 characters");

        const res = await createUserWithEmailAndPassword(auth, email, password);
        const uid = res.user.uid;
        let claimed;
        try {
          claimed = await claimUsername(normalizedUsername, uid);
        } catch (e) {
          await res.user.delete();
          throw e;
        }
        if (!claimed) {
          await res.user.delete();
          throw new Error("Username taken");
        }

        try {
          await set(ref(db, `users/${uid}`), {
            username: normalizedUsername,
            email,
            createdAt: Date.now(),
            photo: ""
          });
        } catch (e) {
          await runTransaction(ref(db, `usernames/${normalizedUsername}`), current => current === uid ? null : undefined);
          await res.user.delete();
          throw e;
        }

        onAuth(res.user);
      } else {
        if (!email || !password) throw new Error("Fill all fields");

        const res = await signInWithEmailAndPassword(auth, email, password);
        onAuth(res.user);
      }
    } catch (e) {
      setError(e.message);
    }

    setLoading(false);
  };

  // GOOGLE AUTH
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await signInWithPopup(auth, provider);
      const user = res.user;
      const uid = user.uid;

      const userRef = ref(db, `users/${uid}`);
      const snap = await get(userRef);
      if (!snap.exists()) {
        const suggestion = (user.displayName || "user").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24);
        setGoogleUser(user);
        setUsername(suggestion.length >= 3 ? suggestion : "user");
        setMode("google-username");
        setLoading(false);
        return;
      }

      onAuth(user);
    } catch (e) {
      setError(e.message);
    }

    setLoading(false);
  };

  const completeGoogleSignup = async () => {
    const candidate = username.trim().toLowerCase();
    if (!googleUser) return;
    if (!/^[a-z0-9_]{3,24}$/.test(candidate)) {
      setUsernameAvailability("invalid");
      setError("Use 3–24 letters, numbers, or underscores for your username.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const claimed = await claimUsername(candidate, googleUser.uid);
      if (!claimed) {
        setUsernameAvailability("taken");
        throw new Error("That username is already taken. Try another one.");
      }
      try {
        await set(ref(db, `users/${googleUser.uid}`), {
          username: candidate,
          email: googleUser.email,
          createdAt: Date.now(),
          photo: googleUser.photoURL || ""
        });
      } catch (e) {
        await releaseUsername(candidate, googleUser.uid);
        throw e;
      }
      onAuth(googleUser);
    } catch (e) {
      setError(e.message || "Could not create your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleSetup = mode === "google-username";
  const usernameField = (mode === "signup" || googleSetup) && (
    <div className="auth-username-field">
      <label className="field-label" htmlFor="auth-username">Username</label>
      <input
        id="auth-username"
        className="input"
        placeholder="e.g. dlshan"
        maxLength={24}
        autoCapitalize="none"
        autoCorrect="off"
        value={username}
        onChange={event => { setUsername(event.target.value); setError(""); }}
      />
      {googleSetup && usernameAvailability !== "idle" && (
        <p className={`username-feedback ${usernameAvailability}`} role="status">
          {{ checking: "Checking with Firebase…", available: "Username available", taken: "Already taken — try another", invalid: "Use 3–24 letters, numbers, or underscores", unavailable: "Couldn't check availability. Check your database rules." }[usernameAvailability]}
        </p>
      )}
    </div>
  );

  const googlePrompt = googleSetup && (
    <div className="google-account-note">
      <span className="google-mark">G</span>
      <span>Signed in with Google as <strong>{googleUser?.email || googleUser?.displayName}</strong></span>
    </div>
  );

  return isMobile ? (

    // MOBILE
    <div className="auth-screen auth-mobile">

      {/* BACKGROUND */}
      <div
        className="auth-backdrop"
      >
        <LeftAnimation />
      </div>

      {/* CONTENT */}
      <div className="auth-content">

        <h1 className="auth-wordmark">s<span>.</span>chat</h1>

        <div className="card auth-card">

          <h2 style={{ fontFamily: "Space Grotesk", marginBottom: "15px" }}>
            {googleSetup ? "CHOOSE A USERNAME" : mode === "signup" ? "CREATE ACCOUNT" : "WELCOME BACK"}
          </h2>

          {googlePrompt}
          {usernameField}

          {!googleSetup && <input
            className="input"
            placeholder="EMAIL"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ marginBottom: "10px" }}
          />}

          {!googleSetup && <input
            className="input"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder="PASSWORD"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ marginBottom: "12px" }}
          />}

          <button
            className={`btn ${mode === "signup" ? "btn-pink" : "btn-green"}`}
            onClick={googleSetup ? completeGoogleSignup : submit}
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "PLEASE WAIT…" : googleSetup ? "CREATE ACCOUNT" : mode === "signup" ? "CREATE ACCOUNT" : "SIGN IN"}
          </button>

          {!googleSetup && <><div style={{ textAlign: "center", margin: "10px 0", fontSize: "12px", opacity: 0.6 }}>
            OR
          </div>

          <button
            className="btn"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{ width: "100%" }}
          >
            Continue with Google
          </button>

          <div
            style={{
              marginTop: "12px",
              fontSize: "13px",
              cursor: "pointer",
              textDecoration: "underline"
            }}
            onClick={() =>
              setMode(mode === "signup" ? "login" : "signup")
            }
          >
            {mode === "signup"
              ? "Already have an account?"
              : "Create new account"}
          </div></>}

          {error && (
            <div className="card bg-pink" style={{ marginTop: "10px" }}>
              {error}
            </div>
          )}

        </div>

      </div>

    </div>

  ) : (

    // DESKTOP
    <div className="auth-screen auth-desktop">

      <div
        className="auth-art"
      >
        <LeftAnimation />

        <div className="auth-art-copy"><span className="brand-glyph">s.</span><h1>Good chats.<br/><span>Good plot.</span></h1><p>A small place to meet people without the whole social media thing.</p></div>
      </div>

      <div
        className="auth-panel"
      >
        <div className="card auth-card">

          <h2 style={{ fontFamily: "Space Grotesk", marginBottom: "15px" }}>
            {googleSetup ? "CHOOSE A USERNAME" : mode === "signup" ? "CREATE ACCOUNT" : "WELCOME BACK"}
          </h2>

          {googlePrompt}
          {usernameField}

          {!googleSetup && <input
            className="input"
            placeholder="EMAIL"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ marginBottom: "10px" }}
          />}

          {!googleSetup && <input
            className="input"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            placeholder="PASSWORD"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ marginBottom: "12px" }}
          />}

          <button
            className={`btn ${mode === "signup" ? "btn-pink" : "btn-green"}`}
            onClick={googleSetup ? completeGoogleSignup : submit}
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "PLEASE WAIT…" : googleSetup ? "CREATE ACCOUNT" : mode === "signup" ? "CREATE ACCOUNT" : "SIGN IN"}
          </button>

          {!googleSetup && <><div style={{ textAlign: "center", margin: "10px 0", fontSize: "12px", opacity: 0.6 }}>
            OR
          </div>

          <button
            className="btn"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{ width: "100%" }}
          >
            Continue with Google
          </button>

          <div
            style={{
              marginTop: "12px",
              fontSize: "13px",
              cursor: "pointer",
              textDecoration: "underline"
            }}
            onClick={() =>
              setMode(mode === "signup" ? "login" : "signup")
            }
          >
            {mode === "signup"
              ? "Already have an account?"
              : "Create new account"}
          </div></>}

          {error && (
            <div className="card bg-pink" style={{ marginTop: "10px" }}>
              {error}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
