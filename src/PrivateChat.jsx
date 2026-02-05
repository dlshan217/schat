import { useEffect, useState } from "react";
import { ref, push, onValue, get } from "firebase/database";
import { db } from "./firebase";

export default function PrivateChat({ user, chatId, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [otherUser, setOtherUser] = useState(null);

  // Load messages
  useEffect(() => {
    const msgRef = ref(db, `privateChats/${chatId}/messages`);
    return onValue(msgRef, snap => {
      const data = snap.val() || {};
      setMessages(Object.values(data));
    });
  }, [chatId]);

  // Load other user's profile
  useEffect(() => {
    const loadProfile = async () => {
      const chatSnap = await get(ref(db, `privateChats/${chatId}`));
      if (!chatSnap.exists()) return;

      const users = Object.keys(chatSnap.val().users);
      const otherUid = users.find(id => id !== user.uid);

      const userSnap = await get(ref(db, `users/${otherUid}`));
      setOtherUser(userSnap.val());
    };

    loadProfile();
  }, [chatId, user.uid]);

  const send = () => {
    if (!text.trim()) return;

    push(ref(db, `privateChats/${chatId}/messages`), {
      text,
      sender: user.uid,
      ts: Date.now()
    });

    setText("");
  };

  return (
    <div className="private-chat">
      {/* HEADER */}
      <div className="header" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onBack}>← Back</button>

        {otherUser && (
          <>
            {otherUser.photo && (
              <img
                src={otherUser.photo}
                alt=""
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%"
                }}
              />
            )}
            <b>{otherUser.username}</b>
          </>
        )}
      </div>

      {/* MESSAGES */}
      <div className="chat">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`message ${
              m.sender === user.uid ? "me" : "them"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="footer">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Message…"
          onKeyDown={e => e.key === "Enter" && send()}
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
