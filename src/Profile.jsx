import { useEffect, useState } from "react";
import { ref, get, update } from "firebase/database";
import { auth, db } from "./firebase";

export default function Profile({ onBack }) {

  const uid = auth.currentUser.uid;

  const [profile,setProfile] = useState(null);
  const [photo,setPhoto] = useState("");

  const [status,setStatus] = useState("");
  const [statusExpire,setStatusExpire] = useState("");

  const [theme,setTheme] = useState("yellow");


  /* LOAD PROFILE */

  useEffect(()=>{

    const load = async()=>{

      const snap = await get(ref(db,`users/${uid}`));

      if(!snap.exists()) return;

      const data = snap.val();

      setProfile(data);
      setPhoto(data.photo || "");
      setStatus(data.status || "");
      setStatusExpire(data.statusExpire || "");
      setTheme(data.theme || "yellow");

    };

    load();

  },[uid]);


  /* SAVE PROFILE */

  const save = async()=>{

    await update(ref(db,`users/${uid}`),{

      photo,
      status,
      statusExpire,
      theme

    });

    alert("PROFILE UPDATED");

  };


  /* TEMP STATUS */

  const setTemporaryStatus = (minutes)=>{

    const expire = Date.now() + minutes * 60000;

    setStatusExpire(expire);

  };


  /* COPY UID */

  const copyUID = ()=>{

    navigator.clipboard.writeText(uid);
    alert("UID COPIED");

  };


  if(!profile){

    return <div className="loading">Loading...</div>;

  }


  return (

  <div className="page">


    {/* TOPBAR */}

    <div className="topbar">

      <button
      className="btn"
      onClick={onBack}
      >
        BACK
      </button>

      <div>PROFILE</div>

    </div>


    {/* MAIN */}

    <div className="main">


      <div className="card bg-white" style={{maxWidth:420}}>


        {/* AVATAR */}

        {photo ? (

          <img
          src={photo}
          alt="profile"
          style={{
            width:120,
            height:120,
            border:"4px solid black",
            borderRadius:"50%",
            marginBottom:20
          }}
          />

        ) : (

          <div
          style={{
            width:120,
            height:120,
            border:"4px solid black",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            marginBottom:20,
            fontWeight:700
          }}
          >
            NO IMAGE
          </div>

        )}


        {/* BASIC INFO */}

        <p><b>USERNAME:</b> {profile.username}</p>
        <p><b>EMAIL:</b> {profile.email}</p>


        {/* STATUS */}

        <input
        className="input"
        placeholder="STATUS (optional)"
        value={status}
        onChange={e=>setStatus(e.target.value)}
        />


        <div style={{display:"flex",gap:10,marginTop:10}}>

          <button
          className="btn btn-yellow"
          onClick={()=>setTemporaryStatus(30)}
          >
            30M
          </button>

          <button
          className="btn btn-yellow"
          onClick={()=>setTemporaryStatus(60)}
          >
            1H
          </button>

        </div>


        {/* PROFILE IMAGE */}

        <input
        className="input"
        placeholder="PROFILE IMAGE URL"
        value={photo}
        onChange={e=>setPhoto(e.target.value)}
        style={{marginTop:20}}
        />


        {/* THEME COLOR */}

        <div style={{marginTop:20}}>

          <b>CHAT COLOR</b>

          <div style={{display:"flex",gap:10,marginTop:10}}>

            <button
            className="btn btn-yellow"
            onClick={()=>setTheme("yellow")}
            >
              YELLOW
            </button>

            <button
            className="btn btn-pink"
            onClick={()=>setTheme("pink")}
            >
              PINK
            </button>

            <button
            className="btn btn-green"
            onClick={()=>setTheme("green")}
            >
              GREEN
            </button>

          </div>

        </div>


        {/* ACTIONS */}

        <div style={{display:"flex",gap:10,marginTop:24}}>

          <button
          className="btn btn-green"
          onClick={save}
          >
            SAVE
          </button>

          <button
          className="btn"
          onClick={copyUID}
          >
            COPY UID
          </button>

          <button
          className="btn btn-pink"
          onClick={()=>{
            auth.signOut();
            window.location.reload();
          }}
          >
            LOGOUT
          </button>

        </div>


      </div>

    </div>

  </div>

  );

}