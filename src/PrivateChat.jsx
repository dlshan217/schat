import { useEffect, useState, useRef } from "react";
import { ref, push, onValue, get, set } from "firebase/database";
import { db } from "./firebase";

export default function PrivateChat({ user, chatId, onBack }) {

const [messages,setMessages] = useState([]);
const [text,setText] = useState("");
const [otherUser,setOtherUser] = useState(null);

const [typing,setTyping] = useState(false);
const [otherTyping,setOtherTyping] = useState(false);

const typingTimeout = useRef(null);



/* LOAD MESSAGES */

useEffect(()=>{

const msgRef = ref(db,`privateChats/${chatId}/messages`);

return onValue(msgRef,snap=>{

const data = snap.val() || {};
setMessages(Object.values(data));

});

},[chatId]);



/* LOAD OTHER USER */

useEffect(()=>{

const loadProfile = async ()=>{

const chatSnap = await get(ref(db,`privateChats/${chatId}`));
if(!chatSnap.exists()) return;

const users = Object.keys(chatSnap.val().users);
const otherUid = users.find(id => id !== user.uid);

const userSnap = await get(ref(db,`users/${otherUid}`));

setOtherUser(userSnap.val());

};

loadProfile();

},[chatId,user.uid]);



/* TYPING SEND */

useEffect(()=>{

if(!chatId) return;

const typingRef = ref(db,`privateChats/${chatId}/typing/${user.uid}`);

set(typingRef,typing);

if(typingTimeout.current) clearTimeout(typingTimeout.current);

typingTimeout.current = setTimeout(()=>{

set(typingRef,false);
setTyping(false);

},1200);

},[typing,chatId,user.uid]);



/* TYPING LISTENER */

useEffect(()=>{

if(!chatId) return;

const typingRef = ref(db,`privateChats/${chatId}/typing`);

return onValue(typingRef,snap=>{

const data = snap.val() || {};

const other = Object.keys(data).find(id=>id!==user.uid);

setOtherTyping(other ? data[other] : false);

});

},[chatId,user.uid]);



/* SEND MESSAGE */

const send = ()=>{

if(!text.trim()) return;

push(ref(db,`privateChats/${chatId}/messages`),{

text,
sender:user.uid,
ts:Date.now()

});

setText("");
setTyping(false);

};



/* UI */

return(

<div className="page">

{/* TOPBAR */}

<div className="topbar">

<button className="btn" onClick={onBack}>
BACK
</button>

<div>

{otherUser?.photo &&(

<img
src={otherUser.photo}
alt=""
style={{
width:30,
height:30,
border:"3px solid black",
borderRadius:"50%",
marginRight:8
}}
/>

)}

{otherUser?.username}

</div>

</div>



{/* CHAT AREA */}

<div className="chat-area">

{messages.map((m,i)=>(

<div
key={i}
className={"msg "+(m.sender===user.uid?"me":"")}
>

{m.text}

</div>

))}


{otherTyping && (

<div className="typing">

{otherUser?.username || "User"} is typing...

</div>

)}

</div>



{/* INPUT */}

<div className="input-row">

<input
className="input"
value={text}
placeholder="TYPE MESSAGE"
onChange={e=>{
setText(e.target.value);
setTyping(true);
}}
onKeyDown={e=>{
if(e.key==="Enter"){
e.preventDefault();
send();
}
}}
/>

<button
className="btn btn-yellow"
onClick={send}
>

SEND

</button>

</div>

</div>

);
}