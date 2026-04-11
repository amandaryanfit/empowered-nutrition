const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const MN=['Breakfast','Lunch','Dinner','4th Meal','5th Meal'];
const FLOOR_OFF=200,MAX_CUT=200,CAL_BUF=150,PRO_BUF=0.10;
const ADMIN_EMAIL='admin@shiftsociety.co',ADMIN_PASS='P00t3r12!';
const PANCHORS=['chicken','turkey','eggs','greek yogurt','cottage cheese','salmon','tuna','white fish','shrimp','lean beef','tofu','edamame','protein powder','lentils'];
const HTRIG={eggs:'Cooking oil or butter &#8212; eggs are almost always cooked in fat. Even 1 tsp adds ~40 calories.',scrambled:'Butter or oil for cooking',omelette:'Butter or oil &#8212; usually 1-2 tsp',fried:'Oil used for frying','stir fry':'Oil for stir frying &#8212; typically 1-2 tbsp = 120-240 calories',salad:'Dressing or olive oil &#8212; 2 tbsp adds 100-150+ calories',grilled:'Marinade, oil, or butter used for grilling',roasted:'Olive oil for roasting &#8212; typically 60-120 calories',pasta:'Olive oil, butter, or cheese',chicken:'Cooking oil or butter if pan-cooked',salmon:'Oil or butter for cooking',toast:'Butter or spread on the toast',sandwich:'Mayo, butter, or spread on bread',wrap:'Sauce or dressing inside',bowl:'Dressing, sauce, or oil'};
const QADD=[{n:'1 tsp olive oil',c:40,p:0,f:4.5},{n:'1 tbsp olive oil',c:120,p:0,f:14},{n:'1 tsp butter',c:34,p:0,f:3.8},{n:'1 tbsp butter',c:102,p:0,f:11.5},{n:'Cooking spray',c:7,p:0,f:0.7},{n:'1 tbsp dressing',c:60,p:0,f:6},{n:'1 tbsp mayo',c:94,p:0,f:10},{n:'1 oz cheese',c:110,p:7,f:9},{n:'1 tbsp peanut butter',c:94,p:4,f:8},{n:'1 tbsp tahini',c:89,p:3,f:8}];

let P={cal:0,pro:0,carb:0,fat:0,meals:3,snacks:1,units:'us',name:'',email:'',password:'',prefs:'',firstLogin:false};
let MV=[],MM={},planBuilt=false,PL={cal:1800,pro:140,carb:175,fat:65,meals:3,snacks:1};
let ebOn=false,HD=[],slV=0,DC={};
let clients=[],recipes=[],pStep=0;
let copyCtx={day:null,slot:null},copySel=[],lastRecTxt='';

function sv(){try{localStorage.setItem('ss_p',JSON.stringify(P));localStorage.setItem('ss_mv',JSON.stringify(MV));localStorage.setItem('ss_mm',JSON.stringify(MM));localStorage.setItem('ss_pb',JSON.stringify(planBuilt));localStorage.setItem('ss_pl',JSON.stringify(PL));localStorage.setItem('ss_eb',JSON.stringify({ebOn,HD,slV,DC}));localStorage.setItem('ss_cl',JSON.stringify(clients));localStorage.setItem('ss_rec',JSON.stringify(recipes));}catch(e){}}
function ld(){try{const p=localStorage.getItem('ss_p');if(p)P=JSON.parse(p);const mv=localStorage.getItem('ss_mv');if(mv)MV=JSON.parse(mv);const mm=localStorage.getItem('ss_mm');if(mm)MM=JSON.parse(mm);const pb=localStorage.getItem('ss_pb');if(pb)planBuilt=JSON.parse(pb);const pl=localStorage.getItem('ss_pl');if(pl)PL=JSON.parse(pl);const eb=localStorage.getItem('ss_eb');if(eb){const d=JSON.parse(eb);ebOn=d.ebOn;HD=d.HD||[];slV=d.slV||0;DC=d.DC||{};}const cl=localStorage.getItem('ss_cl');if(cl)clients=JSON.parse(cl);const rc=localStorage.getItem('ss_rec');if(rc)recipes=JSON.parse(rc);}catch(e){}}

