import { useEffect, useState } from "react";
import { ref, onValue, get } from "firebase/database";
import { db } from "./firebase";

export default function Inbox({ user, openChat, onBack }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const userChatsRef = ref(db, `userChats/${user.uid}`);

    return onValue(userChatsRef, async snap => {
      const data = snap.val() || {};
      const chatIds = Object.keys(data);

      const results = [];

      for (let chatId of chatIds) {
        const chatSnap = await get(ref(db, `privateChats/${chatId}`));
        if (!chatSnap.exists()) continue;

        const chat = chatSnap.val();
        const otherUid = Object.keys(chat.users).find(
          id => id !== user.uid
        );

        const userSnap = await get(ref(db, `users/${otherUid}`));
        const username = userSnap.val()?.username || "Unknown";

        results.push({
          chatId,
          username
        });
      }

      setChats(results);
    });
  }, [user.uid]);

  return (
    <div className="inbox">
      {/* HEADER */}
      <div style={{ padding: "10px" }}>
        <button onClick={onBack}>← Back</button>
      </div>

      <h2>Inbox</h2>

      {chats.length === 0 && (
        <p style={{ opacity: 0.6 }}>No chats yet</p>
      )}

      {chats.map(chat => (
        <div
          key={chat.chatId}
          className="inbox-item"
          onClick={() => openChat(chat.chatId)}
          style={{
            padding: 12,
            borderBottom: "1px solid #333",
            cursor: "pointer"
          }}
        >
          {chat.username}
        </div>
      ))}
    </div>
  );
}
