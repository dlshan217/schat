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

        // Check username uniqueness
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
          photo: "" // profile image later
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
    <div className="auth">
      <h2>{mode === "signup" ? "Sign Up" : "Login"}</h2>

      {mode === "signup" && (
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      )}

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={submit} disabled={loading}>
        {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Login"}
      </button>

      <p onClick={() => setMode(mode === "signup" ? "login" : "signup")}>
        {mode === "signup"
          ? "Already have an account?"
          : "Create new account"}
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