function h(tag,attrs,inner){let s='<'+tag;for(const[k,v]of Object.entries(attrs||{}))s+=' '+k+'="'+String(v).replace(/"/g,'&quot;')+'"';return s+'>'+(inner||'')+'</'+tag+'>';}
function e(id){return document.getElementById(id);}
function escH(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function setHTML(id,html){const el=e(id);if(el)el.innerHTML=html;}

function buildApp(){
  const root=e('APP_ROOT');
  root.innerHTML=`
<div class="view active" id="v-login">
<div style="display:flex;flex-direction:column;min-height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;background:var(--cr)">
  <div style="padding:36px 28px 20px;display:flex;flex-direction:column;align-items:flex-start">
    <div style="margin-bottom:20px">
      <img src="/logo-light.jpg" alt="Shift Society" style="width:110px;height:auto;display:block"/>
    </div>
    <div style="color:rgba(239,200,199,.55);font-size:11px;font-family:var(--fc);letter-spacing:.1em;text-transform:uppercase">Empowered Nutrition</div>
  </div>
  <div class="login-form" style="flex:1;border-radius:28px 28px 0 0;padding:28px 24px 48px">
    <div class="login-title">Welcome back</div>
    <div class="login-sub">Sign in to your Empowered Nutrition app</div>
    <div id="login-err" class="login-err">Incorrect email or password. Try again.</div>
    <label>Email address</label>
    <input type="email" id="li-email" placeholder="you@example.com" autocomplete="email" style="margin-bottom:10px"/>
    <label>Password</label>
    <div class="pw-wrap"><input type="password" id="li-pass" placeholder="Your password"/><button class="pw-eye" onclick="togglePW('li-pass',this)" type="button">&#128065;</button></div>
    <button class="btn" onclick="doLogin()" style="margin-top:6px">Sign in</button>
    <div style="text-align:center;font-size:12px;color:var(--tp);font-family:var(--fc);cursor:pointer;margin-bottom:12px" onclick="showForgot()">Forgot password?</div>
    <div style="padding-top:14px;border-top:.5px solid var(--bl);text-align:center"><span style="font-size:11px;color:var(--tp);font-family:var(--fc)">Admin? </span><span style="font-size:11px;color:var(--cr);font-family:var(--fc);cursor:pointer" onclick="showAdmin()">Sign in here</span></div>
  </div>
</div>
</div>

<div class="view" id="v-wizard">
<div class="wz-screen">
  <div class="wz-hdr"><div class="wz-dots" id="wz-dots"></div><div class="wz-title" id="wz-title">Welcome</div><div class="wz-sub" id="wz-sub">Let's get you set up</div></div>
  <div class="wz-body" id="wz-body"></div>
</div>
</div>

<div class="view" id="v-app">
<div style="background:var(--cr);padding:44px 18px 8px;display:flex;justify-content:space-between;align-items:flex-start;flex-shrink:0">
  <div>
    <img src="/logo-light.jpg" alt="Shift Society" style="width:110px;height:auto;display:block;margin-bottom:4px"/>
    <div id="greeting" style="color:var(--pl);font-size:13px;font-family:var(--fc);line-height:1.2">Good morning,</div>
    <div id="welcome-name" style="color:#FAF8F6;font-size:20px;font-family:var(--fh);line-height:1.1"></div>
  </div>
  <div style="display:flex;align-items:center;gap:5px;margin-top:4px">
    <svg viewBox="0 0 16 12" width="13" height="10" fill="#FAF8F6" opacity=".8"><rect x="0" y="3" width="3" height="9" rx="1"/><rect x="4.5" y="2" width="3" height="10" rx="1"/><rect x="9" y="0" width="3" height="12" rx="1"/><rect x="13.5" y="1" width="2.5" height="11" rx="1" opacity=".3"/></svg>
    <div id="clock" style="color:rgba(239,200,199,.7);font-size:11px;font-family:var(--fc)">9:41</div>
  </div>
</div>
<div class="screen active" id="sc-home">
  <div class="goals-bar" style="background:linear-gradient(135deg,var(--cr) 0%,#8B1A19 100%)">
    <div class="g-hdr"><div class="g-title" id="g-title-lbl">My weekly targets</div><button class="g-edit" onclick="toggleGF()">Edit</button><button class="g-edit" onclick="nav('profile')" style="margin-left:6px">Profile</button></div>
    <div class="g-nums">
      <div class="gn"><div class="gn-v" id="g-cal">&#8212;</div><div class="gn-l">Calories</div></div>
      <div class="gn"><div class="gn-v" id="g-pro">&#8212;</div><div class="gn-l">Protein</div></div>
      <div class="gn"><div class="gn-v" id="g-carb">&#8212;</div><div class="gn-l">Carbs</div></div>
      <div class="gn"><div class="gn-v" id="g-fat">&#8212;</div><div class="gn-l">Fat</div></div>
    </div>
    <div class="g-form" id="g-form">
      <div class="gf-grid">
        <div><div class="gf-l">Daily calories</div><input class="gf-i" type="number" id="gf-cal" placeholder="1800" min="1"/></div>
        <div><div class="gf-l">Protein (g)</div><input class="gf-i" type="number" id="gf-pro" placeholder="140" min="1"/></div>
        <div><div class="gf-l">Carbs (g)</div><input class="gf-i" type="number" id="gf-carb" placeholder="175" min="1"/></div>
        <div><div class="gf-l">Fat (g)</div><input class="gf-i" type="number" id="gf-fat" placeholder="65" min="1"/></div>
      </div>
      <button class="gf-save" onclick="saveGoals()">Save goals</button>
    </div>
  </div>
  <div class="body">
    <div class="sl">Quick actions</div>
    <div class="qstrip">
      <div class="qc pr" ontouchstart="showQC('pl')" ontouchend="hideQCd('pl')" onmouseenter="showQC('pl')" onmouseleave="hideQC('pl')" onclick="nav('planner')">
        <div class="qc-ico"><svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 8h-2v2H8v2h2v2h2v-2h2v-2h-2z"/></svg></div>
        <div class="qc-t">Meal planner</div><div class="qc-s">Map your week in 15 min</div>
        <div class="qc-pv" id="qcp-pl"><div class="pv-t">What it does</div><ul class="pv-l"><li>Full daily meal mapping</li><li>Empowered Balance mode</li><li>Auto macro estimates</li><li>Grocery list + MFP log</li></ul></div>
      </div>
      <div class="qc" ontouchstart="showQC('an')" ontouchend="hideQCd('an')" onmouseenter="showQC('an')" onmouseleave="hideQC('an')" onclick="nav('analyze')">
        <div class="qc-ico"><svg viewBox="0 0 24 24"><path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z"/></svg></div>
        <div class="qc-t">Analyze food</div><div class="qc-s">Photo, menu, or describe</div>
        <div class="qc-pv" id="qcp-an"><div class="pv-t">What it does</div><ul class="pv-l"><li>Describe or photo any meal</li><li>Full macro breakdown</li><li>Micronutrient callouts</li><li>Eating out mode</li></ul></div>
      </div>
    </div>
    <div class="sl">All features</div>
    <div class="agrid">
      <div class="aic" ontouchstart="showTT('mac')" ontouchend="hideTTd('mac')" onmouseenter="showTT('mac')" onmouseleave="hideTT('mac')" onclick="nav('macros')"><div class="ic icm"><div class="tt" id="tt-mac"><div class="tt-t">Day Planner</div><ul class="tt-l"><li>Set per-meal targets</li><li>Track over/under live</li><li>See daily totals</li></ul></div><svg viewBox="0 0 24 24" width="30" height="30" fill="#6E1514"><path d="M9 11H7v6h2v-6zm4-4h-2v10h2V7zm4 8h-2v2h2v-2zm0-4h-2v2h2v-2z"/></svg></div><div class="ic-lbl">Day Planner</div></div>
      <div class="aic" ontouchstart="showTT('gro')" ontouchend="hideTTd('gro')" onmouseenter="showTT('gro')" onmouseleave="hideTT('gro')" onclick="nav('grocery')"><div class="ic icg"><div class="tt" id="tt-gro"><div class="tt-t">My Grocery List</div><ul class="tt-l"><li>Auto-built from your plan</li><li>Organized by section</li><li>Protein weights included</li></ul></div><svg viewBox="0 0 24 24" width="30" height="30" fill="#4a3a10"><path d="M9 9h10l-2.5 4.5H11L9 9zm0-2l2.2 4H19l1.5-4H9z"/></svg></div><div class="ic-lbl">My Grocery List</div></div>
      <div class="aic" ontouchstart="showTT('rec')" ontouchend="hideTTd('rec')" onmouseenter="showTT('rec')" onmouseleave="hideTT('rec')" onclick="nav('recipe')"><div class="ic icrc"><div class="tt" id="tt-rec"><div class="tt-t">Recipe analyzer</div><ul class="tt-l"><li>Paste ingredients</li><li>Get full macros</li><li>Smart modifications</li></ul></div><svg viewBox="0 0 24 24" width="30" height="30" fill="#3a2e10"><path d="M11 12.5c0 .83-.67 1.5-1.5 1.5S8 13.33 8 12.5 8.67 11 9.5 11s1.5.67 1.5 1.5z"/><path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05z"/></svg></div><div class="ic-lbl">Recipe</div></div>
      <div class="aic" ontouchstart="showTT('mfp')" ontouchend="hideTTd('mfp')" onmouseenter="showTT('mfp')" onmouseleave="hideTT('mfp')" onclick="nav('mfp')"><div class="ic icf"><div class="tt" id="tt-mfp"><div class="tt-t">MFP Assistant</div><ul class="tt-l"><li>Step-by-step logging help</li><li>Tap to check off as you log</li><li>Built from your meal plan</li></ul></div><svg viewBox="0 0 24 24" width="30" height="30" fill="#3a1a3a"><path d="M9 17l-5-5 1.41-1.41L9 14.17l7.59-7.59L18 8l-9 9z"/></svg></div><div class="ic-lbl">MFP Assistant</div></div>
      <div class="aic" ontouchstart="showTT('fix')" ontouchend="hideTTd('fix')" onmouseenter="showTT('fix')" onmouseleave="hideTT('fix')" onclick="nav('fix')"><div class="ic icx"><div class="tt" id="tt-fix"><div class="tt-t">Fix my day</div><ul class="tt-l"><li>Log what you ate</li><li>Plan rest of day</li><li>Land close to target</li></ul></div><svg viewBox="0 0 24 24" width="30" height="30" fill="#6E1514"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg></div><div class="ic-lbl">Fix my day</div></div>
      <div class="aic" ontouchstart="showTT('rep')" ontouchend="hideTTd('rep')" onmouseenter="showTT('rep')" onmouseleave="hideTT('rep')" onclick="nav('report')"><div class="ic icr"><div class="tt" id="tt-rep"><div class="tt-t">Insights</div><ul class="tt-l"><li>Review your actual week</li><li>Weekly average method</li><li>One focus for next week</li></ul></div><svg viewBox="0 0 24 24" width="30" height="30" fill="#10353a"><path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/></svg></div><div class="ic-lbl">Insights</div></div>
      <div class="aic" ontouchstart="showTT('myrec')" ontouchend="hideTTd('myrec')" onmouseenter="showTT('myrec')" onmouseleave="hideTT('myrec')" onclick="nav('myrecipes')"><div class="ic icrec"><div class="tt" id="tt-myrec"><div class="tt-t">My recipes</div><ul class="tt-l"><li>Save your go-to meals</li><li>Browse for inspo</li><li>Use in meal map</li></ul></div><svg viewBox="0 0 24 24" width="30" height="30" fill="#4a1a4a"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 14H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V6h8v2z"/></svg></div><div class="ic-lbl">My recipes</div></div>
    </div>
    <div class="sl">Weekly insights</div>
    <div id="ins-no-plan" class="ins-card neutral"><div class="ins-hdr"><div class="ins-dot neutral"></div><div class="ins-lbl neutral">No plan yet this week</div></div><div class="ins-msg neutral">Your weekly insights live here. Map your week first and I'll review your plan.</div><div class="ins-act neutral" onclick="toggleCI()">Check my plan numbers &#8594;</div></div>
    <div id="ins-good" class="ins-card good" style="display:none"><div class="ins-hdr"><div class="ins-dot good"></div><div class="ins-lbl good">Looking strong</div></div><div class="ins-msg good" id="ins-good-msg"></div><div class="ins-act good" id="ins-good-act"></div></div>
    <div id="ins-cl" class="ins-card warn" style="display:none"><div class="ins-hdr"><div class="ins-dot warn"></div><div class="ins-lbl warn">Calories too low</div></div><div class="ins-msg warn" id="ins-cl-msg"></div><div class="ins-act warn" id="ins-cl-act"></div></div>
    <div id="ins-ch" class="ins-card warn" style="display:none"><div class="ins-hdr"><div class="ins-dot warn"></div><div class="ins-lbl warn">Calories a bit high</div></div><div class="ins-msg warn" id="ins-ch-msg"></div><div class="ins-act warn" id="ins-ch-act"></div></div>
    <div id="ins-pl" class="ins-card info" style="display:none"><div class="ins-hdr"><div class="ins-dot info"></div><div class="ins-lbl info">Protein gap</div></div><div class="ins-msg info" id="ins-pl-msg"></div><div class="ins-act info" id="ins-pl-act"></div></div>
    <div id="ci-wrap" style="display:none"><div class="card" style="background:var(--bl);border-color:var(--pm)">
      <div style="font-size:10px;font-family:var(--fc);color:var(--tp);text-transform:uppercase;letter-spacing:.1em;margin-bottom:9px">Plan averages this week</div>
      <div class="r2"><div><label>Avg daily calories</label><input type="number" id="ci-cal" placeholder="e.g. 1650"/></div><div><label>Avg protein (g)</label><input type="number" id="ci-pro" placeholder="e.g. 118"/></div></div>
      <div class="r2"><div><label>Calorie target</label><input type="number" id="ci-ct"/></div><div><label>Protein target (g)</label><input type="number" id="ci-pt"/></div></div>
      <button class="btn" onclick="evalIns()">Show my insights</button>
    </div></div>
  </div>

</div>
<div class="screen" id="sc-analyze"><div class="sh"><div class="sh-row"><button class="sh-back" onclick="nav('home')">&#8592; Home</button><div><div class="sh-title">Analyze food</div><div class="sh-sub">Describe, photo, or eating out</div></div></div></div><div class="body" id="body-analyze"></div></div>
<div class="screen" id="sc-macros"><div class="sh"><div class="sh-row"><button class="sh-back" onclick="nav('home')">&#8592; Home</button><div><div class="sh-title">Day Planner</div><div class="sh-sub">Build your day meal by meal</div></div></div></div><div class="body" id="body-macros"></div></div>
<div class="screen" id="sc-planner"><div class="sh"><div class="sh-row"><button class="sh-back" id="plan-back-btn" onclick="planBack()">&#8592; Home</button><div><div class="sh-title">Meal planner</div><div class="sh-sub">15-Minute Meal Map</div></div></div></div><div class="body" id="body-planner"></div></div>
<div class="screen" id="sc-grocery"><div class="sh"><div class="sh-row"><button class="sh-back" onclick="nav('home')">&#8592; Home</button><div><div class="sh-title">My Grocery List</div><div class="sh-sub">Built from your meal plan</div></div></div></div><div class="body"><div id="gro-content"></div></div></div>
<div class="screen" id="sc-mfp"><div class="sh"><div class="sh-row"><button class="sh-back" onclick="nav('home')">&#8592; Home</button><div><div class="sh-title">MFP Assistant</div><div class="sh-sub">Your personal logging guide</div></div></div></div><div class="body" id="body-mfp"></div></div>
<div class="screen" id="sc-recipe"><div class="sh"><div class="sh-row"><button class="sh-back" onclick="nav('home')">&#8592; Home</button><div><div class="sh-title">Recipe analyzer</div><div class="sh-sub">Paste ingredients to analyze</div></div></div></div><div class="body" id="body-recipe"></div></div>
<div class="screen" id="sc-myrecipes"><div class="sh"><div class="sh-row"><button class="sh-back" onclick="nav('home')">&#8592; Home</button><div><div class="sh-title">My recipes</div><div class="sh-sub">Saved meals and inspo</div></div></div></div><div class="body" id="body-myrecipes"></div></div>
<div class="screen" id="sc-fix"><div class="sh"><div class="sh-row"><button class="sh-back" onclick="nav('home')">&#8592; Home</button><div><div class="sh-title">Fix my day</div><div class="sh-sub">Get back on track</div></div></div></div><div class="body" id="body-fix"></div></div>
<div class="screen" id="sc-report"><div class="sh"><div class="sh-row"><button class="sh-back" onclick="nav('home')">&#8592; Home</button><div><div class="sh-title">Weekly insights</div><div class="sh-sub">Your plan at a glance</div></div></div></div><div class="body" id="body-report"></div></div>
<div class="screen" id="sc-profile"><div class="sh"><div class="sh-row"><button class="sh-back" onclick="nav('home')">&#8592; Home</button><div><div class="sh-title">My profile</div><div class="sh-sub">Settings and targets</div></div></div></div><div class="body" id="body-profile"></div></div>
</div>

<div class="view" id="v-admin">
<div class="admin-view"><div class="adm-wrap">
  <div class="adm-header"><div><img src="/logo-dark.jpg" alt="Shift Society" style="width:120px;height:auto;display:block;margin-bottom:4px"/><div class="adm-sub" style="color:var(--pl)">Admin dashboard</div></div><button class="adm-btn" onclick="showLogin()">Sign out</button></div>
  <div class="adm-card"><div class="adm-ct">Active clients</div><div id="client-list"></div>
    <button class="btn btn-g btn-sm" style="margin-top:12px" onclick="toggleAddForm()">+ Add new client</button>
    <div class="add-form" id="add-form">
      <div class="r2"><div><label>Client name</label><input type="text" id="af-name" placeholder="Sarah Johnson"/></div><div><label>Email</label><input type="email" id="af-email" placeholder="sarah@email.com"/></div></div>
      <div class="r2"><div><label>Daily calories</label><input type="number" id="af-cal" placeholder="1800" min="1"/></div><div><label>Protein (g)</label><input type="number" id="af-pro" placeholder="140" min="1"/></div></div>
      <div class="r2"><div><label>Carbs (g)</label><input type="number" id="af-carb" placeholder="175" min="1"/></div><div><label>Fat (g)</label><input type="number" id="af-fat" placeholder="65" min="1"/></div></div>
      <button class="btn" onclick="addClient()">Create account</button>
    </div>
  </div>
  <div class="adm-card"><div class="adm-ct">Team access</div>
    <div style="font-size:13px;color:var(--mu);margin-bottom:10px;font-weight:300">Invite a VA or team member to access the admin dashboard.</div>
    <div class="r2"><div><label>Name</label><input type="text" id="tm-name" placeholder="Team member name"/></div><div><label>Email</label><input type="email" id="tm-email" placeholder="va@email.com"/></div></div>
    <button class="btn btn-g btn-sm" onclick="inviteTeam()">Send invite</button>
  </div>
</div></div>
</div>

<div class="copy-modal" id="copy-modal" style="display:none" onclick="closeCopyModal()">
  <div class="copy-modal-body" onclick="event.stopPropagation()">
    <div class="copy-modal-title" id="copy-modal-title">Copy to which days?</div>
    <div id="copy-day-list"></div>
    <div style="display:flex;gap:8px;margin-top:14px"><button class="btn btn-g" onclick="closeCopyModal()" style="flex:1;margin-bottom:0">Cancel</button><button class="btn" onclick="applyCopy()" style="flex:1;margin-bottom:0">Copy</button></div>
  </div>
</div>`;
}

function tick(){const n=new Date();let h=n.getHours(),m=n.getMinutes();const ap=h>=12?'PM':'AM';h=h%12||12;const el=e('clock');if(el)el.textContent=h+':'+(m<10?'0':'')+m+' '+ap;const gr=n.getHours();const g=e('greeting');if(g)g.textContent=gr<12?'Good morning,':gr<17?'Good afternoon,':'Good evening,';const wn=e('welcome-name');if(wn){const fn=P.name?P.name.split(' ')[0]:'';wn.textContent=fn;}}
function togglePW(elOrId,btn){const inp=typeof elOrId==='string'?e(elOrId):elOrId;if(!inp)return;inp.type=inp.type==='password'?'text':'password';btn.textContent=inp.type==='password'?'👁':'🔒';}
function showV(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));const el=e('v-'+id);if(el)el.classList.add('active');}
function showLogin(){P={cal:0,pro:0,carb:0,fat:0,meals:3,snacks:1,units:'us',name:'',email:'',password:'',prefs:'',firstLogin:false};showV('login');}
function showAdmin(){ld();showV('admin');renderClients();}
function showForgot(){alert('In the hosted app with Firebase, a password reset email would be sent automatically.\n\nFor now, contact Amanda to reset your password.');}
function doLogout(){showLogin();}

function doLogin(){
  const email=e('li-email').value.trim().toLowerCase();
  const pass=e('li-pass').value;
  if(email===ADMIN_EMAIL.toLowerCase()&&pass===ADMIN_PASS){showAdmin();return;}
  ld();
  const client=clients.find(c=>c.email.toLowerCase()===email&&c.password===pass);
  if(client){
    P={...P,...client.profile,name:client.name,email:client.email,password:client.password,firstLogin:!client.hasLoggedIn,prefs:client.prefs||''};
    client.hasLoggedIn=true;client.lastActive=new Date().toISOString();
    clients=clients.map(c=>c.email.toLowerCase()===email?client:c);sv();
    e('login-err').style.display='none';
    if(P.firstLogin)showWizard();else{showV('app');updG();nav('home');}
  }else{e('login-err').style.display='block';}
}

let wzS=0;
function showWizard(){wzS=0;showV('wizard');renderWZ();}
function renderWZ(){
  const steps=5;let dots='';for(let i=0;i<steps;i++)dots+='<div class="wz-dot'+(i===wzS?' active':'')+'"></div>';
  setHTML('wz-dots',dots);
  const titles=['Welcome','Your targets','Meals & snacks','Preferences',"You're all set"];
  const subs=["Let's get you set up","Pre-set by Amanda &#8212; confirm or adjust","How you like to eat","Almost done","Everything is ready"];
  e('wz-title').textContent=wzS===0?('Welcome, '+(P.name||'there')):titles[wzS];
  e('wz-sub').innerHTML=subs[wzS];
  let b='';
  if(wzS===0){b='<div style="text-align:center;padding:20px 0"><div style="width:74px;height:74px;border-radius:50%;background:var(--bl);border:2px solid var(--pm);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;font-family:var(--fh);color:var(--cr)">'+(P.name||'?')[0].toUpperCase()+'</div><div style="font-size:22px;font-family:var(--fh);color:var(--tx);margin-bottom:8px">'+(P.name||'Welcome')+'</div><div style="font-size:13px;color:var(--mu);line-height:1.65;font-weight:300;margin-bottom:24px">This is your personal Empowered Nutrition app, built around your specific targets and the Shift Society key frameworks.</div></div><button class="btn" onclick="wzS=1;renderWZ()">Get started &#8594;</button>';}
  else if(wzS===1){b='<div class="flag f-t" style="margin-bottom:14px"><i>&#128161;</i><span>These were set by Amanda. You can adjust them here or update them anytime in your profile.</span></div><div class="r2"><div><label>Daily calories</label><input type="number" id="wz-cal" value="'+(P.cal||'')+'" placeholder="1800" min="1"/></div><div><label>Protein (g)</label><input type="number" id="wz-pro" value="'+(P.pro||'')+'" placeholder="140" min="1"/></div></div><div class="r2"><div><label>Carbs (g)</label><input type="number" id="wz-carb" value="'+(P.carb||'')+'" placeholder="175" min="1"/></div><div><label>Fat (g)</label><input type="number" id="wz-fat" value="'+(P.fat||'')+'" placeholder="65" min="1"/></div></div><button class="btn" onclick="saveWZT()">Confirm targets &#8594;</button>';}
  else if(wzS===2){b='<label style="font-size:13px;font-family:var(--fs);color:var(--tx);margin-bottom:9px;display:block">How many meals per day?</label><div class="tog-row">'+[3,4,5].map(n=>'<button class="tog'+((P.meals||3)==n?' on':'')+'" onclick="P.meals='+n+';this.parentElement.querySelectorAll(\'.tog\').forEach(t=>t.classList.remove(\'on\'));this.classList.add(\'on\')">'+n+'</button>').join('')+'</div><label style="font-size:13px;font-family:var(--fs);color:var(--tx);margin-bottom:9px;display:block;margin-top:10px">Snacks per day?</label><div class="tog-row">'+[0,1,2].map(n=>'<button class="tog'+((P.snacks||1)==n?' on':'')+'" onclick="P.snacks='+n+';this.parentElement.querySelectorAll(\'.tog\').forEach(t=>t.classList.remove(\'on\'));this.classList.add(\'on\')">'+n+'</button>').join('')+'</div><button class="btn" style="margin-top:16px" onclick="sv();wzS=3;renderWZ()">Next &#8594;</button><button class="btn btn-g" onclick="wzS=1;renderWZ()">&#8592; Back</button>';}
  else if(wzS===3){
  var uOn=(P.units||'us')==='us';
  var mOn=P.units==='metric';
  b='<label style="font-size:13px;font-family:var(--fs);color:var(--tx);margin-bottom:9px;display:block">Preferred units</label>'
  +'<div class="tog-row">'
  +'<button class="tog'+(uOn?' on':'')+'" id="wz-us" onclick="P.units=\'us\';this.classList.add(\'on\');e(\'wz-met\').classList.remove(\'on\')">US (cups/oz)</button>'
  +'<button class="tog'+(mOn?' on':'')+'" id="wz-met" onclick="P.units=\'metric\';this.classList.add(\'on\');e(\'wz-us\').classList.remove(\'on\')">Metric (g/ml)</button>'
  +'</div>'
  +'<label style="font-size:13px;font-family:var(--fs);color:var(--tx);margin-bottom:9px;display:block;margin-top:10px">Any dietary preferences?</label>'
  +'<input type="text" id="wz-prefs" placeholder="e.g. gluten-free, no pork..." value="'+(P.prefs||'')+'"/>'
  +'<button class="btn" style="margin-top:6px" onclick="const pr=e(\'wz-prefs\');if(pr)P.prefs=pr.value;P.firstLogin=false;sv();wzS=4;renderWZ()">Save and continue &#8594;</button>'
  +'<button class="btn btn-g" onclick="wzS=2;renderWZ()">&#8592; Back</button>';
}
  else{b='<div style="text-align:center;padding:20px 0"><div style="font-size:52px;margin-bottom:14px;color:var(--sg)">&#10003;</div><div style="font-size:20px;font-family:var(--fh);color:var(--sg);margin-bottom:8px">You\'re all set</div><div style="font-size:13px;color:var(--mu);line-height:1.65;font-weight:300;margin-bottom:26px">Your app is ready. Start by mapping your week in the Meal Planner &#8212; protein anchors first, always.</div><button class="btn" onclick="showV(\'app\');updG();nav(\'home\')">Go to my app &#8594;</button></div>';}
  setHTML('wz-body',b);
}
function saveWZT(){const cal=parseInt((e('wz-cal')||{}).value)||0;if(cal<1){alert('Please enter a valid calorie target.');return;}P.cal=cal;P.pro=parseInt((e('wz-pro')||{}).value)||0;P.carb=parseInt((e('wz-carb')||{}).value)||0;P.fat=parseInt((e('wz-fat')||{}).value)||0;sv();wzS=2;renderWZ();}

function nav(id){
  document.querySelectorAll('#v-app .screen').forEach(s=>s.classList.remove('active'));
  const sc=e('sc-'+id);if(!sc)return;sc.classList.add('active');
  document.querySelectorAll('.dt').forEach(d=>d.classList.remove('active-dock'));
  const dk=e('dk-'+id);if(dk)dk.classList.add('active-dock');
  const body=sc.querySelector('.body');if(body)body.scrollTop=0;
  if(id==='macros')buildMacros();
  if(id==='grocery')buildGrocery();
  if(id==='mfp')buildMFP();
  if(id==='report')buildReportDays();
  if(id==='planner'){buildPlannerHTML();initSegs();syncPlanner();showPS(0);}
  if(id==='profile')buildProfile();
  if(id==='myrecipes')buildRecipesList();
  if(id==='analyze')buildAnalyzeHTML();
  if(id==='recipe')buildRecipeHTML();
  if(id==='fix')buildFixHTML();
  sv();
}
function planBack(){if(pStep===0)nav('home');else pNext(pStep-1);}

function showQC(id){const el=e('qcp-'+id);if(el)el.classList.add('show');}
function hideQC(id){const el=e('qcp-'+id);if(el)el.classList.remove('show');}
function hideQCd(id){setTimeout(()=>hideQC(id),300);}
function showTT(id){const el=e('tt-'+id);if(el)el.classList.add('show');}
function hideTT(id){const el=e('tt-'+id);if(el)el.classList.remove('show');}
function hideTTd(id){setTimeout(()=>hideTT(id),300);}

function toggleGF(){e('g-form').classList.toggle('show');}
function saveGoals(){const c=parseInt((e('gf-cal')||{}).value)||0;if(c<1){alert('Please enter a valid calorie target.');return;}P.cal=c;P.pro=parseInt((e('gf-pro')||{}).value)||0;P.carb=parseInt((e('gf-carb')||{}).value)||0;P.fat=parseInt((e('gf-fat')||{}).value)||0;updG();e('g-form').classList.remove('show');MV=Array(P.meals+P.snacks).fill(null).map(()=>({p:0,c:0,f:0}));sv();}
function updG(){['cal','pro','carb','fat'].forEach(k=>{const el=e('g-'+k);if(el)el.textContent=P[k]?(P[k]+(k!=='cal'?'g':'')):'&#8212;';});if(P.cal){const gc=e('gf-cal');if(gc)gc.value=P.cal;const ct=e('ci-ct');if(ct)ct.value=P.cal;}if(P.pro){const gp=e('gf-pro');if(gp)gp.value=P.pro;const pt=e('ci-pt');if(pt)pt.value=P.pro;}if(P.carb){const gc2=e('gf-carb');if(gc2)gc2.value=P.carb;}if(P.fat){const gf=e('gf-fat');if(gf)gf.value=P.fat;}}
function toggleCI(){const el=e('ci-wrap');el.style.display=el.style.display==='none'?'block':'none';}
function evalIns(){
  const aC=parseInt((e('ci-cal')||{}).value)||0;const aP=parseInt((e('ci-pro')||{}).value)||0;
  const ct=parseInt((e('ci-ct')||{}).value)||P.cal||0;const pt=parseInt((e('ci-pt')||{}).value)||P.pro||0;
  if(!aC&&!aP)return;const cd=aC-ct;
  ['ins-no-plan','ins-good','ins-cl','ins-ch','ins-pl'].forEach(i=>{const el=e(i);if(el)el.style.display='none';});
  e('ci-wrap').style.display='none';
  if(ct>0&&cd<-CAL_BUF){const m=e('ins-cl-msg'),a=e('ins-cl-act'),el=e('ins-cl');if(m)m.textContent='Your plan is averaging '+aC+' calories &#8212; your body needs more fuel than this to do what you\'re asking it to do. You\'re '+Math.round(ct-aC)+' calories under your target each day.';if(a)a.textContent='Add a protein-based snack you\'re currently skipping, or bump up your lunch portions.';if(el)el.style.display='block';}
  else if(ct>0&&cd>CAL_BUF){const m=e('ins-ch-msg'),a=e('ins-ch-act'),el=e('ins-ch');if(m)m.textContent='Calories are averaging '+aC+' &#8212; that\'s '+Math.round(cd)+' over your target per day.';if(a)a.textContent='Look at where carbs or fat are running heavy. Usually one meal is the culprit.';if(el)el.style.display='block';}
  else if(pt>0&&aP<pt*(1-PRO_BUF)){const m=e('ins-pl-msg'),a=e('ins-pl-act'),el=e('ins-pl');if(m)m.textContent='Protein is averaging '+aP+'g and your target is '+pt+'g. That\'s a '+Math.round(pt-aP)+'g gap per day.';if(a)a.textContent='Anchor your lunch with a real protein source, not a side of it.';if(el)el.style.display='block';}
  else{const m=e('ins-good-msg'),a=e('ins-good-act'),el=e('ins-good');if(m)m.textContent='You hit your protein goal perfectly this week. Proud of you.';if(a)a.textContent='Keep the same structure next week.';if(el)el.style.display='block';}
  sv();
}

function buildProfile(){
  var body=e("body-profile");if(!body)return;
  var init=(P.name||"?").split(" ").map(function(n){return n[0];}).join("").slice(0,2).toUpperCase();
  var uOn=(P.units||"us")==="us";
  var mOn=P.units==="metric";
  var html="";
  html+='<div style="text-align:center;padding:20px 0 8px">';
  html+='<div style="width:72px;height:72px;border-radius:50%;background:var(--bl);border:2px solid var(--pm);display:flex;align-items:center;justify-content:center;font-size:26px;font-family:var(--fh);color:var(--cr);margin:0 auto 12px">'+init+"</div>";
  html+='<div style="font-size:20px;font-family:var(--fh);color:var(--tx);margin-bottom:4px">'+escH(P.name)+"</div>";
  html+='<div style="font-size:12px;color:var(--mu);font-family:var(--fc);margin-bottom:20px">'+escH(P.email)+"</div></div>";
  html+='<div class="psec"><div class="psec-t">Account</div><div class="card">';
  html+='<label>Name</label><input type="text" id="pf-name" value="'+escH(P.name)+'"/>';
  html+='<label>Email</label><input type="email" id="pf-email" value="'+escH(P.email)+'"/>';
  html+='<button class="btn btn-sm btn-g" onclick="savePfBasic()" style="margin-top:4px">Save changes</button>';
  html+="</div></div>";
  html+='<div class="psec"><div class="psec-t">Change password</div><div class="card">';
  html+='<label>Current password</label>';
  html+='<div class="pw-wrap" style="margin-bottom:10px"><input type="password" id="pf-pw-cur" style="margin-bottom:0"/>';
  html+='<button class="pw-eye" type="button" onclick="pfToggle(this)">&#128065;</button></div>';
  html+='<label>New password</label>';
  html+='<div class="pw-wrap" style="margin-bottom:10px"><input type="password" id="pf-pw-new" style="margin-bottom:0"/>';
  html+='<button class="pw-eye" type="button" onclick="pfToggle(this)">&#128065;</button></div>';
  html+='<label>Confirm new password</label>';
  html+='<div class="pw-wrap" style="margin-bottom:10px"><input type="password" id="pf-pw-con" style="margin-bottom:0"/>';
  html+='<button class="pw-eye" type="button" onclick="pfToggle(this)">&#128065;</button></div>';
  html+='<div id="pw-err" style="font-size:12px;color:var(--dn);margin-bottom:8px;display:none"></div>';
  html+='<div id="pw-ok" style="font-size:12px;color:var(--sg);margin-bottom:8px;display:none">Password updated.</div>';
  html+='<button class="btn btn-sm btn-g" onclick="changePW()">Update password</button>';
  html+="</div></div>";
  html+='<div class="psec"><div class="psec-t">Macro targets</div><div class="card">';
  html+='<div class="flag f-t" style="margin-bottom:10px"><i>&#128161;</i><span style="font-size:12px">Update these whenever Amanda adjusts your plan.</span></div>';
  html+='<div class="r2"><div><label>Daily calories</label><input type="number" id="pf-cal" value="'+(P.cal||"")+'" min="1"/></div>';
  html+='<div><label>Protein (g)</label><input type="number" id="pf-pro" value="'+(P.pro||"")+'" min="1"/></div></div>';
  html+='<div class="r2"><div><label>Carbs (g)</label><input type="number" id="pf-carb" value="'+(P.carb||"")+'" min="1"/></div>';
  html+='<div><label>Fat (g)</label><input type="number" id="pf-fat" value="'+(P.fat||"")+'" min="1"/></div></div>';
  html+='<div class="r2"><div><label>Meals/day</label><select id="pf-meals">';
  html+='<option value="3"'+(P.meals==3?" selected":"")+">3</option>";
  html+='<option value="4"'+(P.meals==4?" selected":"")+">4</option>";
  html+='<option value="5"'+(P.meals==5?" selected":"")+">5</option>";
  html+="</select></div>";
  html+='<div><label>Snacks/day</label><select id="pf-snacks">';
  html+='<option value="0"'+(P.snacks==0?" selected":"")+">0</option>";
  html+='<option value="1"'+(P.snacks==1?" selected":"")+">1</option>";
  html+='<option value="2"'+(P.snacks==2?" selected":"")+">2</option>";
  html+="</select></div></div>";
  html+='<button class="btn btn-sm btn-g" onclick="savePfMacros()" style="margin-top:4px">Save targets</button>';
  html+="</div></div>";
  html+='<div class="psec"><div class="psec-t">Preferences</div><div class="card">';
  html+="<label>Units</label>";
  html+='<div class="tog-row" style="margin-bottom:12px">';
  html+='<button class="tog'+(uOn?" on":"")+'" id="pf-us" onclick="pfUnits(this,\'us\')">US (cups/oz)</button>';
  html+='<button class="tog'+(mOn?" on":"")+'" id="pf-met" onclick="pfUnits(this,\'metric\')">Metric (g/ml)</button>';
  html+="</div>";
  html+="<label>Dietary preferences</label>";
  html+='<input type="text" id="pf-prefs" value="'+escH(P.prefs||"")+'" placeholder="e.g. gluten-free, no pork..."/>';
  html+='<button class="btn btn-sm btn-g" onclick="savePfPrefs()">Save preferences</button>';
  html+="</div></div>";
  html+='<div style="padding:10px 0 20px;text-align:center">';
  html+='<button class="btn btn-g" onclick="doLogout()" style="border-color:var(--dn);color:var(--dn)">Sign out</button>';
  html+="</div>";
  body.innerHTML=html;
}
function pfToggle(btn){var inp=btn.previousElementSibling;inp.type=inp.type==="password"?"text":"password";btn.textContent=inp.type==="password"?"👁":"🔒";}
function pfUnits(btn,val){P.units=val;document.querySelectorAll("#pf-us,#pf-met").forEach(function(b){b.classList.remove("on");});btn.classList.add("on");sv();}
function savePfPrefs(){P.prefs=(e("pf-prefs")||{}).value||"";sv();alert("Saved.");}

function savePfBasic(){P.name=(e('pf-name')||{}).value||P.name;P.email=(e('pf-email')||{}).value||P.email;const c=clients.find(x=>x.email.toLowerCase()===P.email.toLowerCase());if(c){c.name=P.name;clients=clients.map(x=>x.email.toLowerCase()===P.email.toLowerCase()?c:x);}sv();buildProfile();alert('Profile updated.');}
function changePW(){const cur=(e('pf-pw-cur')||{}).value,nw=(e('pf-pw-new')||{}).value,con=(e('pf-pw-con')||{}).value;const err=e('pw-err'),ok=e('pw-ok');if(err)err.style.display='none';if(ok)ok.style.display='none';if(cur!==P.password){if(err){err.textContent='Current password is incorrect.';err.style.display='block';}return;}if(nw.length<6){if(err){err.textContent='New password must be at least 6 characters.';err.style.display='block';}return;}if(nw!==con){if(err){err.textContent="Passwords don't match.";err.style.display='block';}return;}P.password=nw;const c=clients.find(x=>x.email.toLowerCase()===P.email.toLowerCase());if(c){c.password=nw;clients=clients.map(x=>x.email.toLowerCase()===P.email.toLowerCase()?c:x);}sv();if(ok)ok.style.display='block';['pf-pw-cur','pf-pw-new','pf-pw-con'].forEach(function(id){const el=e(id);if(el)el.value='';});}
function savePfMacros(){const cal=parseInt((e('pf-cal')||{}).value)||0;if(cal<1){alert('Please enter a valid calorie target.');return;}P.cal=cal;P.pro=parseInt((e('pf-pro')||{}).value)||P.pro;P.carb=parseInt((e('pf-carb')||{}).value)||P.carb;P.fat=parseInt((e('pf-fat')||{}).value)||P.fat;P.meals=parseInt((e('pf-meals')||{}).value)||P.meals;P.snacks=parseInt((e('pf-snacks')||{}).value)||P.snacks;const c=clients.find(x=>x.email.toLowerCase()===P.email.toLowerCase());if(c){c.profile={cal:P.cal,pro:P.pro,carb:P.carb,fat:P.fat,meals:P.meals,snacks:P.snacks};clients=clients.map(x=>x.email.toLowerCase()===P.email.toLowerCase()?c:x);}updG();sv();alert('Targets saved.');}

function buildPlannerHTML(){
  const bp=e('body-planner');if(!bp)return;
  bp.innerHTML='<div class="step-bar" id="plan-segs"></div>'
  +'<div class="pstep active" id="ps-0"><div class="sl">Step 1 &#8212; Targets</div><div class="card" style="background:var(--bl);border-color:var(--pm)"><div class="cb">These drive your meal breakdown, Empowered Balance, and the completion check.</div></div><div class="r2"><div><label>Daily calories</label><input type="number" id="p-cal" placeholder="1800" min="1"/></div><div><label>Protein (g)</label><input type="number" id="p-pro" placeholder="140" min="1"/></div></div><div class="r2"><div><label>Carbs (g)</label><input type="number" id="p-carb" placeholder="175" min="1"/></div><div><label>Fat (g)</label><input type="number" id="p-fat" placeholder="65" min="1"/></div></div><div class="r2"><div><label>Meals/day</label><select id="p-meals"><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></div><div><label>Snacks/day</label><select id="p-snacks"><option value="0">0</option><option value="1">1</option><option value="2">2</option></select></div></div><button class="btn" onclick="pNext(1)">Next &#8212; Empowered Balance &#8594;</button></div>'
  +'<div class="pstep" id="ps-1"><div class="sl">Step 2 &#8212; Empowered Balance</div><div id="eb-tc" style="border-radius:15px;border:1.5px solid var(--bd);padding:14px;background:#fff;margin-bottom:11px"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px"><div style="flex:1"><div style="font-size:14px;font-family:var(--fs);color:var(--tx);margin-bottom:6px">Empowered Balance</div><div style="font-size:12px;color:var(--mu);line-height:1.6;font-weight:300">Enabling Empowered Balance mode allows you to plan for higher or lower calorie days in your week and auto-adjusts your macros on the other days. Switch it ON if you plan to have higher calorie days (i.e. the weekend) or keep it OFF if you plan to eat pretty much the same amount daily.</div></div><button class="sw" id="eb-sw" onclick="toggleEB()"></button></div><div id="eb-bd" style="display:none;margin-top:13px;padding-top:13px;border-top:.5px solid var(--pm)"><div style="font-size:11px;font-family:var(--fs);color:var(--tx);margin-bottom:7px">Which days are higher?</div><div class="dchips" id="dchips"><button class="dchip" onclick="toggleHD(\'Mon\')">Mon</button><button class="dchip" onclick="toggleHD(\'Tue\')">Tue</button><button class="dchip" onclick="toggleHD(\'Wed\')">Wed</button><button class="dchip" onclick="toggleHD(\'Thu\')">Thu</button><button class="dchip" onclick="toggleHD(\'Fri\')">Fri</button><button class="dchip" onclick="toggleHD(\'Sat\')">Sat</button><button class="dchip" onclick="toggleHD(\'Sun\')">Sun</button></div><div id="no-days" style="font-size:12px;color:var(--tp);text-align:center;padding:6px 0 12px;font-family:var(--fc)">Select at least one higher day above</div><div id="eb-sw-wrap" style="display:none"><div class="sl-wrap"><div class="sl-hdr"><div><div class="sl-lbl">How much higher?</div><div style="font-size:10px;color:var(--in);margin-top:3px;font-family:var(--fc)" id="sl-cap"></div></div><div style="text-align:right"><div class="sl-val" id="sl-disp">+0</div><div style="font-size:10px;color:var(--tp);font-family:var(--fc)">calories</div></div></div><input type="range" id="eb-sl" min="0" max="200" step="25" value="0" oninput="onSl()"/><div style="display:flex;justify-content:space-between;font-size:9px;color:var(--tp);margin-top:3px;font-family:var(--fc)"><span>0</span><span id="st-25"></span><span id="st-50"></span><span id="st-75"></span><span id="st-max"></span></div></div><div class="wk-grid" id="wk-grid"></div><div id="eb-flags"></div><div class="card" style="padding:10px"><div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:.5px solid var(--bl);font-size:12px"><span style="color:var(--mu)">Target</span><span id="mr-tgt">&#8212;</span></div><div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:.5px solid var(--bl);font-size:12px"><span style="color:var(--mu)">Floor (never below)</span><span id="mr-fl">&#8212;</span></div><div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:.5px solid var(--bl);font-size:12px"><span style="color:var(--mu)">Higher day(s)</span><span style="color:var(--wn)" id="mr-hi">&#8212;</span></div><div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:.5px solid var(--bl);font-size:12px"><span style="color:var(--mu)">Cut per cushion day</span><span style="color:var(--in)" id="mr-cut">&#8212;</span></div><div style="display:flex;justify-content:space-between;padding:7px 0 5px;border-top:1.5px solid var(--bl);font-size:12px"><span style="font-family:var(--fs);color:var(--tx)">Weekly avg</span><span style="font-family:var(--fs)" id="mr-avg">&#8212;</span></div></div></div></div></div><div style="display:flex;gap:8px"><button class="btn btn-g" onclick="pNext(0)" style="flex:1;margin-bottom:0">&#8592; Back</button><button class="btn" onclick="pNext(2)" style="flex:2;margin-bottom:0">Next &#8212; Map meals &#8594;</button></div></div>'
  +'<div class="pstep" id="ps-2"><div class="sl">Step 3 &#8212; Map your meals</div><div class="flag f-t" style="margin-bottom:11px"><i>&#128161;</i><span>Tap any day to expand it. Protein anchor first, then plant foods, carbs, fats.</span></div><div id="day-cards"></div><div style="display:flex;gap:8px;margin-top:4px"><button class="btn btn-g" onclick="pNext(1)" style="flex:1;margin-bottom:0">&#8592; Back</button><button class="btn" onclick="pNext(3)" style="flex:2;margin-bottom:0">Next &#8212; Review &#8594;</button></div></div>'
  +'<div class="pstep" id="ps-3"><div class="sl">Step 4 &#8212; Plan review</div><div id="comp-good" style="display:none"><div class="flag f-s"><i>&#10003;</i><span>Every day is fully mapped. Ready to generate your grocery list and MFP log.</span></div></div><div id="comp-warn" style="display:none"><div class="flag f-w" style="margin-bottom:11px"><i>&#8595;</i><div id="comp-msg"></div></div><div class="card" id="comp-list"></div><div style="font-size:12px;color:var(--mu);margin-bottom:11px;line-height:1.5">These might be meals-out or intentionally lighter days.</div><div style="display:flex;gap:8px;margin-bottom:9px"><button class="btn btn-g" onclick="pNext(2)" style="flex:1;margin-bottom:0">&#8592; Go back</button><button class="btn" onclick="pNext(4)" style="flex:1;margin-bottom:0">Proceed as planned</button></div></div><div id="comp-checking" style="text-align:center;padding:24px;color:var(--mu);font-size:13px">Checking your plan...</div></div>'
  +'<div class="pstep" id="ps-4"><div class="sl">Step 5 &#8212; Your plan is ready</div><div class="flag f-s" style="margin-bottom:13px"><i>&#10003;</i><span>Plan complete. Grocery list and MFP log are ready.</span></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px;text-align:center;margin-bottom:11px"><div style="background:var(--bl);border-radius:9px;padding:9px 4px"><div style="font-size:15px;font-family:var(--fh);color:var(--cr)" id="sm-cal">&#8212;</div><div style="font-size:9px;color:var(--tp);text-transform:uppercase;font-family:var(--fc)">Avg cal</div></div><div style="background:var(--bl);border-radius:9px;padding:9px 4px"><div style="font-size:15px;font-family:var(--fh);color:var(--cr)" id="sm-pro">&#8212;</div><div style="font-size:9px;color:var(--tp);text-transform:uppercase;font-family:var(--fc)">Avg pro</div></div><div style="background:var(--bl);border-radius:9px;padding:9px 4px"><div style="font-size:15px;font-family:var(--fh);color:var(--cr)" id="sm-days">&#8212;</div><div style="font-size:9px;color:var(--tp);text-transform:uppercase;font-family:var(--fc)">Full days</div></div><div style="background:var(--bl);border-radius:9px;padding:9px 4px"><div style="font-size:15px;font-family:var(--fh);color:var(--cr)" id="sm-eb">&#8212;</div><div style="font-size:9px;color:var(--tp);text-transform:uppercase;font-family:var(--fc)">Balance</div></div></div><div id="plan-insights"></div><button class="btn" onclick="nav(\'grocery\')">View grocery list &#8594;</button><button class="btn" onclick="nav(\'mfp\')">View MFP log &#8594;</button><button class="btn btn-g" onclick="pNext(2)">&#8592; Edit plan</button></div>';
}
function initSegs(){let h='';for(let i=0;i<5;i++)h+='<div class="seg'+(i===0?' cur':'')+'" id="pseg-'+i+'"></div>';setHTML('plan-segs',h);}
function syncPlanner(){if(P.cal>0){PL.cal=P.cal;PL.pro=P.pro;PL.carb=P.carb||175;PL.fat=P.fat||65;PL.meals=P.meals||3;PL.snacks=P.snacks||1;}['cal','pro','carb','fat'].forEach(function(k){const el=e('p-'+k);if(el&&PL[k])el.value=PL[k];});const pm=e('p-meals');if(pm)pm.value=PL.meals||3;const ps=e('p-snacks');if(ps)ps.value=PL.snacks||1;DAYS.forEach(function(d){if(!DC[d])DC[d]=PL.cal;});if(ebOn){const sw=e('eb-sw');if(sw)sw.classList.add('on');const bd=e('eb-bd');if(bd)bd.style.display='block';}}
function showPS(n){document.querySelectorAll('.pstep').forEach(function(s){s.classList.remove('active');});const ps=e('ps-'+n);if(ps)ps.classList.add('active');for(let i=0;i<5;i++){const s=e('pseg-'+i);if(s)s.className='seg'+(i<n?' done':i===n?' cur':'');}pStep=n;const body=e('body-planner');if(body)body.scrollTop=0;const bb=e('plan-back-btn');if(bb)bb.textContent=n===0?'← Home':'← Back';}
function pNext(n){if(n===1)rdPL();if(n===2)buildDC();if(n===3)runCheck();if(n===4)buildSum();showPS(n);sv();}
function rdPL(){PL.cal=parseInt((e('p-cal')||{}).value)||1800;PL.pro=parseInt((e('p-pro')||{}).value)||140;PL.carb=parseInt((e('p-carb')||{}).value)||175;PL.fat=parseInt((e('p-fat')||{}).value)||65;PL.meals=parseInt((e('p-meals')||{}).value)||3;PL.snacks=parseInt((e('p-snacks')||{}).value)||1;if(PL.cal<1){alert('Please enter a valid calorie target.');return;}P.cal=PL.cal;P.pro=PL.pro;P.carb=PL.carb;P.fat=PL.fat;P.meals=PL.meals;P.snacks=PL.snacks;DAYS.forEach(function(d){DC[d]=DC[d]||PL.cal;});updG();}
function toggleEB(){ebOn=!ebOn;const sw=e('eb-sw');if(sw)sw.classList.toggle('on',ebOn);const bd=e('eb-bd');if(bd)bd.style.display=ebOn?'block':'none';sv();}
function toggleHD(day){const i=HD.indexOf(day);if(i>-1)HD.splice(i,1);else HD.push(day);document.querySelectorAll('.dchip').forEach(function(c){c.classList.toggle('sel',HD.includes(c.textContent.trim()));});const has=HD.length>0;const nd=e('no-days');if(nd)nd.style.display=has?'none':'block';const sw=e('eb-sw-wrap');if(sw)sw.style.display=has?'block':'none';if(has){const mx=cMax();const sl=e('eb-sl');if(sl){sl.max=mx;if(slV>mx){slV=mx;sl.value=mx;}}updTicks(mx);recEB();}sv();}
function cMax(){const cd=7-HD.length;if(cd===0)return 0;return Math.floor((cd*MAX_CUT)/HD.length);}
function updTicks(mx){const set=function(id,t){const el=e(id);if(el)el.textContent=t;};set('st-25','+'+Math.round(mx*.25));set('st-50','+'+Math.round(mx*.5));set('st-75','+'+Math.round(mx*.75));set('st-max','+'+mx+' max');const sc=e('sl-cap');if(sc)sc.textContent='Cap: +'+mx+' &#8212; floor at '+(PL.cal-FLOOR_OFF);}
function onSl(){slV=parseInt((e('eb-sl')||{}).value)||0;const sd=e('sl-disp');if(sd)sd.textContent='+'+slV;recEB();sv();}
function recEB(){if(!HD.length)return;const fl=PL.cal-FLOOR_OFF;const cush=DAYS.filter(function(d){return !HD.includes(d);});const cut=cush.length>0?Math.round((HD.length*slV)/cush.length):0;let atF=false;DAYS.forEach(function(d){if(HD.includes(d))DC[d]=PL.cal+slV;else{const p=PL.cal-cut;DC[d]=Math.max(p,fl);if(p<fl)atF=true;}});const avg=Math.round(DAYS.reduce(function(a,d){return a+DC[d];},0)/7);const maxC=Math.max.apply(null,Object.values(DC));let gh='';DAYS.forEach(function(d){const c=DC[d],hi=HD.includes(d),cu=!hi&&c<PL.cal,af=c<=fl;const pct=Math.max(Math.round((c/(maxC*1.05))*100),8);const bc=hi?'var(--wn)':af?'var(--dn)':cu?'var(--in)':'var(--cr)';const tp=hi?'&#8593; higher':af?'&#9888; floor':cu?'&#8595; cushion':'target';gh+='<div class="dc"><div class="dc-n">'+d+'</div><div class="dc-bw"><div class="dc-b" style="height:'+pct+'%;background:'+bc+'"></div></div><div class="dc-c">'+c+'</div><div class="dc-t">'+tp+'</div></div>';});const wg=e('wk-grid');if(wg)wg.innerHTML=gh;const diff=avg-PL.cal;let fl2='';if(Math.abs(diff)<=50)fl2='<div class="flag f-s"><i>&#10003;</i><span>Weekly average is '+avg+' &#8212; right on your '+PL.cal+' target.</span></div>';else if(diff>50)fl2='<div class="flag f-w"><i>&#8593;</i><span>Weekly average is '+avg+' &#8212; '+Math.round(diff)+' above target.</span></div>';else fl2='<div class="flag f-i"><i>&#8595;</i><span>Weekly average is '+avg+' &#8212; '+Math.abs(Math.round(diff))+' below. Well within range.</span></div>';if(atF)fl2+='<div class="flag f-w"><i>&#9888;</i><span>Some cushion days hit your floor of '+fl+'. Capped automatically.</span></div>';const ef=e('eb-flags');if(ef)ef.innerHTML=fl2;const set2=function(id,t){const el=e(id);if(el)el.textContent=t;};set2('mr-tgt',PL.cal+' cal');set2('mr-fl',(PL.cal-FLOOR_OFF)+' cal');set2('mr-hi',HD.join(', ')+' → '+(PL.cal+slV)+' cal');set2('mr-cut',cut>0?'−'+cut+' cal/day':'&#8212;');const ae=e('mr-avg');if(ae){ae.textContent=avg+' cal';ae.style.color=Math.abs(diff)<=50?'var(--sg)':diff>50?'var(--wn)':'var(--in)';}}

function getMF(d,slot){if(!MM[d])MM[d]={};if(!MM[d][slot])MM[d][slot]={protein:'',plants:'',carbs:'',fats:'',extras:''};return MM[d][slot];}
function buildDC(){
  const ms=MN.slice(0,PL.meals);const ss=Array.from({length:PL.snacks},function(_,i){return PL.snacks>1?'Snack '+(i+1):'Snack';});const slots=ms.concat(ss);
  let h='';
  DAYS.forEach(function(d){
    const c=DC[d]||PL.cal;const hi=HD.includes(d)&&ebOn,cu=ebOn&&!hi&&c<PL.cal;
    const tag=hi?(c+' cal &#8212; higher day'):cu?(c+' cal &#8212; cushion day'):(c+' cal target');
    const tagCls=hi?'hi':cu?'cu':'';
    const filled=slots.filter(function(s){return MM[d]&&MM[d][s]&&MM[d][s].protein;}).length;
    const dotCls=filled>=slots.length?'done':filled>0?'partial':'';
    h+='<div class="day-card"><div class="day-card-hdr" onclick="toggleDay(\''+d+'\')"><div style="display:flex;align-items:center;gap:8px"><div class="day-dot '+dotCls+'" id="ddot-'+d+'"></div><div class="day-name">'+d+'</div></div><div style="display:flex;align-items:center;gap:7px"><div class="day-cal-tag '+tagCls+'">'+tag+'</div><div style="font-size:18px;color:var(--tp);margin-left:4px" id="darr-'+d+'">&#8250;</div></div></div><div class="day-body" id="db-'+d+'">';
    slots.forEach(function(slot){
      const f=getMF(d,slot);const safe=d+'__'+slot.replace(/ /g,'_');
      h+='<div class="meal-slot"><div class="meal-slot-hdr"><div class="meal-slot-name">'+slot+'</div><div class="meal-slot-actions"><button class="recipe-btn" onclick="openRP(\''+d+'\',\''+slot+'\')">&#128218; My recipes</button><button class="copy-btn" onclick="openCM(\''+d+'\',\''+slot+'\')">Copy to...</button></div></div>';
      h+='<div class="meal-field"><label>Protein anchor</label><input type="text" value="'+escH(f.protein)+'" placeholder="e.g. chicken breast, 5oz" oninput="setMF(\''+d+'\',\''+slot+'\',\'protein\',this.value)"/></div>';
      h+='<div class="meal-field"><label>Plant foods</label><input type="text" value="'+escH(f.plants)+'" placeholder="e.g. spinach, bell peppers" oninput="setMF(\''+d+'\',\''+slot+'\',\'plants\',this.value)"/></div>';
      h+='<div class="meal-field"><label>Carbs</label><input type="text" value="'+escH(f.carbs)+'" placeholder="e.g. brown rice 1/2 cup" oninput="setMF(\''+d+'\',\''+slot+'\',\'carbs\',this.value)"/></div>';
      h+='<div class="meal-field"><label>Fats, oils &amp; sauces</label><input type="text" value="'+escH(f.fats)+'" placeholder="e.g. 1 tsp olive oil" oninput="setMF(\''+d+'\',\''+slot+'\',\'fats\',this.value)"/></div>';
      h+='<div class="meal-field"><label>Extras &amp; notes</label><input type="text" value="'+escH(f.extras)+'" placeholder="e.g. seasonings, hot sauce" oninput="setMF(\''+d+'\',\''+slot+'\',\'extras\',this.value)"/></div>';
      h+='<div class="meal-macro-est" id="mme-'+safe+'"><div class="mme-pill"><div class="mme-v" id="mme-cal-'+safe+'">&#8212;</div><div class="mme-l">cal</div></div><div class="mme-pill"><div class="mme-v" id="mme-pro-'+safe+'">&#8212;</div><div class="mme-l">protein</div></div><div class="mme-pill"><div class="mme-v" id="mme-carb-'+safe+'">&#8212;</div><div class="mme-l">carbs</div></div><div class="mme-pill"><div class="mme-v" id="mme-fat-'+safe+'">&#8212;</div><div class="mme-l">fat</div></div></div>';
      h+='<button class="btn btn-xs btn-g" style="margin-top:8px" onclick="estMM(\''+d+'\',\''+slot+'\',this)">Estimate macros</button></div>';
    });
    h+='</div></div>';
  });
  setHTML('day-cards',h);
}
function toggleDay(d){const body=e('db-'+d);const arr=e('darr-'+d);if(!body)return;const open=body.classList.toggle('open');if(arr)arr.innerHTML=open?'&#8964;':'&#8250;';}
function setMF(d,slot,field,val){if(!MM[d])MM[d]={};if(!MM[d][slot])MM[d][slot]={protein:'',plants:'',carbs:'',fats:'',extras:''};MM[d][slot][field]=val;updDD(d);sv();}
function updDD(d){const ms=MN.slice(0,PL.meals);const ss=Array.from({length:PL.snacks},function(_,i){return PL.snacks>1?'Snack '+(i+1):'Snack';});const slots=ms.concat(ss);const filled=slots.filter(function(s){return MM[d]&&MM[d][s]&&MM[d][s].protein;}).length;const dot=e('ddot-'+d);if(dot)dot.className='day-dot'+(filled>=slots.length?' done':filled>0?' partial':'');}
async function estMM(d,slot,btn){const f=getMF(d,slot);const safe=d+'__'+slot.replace(/ /g,'_');const desc=[f.protein,f.plants,f.carbs,f.fats,f.extras].filter(Boolean).join(', ');if(!desc){alert('Fill in at least one field first.');return;}btn.textContent='Estimating...';btn.disabled=true;try{const r=await fetch('/api/claude',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:150,system:'Respond ONLY with valid JSON: {"cal":number,"pro":number,"carb":number,"fat":number}. No other text.',messages:[{role:'user',content:'Estimate macros for: '+desc}]})});const data=await r.json();const txt=(data.content&&data.content[0]&&data.content[0].text)||'{}';const macros=JSON.parse(txt.replace(/```json|```/g,'').trim());const set=function(id,v,g){const el=e(id);if(el)el.textContent=Math.round(v||0)+(g?'g':'');};set('mme-cal-'+safe,macros.cal,false);set('mme-pro-'+safe,macros.pro,true);set('mme-carb-'+safe,macros.carb,true);set('mme-fat-'+safe,macros.fat,true);}catch(err){alert('Could not estimate. Try again.');}btn.textContent='Estimate macros';btn.disabled=false;}

