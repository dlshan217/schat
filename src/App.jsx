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

  // HOME
  return (
    <div className="home">
      <h2>Home</h2>

      <button onClick={() => setPage("chat")}>
        Stranger Chat
      </button>

      <button onClick={() => setPage("inbox")}>
        Inbox
      </button>

      <button onClick={() => setPage("profile")}>
        Profile
      </button>

      <button onClick={() => signOut(auth)}>
        Logout
      </button>
    </div>
  );
}
