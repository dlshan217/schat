import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import "./App.css";


import Auth from "./Auth";
import Chat from "./Chat";
import Inbox from "./Inbox";
import PrivateChat from "./PrivateChat";
import Profile from "./Profile";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // pages: home | chat | inbox | dm | profile
  const [page, setPage] = useState("home");
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div>Loading…</div>;

  // NOT LOGGED IN → AUTH SCREEN
  if (!user) {
    return <Auth onAuth={setUser} />;
  }

  // STRANGER CHAT
  if (page === "chat") {
    return (
      <Chat
        user={user}
        onExit={() => setPage("home")}
      />
    );
  }

  // INBOX
  if (page === "inbox") {
  return (
    <Inbox
      user={user}
      onBack={() => setPage("home")}
      openChat={chatId => {
        setActiveChat(chatId);
        setPage("dm");
      }}
    />
  );
}


  // PRIVATE CHAT (DM)
  if (page === "dm") {
    return (
      <PrivateChat
        user={user}
        chatId={activeChat}
        onBack={() => setPage("inbox")}
      />
    );
  }

  // PROFILE
  if (page === "profile") {
    return <Profile onBack={() => setPage("home")} />;
  }

// HOME (DESKTOP ONLY)
return (
  <div className="app">
    <div className="home-card">
      <h2>Welcome</h2>
      <p className="home-sub">
        Start a new conversation or continue one
      </p>

      <div
        className="action-card primary"
        onClick={() => setPage("chat")}
      >
        <h3>Stranger Chat</h3>
        <p>Talk to someone new</p>
      </div>

      <div className="action-row">
        <div
          className="action-card"
          onClick={() => setPage("inbox")}
        >
          <h3>Inbox</h3>
          <p>Your private chats</p>
        </div>

        <div
          className="action-card"
          onClick={() => setPage("profile")}
        >
          <h3>Profile</h3>
          <p>Edit your identity</p>
        </div>
      </div>
  

      {/* MOBILE BOTTOM NAV */}
<div className="bottom-nav">
  <button onClick={() => setPage("chat")}>Chat</button>
  <button onClick={() => setPage("inbox")}>Inbox</button>
  <button onClick={() => setPage("profile")}>Profile</button>
</div>

    </div>
  </div>
);

}