function openCM(d,slot){copyCtx={day:d,slot:slot};copySel=[];e('copy-modal-title').textContent='Copy '+slot+' from '+d+' to:';let h='';DAYS.filter(function(x){return x!==d;}).forEach(function(day){h+='<div class="copy-day-opt" onclick="toggleCD(\''+day+'\')"><div style="font-size:13px">'+day+'</div><div class="copy-check" id="cc-'+day+'"></div></div>';});h+='<div class="copy-day-opt" onclick="selAllCD()"><div style="font-size:13px;font-family:var(--fs);color:var(--cr)">All other days</div><div></div></div>';setHTML('copy-day-list',h);e('copy-modal').style.display='flex';}
function toggleCD(day){const idx=copySel.indexOf(day);if(idx>-1)copySel.splice(idx,1);else copySel.push(day);DAYS.filter(function(d){return d!==copyCtx.day;}).forEach(function(d){const el=e('cc-'+d);if(el)el.className='copy-check'+(copySel.includes(d)?' sel':'');});}
function selAllCD(){copySel=DAYS.filter(function(d){return d!==copyCtx.day;});DAYS.filter(function(d){return d!==copyCtx.day;}).forEach(function(d){const el=e('cc-'+d);if(el)el.className='copy-check sel';});}
function closeCopyModal(){e('copy-modal').style.display='none';copyCtx={day:null,slot:null};copySel=[];}
function applyCopy(){if(!copyCtx.day||!copyCtx.slot||!copySel.length){closeCopyModal();return;}const src=getMF(copyCtx.day,copyCtx.slot);copySel.forEach(function(d){if(!MM[d])MM[d]={};MM[d][copyCtx.slot]=Object.assign({},src);updDD(d);});sv();closeCopyModal();buildDC();}
function openRP(d,slot){if(!recipes.length){alert('No saved recipes yet. Add one in My Recipes.');return;}let html='<div style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:flex;align-items:flex-end;justify-content:center" id="rp-modal" onclick="this.remove()"><div style="background:#fff;border-radius:20px 20px 0 0;padding:20px;width:100%;max-width:430px;max-height:70vh;overflow-y:auto" onclick="event.stopPropagation()"><div style="font-size:15px;font-family:var(--fs);color:var(--tx);margin-bottom:14px">Choose a recipe for '+slot+' on '+d+'</div>';recipes.forEach(function(rec,i){html+='<div style="padding:10px 0;border-bottom:.5px solid var(--bl);cursor:pointer" onclick="applyRec(\''+d+'\',\''+slot+'\','+i+');this.closest(\'#rp-modal\').remove()"><div style="font-size:13px;font-family:var(--fs);color:var(--tx)">'+escH(rec.name)+'</div><div style="font-size:11px;color:var(--mu);font-family:var(--fc);margin-top:2px">'+(rec.cal||'?')+' cal &middot; '+(rec.pro||'?')+'g P</div></div>';});html+='<button class="btn btn-g" style="margin-top:14px" onclick="this.closest(\'#rp-modal\').remove()">Cancel</button></div></div>';document.body.insertAdjacentHTML('beforeend',html);}
function applyRec(d,slot,idx){const rec=recipes[idx];if(!rec)return;if(!MM[d])MM[d]={};MM[d][slot]={protein:rec.name,plants:'',carbs:'',fats:'',extras:rec.name};updDD(d);sv();buildDC();const body=e('db-'+d);if(body&&!body.classList.contains('open'))toggleDay(d);}

