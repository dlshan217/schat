import { useEffect, useState } from "react";
<<<<<<< HEAD
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import "./App.css";


=======
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "./App.css";

>>>>>>> 71c2677 (Update)
import Auth from "./Auth";
import Chat from "./Chat";
import Inbox from "./Inbox";
import PrivateChat from "./PrivateChat";
import Profile from "./Profile";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

<<<<<<< HEAD
  // pages: home | chat | inbox | dm | profile
=======
>>>>>>> 71c2677 (Update)
  const [page, setPage] = useState("home");
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

<<<<<<< HEAD
  if (loading) return <div>Loading…</div>;

  // NOT LOGGED IN → AUTH SCREEN
=======
  if (loading) return <div>Loading...</div>;

>>>>>>> 71c2677 (Update)
  if (!user) {
    return <Auth onAuth={setUser} />;
  }

<<<<<<< HEAD
  // STRANGER CHAT
=======
  /* ================= CHAT PAGE ================= */

>>>>>>> 71c2677 (Update)
  if (page === "chat") {
    return (
      <Chat
        user={user}
        onExit={() => setPage("home")}
<<<<<<< HEAD
=======
        goToInbox={() => setPage("inbox")}
>>>>>>> 71c2677 (Update)
      />
    );
  }

<<<<<<< HEAD
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
=======
  /* ================= INBOX ================= */

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

  /* ================= PRIVATE CHAT ================= */

>>>>>>> 71c2677 (Update)
  if (page === "dm") {
    return (
      <PrivateChat
        user={user}
        chatId={activeChat}
        onBack={() => setPage("inbox")}
      />
    );
  }

<<<<<<< HEAD
  // PROFILE
=======
  /* ================= PROFILE ================= */

>>>>>>> 71c2677 (Update)
  if (page === "profile") {
    return <Profile onBack={() => setPage("home")} />;
  }

<<<<<<< HEAD
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
=======
  /* ================= HOME ================= */

  return (
    <div className="home-wrapper">

      {/* TOP STRIP */}
      <div className="top-strip">
        Please don’t be weird. *Be human.
      </div>

      {/* NAVBAR */}
      <div className="home-nav">
        <div className="logo">SCHAT■</div>

        <div className="nav-links">
          
          <span onClick={() => setPage("profile")}>PROFILE</span>
        </div>
      </div>

      {/* HERO GRID */}
      <div className="hero-grid">

        {/* MAIN HERO */}
        <div className="hero-main">
          <h1>
            MEET <br />
            THE <br />
            UNKNOWN.
          </h1>

          <div className="hero-sub">
            You get connected to a random human (hopefully)
          </div>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => setPage("chat")}
            >
              START HUNTING
            </button>

            
          </div>
          <div className="hero-side green-card">
          <div><h2>PRIVATE MODE</h2>
          <p>
            Identity reveals only when both users approve.
          </p></div>
          <div>
          <h2>LIVE MATCHING</h2>
          <p>
            Real-time random pairing system.
          </p></div>
        
        </div>
        
        </div>

        {/* RIGHT TOP CARD */}
        <div 
          className="secondary-btn"
              onClick={() => setPage("inbox")}
            >
              OPEN INBOX
        </div>

        {/* RIGHT BOTTOM CARD */}
        <div className="hero-side pink-card">
          <h2>HOW IT WORKS</h2>
          <p>
            Click Start Hunting.
          </p>
          <p>
            Get matched instantly.
          </p>
          <p>
            Chat anonymously. 
          </p>
          <p>
           Reveal only if both agree. 
          </p>
          <p>
           Continue privately in your Inbox.
          </p>

          
        </div>

      </div>

      @dlshan

    </div>
  );
}
>>>>>>> 71c2677 (Update)
