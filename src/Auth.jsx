import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { auth, db } from "./firebase";

export default function Auth({ onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        if (snap.exists()) {
          throw new Error("Username already taken");
        }

        const res = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

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
        if (!email || !password) {
          throw new Error("Fill all fields");
        }

        const res = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        onAuth(res.user);
      }
    } catch (e) {
      setError(e.message);
    }

    setLoading(false);
  };

  return (
<div className="auth-page">

  <div className="auth-hero">

    <h1>SCHAT</h1>
    <p>Meet strangers instantly.</p>

  </div>


  <div className="auth-card">

    <h2>
      {mode === "signup" ? "CREATE ACCOUNT" : "LOGIN"}
    </h2>

    {mode === "signup" && (
      <input
        className="auth-input"
        placeholder="USERNAME"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
    )}

    <input
      className="auth-input"
      placeholder="EMAIL"
      value={email}
      onChange={e => setEmail(e.target.value)}
    />

    <input
      className="auth-input"
      type="password"
      placeholder="PASSWORD"
      value={password}
      onChange={e => setPassword(e.target.value)}
    />

    <button
      className="auth-submit"
      onClick={submit}
      disabled={loading}
    >
      {loading
        ? "PLEASE WAIT..."
        : mode === "signup"
        ? "CREATE ACCOUNT"
        : "LOGIN"}
    </button>

    <div
      className="auth-switch"
      onClick={() =>
        setMode(mode === "signup" ? "login" : "signup")
      }
    >
      {mode === "signup"
        ? "Already have an account?"
        : "Create new account"}
    </div>

    {error && (
      <div className="auth-error">
        {error}
      </div>
    )}

  </div>

</div>
)
}