function runCheck(){['comp-good','comp-warn'].forEach(function(id){const el=e(id);if(el)el.style.display='none';});const chk=e('comp-checking');if(chk)chk.style.display='block';const ms=MN.slice(0,PL.meals);const ss=Array.from({length:PL.snacks},function(_,i){return PL.snacks>1?'Snack '+(i+1):'Snack';});const slots=ms.concat(ss);const thr=PL.meals-1;const light=[];DAYS.forEach(function(d){const f=slots.filter(function(s){return MM[d]&&MM[d][s]&&MM[d][s].protein;}).length;if(f<thr)light.push({day:d,count:f});});setTimeout(function(){if(chk)chk.style.display='none';if(!light.length){const g=e('comp-good');if(g)g.style.display='block';setTimeout(function(){pNext(4);},900);}else{const cm=e('comp-msg');if(cm)cm.textContent=(light.length>1?light.length+' days look':'1 day looks')+' light &#8212; fewer protein anchors than your target of '+PL.meals+' per day.';let lh='';light.forEach(function(obj){const hi=HD.includes(obj.day)&&ebOn,cu=ebOn&&!hi&&(DC[obj.day]||PL.cal)<PL.cal;const note=hi?' (higher day)':cu?' (cushion day)':'';lh+='<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:.5px solid var(--bl)"><div style="font-size:13px;font-family:var(--fs)">'+obj.day+note+'</div><div style="font-size:11px;color:var(--wn);font-family:var(--fc)">'+obj.count+' of '+PL.meals+' mapped</div></div>';});const cl=e('comp-list');if(cl)cl.innerHTML=lh;const w=e('comp-warn');if(w)w.style.display='block';}},500);}
function buildSum(){const ms=MN.slice(0,PL.meals);const ss=Array.from({length:PL.snacks},function(_,i){return PL.snacks>1?'Snack '+(i+1):'Snack';});const slots=ms.concat(ss);let full=0;DAYS.forEach(function(d){if(slots.filter(function(s){return MM[d]&&MM[d][s]&&MM[d][s].protein;}).length>=PL.meals-1)full++;});const avg=Math.round(DAYS.reduce(function(a,d){return a+(DC[d]||PL.cal);},0)/7);const set=function(id,t){const el=e(id);if(el)el.textContent=t;};set('sm-cal',avg);set('sm-pro',PL.pro+'g');set('sm-days',full+'/7');set('sm-eb',ebOn&&HD.length?'On':'Off');planBuilt=true;let ins='';const diff=avg-PL.cal;if(Math.abs(diff)<=CAL_BUF)ins+=iCard('good','Calories on target','Averaging '+avg+' calories &#8212; right where you need to be.',ebOn?'Empowered Balance is keeping your weekly average clean.':'Keep this structure.');else if(diff<-CAL_BUF)ins+=iCard('warn','Calories too low','Your plan is averaging '+avg+' calories &#8212; your body needs more fuel than this.','Add a protein-based snack you\'re currently skipping.');else ins+=iCard('warn','Calories a bit high','Averaging '+avg+' &#8212; '+Math.round(diff)+' over target per day.','Look at where carbs or fat are running heavy.');if(ebOn&&HD.length)ins+=iCard('info','Empowered Balance active',HD.join(', ')+' planned as higher. Cushion spread across remaining days.','No restriction before. No punishment after.');setHTML('plan-insights',ins);sv();}
function iCard(t,l,m,a){const bg={good:'var(--sgb)',warn:'var(--wnb)',info:'var(--inb)'};const bd={good:'var(--sbd)',warn:'var(--wbd)',info:'var(--ibd)'};const tc={good:'#1a3a08',warn:'#3a2005',info:'#082040'};const dc={good:'var(--sg)',warn:'var(--wn)',info:'var(--in)'};return'<div style="background:'+bg[t]+';border:.5px solid '+bd[t]+';border-radius:13px;padding:12px;margin-bottom:9px"><div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><div style="width:7px;height:7px;border-radius:50%;background:'+dc[t]+';flex-shrink:0"></div><div style="font-size:10px;font-family:var(--fc);text-transform:uppercase;letter-spacing:.08em;color:'+dc[t]+'">'+l+'</div></div><div style="font-size:13px;color:'+tc[t]+';line-height:1.55;margin-bottom:6px;font-weight:300">'+m+'</div><div style="font-size:12px;font-family:var(--fs);color:'+dc[t]+';padding-top:6px;border-top:.5px solid rgba(0,0,0,.07)">'+a+'</div></div>';}

