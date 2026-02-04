import { useEffect, useRef, useState } from "react";
import { signInAnonymously } from "firebase/auth";
import {
  ref,
  set,
  push,
  get,
  onValue,
  remove,
  onDisconnect
} from "firebase/database";
import { auth, db } from "./firebase";
import "./App.css";

export default function App() {
  const [uid, setUid] = useState(null);
  const [roomId, setRoomId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [onlineCount, setOnlineCount] = useState(0);

  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);

  const [systemMsg, setSystemMsg] = useState("");

  const typingTimeout = useRef(null);

  /* =========================
     1️⃣ AUTH
  ========================= */
  useEffect(() => {
    signInAnonymously(auth).then(res => {
      setUid(res.user.uid);
    });
  }, []);

  /* =========================
     2️⃣ PRESENCE
  ========================= */
  useEffect(() => {
    if (!uid) return;

    const onlineRef = ref(db, `online/${uid}`);
    const connectedRef = ref(db, ".info/connected");

    onValue(connectedRef, snap => {
      if (snap.val()) {
        set(onlineRef, true);
        onDisconnect(onlineRef).remove();
      }
    });
  }, [uid]);

  /* =========================
     3️⃣ ONLINE COUNT
  ========================= */
  useEffect(() => {
    const onlineRef = ref(db, "online");
    onValue(onlineRef, snap => {
      setOnlineCount(Object.keys(snap.val() || {}).length);
    });
  }, []);

  /* =========================
     4️⃣ MATCH LISTENER
  ========================= */
  useEffect(() => {
    if (!uid) return;

    const matchRef = ref(db, `matches/${uid}`);
    onValue(matchRef, snap => {
      const data = snap.val();
      if (data?.roomId) {
        setRoomId(data.roomId);
        setSystemMsg("");
        remove(matchRef);
      }
    });
  }, [uid]);

  /* =========================
     5️⃣ FIND STRANGER
  ========================= */
  const findStranger = async () => {
    setMessages([]);
    setSystemMsg("");

    const queueRef = ref(db, "queue");
    const snap = await get(queueRef);
    const queue = snap.val() || {};

    const otherUid = Object.keys(queue).find(id => id !== uid);

    if (otherUid) {
      const newRoom = "room_" + Date.now();

      await set(ref(db, `rooms/${newRoom}`), {
        users: { [uid]: true, [otherUid]: true }
      });

      await set(ref(db, `matches/${uid}`), { roomId: newRoom });
      await set(ref(db, `matches/${otherUid}`), { roomId: newRoom });

      await remove(ref(db, `queue/${otherUid}`));
    } else {
      await set(ref(db, `queue/${uid}`), true);
    }
  };

  /* =========================
     6️⃣ ROOM LISTENER
  ========================= */
  useEffect(() => {
    if (!roomId) return;

    const roomRef = ref(db, `rooms/${roomId}`);

    onValue(roomRef, snap => {
      const data = snap.val();

      if (!data) {
        setSystemMsg("Stranger left the chat");
        setRoomId(null);
        return;
      }

      setMessages(data.messages ? Object.values(data.messages) : []);
    });

    // cleanup typing on disconnect
    onDisconnect(ref(db, `rooms/${roomId}/typing/${uid}`)).set(false);
  }, [roomId]);

  /* =========================
     7️⃣ SEND MESSAGE
  ========================= */
  const sendMessage = () => {
    if (!text || !roomId) return;

    push(ref(db, `rooms/${roomId}/messages`), {
      text,
      sender: uid
    });

    setText("");
    setTyping(false);
  };

  /* =========================
     8️⃣ TYPING LOGIC
  ========================= */
  useEffect(() => {
    if (!roomId || !uid) return;

    const typingRef = ref(db, `rooms/${roomId}/typing/${uid}`);
    set(typingRef, typing);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      set(typingRef, false);
      setTyping(false);
    }, 1200);
  }, [typing]);

  useEffect(() => {
    if (!roomId || !uid) return;

    const typingRef = ref(db, `rooms/${roomId}/typing`);

    onValue(typingRef, snap => {
      const data = snap.val() || {};
      const other = Object.keys(data).find(id => id !== uid);
      setOtherTyping(other ? data[other] : false);
    });
  }, [roomId]);

  /* =========================
     9️⃣ SKIP / END CHAT
  ========================= */
  const skip = async () => {
    if (roomId) {
      await set(ref(db, `rooms/${roomId}/ended`), true);
      await remove(ref(db, `rooms/${roomId}`));
    }
    setRoomId(null);
    findStranger();
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="app">
      <div className="header">
       {onlineCount} online
      </div>

          <div className="viewport">
  <div className="app">
    {/* existing app UI */}
  </div>
</div>


      {!roomId && (
        <div className="center">
          <button onClick={findStranger}>Find someone</button>
          {systemMsg && <p>{systemMsg}</p>}
        </div>
      )}

      {roomId && (
        <>
          <div className="chat">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`message ${m.sender === uid ? "me" : "them"}`}
              >
                {m.text}
              </div>
            ))}
          </div>

          {otherTyping && (
            <div style={{ padding: "4px 12px", fontSize: 12, opacity: 0.7 }}>
              Stranger is typing…
            </div>
          )}

          <div className="footer">
            <input
              value={text}
              onChange={e => {
                setText(e.target.value);
                setTyping(true);
              }}
              placeholder="Type…"
              onKeyDown={e => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
            <button className="secondary" onClick={skip}>
              Next
            </button>
            
          </div>
<section>
  <div>
    <p className="disclaimer">
      <b>Disclaimer</b><br />
      This thing is built for fun, learning, and curiosity.<br />
      Please don’t be weird. <span>Be human.</span>
    </p>
  </div>
  <p className="disclaimer">@dlshan</p>
</section>


        </>
      )}
      
    </div>
      );
}

