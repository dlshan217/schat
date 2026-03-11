import { useEffect, useState } from "react";
import { ref, onValue, get } from "firebase/database";
import { db } from "./firebase";

export default function Inbox({ user, openChat, onBack }) {

  const [chats,setChats] = useState([]);
  const [search,setSearch] = useState("");
  const [view,setView] = useState("list"); // list or grid

  useEffect(()=>{

    const userChatsRef = ref(db, `userChats/${user.uid}`);

    return onValue(userChatsRef, async snap=>{

      const data = snap.val() || {};
      const chatIds = Object.keys(data);

      const results = [];

      for(let chatId of chatIds){

        const chatSnap = await get(ref(db,`privateChats/${chatId}`));
        if(!chatSnap.exists()) continue;

        const chat = chatSnap.val();

        const otherUid = Object
        .keys(chat.users)
        .find(id=>id !== user.uid);

        const userSnap = await get(ref(db,`users/${otherUid}`));

        const msgSnap = await get(ref(db,`privateChats/${chatId}/messages`));
        const messages = msgSnap.val() || {};
        const lastMsg = Object.values(messages).pop();

        results.push({
          chatId,
          username: userSnap.val()?.username || "Unknown",
          lastMessage: lastMsg?.text || "",
          ts: lastMsg?.ts || 0
        });

      }

      // sort by latest message
      results.sort((a,b)=>b.ts-a.ts);

      setChats(results);

    });

  },[user.uid]);


  const filteredChats = chats.filter(c =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );


  return (
<div className="page">

  {/* TOP BAR */}

  <div className="topbar">

    <button
      className="btn"
      onClick={onBack}
    >
      BACK
    </button>

    <div>INBOX</div>

  </div>


  {/* SEARCH + VIEW SWITCH */}

  <div style={{padding:16,display:"flex",gap:10}}>

    <input
      className="input"
      placeholder="SEARCH CHAT..."
      value={search}
      onChange={e=>setSearch(e.target.value)}
    />

    <button
      className="btn"
      onClick={()=>setView("list")}
    >
      LIST
    </button>

    <button
      className="btn"
      onClick={()=>setView("grid")}
    >
      GRID
    </button>

  </div>


  {/* MAIN */}

  <div className="main">

    <div className={view === "list" ? "grid" : ""}>

      {filteredChats.length === 0 && (

        <div className="card bg-white">
          NO CHATS FOUND
        </div>

      )}


      {filteredChats.map(chat => (

        <div
          key={chat.chatId}
          className={`card bg-blue ${view==="grid"?"list-item":""}`}
          onClick={() => openChat(chat.chatId)}
        >

          <h2>{chat.username}</h2>

          <p>
            {chat.lastMessage || "OPEN CHAT →"}
          </p>

        </div>

      ))}

    </div>

  </div>

</div>
)}