function buildMacros(){const body=e('body-macros');if(!body)return;if(!P.cal){body.innerHTML='<div style="font-size:13px;color:var(--mu);text-align:center;padding:32px 0;font-weight:300">Set up your goals on the home screen first, then come back here to track your meals.</div>';return;}const ms=P.snacks>0?0.85:1,ss=1-ms;const t={mP:Math.round(P.pro*ms/P.meals),mC:Math.round(P.carb*ms/P.meals),mF:Math.round(P.fat*ms/P.meals),sP:P.snacks>0?Math.round(P.pro*ss/P.snacks):0,sC:P.snacks>0?Math.round(P.carb*ss/P.snacks):0,sF:P.snacks>0?Math.round(P.fat*ss/P.snacks):0};if(MV.length!==P.meals+P.snacks)MV=Array(P.meals+P.snacks).fill(null).map(function(){return{p:0,c:0,f:0};});let h='<div id="daily-bar-wrap" style="display:none"><div class="card"><div style="font-size:12px;font-family:var(--fs);margin-bottom:8px;display:flex;justify-content:space-between"><span>Daily totals</span><span style="font-size:10px;color:var(--tp);font-family:var(--fc)">as you fill in meals</span></div><div id="bar-rows"></div></div></div><div class="flag f-t"><i>&#128161;</i><span>Protein first. Build each meal around your anchor, layer in plant foods, fill carbs and fat last.</span></div>';for(let i=0;i<P.meals;i++)h+=mSlot(i,MN[i]||'Meal '+(i+1),t.mP,t.mC,t.mF);for(let i=0;i<P.snacks;i++)h+=mSlot(P.meals+i,'Snack'+(P.snacks>1?' '+(i+1):''),t.sP,t.sC,t.sF);body.innerHTML=h;buildBars();}
function mSlot(idx,name,tP,tC,tF){const v=MV[idx]||{p:0,c:0,f:0};return'<div class="day-card" id="mc-'+idx+'" style="background:#fff;border-radius:12px;border:.5px solid var(--bd);padding:12px;margin-bottom:9px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:13px;font-family:var(--fs)">'+name+'</span><span id="dot-'+idx+'" style="width:8px;height:8px;border-radius:50%;background:var(--pm);display:inline-block"></span></div><div style="font-size:9px;color:var(--tp);text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;font-family:var(--fc)">Target</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:7px"><div style="text-align:center;background:var(--bl);border-radius:6px;padding:5px"><div style="font-size:12px;font-family:var(--fh);color:var(--tp)">'+tP+'g</div><div style="font-size:9px;color:var(--pm);text-transform:uppercase;font-family:var(--fc)">protein</div></div><div style="text-align:center;background:var(--bl);border-radius:6px;padding:5px"><div style="font-size:12px;font-family:var(--fh);color:var(--tp)">'+tC+'g</div><div style="font-size:9px;color:var(--pm);text-transform:uppercase;font-family:var(--fc)">carbs</div></div><div style="text-align:center;background:var(--bl);border-radius:6px;padding:5px"><div style="font-size:12px;font-family:var(--fh);color:var(--tp)">'+tF+'g</div><div style="font-size:9px;color:var(--pm);text-transform:uppercase;font-family:var(--fc)">fat</div></div></div><div style="font-size:9px;color:var(--tp);text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;font-family:var(--fc)">What you actually had</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-bottom:7px"><div><div style="font-size:9px;color:var(--mu);text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px;font-family:var(--fc)">Protein</div><input style="width:100%;padding:8px;border:.5px solid var(--bd);border-radius:7px;background:var(--bl);font-size:14px;font-family:var(--fh);color:var(--cr);text-align:center;-webkit-appearance:none" type="number" id="mi-'+idx+'-p" placeholder="'+tP+'" value="'+(v.p||'')+'" oninput="onM('+idx+',\'p\',this.value,'+tP+','+tC+','+tF+')"/></div><div><div style="font-size:9px;color:var(--mu);text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px;font-family:var(--fc)">Carbs</div><input style="width:100%;padding:8px;border:.5px solid var(--bd);border-radius:7px;background:var(--bl);font-size:14px;font-family:var(--fh);color:var(--cr);text-align:center;-webkit-appearance:none" type="number" id="mi-'+idx+'-c" placeholder="'+tC+'" value="'+(v.c||'')+'" oninput="onM('+idx+',\'c\',this.value,'+tP+','+tC+','+tF+')"/></div><div><div style="font-size:9px;color:var(--mu);text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px;font-family:var(--fc)">Fat</div><input style="width:100%;padding:8px;border:.5px solid var(--bd);border-radius:7px;background:var(--bl);font-size:14px;font-family:var(--fh);color:var(--cr);text-align:center;-webkit-appearance:none" type="number" id="mi-'+idx+'-f" placeholder="'+tF+'" value="'+(v.f||'')+'" oninput="onM('+idx+',\'f\',this.value,'+tP+','+tC+','+tF+')"/></div></div><div id="mf-'+idx+'"></div></div>';}
function onM(idx,field,val,tP,tC,tF){if(!MV[idx])MV[idx]={p:0,c:0,f:0};MV[idx][field]=parseInt(val)||0;const v=MV[idx];const has=v.p>0||v.c>0||v.f>0;const el=e('mf-'+idx);const mc=e('mc-'+idx);const dot=e('dot-'+idx);if(!has){if(el)el.innerHTML='';if(mc)mc.style.borderColor='';if(dot)dot.style.background='var(--pm)';buildBars();sv();return;}const oi=[],ui=[];if(v.p>tP*1.2)oi.push('protein ('+v.p+'g vs ~'+tP+'g)');if(v.c>tC*1.2)oi.push('carbs ('+v.c+'g vs ~'+tC+'g)');if(v.f>tF*1.2)oi.push('fat ('+v.f+'g vs ~'+tF+'g)');if(v.p>0&&v.p<tP*0.8)ui.push('protein');const rem=P.meals+P.snacks-1;if(oi.length){if(el)el.innerHTML='<div class="flag f-w" style="margin-bottom:0"><i>&#8593;</i><span>A bit high on '+oi.join(' and ')+'. You have '+rem+' other meal'+(rem>1?'s':'')+' to balance it out.</span></div>';if(mc)mc.style.borderColor='var(--wbd)';if(dot)dot.style.background='var(--wn)';}else if(ui.length){if(el)el.innerHTML='<div class="flag f-i" style="margin-bottom:0"><i>&#8595;</i><span>A bit light on protein. Bump it up at your next meal or snack.</span></div>';if(mc)mc.style.borderColor='var(--ibd)';if(dot)dot.style.background='var(--in)';}else{if(el)el.innerHTML='<div class="flag f-s" style="margin-bottom:0"><i>&#10003;</i><span>Right on target.</span></div>';if(mc)mc.style.borderColor='var(--sbd)';if(dot)dot.style.background='var(--sg)';}buildBars();sv();}
function buildBars(){const tot=MV.reduce(function(a,m){return{p:a.p+(m&&m.p||0),c:a.c+(m&&m.c||0),f:a.f+(m&&m.f||0)};},{p:0,c:0,f:0});const any=tot.p>0||tot.c>0||tot.f>0;const bw=e('daily-bar-wrap');if(bw)bw.style.display=any?'block':'none';if(!any)return;let h='';[{k:'p',l:'Protein',t:P.pro||1},{k:'c',l:'Carbs',t:P.carb||1},{k:'f',l:'Fat',t:P.fat||1}].forEach(function(obj){const v=tot[obj.k],p=Math.min(Math.round(v/obj.t*100),115),c=v>obj.t*1.1?'var(--wn)':v<obj.t*.75?'var(--in)':'var(--cr)';h+='<div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--mu);margin-bottom:2px;font-family:var(--fc)"><span>'+obj.l+'</span><span>'+v+' / '+obj.t+'g</span></div><div style="background:var(--bl);border-radius:3px;height:5px;overflow:hidden"><div style="height:100%;border-radius:3px;background:'+c+';width:'+p+'%;transition:width .3s"></div></div></div>';});const br=e('bar-rows');if(br)br.innerHTML=h;}

