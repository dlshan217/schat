<<<<<<< HEAD
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
HOW IT WORKS
</h1>


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
hit "start hunting" /( Warning: You might end up talking to yourself if no one else is online )
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
You get paired with a random person.( lets hope)
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
Both users can reveal identities if they agree. dont be wierd
</p>

</div>




</div>

</div>
<p class="watermark">
  <span id="wm">dlshan.</span>
</p>


</div>

)

=======
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
HOW IT WORKS
</h1>


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
hit "start hunting" /( Warning: You might end up talking to yourself if no one else is online )
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
You get paired with a random person.( lets hope)
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
Both users can reveal identities if they agree. dont be wierd
</p>

</div>




</div>

</div>
<p class="watermark">
  <span id="wm">dlshan.</span>
</p>


</div>

)

>>>>>>> aae81250010c1df3b72ecc2abcac096d1026573e
}