import "./App.css";

export default function About({ onBack }) {

    

return(

<div className="page">

{/* TOPBAR */}

<div className="topbar">

<button
className="btn"
onClick={onBack}
>
BACK
</button>

<div>HOW SCHAT WORKS</div>

</div>


{/* MAIN */}

<div className="main">

<h1 className="hero-title">
The lowdown<span className="brand-period">.</span>
</h1>

<p className="about-intro">A tiny social experiment for people who miss talking to people.</p>


<div className="grid">


{/* STEP 1 */}

<div className="card bg-yellow">

<h2>1. FIND STRANGER</h2>

<div className="anim-search">

<div className="dot"></div>
<div className="dot"></div>
<div className="dot"></div>

</div>

<p>
Tap Find a human and we’ll look for someone else who’s up for a chat.
</p>

</div>


{/* STEP 2 */}

<div className="card bg-blue">

<h2>2. MATCH</h2>

<div className="anim-match">

<div className="user"></div>

<div className="arrow"></div>

<div className="user"></div>

</div>

<p>
You’ll meet someone new. No bios to perform, no feed to keep up with.
</p>

</div>


{/* STEP 3 */}

<div className="card bg-green">

<h2>3. CHAT</h2>

<div className="anim-chat">

<div className="bubble"></div>

<div className="bubble me"></div>

</div>

<p>
Start talking instantly.
</p>

</div>


{/* STEP 4 */}

<div className="card bg-pink">

<h2>4. REVEAL ID</h2>

<div className="anim-reveal">

<div className="lock"></div>

</div>

<p>
If you both want to stay in touch, you can move the conversation to your inbox.
</p>

</div>




</div>

</div>
<p className="watermark">
  <span>✳</span> good vibes, basic manners
</p>


</div>

)

}