function checkHid(food){const lo=food.toLowerCase();let msg='';for(const k in HTRIG){if(lo.includes(k)){msg=HTRIG[k];break;}}const hp=e('hid-prompt');if(!msg){if(hp)hp.classList.remove('show');return;}const hm=e('hid-msg');if(hm)hm.textContent=msg;if(hp)hp.classList.add('show');const hq=e('hid-quick');if(hq)hq.classList.remove('show');}
function dismissHidden(){const hp=e('hid-prompt');if(hp)hp.classList.remove('show');}
function showQuickAdd(){const el=e('hid-quick');if(!el)return;el.classList.add('show');let h='<div style="font-size:11px;font-family:var(--fc);color:var(--tp);margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em">Tap to add to your meal</div>';QADD.forEach(function(item,i){h+='<div class="hid-item" onclick="addHC('+i+')"><span style="font-size:12px;color:var(--tx)">'+item.n+'</span><div style="display:flex;align-items:center;gap:8px"><span style="font-size:11px;color:var(--tp);font-family:var(--fc)">'+item.c+' cal &middot; '+item.f+'g fat</span><span style="font-size:11px;color:var(--cr);padding:3px 8px;border:1px solid var(--cr);border-radius:6px;font-family:var(--fc)">+ Add</span></div></div>';});el.innerHTML=h;}
function addHC(i){const item=QADD[i];const hp=e('hid-prompt');if(hp)hp.classList.remove('show');const box=e('ana-box');const txt=e('ana-txt');if(box&&box.classList.contains('show')&&txt)txt.innerHTML+='<div class="flag f-t" style="margin-top:10px;margin-bottom:0"><i>+</i><span>Added: '+item.n+' &#8212; '+item.c+' cal, '+item.p+'g P, '+item.f+'g F</span></div>';}

function buildAnalyzeHTML(){const body=e('body-analyze');if(!body)return;body.innerHTML='<div class="tog-row"><button class="tog on" id="at-d" onclick="setAT(\'d\')">Describe</button><button class="tog" id="at-p" onclick="setAT(\'p\')">Photo</button><button class="tog" id="at-r" onclick="setAT(\'r\')">Eating out</button></div><div id="a-d"><label>What did you eat?</label><textarea id="food-in" rows="3" placeholder="e.g. Scrambled eggs with toast..."></textarea><button class="btn" onclick="doAnalyze()">Analyze macros</button></div><div id="a-p" style="display:none"><div style="border:1.5px dashed var(--pm);border-radius:11px;padding:24px;text-align:center;background:#fff;margin-bottom:10px"><svg viewBox="0 0 24 24" width="28" height="28" fill="#BDA59B" style="margin:0 auto 6px;display:block"><path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z"/></svg><div style="font-size:13px;color:var(--mu)">Upload a photo</div><div style="font-size:11px;color:var(--tp);margin-top:2px;font-family:var(--fc)">Menu, plate, food label</div></div><textarea id="photo-in" rows="2" placeholder="or describe what you see..."></textarea><button class="btn" onclick="doPhoto()">Analyze from description</button></div><div id="a-r" style="display:none"><label>Restaurant</label><input type="text" id="rest-n" placeholder="e.g. Chipotle, Sweetgreen..."/><label>What are you in the mood for?</label><textarea id="rest-m" rows="2" placeholder="e.g. something high protein..."></textarea><button class="btn" onclick="doRestaurant()">Find best options for my macros</button></div><div class="ai-box" id="ana-box"><div class="ai-lbl" style="display:flex;align-items:center;gap:5px"><span style="width:6px;height:6px;border-radius:50%;background:var(--cr);display:inline-block"></span>Empowered Nutrition analysis</div><div class="ai-txt" id="ana-txt"></div><button class="retry-btn" id="ana-retry" style="display:none" onclick="doAnalyze()">Try again</button></div><div class="hid-prompt" id="hid-prompt"><div class="hid-title">Quick check &#8212; did you account for this?</div><div class="hid-msg" id="hid-msg"></div><div class="hid-btns"><button class="hid-btn hid-yes" onclick="dismissHidden()">Yes, included</button><button class="hid-btn hid-add" onclick="showQuickAdd()">Add it</button></div><div class="hid-quick" id="hid-quick"></div></div><div class="disclaimer" id="ana-disc" style="display:none">These estimates are for planning and education. Exact macros vary based on preparation, brand, and portion. Use as a guide, not a guarantee.</div>';}
function setAT(t){['d','p','r'].forEach(x=>{const b=e('at-'+x);if(b)b.classList.toggle('on',x===t);const a=e('a-'+x);if(a)a.style.display=x===t?'block':'none';});const box=e('ana-box');if(box)box.classList.remove('show');const disc=e('ana-disc');if(disc)disc.style.display='none';const hp=e('hid-prompt');if(hp)hp.classList.remove('show');}

