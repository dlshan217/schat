import { useEffect, useRef, useState } from "react";

import {
  ref,
  set,
  push,
  get,
  onValue,
  remove,
  onDisconnect
} from "firebase/database";
import { db } from "./firebase";

export default function Chat({ user, onExit }) {
  const uid = user.uid;

  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);

  const [typing, setTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);

  const [systemMsg, setSystemMsg] = useState("");

  // Reveal ID states
  const [revealRequested, setRevealRequested] = useState(false);
  const [incomingReveal, setIncomingReveal] = useState(false);

  const typingTimeout = useRef(null);

  /* =========================
     PRESENCE
  ========================= */
  useEffect(() => {
    const onlineRef = ref(db, `online/${uid}`);
    const connectedRef = ref(db, ".info/connected");

    const unsub = onValue(connectedRef, snap => {
      if (snap.val()) {
        set(onlineRef, true);
        onDisconnect(onlineRef).remove();
      }
    });

    return () => unsub();
  }, [uid]);

  /* =========================
     ONLINE COUNT
  ========================= */
  useEffect(() => {
    const onlineRef = ref(db, "online");
    return onValue(onlineRef, snap => {
      setOnlineCount(Object.keys(snap.val() || {}).length);
    });
  }, []);

  /* =========================
     MATCH LISTENER
  ========================= */
  useEffect(() => {
    const matchRef = ref(db, `matches/${uid}`);
    return onValue(matchRef, snap => {
      const data = snap.val();
      if (data?.roomId) {
        setRoomId(data.roomId);
        setSystemMsg("");
        setRevealRequested(false);
        setIncomingReveal(false);
        remove(matchRef);
      }
    });
  }, [uid]);

  /* =========================
     FIND STRANGER
  ========================= */
  const findStranger = async () => {
  setMessages([]);
  setSystemMsg("");

  // Get users I already have private chats with
  const myChatsSnap = await get(ref(db, `userChats/${uid}`));
  const myChats = myChatsSnap.val() || {};

  const blockedUsers = new Set();

  for (let chatId of Object.keys(myChats)) {
    const chatSnap = await get(ref(db, `privateChats/${chatId}`));
    if (!chatSnap.exists()) continue;

    const users = Object.keys(chatSnap.val().users);
    users.forEach(u => blockedUsers.add(u));
  }

  // Get queue
  const queueRef = ref(db, "queue");
  const snap = await get(queueRef);
  const queue = snap.val() || {};

  // Find a stranger I have NOT connected with
  const matchUid = Object.keys(queue).find(
    id => id !== uid && !blockedUsers.has(id)
  );

  if (matchUid) {
    const newRoom = "room_" + Date.now();

    await set(ref(db, `rooms/${newRoom}`), {
      users: { [uid]: true, [matchUid]: true }
    });

    await set(ref(db, `matches/${uid}`), { roomId: newRoom });
    await set(ref(db, `matches/${matchUid}`), { roomId: newRoom });

    await remove(ref(db, `queue/${matchUid}`));
  } else {
    await set(ref(db, `queue/${uid}`), true);
  }
};

  /* =========================
     ROOM LISTENER
  ========================= */
  useEffect(() => {
    if (!roomId) return;

    const roomRef = ref(db, `rooms/${roomId}`);

    const unsub = onValue(roomRef, snap => {
      const data = snap.val();

      if (!data) {
        setSystemMsg("Stranger left the chat");
        setRoomId(null);
        return;
      }

      setMessages(data.messages ? Object.values(data.messages) : []);
    });

    onDisconnect(ref(db, `rooms/${roomId}/typing/${uid}`)).set(false);

    return () => unsub();
  }, [roomId, uid]);

  /* =========================
     SEND MESSAGE
  ========================= */
  const sendMessage = () => {
    if (!text || !roomId) return;

    push(ref(db, `rooms/${roomId}/messages`), {
      text,
      sender: uid,
      ts: Date.now()
    });

    setText("");
    setTyping(false);
  };

  /* =========================
     TYPING LOGIC
  ========================= */
  useEffect(() => {
    if (!roomId) return;

    const typingRef = ref(db, `rooms/${roomId}/typing/${uid}`);
    set(typingRef, typing);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      set(typingRef, false);
      setTyping(false);
    }, 1200);
  }, [typing, roomId, uid]);

  useEffect(() => {
    if (!roomId) return;

    const typingRef = ref(db, `rooms/${roomId}/typing`);
    return onValue(typingRef, snap => {
      const data = snap.val() || {};
      const other = Object.keys(data).find(id => id !== uid);
      setOtherTyping(other ? data[other] : false);
    });
  }, [roomId, uid]);

  /* =========================
     REVEAL ID LISTENER
  ========================= */
  useEffect(() => {
    if (!roomId) return;

    const revealRef = ref(db, `rooms/${roomId}/revealRequest`);

    return onValue(revealRef, snap => {
      const data = snap.val() || {};
      const other = Object.keys(data).find(id => id !== uid);
      setIncomingReveal(!!other);
    });
  }, [roomId, uid]);

  /* =========================
     REVEAL ACTIONS
  ========================= */
  const requestReveal = async () => {
    await set(ref(db, `rooms/${roomId}/revealRequest/${uid}`), true);
    setRevealRequested(true);
  };

  const acceptReveal = async () => {
    const roomRef = ref(db, `rooms/${roomId}`);
    const snap = await get(roomRef);
    const users = Object.keys(snap.val().users);

    const [u1, u2] = users;
    const sorted = [u1, u2].sort();
const chatId = `chat_${sorted[0]}_${sorted[1]}`;

const chatRef = ref(db, `privateChats/${chatId}`);
const chatSnap = await get(chatRef);

if (!chatSnap.exists()) {
  await set(chatRef, {
    users: { [u1]: true, [u2]: true },
    createdAt: Date.now()
  });

  await set(ref(db, `userChats/${u1}/${chatId}`), true);
  await set(ref(db, `userChats/${u2}/${chatId}`), true);
}
// else → chat already exists, DO NOTHING


    await set(ref(db, `userChats/${u1}/${chatId}`), true);
    await set(ref(db, `userChats/${u2}/${chatId}`), true);

    await remove(roomRef);

    onExit(); // go back to home (Inbox will show chat)
  };

  /* =========================
     SKIP / NEXT
  ========================= */
  const skip = async () => {
    if (roomId) {
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
        <button onClick={onExit} style={{ float: "right" }}>
          Exit
        </button>
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

          {/* Reveal ID UI */}
          <div style={{ padding: 10, textAlign: "center" }}>
            {!revealRequested && (
              <button onClick={requestReveal}>
                Reveal my ID
              </button>
            )}

            {revealRequested && (
              <p style={{ opacity: 0.6 }}>
                Reveal request sent
              </p>
            )}

            {incomingReveal && (
              <div>
                <p>Stranger wants to reveal their ID</p>
                <button onClick={acceptReveal}>
                  Accept
                </button>
              </div>
            )}
          </div>

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
        </>
      )}
    </div>
  );
}
