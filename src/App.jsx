import { useEffect, useState } from "react";
import { signInAnonymously } from "firebase/auth";
import { auth, db } from "./firebase";
import {
  ref,
  set,
  push,
  get,
  onValue,
  remove
} from "firebase/database";

export default function App() {
  const [uid, setUid] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  // 1️⃣ Login
  useEffect(() => {
    signInAnonymously(auth).then(res => {
      setUid(res.user.uid);
    });
  }, []);

  // 2️⃣ Listen for match assignment
  useEffect(() => {
    if (!uid) return;

    const matchRef = ref(db, `matches/${uid}`);

    onValue(matchRef, snap => {
      const data = snap.val();
      if (data?.roomId) {
        setRoomId(data.roomId);
        remove(matchRef); // cleanup
      }
    });
  }, [uid]);

  // 3️⃣ Find stranger
  const findStranger = async () => {
    setMessages([]);
    setIsPrivate(false);

    const queueRef = ref(db, "queue");
    const snap = await get(queueRef);
    const queue = snap.val() || {};

    const otherUid = Object.keys(queue).find(id => id !== uid);

    if (otherUid) {
      const newRoom = "room_" + Date.now();

      // Create room
      await set(ref(db, `rooms/${newRoom}`), {
        users: {
          [uid]: true,
          [otherUid]: true
        },
        private: false
      });

      // Assign match to BOTH users
      await set(ref(db, `matches/${uid}`), { roomId: newRoom });
      await set(ref(db, `matches/${otherUid}`), { roomId: newRoom });

      // Remove other user from queue
      await remove(ref(db, `queue/${otherUid}`));
    } else {
      await set(ref(db, `queue/${uid}`), true);
    }
  };

  // 4️⃣ Listen to room messages
  useEffect(() => {
    if (!roomId) return;

    const roomRef = ref(db, `rooms/${roomId}`);

    onValue(roomRef, snap => {
      const data = snap.val();
      if (!data) return;

      setIsPrivate(data.private || false);
      setMessages(data.messages ? Object.values(data.messages) : []);
    });
  }, [roomId]);

  // 5️⃣ Send message
  const sendMessage = () => {
    if (!text || !roomId) return;

    push(ref(db, `rooms/${roomId}/messages`), {
      text,
      sender: uid
    });

    setText("");
  };

  // 6️⃣ Skip
  const skip = async () => {
    if (roomId && !isPrivate) {
      await remove(ref(db, `rooms/${roomId}`));
    }
    setRoomId(null);
    findStranger();
  };

  // 7️⃣ Reveal ID
  const revealId = async () => {
    if (!roomId) return;

    await set(ref(db, `rooms/${roomId}/reveal/${uid}`), true);

    const snap = await get(ref(db, `rooms/${roomId}/reveal`));
    if (Object.keys(snap.val() || {}).length === 2) {
      await set(ref(db, `rooms/${roomId}/private`), true);
    }
  };

  return (
    <div style={{ width: 420, margin: "20px auto" }}>
      <h2>{isPrivate ? "Private Chat " : "schaat"}</h2>

      {!roomId && <button onClick={findStranger}>Find Someone</button>}

      <div style={{
        border: "1px solid #ccc",
        height: 300,
        padding: 10,
        marginTop: 10,
        overflowY: "auto"
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.sender === uid ? "right" : "left" }}>
            <span style={{
              background: m.sender === uid ? "#dcf8c6" : "#eee",
              padding: "6px 10px",
              borderRadius: 8,
              display: "inline-block",
              marginBottom: 4
            }}>
              {m.text}
            </span>
          </div>
        ))}
      </div>

      {roomId && (
        <>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type..."
            style={{ width: "70%" }}
          />
          <button onClick={sendMessage}>Send</button>

          {!isPrivate && (
            <>
              <button onClick={skip}>Nxt</button>
            </>
          )}

          {isPrivate && <p>Your ID: <b>{uid}</b></p>}
        </>
      )}
    </div>
  );
}