function buildRecipeHTML(){const body=e('body-recipe');if(!body)return;body.innerHTML='<div class="flag f-t" style="margin-bottom:10px"><i>&#128161;</i><span>Paste the ingredients list from any recipe &#8212; not the URL. Most sites have a "jump to recipe" button.</span></div><label>Ingredients list</label><textarea id="rec-in" rows="5" placeholder="e.g.&#10;6oz salmon fillet&#10;1 tbsp olive oil&#10;2 cloves garlic&#10;Serves 1"></textarea><div class="r2"><div><label>Servings</label><input type="number" id="rec-serv" value="1" min="1"/></div><div><label>Goal</label><select id="rec-goal"><option value="hit">Hit my targets</option><option value="pro">Max protein</option><option value="fl">Lower fat</option><option value="fc">Lower carbs</option></select></div></div><button class="btn" onclick="doRecipe()">Analyze + modify</button><div class="ai-box" id="rec-box"><div class="ai-lbl" style="display:flex;align-items:center;gap:5px"><span style="width:6px;height:6px;border-radius:50%;background:var(--cr);display:inline-block"></span>Recipe analysis</div><div class="ai-txt" id="rec-txt"></div><button class="retry-btn" id="rec-retry" style="display:none" onclick="doRecipe()">Try again</button><button class="btn btn-g btn-sm" id="rec-save-btn" style="display:none;margin-top:10px" onclick="saveRecFromAnalyzer()">Save to My Recipes</button></div><div class="disclaimer" id="rec-disc" style="display:none">These estimates are for planning and education. Exact macros vary based on preparation, brand, and portion. Use as a guide, not a guarantee.</div>';}

function buildFixHTML(){const body=e('body-fix');if(!body)return;body.innerHTML='<div style="background:var(--cr);border-radius:14px;padding:15px;margin-bottom:14px"><div style="color:#FAF8F6;font-size:15px;font-family:var(--fs);margin-bottom:3px">Tell me what you\'ve eaten</div><div style="color:var(--pl);font-size:12px;font-weight:300">I\'ll plan the rest of your day to land as close to your targets as possible.</div></div><label>What have you eaten today?</label><textarea id="fix-eaten" rows="4" placeholder="e.g.&#10;Breakfast: 2 eggs, toast&#10;Lunch: turkey wrap&#10;Snack: Greek yogurt"></textarea><label>How much of the day is left?</label><select id="fix-time"><option value="morning">Morning &#8212; most of the day ahead</option><option value="midday">Midday</option><option value="afternoon" selected>Afternoon &#8212; 1-2 meals left</option><option value="evening">Evening &#8212; just dinner left</option></select><button class="btn" onclick="doFix()">Fix my day</button><div class="ai-box" id="fix-box"><div class="ai-lbl" style="display:flex;align-items:center;gap:5px"><span style="width:6px;height:6px;border-radius:50%;background:var(--cr);display:inline-block"></span>Your plan for the rest of today</div><div class="ai-txt" id="fix-txt"></div><button class="retry-btn" id="fix-retry" style="display:none" onclick="doFix()">Try again</button></div><div class="disclaimer" style="display:block;margin-top:8px">These estimates are for planning and education. Exact macros vary based on preparation, brand, and portion. Use as a guide, not a guarantee.</div>';}

function buildGrocery(){const body=e('gro-content');if(!body)return;if(!planBuilt){body.innerHTML='<div class="card"><div class="cb">Build your meal plan first &#8212; your grocery list generates automatically from it.</div></div>';return;}const u=P.units!=='metric';const proteins=[];DAYS.forEach(d=>{if(MM[d])Object.values(MM[d]).forEach(slot=>{if(slot&&slot.protein&&slot.protein.trim())proteins.push(slot.protein.toLowerCase());});});const plants=[];DAYS.forEach(d=>{if(MM[d])Object.values(MM[d]).forEach(slot=>{if(slot&&slot.plants)slot.plants.split(',').forEach(p=>{const t=p.trim();if(t)plants.push(t);});});});const uP=[...new Set(proteins)],uPl=[...new Set(plants)];const secs={'Proteins':uP.length?uP.map(p=>[p.charAt(0).toUpperCase()+p.slice(1),'Calculate raw weight for protein targets']):[['Chicken breast (raw)',u?'~2 lbs':'~900g'],['Salmon fillets',u?'~1.5 lbs':'~680g'],['Eggs','1 dozen'],['Greek yogurt',u?'32 oz':'900g']],'Produce':uPl.length?uPl.map(p=>[p,'']):[[' Spinach',u?'5 oz':'140g'],['Broccoli',u?'1 head':'~400g'],['Bell peppers','3'],['Berries',u?'1 pint':'~300g'],['Avocado','2-3']],'Carbs':[['Brown rice',u?'2 cups dry':'380g dry'],['Sweet potatoes','2 medium'],['Oats',u?'1 cup dry':'90g dry'],['Black beans','1 can']],'Fats &amp; Oils':[['Olive oil','as needed'],['Butter','as needed'],['Nuts or nut butter','small jar']],'Snacks':[['Cottage cheese',u?'16 oz':'450g'],['Protein bars','4-6']]};let h=ebOn&&HD.length?'<div class="flag f-i"><i>&#128197;</i><span>Empowered Balance active. Higher days ('+HD.join(', ')+') may need slightly more food.</span></div>':'';Object.entries(secs).forEach(([sec,items])=>{if(!items.length)return;h+='<div style="margin-bottom:14px"><div style="font-size:10px;font-family:var(--fc);color:var(--cr);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px;padding-bottom:5px;border-bottom:.5px solid var(--pm)">'+sec+'</div>';items.forEach(([item,amt])=>{h+='<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:.5px solid var(--bl);font-size:13px"><span>'+item+'</span>'+(amt?'<span style="font-size:12px;color:var(--tp);font-family:var(--fc)">'+amt+'</span>':'')+'</div>';});h+='</div>';});body.innerHTML=h;}

function mfpTap(el){
  var c=el.querySelector(".cbx");
  var done=!c.classList.contains("on");
  c.classList.toggle("on",done);
  c.style.background=done?"var(--cr)":"";
  c.style.borderColor=done?"var(--cr)":"var(--tp)";
  c.innerHTML=done?'<svg viewBox="0 0 12 10" width="10" height="10" fill="none" stroke="#FAF8F6" stroke-width="1.5"><path d="M1 5l3.5 3.5L11 1"/></svg>':"";
}
function buildMFP(){
  var body=e("body-mfp");if(!body)return;
  if(!planBuilt){
    var h2="";
    h2+='<div style="background:var(--pl);border-radius:14px;padding:16px;margin-bottom:16px">';
    h2+='<div style="font-size:15px;font-family:var(--fs);color:var(--cr);margin-bottom:6px">Your personal MFP guide</div>';
    h2+='<div style="font-size:13px;color:var(--tx);line-height:1.6;font-weight:300">Once you map your meals in the Planner, your full logging list shows up here automatically &#8212; meal by meal, with checkboxes you can tap as you log in MFP.</div>';
    h2+="</div>";
    h2+='<div class="flag f-t"><i>&#128247;</i><span>To get started: tap <strong>Meal planner</strong> on the home screen, map out your week, and come back here for your ready-to-use logging list.</span></div>';
    h2+='<div class="card" style="border-color:var(--pm)">';
    h2+='<div style="font-size:12px;font-family:var(--fs);color:var(--tx);margin-bottom:8px">How MFP logging works</div>';
    h2+='<div style="font-size:12px;color:var(--mu);line-height:1.7;font-weight:300">';
    h2+="1. Search for each food in MyFitnessPal<br>2. Log the portion from your meal plan<br>3. Tick it here so you don't lose track<br>4. Use the batch recipe tip for meals you prep ahead";
    h2+="</div></div>";
    h2+='<div class="flag f-t" style="margin-top:4px"><i>&#128230;</i><div>';
    h2+='<div style="font-family:var(--fs);margin-bottom:3px">Batch recipes in MFP</div>';
    h2+="<div>Cook full batch &#8594; weigh total in grams &#8594; divide by serving count = your serving size. Log 1 serving each time.</div>";
    h2+="</div></div>";
    body.innerHTML=h2;
    return;
  }
  var bySlot={};
  DAYS.forEach(function(d){
    if(MM[d])Object.entries(MM[d]).forEach(function(entry){
      var slot=entry[0],fields=entry[1];
      if(fields&&(fields.protein||fields.plants||fields.carbs)){
        if(!bySlot[slot])bySlot[slot]=[];
        var parts=[fields.protein,fields.plants,fields.carbs,fields.fats,fields.extras].filter(Boolean);
        bySlot[slot].push.apply(bySlot[slot],parts);
      }
    });
  });
  var h='<div class="tog-row">';
  h+='<button class="tog on" id="mfp-us" onclick="setMFP(\'us\')">US (cups/oz)</button>';
  h+='<button class="tog" id="mfp-met" onclick="setMFP(\'metric\')">Metric (g/ml)</button>';
  h+="</div>";
  if(Object.keys(bySlot).length>0){
    Object.entries(bySlot).forEach(function(entry){
      var slot=entry[0],foods=entry[1];
      h+='<div style="margin-bottom:14px">';
      h+='<div style="font-size:10px;font-family:var(--fc);color:var(--cr);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;padding-bottom:5px;border-bottom:.5px solid var(--pm)">'+slot+"</div>";
      Array.from(new Set(foods)).forEach(function(food){
        h+='<div style="display:flex;align-items:flex-start;gap:9px;padding:8px 0;border-bottom:.5px solid var(--bl);cursor:pointer" onclick="mfpTap(this)">';
        h+='<div class="cbx" style="width:17px;height:17px;border-radius:4px;border:1.5px solid var(--tp);flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center"></div>';
        h+='<div style="font-size:12px;line-height:1.45;font-weight:300">'+escH(food)+"</div>";
        h+="</div>";
      });
      h+="</div>";
    });
    if(ebOn&&HD.length){
      h+='<div class="flag f-i"><i>&#128197;</i><span>Higher days ('+HD.join(", ")+"): calorie target is "+(PL.cal+slV)+". Adjust portions when logging those days.</span></div>";
    }
  } else {
    h+='<div class="card"><div class="cb">Fill in your meal map in the Planner to generate your MFP log.</div></div>';
  }
  h+='<div class="flag f-t" style="margin-top:10px"><i>&#128230;</i><div>';
  h+='<div style="font-family:var(--fs);margin-bottom:3px">Batch recipes in MFP</div>';
  h+="<div>Cook full batch &#8594; weigh total in grams &#8594; divide by serving count = your serving size. Log 1 serving each time.</div>";
  h+="</div></div>";
  h+='<div class="disclaimer" style="display:block;margin-top:10px">These estimates are for planning and education. Exact macros vary based on preparation, brand, and portion. Use as a guide, not a guarantee.</div>';
  body.innerHTML=h;
}
function setMFP(u){P.units=u==='metric'?'metric':'us';const um=e('mfp-us');if(um)um.classList.toggle('on',u==='us');const mm=e('mfp-met');if(mm)mm.classList.toggle('on',u==='metric');buildMFP();}

function buildReportDays(){
  var body=e("body-report");if(!body)return;
  var h="";
  if(planBuilt){
    var ms=MN.slice(0,PL.meals||3);
    var ss=Array.from({length:PL.snacks||1},function(_,i){return (PL.snacks||1)>1?"Snack "+(i+1):"Snack";});
    var slots=ms.concat(ss);
    var totalSlots=0,filledSlots=0;
    DAYS.forEach(function(d){
      if(MM[d])slots.forEach(function(sl){totalSlots++;if(MM[d][sl]&&MM[d][sl].protein)filledSlots++;});
    });
    var pct=totalSlots>0?Math.round(filledSlots/totalSlots*100):0;
    var avg=Math.round(DAYS.reduce(function(a,d){return a+(DC[d]||PL.cal||0);},0)/7);
    h+='<div style="background:var(--pl);border-radius:14px;padding:14px;margin-bottom:14px;border:.5px solid var(--pm)">';
    h+='<div style="font-size:11px;font-family:var(--fc);color:var(--cr);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">This week&#39;s plan overview</div>';
    h+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:10px">';
    h+='<div style="background:#fff;border-radius:10px;padding:9px;text-align:center"><div style="font-size:18px;font-family:var(--fh);color:var(--cr)">'+avg+'</div><div style="font-size:8px;color:var(--tp);text-transform:uppercase;font-family:var(--fc);line-height:1.2">Avg cal</div></div>';
    h+='<div style="background:#fff;border-radius:10px;padding:9px;text-align:center"><div style="font-size:18px;font-family:var(--fh);color:var(--cr)">'+(PL.pro||0)+'g</div><div style="font-size:8px;color:var(--tp);text-transform:uppercase;font-family:var(--fc);line-height:1.2">Protein target</div></div>';
    h+='<div style="background:#fff;border-radius:10px;padding:9px;text-align:center"><div style="font-size:18px;font-family:var(--fh);color:var(--cr)">'+pct+'%</div><div style="font-size:8px;color:var(--tp);text-transform:uppercase;font-family:var(--fc);line-height:1.2">Meals mapped</div></div>';
    h+="</div>";
    if(ebOn&&HD.length){
      h+='<div style="font-size:12px;color:var(--tx);font-weight:300">Empowered Balance ON. Higher days: '+HD.join(", ")+".</div>";
    }
    h+="</div>";
  }
  h+='<div class="card" style="background:var(--bl);border-color:var(--pm)">';
  h+='<div style="font-size:13px;font-family:var(--fs);color:var(--tx);margin-bottom:6px">How did the week actually go?</div>';
  h+='<div style="font-size:12px;color:var(--mu);line-height:1.6;font-weight:300">Enter what you actually logged each day. Skip days you did not track. I will review your week using the Weekly Average Method and give you one thing to focus on next week.</div>';
  h+="</div>";
  DAYS.forEach(function(d,i){
    h+='<div class="card" style="padding:12px;margin-bottom:8px">';
    h+='<div style="font-size:13px;font-family:var(--fs);margin-bottom:7px">'+d+"</div>";
    h+='<div class="r2" style="gap:8px">';
    h+='<div><label>Protein (g)</label><input type="number" id="rp-'+i+'" placeholder="'+(P.pro||140)+'" style="margin-bottom:0"/></div>';
    h+='<div><label>Calories</label><input type="number" id="rc-'+i+'" placeholder="'+(P.cal||1800)+'" style="margin-bottom:0"/></div>';
    h+="</div>";
    h+='<div class="r2" style="gap:8px;margin-top:7px">';
    h+='<div><label>Carbs (g)</label><input type="number" id="rcarb-'+i+'" placeholder="'+(P.carb||175)+'" style="margin-bottom:0"/></div>';
    h+='<div><label>Fat (g)</label><input type="number" id="rfat-'+i+'" placeholder="'+(P.fat||65)+'" style="margin-bottom:0"/></div>';
    h+="</div></div>";
  });
  h+='<button class="btn" onclick="doReport()" style="margin-top:4px">Get my insights &#10024;</button>';
  h+='<div class="ai-box" id="rep-box">';
  h+='<div class="ai-lbl" style="display:flex;align-items:center;gap:5px"><span style="width:6px;height:6px;border-radius:50%;background:var(--cr);display:inline-block"></span>Weekly insights</div>';
  h+='<div class="ai-txt" id="rep-txt"></div>';
  h+='<button class="retry-btn" id="rep-retry" style="display:none" onclick="doReport()">Try again</button>';
  h+="</div>";
  body.innerHTML=h;
}
function doReport(){const days=DAYS.map((d,i)=>({day:d,p:parseInt((e('rp-'+i)||{}).value)||0,cal:parseInt((e('rc-'+i)||{}).value)||0,carb:parseInt((e('rcarb-'+i)||{}).value)||0,fat:parseInt((e('rfat-'+i)||{}).value)||0})).filter(d=>d.p>0||d.cal>0);if(!days.length){alert('Enter at least one day.');return;}const avgP=Math.round(days.reduce((a,d)=>a+d.p,0)/days.length);const avgC=Math.round(days.reduce((a,d)=>a+d.cal,0)/days.length);const avgCb=Math.round(days.reduce((a,d)=>a+d.carb,0)/days.length);const avgF=Math.round(days.reduce((a,d)=>a+d.fat,0)/days.length);callAI(sysP(),'Weekly insights. Days logged: '+days.length+'/7. Averages: '+avgP+'g protein (target '+(P.pro||PL.pro)+'g), '+avgC+' calories (target '+(P.cal||PL.cal)+'), '+avgCb+'g carbs, '+avgF+'g fat. Days: '+days.map(d=>d.day+': '+d.p+'g P / '+d.cal+' cal').join(', ')+'. Weekly Average Method. Celebrate wins. Patterns. ONE focus next week. Warm, direct, coach energy. Sign off: xo, Amanda.','rep-box','rep-txt','rep-retry',null,doReport);}

