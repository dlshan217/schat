import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { ref, get, set } from "firebase/database";
import LeftAnimation from "./LeftAnimation";
import { auth, db, provider } from "./firebase";

export default function Auth({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // EMAIL AUTH
  const submit = async () => {
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!email || !password || !username) {
          throw new Error("Fill all fields");
        }

        const nameRef = ref(db, `usernames/${username}`);
        const snap = await get(nameRef);
        if (snap.exists()) throw new Error("Username taken");

        const res = await createUserWithEmailAndPassword(auth, email, password);
        const uid = res.user.uid;

        await set(ref(db, `usernames/${username}`), uid);

        await set(ref(db, `users/${uid}`), {
          username,
          email,
          createdAt: Date.now(),
          photo: ""
        });

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
        const base =
          user.displayName?.replace(/\s+/g, "").toLowerCase() || "user";

        const username = base + Math.random().toString(36).slice(2, 6);

        await set(ref(db, `usernames/${username}`), uid);

        await set(userRef, {
          username,
          email: user.email,
          createdAt: Date.now(),
          photo: user.photoURL || ""
        });
      }

      onAuth(user);
    } catch (e) {
      setError(e.message);
    }

    setLoading(false);
  };

  return isMobile ? (

    // MOBILE
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>

      {/* BACKGROUND */}
      <div
        className="bg-yellow"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden"
        }}
      >
        <LeftAnimation />
      </div>

      {/* CONTENT */}
      <div style={{
        position: "relative",
        zIndex: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>

        <h1 style={{
          fontFamily: "Anton",
          fontSize: "110px",
          marginBottom: "20px"
        }}>
          SCHAT.
        </h1>

        <div className="card bg-white" style={{ width: "85%", maxWidth: "320px" }}>

          <h2 style={{ fontFamily: "Anton", marginBottom: "15px" }}>
            {mode === "signup" ? "CREATE" : "LOGIN"}
          </h2>

          {mode === "signup" && (
            <input
              className="input"
              placeholder="USERNAME"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ marginBottom: "10px" }}
            />
          )}

          <input
            className="input"
            placeholder="EMAIL"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ marginBottom: "10px" }}
          />

          <input
            className="input"
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ marginBottom: "12px" }}
          />

          <button
            className={`btn ${mode === "signup" ? "btn-pink" : "btn-green"}`}
            onClick={submit}
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "WAIT..." : mode === "signup" ? "CREATE" : "LOGIN"}
          </button>

          <div style={{ textAlign: "center", margin: "10px 0", fontSize: "12px", opacity: 0.6 }}>
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
          </div>

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
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>

      <div
        className="bg-yellow"
        style={{
          width: "50%",
          position: "relative",
          borderRight: "4px solid black",
          overflow: "hidden"
        }}
      >
        <LeftAnimation />

        <h1
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontFamily: "Anton",
            fontSize: "80px",
            zIndex: 2
          }}
        >
          SCHAT.
        </h1>
      </div>

      <div
        style={{
          width: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#eaeaea"
        }}
      >
        <div className="card bg-white" style={{ width: "300px" }}>

          <h2 style={{ fontFamily: "Anton", marginBottom: "15px" }}>
            {mode === "signup" ? "CREATE" : "LOGIN"}
          </h2>

          {mode === "signup" && (
            <input
              className="input"
              placeholder="USERNAME"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ marginBottom: "10px" }}
            />
          )}

          <input
            className="input"
            placeholder="EMAIL"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ marginBottom: "10px" }}
          />

          <input
            className="input"
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ marginBottom: "12px" }}
          />

          <button
            className={`btn ${mode === "signup" ? "btn-pink" : "btn-green"}`}
            onClick={submit}
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "WAIT..." : mode === "signup" ? "CREATE" : "LOGIN"}
          </button>

          <div style={{ textAlign: "center", margin: "10px 0", fontSize: "12px", opacity: 0.6 }}>
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
          </div>

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