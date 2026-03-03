import { useEffect, useState } from "react";
<<<<<<< HEAD
import { ref, onValue, get } from "firebase/database";
=======
import { ref, onValue, get, remove, update } from "firebase/database";
>>>>>>> 71c2677 (Update)
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

<<<<<<< HEAD
        results.push({
          chatId,
          username
        });
      }

=======
        // LAST MESSAGE
        let lastMessage = "No messages";
        let timestamp = "";
        let unread = 0;

        if (chat.messages) {
          const msgs = Object.values(chat.messages);
          const sorted = msgs.sort((a, b) => b.ts - a.ts);
          const latest = sorted[0];

          lastMessage = latest.text;
          timestamp = new Date(latest.ts).toLocaleString();

          unread = msgs.filter(
            m => m.sender !== user.uid && !m.readBy?.[user.uid]
          ).length;
        }

        results.push({
          chatId,
          username,
          lastMessage,
          timestamp,
          unread
        });
      }

      // sort by latest timestamp
      results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

>>>>>>> 71c2677 (Update)
      setChats(results);
    });
  }, [user.uid]);

<<<<<<< HEAD
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
=======
  const deleteChat = async chatId => {
    await remove(ref(db, `privateChats/${chatId}`));
    await remove(ref(db, `userChats/${user.uid}/${chatId}`));
  };

  return (
    <div className="app">
      <div className="header">
        <span>INBOX</span>
        <button onClick={onBack}>BACK</button>
      </div>

      <div className="inbox-list">

        {chats.length === 0 && (
          <div className="empty-state">
            NO CHATS YET
          </div>
        )}

        {chats.map(chat => (
          <div
            key={chat.chatId}
            className="inbox-item"
            onClick={() => openChat(chat.chatId)}
          >
            <div className="inbox-top">
              <span className="username">
                {chat.username}
              </span>

              {chat.unread > 0 && (
                <span className="badge">
                  {chat.unread}
                </span>
              )}
            </div>

            <div className="last-message">
              {chat.lastMessage}
            </div>

            <div className="timestamp">
              {chat.timestamp}
            </div>

            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                deleteChat(chat.chatId);
              }}
            >
              DELETE
            </button>
          </div>
        ))}

      </div>
    </div>
  );
}
>>>>>>> 71c2677 (Update)