function buildRecipesList(){const body=e('body-myrecipes');if(!body)return;let h='<button class="btn btn-g" onclick="toggleAddRec()" style="margin-bottom:14px">+ Add recipe manually</button><div id="add-rec-form" style="display:none"><div class="card" style="background:var(--bl);border-color:var(--pm)"><div style="font-size:13px;font-family:var(--fs);color:var(--tx);margin-bottom:10px">Add a recipe</div><label>Recipe name</label><input type="text" id="nr-name" placeholder="e.g. Lemon herb salmon"/><label>Ingredients</label><textarea id="nr-ing" rows="3" placeholder="e.g. 6oz salmon, 1 tbsp olive oil..."></textarea><div class="r2"><div><label>Calories (est.)</label><input type="number" id="nr-cal" placeholder="400"/></div><div><label>Protein (g)</label><input type="number" id="nr-pro" placeholder="40"/></div></div><div class="r2"><div><label>Carbs (g)</label><input type="number" id="nr-carb" placeholder="10"/></div><div><label>Fat (g)</label><input type="number" id="nr-fat" placeholder="18"/></div></div><button class="btn" onclick="saveRecManual()">Save recipe</button><button class="btn btn-g" onclick="toggleAddRec()">Cancel</button></div></div>';if(!recipes.length)h+='<div style="font-size:13px;color:var(--mu);text-align:center;padding:32px 0;font-weight:300">No saved recipes yet. Analyze a recipe and save it, or add one manually above.</div>';else recipes.forEach(rec=>{h+='<div class="rec-card"><div class="rec-card-name">'+escH(rec.name)+'</div><div class="rec-card-macros">'+(rec.cal?'<span class="rec-macro-pill">'+rec.cal+' cal</span>':'')+(rec.pro?'<span class="rec-macro-pill">'+rec.pro+'g P</span>':'')+(rec.carb?'<span class="rec-macro-pill">'+rec.carb+'g C</span>':'')+(rec.fat?'<span class="rec-macro-pill">'+rec.fat+'g F</span>':'')+'</div><div class="rec-card-ing">'+escH(rec.ingredients)+'</div><div class="rec-card-actions"><button class="btn btn-xs btn-g" onclick="delRec('+rec.id+')">Delete</button></div></div>';});body.innerHTML=h;}
function toggleAddRec(){const f=e('add-rec-form');if(f)f.style.display=f.style.display==='none'?'block':'none';}
function saveRecManual(){const name=(e('nr-name')||{}).value;const ing=(e('nr-ing')||{}).value;if(!name||!ing){alert('Name and ingredients are required.');return;}recipes.push({id:Date.now(),name:name.trim(),ingredients:ing.trim(),cal:parseInt((e('nr-cal')||{}).value)||0,pro:parseInt((e('nr-pro')||{}).value)||0,carb:parseInt((e('nr-carb')||{}).value)||0,fat:parseInt((e('nr-fat')||{}).value)||0});sv();buildRecipesList();}
function saveRecFromAnalyzer(){const name=prompt('Name this recipe:','My recipe');if(!name)return;const ri=e('rec-in');recipes.push({id:Date.now(),name:name.trim(),ingredients:(ri&&ri.value.trim())||'',cal:0,pro:0,carb:0,fat:0});sv();alert('Saved to My Recipes!');const sb=e('rec-save-btn');if(sb){sb.textContent='Saved ✓';sb.disabled=true;}}
function delRec(id){if(!confirm('Delete this recipe?'))return;recipes=recipes.filter(r=>r.id!==id);sv();buildRecipesList();}

function sysP(){return'You are the Empowered Nutrition coaching app by Amanda Ryan. Voice: confident, warm, supportive, wise big sister energy. Direct and real. No diet culture. No restriction framing. No em dashes. No clinical tone. Client: '+(P.name||'a client')+'. Protein '+(P.pro||PL.pro)+'g/day, Carbs '+(P.carb||PL.carb)+'g/day, Fat '+(P.fat||PL.fat)+'g/day, Calories '+(P.cal||PL.cal)+'/day. Units: '+((P.units||'us')==='us'?'US cups/oz':'metric g/ml')+'. Preferences: '+(P.prefs||'none')+'. 3 Ps: Plant Foods (10-15+ plants/week, micronutrient wins tied to real outcomes). Protein anchor first (40%+ cals from protein). Portions (weekly averages, never punishing). Suggestions: add first, then swap, then remove. Concise and real.';}
async function callAI(sys,msg,boxId,txtId,retryId,discId,retryFn){const box=e(boxId),txt=e(txtId),retry=e(retryId);if(!box||!txt)return;box.classList.add('show');txt.innerHTML='<div class="dots"><span></span><span></span><span></span></div>';if(retry)retry.style.display='none';try{const r=await fetch('/api/claude',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:sys,messages:[{role:'user',content:msg}]})});const d=await r.json();const t=d.content&&d.content[0]&&d.content[0].text;if(!t||d.error)throw new Error('API error');txt.innerHTML=t.replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');if(discId){const disc=e(discId);if(disc)disc.style.display='block';}if(retry)retry.style.display='none';return t;}catch(err){txt.innerHTML='<span style="color:var(--dn)">Couldn\'t connect right now.</span>';if(retry){retry.style.display='inline-block';retry.onclick=retryFn;}return'';}}

function doAnalyze(){const fi=e('food-in');if(!fi||!fi.value.trim())return;const t=P.pro||PL.pro,m=P.meals||3;callAI(sysP(),'Analyze macros for: '+fi.value.trim()+'. Give cals, protein, carbs, fat. Compare to per-meal target (~'+Math.round(t/m)+'g protein). Micronutrient wins for plant foods. Suggestions: add first, swap, remove.','ana-box','ana-txt','ana-retry','ana-disc',doAnalyze);setTimeout(()=>checkHid(fi.value),1500);}
function doPhoto(){const di=e('photo-in');if(!di||!di.value.trim())return;callAI(sysP(),'Client described a food photo: "'+di.value.trim()+'". Estimate macros. Compare to per-meal targets. Micronutrient callouts. Suggestions: add, swap, remove.','ana-box','ana-txt','ana-retry','ana-disc',doPhoto);setTimeout(()=>checkHid(di.value),1500);}
function doRestaurant(){const rn=e('rest-n');if(!rn||!rn.value.trim())return;const rm=e('rest-m');callAI(sysP(),'Client going to '+rn.value.trim()+'. Mood: '+((rm&&rm.value.trim())||'balanced')+'. Targets: '+(P.pro||PL.pro)+'g protein, '+(P.cal||PL.cal)+' cal. Suggest 2-3 best options. Estimate macros. Specific swaps.','ana-box','ana-txt','ana-retry','ana-disc',doRestaurant);}
function doRecipe(){const ri=e('rec-in');if(!ri||!ri.value.trim())return;const rs=e('rec-serv'),rg=e('rec-goal'),sb=e('rec-save-btn');if(sb){sb.style.display='none';sb.textContent='Save to My Recipes';sb.disabled=false;}lastRecTxt=ri.value.trim();callAI(sysP(),'Analyze for '+(rs&&rs.value||1)+' serving(s), goal: '+(rg&&rg.value||'hit')+'. Recipe: '+lastRecTxt+'. Macro breakdown per serving. Compare to targets. Smart modifications. Micronutrient callouts. If 4+ servings, suggest MFP custom recipe. Suggestions: add, swap, remove.','rec-box','rec-txt','rec-retry','rec-disc',doRecipe).then(t=>{if(t&&sb)sb.style.display='inline-block';});}
function doFix(){const fe=e('fix-eaten');if(!fe||!fe.value.trim())return;const ft=e('fix-time');const tmap={morning:'most of the day ahead',midday:'roughly midday',afternoon:'afternoon, 1-2 meals left',evening:'just dinner left'};callAI(sysP(),'Fix my day. Time: '+(tmap[(ft&&ft.value)||'afternoon'])+'. Eaten: '+fe.value.trim()+'. Targets: '+(P.pro||PL.pro)+'g P, '+(P.carb||PL.carb)+'g C, '+(P.fat||PL.fat)+'g F, '+(P.cal||PL.cal)+' cal. '+(P.meals||3)+' meals + '+(P.snacks||1)+' snack(s)/day. Flag likely missing hidden calories. Estimate consumed, then give exact meals for rest of day.','fix-box','fix-txt','fix-retry',null,doFix);}

function toggleAddForm(){const af=e('add-form');if(af)af.classList.toggle('show');}
function addClient(){const name=(e('af-name')||{}).value||'';const email=(e('af-email')||{}).value||'';if(!name.trim()||!email.trim()){alert('Name and email are required.');return;}const cal=parseInt((e('af-cal')||{}).value)||0;if(cal<1){alert('Please enter a valid calorie target.');return;}if(clients.find(c=>c.email.toLowerCase()===email.toLowerCase())){alert('A client with this email already exists.');return;}const nc={name:name.trim(),email:email.trim(),password:'shiftsociety123',hasLoggedIn:false,createdAt:new Date().toISOString(),lastActive:null,prefs:'',profile:{cal,pro:parseInt((e('af-pro')||{}).value)||0,carb:parseInt((e('af-carb')||{}).value)||0,fat:parseInt((e('af-fat')||{}).value)||0,meals:3,snacks:1}};clients.push(nc);sv();renderClients();const af=e('add-form');if(af)af.classList.remove('show');['af-name','af-email','af-cal','af-pro','af-carb','af-fat'].forEach(id=>{const el=e(id);if(el)el.value='';});alert('Account created for '+name+'.\n\nTemporary password: shiftsociety123\n\nShare the app URL and this password with your client. They will set up their meals, snacks, and preferences on first login.');}
function delClient(email){if(!confirm('Remove this client? Their data will be deleted.'))return;clients=clients.filter(c=>c.email!==email);sv();renderClients();}
function editClient(email){const c=clients.find(x=>x.email===email);if(!c)return;const cal=prompt('Daily calories for '+c.name+':',c.profile.cal||'');if(cal===null)return;const pro=prompt('Daily protein (g):',c.profile.pro||'');if(pro===null)return;const carb=prompt('Daily carbs (g):',c.profile.carb||'');if(carb===null)return;const fat=prompt('Daily fat (g):',c.profile.fat||'');if(fat===null)return;c.profile.cal=parseInt(cal)||c.profile.cal;c.profile.pro=parseInt(pro)||c.profile.pro;c.profile.carb=parseInt(carb)||c.profile.carb;c.profile.fat=parseInt(fat)||c.profile.fat;clients=clients.map(x=>x.email===email?c:x);sv();renderClients();alert('Targets updated. Client will see the new numbers next time they open the app.');}
function inviteTeam(){const n=(e('tm-name')||{}).value||'',te=(e('tm-email')||{}).value||'';if(!n.trim()||!te.trim()){alert('Name and email required.');return;}alert('Invite noted for '+n+' ('+te+').\n\nWhen Firebase is connected, a real admin invite email will be sent automatically.');['tm-name','tm-email'].forEach(id=>{const el=e(id);if(el)el.value='';});}
function renderClients(){const el=e('client-list');if(!el)return;if(!clients.length){el.innerHTML='<div style="font-size:13px;color:var(--mu);font-weight:300;padding:10px 0">No clients yet. Add your first client above.</div>';return;}let h='';clients.forEach(c=>{const init=(c.name||'?').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();const la=c.lastActive?new Date(c.lastActive).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'Never';const logPill=c.hasLoggedIn?'<span class="cs-pill cs-g">Active</span>':'<span class="cs-pill cs-w">Never logged in</span>';const tgts=c.profile&&c.profile.cal?'<span class="cs-pill cs-gr">'+c.profile.cal+' cal &middot; '+(c.profile.pro||'?')+'g P</span>':'<span class="cs-pill cs-w">No targets set</span>';h+='<div class="client-row"><div class="client-av">'+init+'</div><div class="client-info"><div class="client-name">'+escH(c.name)+'</div><div class="client-email">'+escH(c.email)+' &middot; Last active: '+la+'</div><div class="client-stats">'+logPill+tgts+'</div></div><div class="client-actions"><button class="ca-btn ca-e" onclick="editClient(\''+c.email+'\')">Edit</button><button class="ca-btn ca-d" onclick="delClient(\''+c.email+'\')">Remove</button></div></div>';});el.innerHTML=h;}

try{buildApp();}catch(err){document.getElementById("APP_ROOT").innerHTML='<div style="padding:40px;font-family:sans-serif;color:#6E1514;text-align:center"><div style="font-size:24px;margin-bottom:12px">&#9888;</div><div style="font-size:14px;margin-bottom:8px">App failed to load</div><div style="font-size:11px;color:#999">Error: '+err.message+'</div></div>';}
ld();
tick();setInterval(tick,10000);
if(P.name&&P.email&&!P.firstLogin){showV('app');updG();nav('home');}else{showV('login');}
