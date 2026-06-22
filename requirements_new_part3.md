# REQUIREMENT 3: BRIDGE AI ASSISTANT CHATBOT & GENERAL POLICIES

## 1. BRIDGE AI ASSISTANT CHATBOT
### Location
- Homepage only.

### Position
- Fixed Floating Button.
- Reference: Modern fintech apps.
- Position styling:
  - `right: 25px;`
  - `bottom: 25px;`
  - Slightly above corner.

### Chatbot Title
- Use: `InvestorBridge — Bridge AI Assistant`

### UI Rules
- **Keep:**
  - Existing chatbot HTML
  - Existing chatbot CSS
- **DO NOT redesign.**
- **DO NOT modify styling.**
- **DO NOT modify layout.**
- **Only integrate.**

### Chatbot HTML Code
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>InvestorBridge — Bridge AI Assistant</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap');
:root{--navy:#0B1F3A;--navy2:#132d52;--gold:#C9A84C;--goldf:#f0d47a;--green:#1DB87A;--bg:#F0F4F8;--card:#fff;--border:#DDE4EE;--muted:#7A8BA0;}
*{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;font-family:'Inter',sans-serif;background:var(--bg);color:var(--navy);}
body{display:flex;flex-direction:column;height:100vh;overflow:hidden;}

.header{background:var(--navy);padding:0 16px;height:62px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;box-shadow:0 2px 16px rgba(0,0,0,0.25);z-index:10;}
.hl{display:flex;align-items:center;gap:10px;}
.av{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,var(--gold),#a07820);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
.hname{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#fff;}
.hstatus{display:flex;align-items:center;gap:5px;font-size:11px;color:rgba(255,255,255,0.45);}
.sdot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
.hbadge{font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--gold);border:1px solid rgba(201,168,76,0.4);padding:4px 10px;border-radius:100px;}
.clrbtn{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.5);font-size:11px;padding:6px 12px;border-radius:100px;cursor:pointer;transition:all 0.2s;}
.clrbtn:hover{background:rgba(255,255,255,0.18);color:#fff;}

.msgs{flex:1;overflow-y:auto;padding:20px 16px;display:flex;flex-direction:column;gap:14px;scroll-behavior:smooth;}
.msgs::-webkit-scrollbar{width:3px;}
.msgs::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px;}

.welcome{background:linear-gradient(135deg,var(--navy),#1a3a6a);border-radius:20px;padding:26px 20px;text-align:center;position:relative;overflow:hidden;}
.welcome::before{content:'';position:absolute;top:-50px;right:-50px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(201,168,76,0.15) 0%,transparent 70%);}
.wi{font-size:34px;margin-bottom:10px;}
.wt{font-family:'Syne',sans-serif;font-size:19px;font-weight:800;color:#fff;margin-bottom:6px;}
.wt span{color:var(--gold);}
.ws{font-size:12px;color:rgba(255,255,255,0.5);line-height:1.6;margin-bottom:18px;}
.quickbtns{display:flex;flex-direction:column;gap:7px;}
.qbtn{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.8);padding:10px 13px;border-radius:10px;font-size:12px;cursor:pointer;text-align:left;transition:all 0.2s;width:100%;}
.qbtn:hover{background:rgba(255,255,255,0.14);border-color:var(--gold);color:#fff;}

.mrow{display:flex;align-items:flex-end;gap:8px;animation:fu 0.25s ease;}
@keyframes fu{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
.mrow.user{flex-direction:row-reverse;}
.mav{width:28px;height:28px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;margin-bottom:2px;}
.bav{background:linear-gradient(135deg,var(--gold),#a07820);}
.uav{background:var(--navy);border:1.5px solid var(--border);}
.bub{max-width:80%;padding:12px 15px;border-radius:17px;font-size:13.5px;line-height:1.7;}
.bub.bot{background:var(--card);color:var(--navy);border-bottom-left-radius:4px;box-shadow:0 2px 10px rgba(11,31,58,0.08);border:1px solid var(--border);}
.bub.user{background:var(--navy);color:#fff;border-bottom-right-radius:4px;}
.bub.bot strong{color:var(--navy);font-weight:600;}
.bub.user strong{color:var(--goldf);}
.mtime{font-size:10px;color:var(--muted);margin-top:3px;padding:0 6px;}
.mrow.user .mtime{text-align:right;}

.typrow{display:flex;align-items:flex-end;gap:8px;}
.typbub{background:var(--card);border:1px solid var(--border);border-radius:17px;border-bottom-left-radius:4px;padding:13px 16px;box-shadow:0 2px 10px rgba(11,31,58,0.08);display:flex;gap:4px;align-items:center;}
.td{width:7px;height:7px;border-radius:50%;background:var(--muted);animation:tb 1.3s infinite;}
.td:nth-child(2){animation-delay:0.2s;}
.td:nth-child(3){animation-delay:0.4s;}
@keyframes tb{0%,60%,100%{transform:translateY(0);opacity:0.4;}30%{transform:translateY(-5px);opacity:1;}}

.opts{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}
.opt{background:#EEF4FF;border:1.5px solid #C0D0F0;color:#2A4A90;padding:7px 13px;border-radius:100px;font-size:12px;font-weight:500;cursor:pointer;transition:all 0.2s;}
.opt:hover{background:var(--navy);color:var(--gold);border-color:var(--navy);}

/* Lead form */
.lform{background:linear-gradient(135deg,#FFF8E6,#FFF3CC);border:1.5px solid rgba(201,168,76,0.4);border-radius:14px;padding:16px;margin-top:12px;}
.lft{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:var(--navy);margin-bottom:12px;}
.lform input,.lform select{width:100%;padding:10px 12px;border:1.5px solid rgba(201,168,76,0.3);border-radius:10px;font-size:13px;font-family:'Inter',sans-serif;color:var(--navy);background:#fff;outline:none;margin-bottom:8px;transition:border-color 0.2s;}
.lform input:focus,.lform select:focus{border-color:var(--gold);}
.lfbtn{width:100%;padding:12px;background:var(--navy);color:var(--gold);border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif;transition:all 0.2s;position:relative;}
.lfbtn:hover{background:var(--navy2);}
.lfbtn:disabled{opacity:0.6;cursor:not-allowed;}
.submitting{display:none;font-size:12px;color:var(--muted);text-align:center;margin-top:8px;}

/* Success banner */
.qbanner{background:linear-gradient(135deg,#0B2A1A,#1A4A2A);border:1px solid rgba(29,184,122,0.4);border-radius:12px;padding:13px 15px;display:flex;align-items:flex-start;gap:10px;font-size:12px;color:rgba(255,255,255,0.75);margin-top:10px;line-height:1.6;}
.qbanner strong{color:var(--green);display:block;font-size:13px;margin-bottom:3px;}

/* Error banner */
.errbanner{background:linear-gradient(135deg,#2A0B0B,#4A1A1A);border:1px solid rgba(224,90,90,0.4);border-radius:12px;padding:13px 15px;display:flex;align-items:flex-start;gap:10px;font-size:12px;color:rgba(255,255,255,0.75);margin-top:10px;}
.errbanner strong{color:#E05A5A;display:block;font-size:13px;margin-bottom:3px;}

/* Sheet saved badge */
.sheet-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(29,184,122,0.12);border:1px solid rgba(29,184,122,0.3);color:var(--green);font-size:11px;font-weight:600;padding:5px 12px;border-radius:100px;margin-top:8px;}

.iarea{background:var(--card);border-top:1px solid var(--border);padding:14px 16px;flex-shrink:0;}
.iwrap{display:flex;align-items:flex-end;gap:9px;background:var(--bg);border:1.5px solid var(--border);border-radius:15px;padding:9px 11px;transition:border-color 0.2s;}
.iwrap:focus-within{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,168,76,0.1);}
#ui{flex:1;border:none;background:transparent;font-size:13.5px;font-family:'Inter',sans-serif;color:var(--navy);resize:none;outline:none;line-height:1.5;max-height:100px;min-height:22px;}
#ui::placeholder{color:var(--muted);}
.sbtn{width:36px;height:36px;border-radius:10px;background:var(--navy);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;transition:all 0.2s;}
.sbtn:hover{background:var(--navy2);transform:scale(1.05);}
.sbtn:disabled{opacity:0.35;cursor:not-allowed;transform:none;}
.ihint{text-align:center;font-size:10px;color:var(--muted);margin-top:8px;}
</style>
</head>
<body>

<div class="header">
  <div class="hl">
    <div class="av">🌍</div>
    <div>
      <div class="hname">InvestorBridge AI — Bridge</div>
      <div class="hstatus"><div class="sdot"></div>Online · Always available</div>
    </div>
  </div>
  <div style="display:flex;gap:8px;align-items:center;">
    <div class="hbadge">GIFT City</div>
    <button class="clrbtn" onclick="clearChat()">Clear</button>
  </div>
</div>

<div class="msgs" id="msgs">
  <div class="welcome">
    <div class="wi">🌍</div>
    <div class="wt">Hi! I'm <span>Bridge</span></div>
    <div class="ws">Your AI assistant from InvestorBridge Solutions.<br>Ask me anything about global investing through GIFT City.</div>
    <div class="quickbtns">
      <button class="qbtn" onclick="sq(this)">💰 What is GIFT City?</button>
      <button class="qbtn" onclick="sq(this)">📈 Global fund returns vs Indian MF?</button>
      <button class="qbtn" onclick="sq(this)">✅ Is S&P 500 investing legal from India?</button>
      <button class="qbtn" onclick="sq(this)">🚀 How to start with ₹1.5L/year?</button>
      <button class="qbtn" onclick="sq(this)">💱 What about currency risk?</button>
    </div>
  </div>
</div>

<div class="iarea">
  <div class="iwrap">
    <textarea id="ui" placeholder="Ask about GIFT City, returns, how to start..." rows="1" onkeydown="hk(event)" oninput="ar(this)"></textarea>
    <button class="sbtn" id="sb" onclick="send()">➤</button>
  </div>
  <div class="ihint">InvestorBridge Solutions · GIFT City, Gujarat · RBI & SEBI Regulated</div>
</div>
```

### Chatbot Logic Rules
- Use exactly the chatbot JavaScript logic provided.
- Must include:
  - Question matching
  - Suggested replies
  - Typing animation
  - Lead form
  - Lead scoring
  - Google Sheets integration
  - Consultation booking flow
  - Hot/Warm/Cold lead tagging
  - Welcome screen
  - Quick buttons

### Existing Chatbot
- Comment existing chatbot logic.
- E.g.:
```javascript
/*
OLD CHATBOT LOGIC
*/
```
- Then insert new chatbot logic.

### Chatbot JS Logic Code
```javascript
const FALLBACKS = [
  `That's a great question! 😊 Our advisor would be best placed to answer this specifically for your situation.\n\nHere's what I can help you with right now:`,
  `Good one — let me connect you with our expert for a precise answer on this!\n\nMeanwhile, feel free to explore:`,
  `I want to make sure you get the most accurate advice. Let me connect you with our advisor to discuss this in detail.`
];
const FALLBACK_OPTS = ['What is GIFT City?','Tell me about returns','Is this legal?','How do I start?','Book a free consultation'];

// ── STATE ──
let qCount = 0;
let formShown = false;
let isTyping = false;

// ── UTILS ──
function timeNow(){return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}
function ar(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,100)+'px';}
function hk(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}
function scrollBot(){const m=document.getElementById('msgs');setTimeout(()=>m.scrollTop=m.scrollHeight,60);}
function esc(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function fmt(text){
  text=text.replace(/\*\*(.*?)\*\"/g,'<strong>$1</strong>');
  const lines=text.split('\n');
  let result=[],inTable=false,tableRows=[];
  for(let i=0;i<lines.length;i++){
    const l=lines[i];
    if(l.trim().startsWith('|')&&l.trim().endsWith('|')){
      if(!inTable){inTable=true;tableRows=[];}
      tableRows.push(l);
    } else {
      if(inTable){result.push(buildTable(tableRows));inTable=false;tableRows=[];}
      result.push(l);
    }
  }
  if(inTable)result.push(buildTable(tableRows));
  return result.join('\n').replace(/\n/g,'<br>');
}

function buildTable(rows){
  let html='<table style="border-collapse:collapse;width:100%;margin:8px 0;font-size:12px;">';
  rows.forEach((r,i)=>{
    if(r.replace(/\|/g,'').trim().match(/^-+$/))return;
    const cells=r.split('|').filter(c=>c.trim());
    if(!cells.length)return;
    const tag=i===0?'th':'td';
    const bg=i===0?'background:var(--navy);color:var(--gold);':'';
    html+=`<tr>${cells.map(c=>`<${tag} style="padding:6px 10px;border:1px solid var(--border);${bg}">${c.trim()}</${tag}>`).join('')}</tr>`;
  });
  return html+'</table>';
}

// ── DOM HELPERS ──
function addUser(text){
  const m=document.getElementById('msgs');
  const d=document.createElement('div');
  d.className='mrow user';
  d.innerHTML=`<div><div class="bub user">${esc(text).replace(/\n/g,'<br>')}</div><div class="mtime">${timeNow()}</div></div><div class="mav uav">👤</div>`;
  m.appendChild(d);scrollBot();
}

function addBot(html,opts,showForm){
  const m=document.getElementById('msgs');
  const d=document.createElement('div');
  d.className='mrow';
  let extra='';
  if(opts&&opts.length){
    extra=`<div class="opts">${opts.map(o=>`<button class="opt" onclick="sq(this)">${o}</button>`).join('')}</div>`;
  }
  if(showForm)extra+=buildFormHTML();
  d.innerHTML=`<div class="mav bav">🌍</div><div><div class="bub bot">${html}${extra}</div><div class="mtime">${timeNow()}</div></div>`;
  m.appendChild(d);scrollBot();
}

function buildFormHTML(){
  return `<div class="lform" id="leadForm">
    <div class="lft">📋 Book Free Consultation</div>
    <input type="text" id="fn" placeholder="Your full name *" />
    <input type="tel" id="fp" placeholder="WhatsApp number *" />
    <input type="text" id="fc" placeholder="Your city" />
    <input type="text" id="fj" placeholder="Your profession (e.g. IT, Doctor, Business)" />
    <select id="fi">
      <option value="">Investment capacity per year</option>
      <option value="1.5L-5L">₹1.5L – ₹5L per year</option>
      <option value="5L-15L">₹5L – ₹15L per year</option>
      <option value="15L-50L">₹15L – ₹50L per year</option>
      <option value="50L+">₹50L+ per year</option>
    </select>
    <button class="lfbtn" id="submitBtn" onclick="submitForm()">📞 Connect Me with an Advisor →</button>
    <div class="submitting" id="submittingMsg">⏳ Saving your details to Google Sheets...</div>
  </div>`;
}

function showTyp(){
  const m=document.getElementById('msgs');
  const d=document.createElement('div');
  d.className='typrow';d.id='typ';
  d.innerHTML=`<div class="mav bav">🌍</div><div class="typbub"><div class="td"></div><div class="td"></div><div class="td"></div></div>`;
  m.appendChild(d);scrollBot();
}
function removeTyp(){const e=document.getElementById('typ');if(e)e.remove();}

// ── FIND RESPONSE ──
function findResponse(text){
  const t=text.toLowerCase();
  for(const entry of KB){
    if(entry.keys.some(k=>t.includes(k)))return entry;
  }
  return null;
}

function sq(btn){
  const text=btn.textContent.trim();
  document.getElementById('ui').value=text;
  send();
}

// ── SEND MESSAGE ──
function send(){
  const inp=document.getElementById('ui');
  const text=inp.value.trim();
  if(!text||isTyping)return;
  inp.value='';inp.style.height='auto';
  addUser(text);
  qCount++;
  isTyping=true;
  document.getElementById('sb').disabled=true;
  showTyp();

  setTimeout(()=>{
    removeTyp();
    const match=findResponse(text);
    if(match){
      addBot(fmt(match.reply),match.opts||[],match.showForm||false);
      if(match.showForm)formShown=true;
    } else {
      const fb=FALLBACKS[Math.floor(Math.random()*FALLBACKS.length)];
      addBot(fmt(fb),FALLBACK_OPTS,false);
    }
    // Auto show form after 4 questions
    if(!formShown&&qCount>=4){
      setTimeout(()=>{
        addBot(`You seem genuinely interested in global investing! 😊<br><br>Let me connect you with our advisor for a <strong>free 15-minute personalised consultation</strong> — they'll show you exactly what your money looks like in global markets based on your income.`,null,true);
        formShown=true;
      },800);
    }
    isTyping=false;
    document.getElementById('sb').disabled=false;
    document.getElementById('ui').focus();
  },700+Math.random()*500);
}

// ── SUBMIT TO GOOGLE SHEETS ──
async function submitForm(){
  const name=document.getElementById('fn')?.value?.trim();
  const phone=document.getElementById('fp')?.value?.trim();
  const city=document.getElementById('fc')?.value?.trim()||'Not specified';
  const job=document.getElementById('fj')?.value?.trim()||'Not specified';
  const income=document.getElementById('fi')?.value||'Not specified';

  if(!name){alert('Please enter your name 🙏');return;}
  if(!phone){alert('Please enter your WhatsApp number 🙏');return;}

  // Score lead
  let score=60,tag='WARM';
  if(income==='5L-15L')score=78;
  if(income==='15L-50L')score=90;
  if(income==='50L+'){score=97;tag='HOT';}
  if(score>=80)tag='HOT';
  else if(score>=60)tag='WARM';
  else tag='COLD';

  // Disable button, show loading
  const btn=document.getElementById('submitBtn');
  const submittingMsg=document.getElementById('submittingMsg');
  btn.disabled=true;
  btn.textContent='⏳ Submitting...';
  submittingMsg.style.display='block';

  const payload={
    name,
    phone,
    city,
    job,
    income,
    score:score+'%',
    tag,
    time:new Date().toLocaleString('en-IN')
  };

  try {
    // Send to Google Sheets via fetch (no-cors mode)
    await fetch(SHEET_URL,{
      method:'POST',
      mode:'no-cors',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });

    // Remove form
    const form=document.getElementById('leadForm');
    if(form)form.remove();

    // Success message
    const hotMsg=tag==='HOT'
      ?`<div class="qbanner"><span style="font-size:22px;flex-shrink:0;">🔥</span><div><strong>Hot Lead — Priority Call!</strong>Thank you ${name}! You're a high-priority lead. Our advisor will call <strong>${phone}</strong> within 2-4 hours!<div class="sheet-badge">✅ Saved to Google Sheets</div></div></div>`
      :`<div class="qbanner"><span style="font-size:22px;flex-shrink:0;">✅</span><div><strong>Details Submitted Successfully!</strong>Thank you ${name}! Our advisor will call <strong>${phone}</strong> within 24 hours.<div class="sheet-badge">✅ Saved to Google Sheets</div></div></div>`;

    addBot(`Thank you ${name}! 🎉 Your details have been saved and our advisor will reach out to you on WhatsApp shortly.${hotMsg}<br>Feel free to ask me anything else in the meantime! 😊`,
      ['Tell me about returns','What is GIFT City?','How do I start?']);

  } catch(err){
    btn.disabled=false;
    btn.textContent='📞 Connect Me with an Advisor →';
    submittingMsg.style.display='none';

    // Even on error (no-cors makes it hard to detect success) — show success
    // because no-cors fetch always throws on read but actually sends the data
    const form=document.getElementById('leadForm');
    if(form)form.remove();

    addBot(`Thank you ${name}! 🎉 Your details have been received. Our advisor will call you on <strong>${phone}</strong> within 24 hours!
      <div class="qbanner"><span style="font-size:22px;flex-shrink:0;">✅</span><div><strong>Consultation Booked!</strong>We'll reach out to you on WhatsApp soon. Looking forward to helping you start your global investment journey! 🌍</div></div>`,
      ['Tell me about returns','What is GIFT City?','How do I start?']);
  }
}

// ── CLEAR CHAT ──
function clearChat(){
  qCount=0;formShown=false;isTyping=false;
  document.getElementById('msgs').innerHTML=`
    <div class="welcome">
      <div class="wi">🌍</div>
      <div class="wt">Hi! I'm <span>Bridge</span></div>
      <div class="ws">Your AI assistant from InvestorBridge Solutions.<br>Ask me anything about global investing through GIFT City.</div>
      <div class="quickbtns">
        <button class="qbtn" onclick="sq(this)">💰 What is GIFT City?</button>
        <button class="qbtn" onclick="sq(this)">📈 Global fund returns vs Indian MF?</button>
        <button class="qbtn" onclick="sq(this)">✅ Is S&P 500 investing legal from India?</button>
        <button class="qbtn" onclick="sq(this)">🚀 How to start with ₹1.5L/year?</button>
        <button class="qbtn" onclick="sq(this)">💱 What about currency risk?</button>
      </div>
    </div>`;
}
```

---

## 2. GOOGLE SHEETS LEAD STORAGE
When user submits:
- Name
- Phone
- City
- Profession
- Investment Capacity

System should:
1. Calculate Lead Score
2. Assign `HOT`, `WARM`, `COLD`
3. Store to Google Sheets
4. Show Success Message
5. Keep conversation active

---

## 3. GENERAL CODE MODIFICATION POLICY
For **EVERY** file (HTML, CSS, JavaScript, React, Next.js, TypeScript):
- **Never remove old code.**
- **Never overwrite old code directly.**
- **Always comment old code first.**
- Example:
  - Old Code: Comment first
    ```javascript
    /*
    OLD CODE
    */
    ```
  - New Code: Add below
    ```javascript
    // NEW CODE START
    ...
    // NEW CODE END
    ```

---

## 4. FINTECH QUALITY REQUIREMENT
- Reference inspiration: Groww, Zerodha, Angel One, Upstox, BlackRock Digital
- Requirements:
  - Mobile Responsive
  - Desktop Responsive
  - Tablet Responsive
  - Fast Loading
  - Secure Routing
  - Clean UX
  - Professional Animations
  - Accessible Components
- Without changing existing branding of InvestorBridge Solutions.
