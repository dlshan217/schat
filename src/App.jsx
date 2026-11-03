import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { get, ref } from "firebase/database";
import { auth, db } from "./firebase";
import "./App.css";
import Auth from "./Auth";
import Chat from "./Chat";
import Inbox from "./Inbox";
import PrivateChat from "./PrivateChat";
import Profile from "./Profile";
import About from "./About";

const navigation = [
  { id: "home", label: "Home", icon: "home" },
  { id: "chat", label: "Chat", icon: "spark" },
  { id: "inbox", label: "Inbox", icon: "inbox" },
  { id: "profile", label: "Profile", icon: "user" },
];

function Icon({ name }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z"/></>,
    inbox: <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 13h5l2 3h4l2-3h5"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
    user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function NavigationDock({ page, setPage }) {
  const activePage = page === "dm" ? "inbox" : page;
  return (
    <nav className="app-dock" aria-label="Main navigation">
      {navigation.map(item => (
        <button
          className={`dock-item ${activePage === item.id ? "is-active" : ""} ${item.id === "chat" ? "dock-meet" : ""}`}
          key={item.id}
          onClick={() => setPage(item.id)}
          aria-label={item.label}
          aria-current={activePage === item.id ? "page" : undefined}
          title={item.label}
        >
          <span className="dock-icon"><Icon name={item.icon} /></span>
          <span className="dock-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function App() {

  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(true);
  const [needsProfile,setNeedsProfile] = useState(false);
  const profileCreatedUid = useRef(null);

  const [page,setPage] = useState("home");
  const [activeChat,setActiveChat] = useState(null);

  useEffect(()=>{

    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u || null);
      if (!u) {
        profileCreatedUid.current = null;
        setNeedsProfile(false);
        setLoading(false);
        return;
      }
      try {
        const profile = await get(ref(db, `users/${u.uid}`));
        setNeedsProfile(!profile.exists() && profileCreatedUid.current !== u.uid);
      } catch {
        setNeedsProfile(profileCreatedUid.current !== u.uid);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();

  },[]);


  if(loading){

    return(
      <div className="loading">
        SCHAT
      </div>
    );

  }


  const googleNeedsProfile = Boolean(needsProfile && user?.providerData?.some(item => item.providerId === "google.com"));
  if(!user || googleNeedsProfile){

    return(
      <Auth authenticatedUser={googleNeedsProfile ? user : null} onAuth={authenticatedUser => {
        profileCreatedUid.current = authenticatedUser.uid;
        setUser(authenticatedUser);
        setNeedsProfile(false);
      }}/>
    );

  }


  /* ================= ROUTING ================= */

  if(page === "about"){
  return <><About onBack={()=>setPage("home")} /><NavigationDock page={page} setPage={setPage} /></>;
}


  if(page === "chat"){

    return(<>

      <Chat
        user={user}
        onExit={()=>setPage("home")}
        goToInbox={()=>setPage("inbox")}
      />
      <NavigationDock page={page} setPage={setPage} />
    </>);

  }


  if(page === "inbox"){

    return(<>

      <Inbox
        user={user}
        openChat={(chatId)=>{
          setActiveChat(chatId);
          setPage("dm");
        }}
      />
      <NavigationDock page={page} setPage={setPage} />
    </>);

  }


  if(page === "dm"){

    return(<>

      <PrivateChat
        user={user}
        chatId={activeChat}
        onBack={()=>setPage("inbox")}
      />
      <NavigationDock page={page} setPage={setPage} />
    </>);

  }


  if(page === "profile"){

    return(<>

      <Profile
        onBack={()=>setPage("home")}
      />
      <NavigationDock page={page} setPage={setPage} />
    </>);

  }


  /* ================= HOME ================= */


  return(

  <>
  <div className="page home-page">


    {/* TOPBAR */}

    <div className="topbar">

      <div className="brand-lockup"><span className="brand-glyph">s.</span><span>SCHAT<span className="brand-period">.</span></span></div>

      <div style={{display:"flex",gap:12}}>

        

        <button
          className="btn btn-pink topbar-profile"
          onClick={()=>setPage("profile")}
        >
          <Icon name="user" /> <span>PROFILE</span>
        </button>

      </div>

    </div>



    {/* MAIN */}

    <div className="main">


      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow"><span className="status-dot" /> A little corner of the internet</span>
          <h1>Make a new<br/><span>connection.</span></h1>
          <p>A low-pressure place to talk to someone new.</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="orbit orbit-one"/><span className="orbit orbit-two"/>
          <div className="art-spark spark-a">✳</div><div className="art-spark spark-b">✦</div>
          <div className="art-card art-card-back"><span className="mini-avatar avatar-lilac">☻</span><span className="skeleton-lines"><i/><i/></span></div>
          <div className="art-card art-card-front"><span className="live-chip"><i/> OPEN TO CHAT</span><div className="avatar-pair"><span className="big-avatar avatar-peach">☻</span><span className="connection-mark">↔</span><span className="big-avatar avatar-blue">☺</span></div><span className="art-caption">one hello can go<br/>a long way</span></div>
          <span className="art-sticker">say hi ✳</span>
        </div>
      </section>


      <section className="mobile-howto" aria-label="Animated guide to using Schat">
        <div className="mobile-howto-heading">
          <span className="eyebrow">THREE EASY STEPS</span>
          <h2 id="mobile-howto-title">How Schat works</h2>
          <p>That’s the whole thing. No big setup.</p>
        </div>
        <div className="howto-steps">
          <article className="howto-step step-find">
            <div className="howto-visual"><span className="howto-orbit"/><span className="howto-person">☺</span><span className="howto-search">⌕</span></div>
            <span className="howto-number">01</span><h3>Find a chat</h3><p>Tap Chat to meet someone new.</p>
          </article>
          <span className="howto-connector" aria-hidden="true">→</span>
          <article className="howto-step step-talk">
            <div className="howto-visual"><span className="howto-bubble">hey 👋</span><span className="howto-bubble bubble-reply">hi there</span><span className="howto-sparkle">✳</span></div>
            <span className="howto-number">02</span><h3>Say hello</h3><p>Keep it easy. See where it goes.</p>
          </article>
          <span className="howto-connector" aria-hidden="true">→</span>
          <article className="howto-step step-save">
            <div className="howto-visual"><span className="howto-heart">♡</span><span className="howto-inbox-icon">▱</span></div>
            <span className="howto-number">03</span><h3>Stay in touch</h3><p>If it clicks, save the chat to your inbox.</p>
          </article>
        </div>
      </section>


      <div className="section-heading desktop-home-links"><div><span className="eyebrow">QUICK LINKS</span><h2>Where to?</h2></div></div>
      <div className="grid home-grid">


        <button
        className="card home-card card-yellow"
        onClick={()=>setPage("chat")}
        >
          <span className="card-icon icon-yellow"><Icon name="spark"/></span><span className="card-arrow">↗</span>
          <h2>Meet someone</h2><p>Start a new conversation.</p>
          <span className="card-meta">START CHATTING <i className="status-dot"/></span>
        </button>



        <button
        className="card home-card card-blue"
        onClick={()=>setPage("inbox")}
        >

          <span className="card-icon icon-blue"><Icon name="inbox"/></span><span className="card-arrow">↗</span>
          <h2>Inbox</h2><p>Pick up where you left off.</p>
          <span className="card-meta">YOUR CHATS</span>
        </button>



        <button
  className="card home-card card-pink"
  onClick={()=>setPage("about")}
>

  <span className="card-icon icon-pink"><Icon name="info"/></span><span className="card-arrow">↗</span>
  <h2>How it works</h2><p>A quick guide to Schat.</p>
  <span className="card-meta">ABOUT SCHAT</span>
        </button>


      </div>

      <section className="mobile-about" aria-label="About Schat">
        <span className="eyebrow">WHAT IS SCHAT?</span>
        <h2>A little place to meet someone new.</h2>
        <p>Start a random chat, see if you click, and save the conversation when you both want to talk again.</p>
        <div className="mobile-about-steps">
          <span><i>01</i> Meet</span><b>·</b><span><i>02</i> Talk</span><b>·</b><span><i>03</i> Keep in touch</span>
        </div>
      </section>


    </div>
    <p className="watermark">made for good conversations <span>✳</span></p>


  </div>
  <NavigationDock page={page} setPage={setPage} />
  </>

  );

}
