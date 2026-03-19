import { useEffect, useState, useRef } from "react";
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

export default function Chat({ user, onExit, goToInbox }) {

const uid = user.uid;

const [roomId,setRoomId] = useState(null);
const [messages,setMessages] = useState([]);
const [text,setText] = useState("");

const [onlineCount,setOnlineCount] = useState(0);
const [searching,setSearching] = useState(false);

const [revealRequested,setRevealRequested] = useState(false);
const [showPopup,setShowPopup] = useState(false);

const [typing,setTyping] = useState(false);
const [otherTyping,setOtherTyping] = useState(false);

const typingTimeout = useRef(null);

const [chatStart,setChatStart] = useState(0);



/* ONLINE PRESENCE */

useEffect(()=>{

const connectedRef = ref(db,".info/connected");
const userRef = ref(db,`online/${uid}`);
const allRef = ref(db,"online");

const unsub1 = onValue(connectedRef,snap=>{

if(snap.val()===true){
set(userRef,true);
onDisconnect(userRef).remove();
}

});

const unsub2 = onValue(allRef,snap=>{

const data = snap.val()||{};
const total = Object.keys(data).length;
const others = data[uid]?total-1:total;

setOnlineCount(Math.max(others,0));

});

return ()=>{
remove(userRef);
unsub1();
unsub2();
};

},[uid]);



/* MATCH LISTENER */

useEffect(()=>{

const matchRef = ref(db,`matches/${uid}`);

return onValue(matchRef,snap=>{

const data = snap.val();

if(data?.roomId){

setRoomId(data.roomId);
setSearching(false);
setRevealRequested(false);

setChatStart(Date.now());

remove(matchRef);

}

});

},[uid]);



/* FIND STRANGER */

const findStranger = async ()=>{

setMessages([]);
setSearching(true);

const queueRef = ref(db,"queue");
const snap = await get(queueRef);

const queue = snap.val()||{};
const matchUid = Object.keys(queue).find(id=>id!==uid);

if(matchUid){

const newRoom = "room_"+Date.now();

await set(ref(db,`rooms/${newRoom}`),{
users:{[uid]:true,[matchUid]:true}
});

await set(ref(db,`matches/${uid}`),{roomId:newRoom});
await set(ref(db,`matches/${matchUid}`),{roomId:newRoom});

await remove(ref(db,`queue/${uid}`));
await remove(ref(db,`queue/${matchUid}`));

}else{

await set(ref(db,`queue/${uid}`),true);

}

};



const cancelSearch = async ()=>{
await remove(ref(db,`queue/${uid}`));
setSearching(false);
};



/* ROOM LISTENER */

useEffect(()=>{

if(!roomId) return;

const roomRef = ref(db,`rooms/${roomId}`);

const unsub = onValue(roomRef,snap=>{

const data = snap.val();

if(!data){
setRoomId(null);
return;
}

setMessages(data.messages?Object.values(data.messages):[]);


/* REVEAL LOGIC */

const revealData = data.revealRequest||{};
const users = Object.keys(revealData);

if(users.length===2){
set(ref(db,`rooms/${roomId}/status`),"approved");
}

if(data.status==="approved"){
setShowPopup(true);
}

});

onDisconnect(roomRef).remove();

return ()=>unsub();

},[roomId,uid]);



/* TYPING SEND */

useEffect(()=>{

if (!roomId) return;

const typingRef = ref(db, `rooms/${roomId}/typing/${uid}`);

set(typingRef, typing);

if (typingTimeout.current) clearTimeout(typingTimeout.current);

typingTimeout.current = setTimeout(() => {
set(typingRef, false);
setTyping(false);
}, 1200);

}, [typing, roomId, uid]);



/* TYPING LISTENER */

useEffect(()=>{

if (!roomId) return;

const typingRef = ref(db, `rooms/${roomId}/typing`);

return onValue(typingRef, snap => {

const data = snap.val() || {};

const other = Object.keys(data).find(id => id !== uid);

setOtherTyping(other ? data[other] : false);

});

}, [roomId, uid]);



/* REVEAL */

const requestReveal = async ()=>{

await set(ref(db,`rooms/${roomId}/revealRequest/${uid}`),true);
setRevealRequested(true);

};



/* MOVE TO INBOX */

const moveToInbox = async ()=>{

const roomRef = ref(db,`rooms/${roomId}`);
const snap = await get(roomRef);

if(!snap.exists()) return;

const users = Object.keys(snap.val().users).sort();

const chatId = `chat_${users[0]}_${users[1]}`;

const chatRef = ref(db,`privateChats/${chatId}`);
const chatSnap = await get(chatRef);

if(!chatSnap.exists()){

await set(chatRef,{
users:{[users[0]]:true,[users[1]]:true},
createdAt:Date.now()
});

await set(ref(db,`userChats/${users[0]}/${chatId}`),true);
await set(ref(db,`userChats/${users[1]}/${chatId}`),true);

}

await remove(roomRef);

};



/* SEND MESSAGE */

const sendMessage = ()=>{

if(!text.trim()||!roomId) return;

const banned = ["m","f","male","female","boy","girl"];
const lower = text.toLowerCase();

if(Date.now()-chatStart<30000){

if(banned.some(w=>lower.includes(w))){
alert("Gender reveal blocked for first 30 seconds");
return;
}

}

push(ref(db,`rooms/${roomId}/messages`),{
text,
sender:uid,
ts:Date.now()
});

setText("");
setTyping(false);

};



/* SKIP */

const skip = async ()=>{

if(roomId) await remove(ref(db,`rooms/${roomId}`));

setRoomId(null);
setRevealRequested(false);

findStranger();

};



/* ESC SHORTCUT */

useEffect(()=>{

const keyHandler = e=>{
if(e.key==="Escape") skip();
};

window.addEventListener("keydown",keyHandler);

return ()=>window.removeEventListener("keydown",keyHandler);

},[roomId]);



/* UI */

return(

<div className="page">

<div className="topbar">

<div>SCHAT</div>
<div>{onlineCount} ONLINE</div>

<button className="btn" onClick={onExit}>
EXIT
</button>

</div>



{!roomId?(

<div className="main">

{!searching?(

<button className="btn btn-yellow" onClick={findStranger}>
START HUNTING
</button>

):( 

<>

<h2>SEARCHING...</h2>

<button className="btn btn-pink" onClick={cancelSearch}>
CANCEL
</button>

</>

)}

</div>

):( 

<>

<div className="chat-area">

{messages.map((m,i)=>(

<div key={i} className={"msg "+(m.sender===uid?"me":"")}>
{m.text}
</div>

))}

{otherTyping && (
<div className="msg typing">Stranger is typing...</div>
)}

</div>



<div style={{padding:"10px"}}>

{!revealRequested && !showPopup &&(

<button className="btn btn-pink" onClick={requestReveal}>
REVEAL ID
</button>

)}

{revealRequested && !showPopup &&(
<h3>WAITING APPROVAL</h3>
)}

</div>



<div className="input-row">

<input
className="input"
value={text}
placeholder="TYPE MESSAGE"
onChange={(e)=>{
setText(e.target.value);
setTyping(true);
}}
onKeyDown={e=>{
if(e.key==="Enter" && !e.shiftKey){
e.preventDefault();
sendMessage();
}
}}
/>

<button className="btn btn-yellow" onClick={sendMessage}>
SEND
</button>

<button className="btn btn-yellow" onClick={skip}>
NEXT
</button>

</div>

</>

)}



{showPopup &&(

<div className="modal-overlay">

<div className="modal">

<h2>Chat moved to inbox</h2>

<div className="modal-buttons">

<button
className="btn btn-green"
onClick={async ()=>{
await moveToInbox();
goToInbox();
}}
>
GO TO INBOX
</button>

<button
className="btn btn-yellow"
onClick={async ()=>{
await moveToInbox();
findStranger();
}}
>
KEEP HUNTING
</button>

</div>

</div>

</div>

)}

</div>

);

}