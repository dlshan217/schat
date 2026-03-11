import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import "./App.css";
import Auth from "./Auth";
import Chat from "./Chat";
import Inbox from "./Inbox";
import PrivateChat from "./PrivateChat";
import Profile from "./Profile";
import About from "./about";

export default function App() {

  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(true);

  const [page,setPage] = useState("home");
  const [activeChat,setActiveChat] = useState(null);

  useEffect(()=>{

    const unsub = onAuthStateChanged(auth,(u)=>{

      setUser(u || null);
      setLoading(false);

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


  if(!user){

    return(
      <Auth onAuth={setUser}/>
    );

  }


  /* ================= ROUTING ================= */

  if(page === "about"){
  return <About onBack={()=>setPage("home")} />;
}


  if(page === "chat"){

    return(

      <Chat
        user={user}
        onExit={()=>setPage("home")}
        goToInbox={()=>setPage("inbox")}
      />

    );

  }


  if(page === "inbox"){

    return(

      <Inbox
        user={user}
        onBack={()=>setPage("home")}
        openChat={(chatId)=>{
          setActiveChat(chatId);
          setPage("dm");
        }}
      />

    );

  }


  if(page === "dm"){

    return(

      <PrivateChat
        user={user}
        chatId={activeChat}
        onBack={()=>setPage("inbox")}
      />

    );

  }


  if(page === "profile"){

    return(

      <Profile
        onBack={()=>setPage("home")}
      />

    );

  }


  /* ================= HOME ================= */


  return(

  <div className="page">


    {/* TOPBAR */}

    <div className="topbar">

      <div style={{
      }}
      >
        SCHAT
      </div>

      <div style={{display:"flex",gap:12}}>

        

        <button
          className="btn btn-pink"
          onClick={()=>setPage("profile")}
        >
          PROFILE
        </button>

      </div>

    </div>



    {/* MAIN */}

    <div className="main">


      <h1
      style={{
        fontFamily:"Anton",
        fontSize:"80px",
        textAlign:"center"
      }}
      >
        MEET SOMEONE.
      </h1>


      <div className="grid">


        <div
        className="card bg-yellow"
        onClick={()=>setPage("chat")}
        >

          <h2>START CHAT</h2>

          <p>
          Talk with random people instantly.
          </p>

        </div>



        <div
        className="card bg-blue"
        onClick={()=>setPage("inbox")}
        >

          <h2>INBOX</h2>

          <p>
          Continue your private chats.
          </p>

        </div>



        <div 
  className="card bg-pink"
  onClick={()=>setPage("about")}
>

  <h2>HOW IT WORKS</h2>

  <p>
  Learn 
  </p>

</div>


      </div>


    </div>
    <p class="watermark">
  <span id="wm">dlshan.</span>
</p>


  </div>

  );

}