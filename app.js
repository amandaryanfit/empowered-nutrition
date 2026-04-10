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
      <img src="/logo-light.jpg" alt="Shift Society" style="width:180px;height:auto;display:block"/>
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
<div class="screen active" id="sc-home" style="overflow:hidden;display:flex;flex-direction:column;flex:1">
  <div class="goals-bar" style="background:linear-gradient(135deg,var(--cr) 0%,#8B1A19 100%)">
    <div class="g-hdr"><div class="g-title" id="g-title-lbl">My weekly targets</div><button class="g-edit" onclick="toggleGF()">Edit</button></div>
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
  e('wz-sub').textContent=subs[wzS];
  let b='';
  if(wzS===0){b='<div style="text-align:center;padding:20px 0"><div style="width:74px;height:74px;border-radius:50%;background:var(--bl);border:2px solid var(--pm);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;font-family:var(--fh);color:var(--cr)">'+(P.name||'?')[0].toUpperCase()+'</div><div style="font-size:22px;font-family:var(--fh);color:var(--tx);margin-bottom:8px">'+(P.name||'Welcome')+'</div><div style="font-size:13px;color:var(--mu);line-height:1.65;font-weight:300;margin-bottom:24px">This is your personal Empowered Nutrition app, built around your specific targets and Amanda\'s methodology.</div></div><button class="btn" onclick="wzS=1;renderWZ()">Get started &#8594;</button>';}
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
function doReport(){const days=DAYS.map((d,i)=>({day:d,p:parseInt((e('rp-'+i)||{}).value)||0,cal:parseInt((e('rc-'+i)||{}).value)||0,carb:parseInt((e('rcarb-'+i)||{}).value)||0,fat:parseInt((e('rfat-'+i)||{}).value)||0})).filter(d=>d.p>0||d.cal>0);if(!days.length){alert('Enter at least one day.');return;}const avgP=Math.round(days.reduce((a,d)=>a+d.p,0)/days.length);const avgC=Math.round(days.reduce((a,d)=>a+d.cal,0)/days.length);const avgCb=Math.round(days.reduce((a,d)=>a+d.carb,0)/days.length);const avgF=Math.round(days.reduce((a,d)=>a+d.fat,0)/days.length);callAI(sysP(),'Weekly insights. Days logged: '+days.length+'/7. Averages: '+avgP+'g protein (target '+(P.pro||PL.pro)+'g), '+avgC+' calories (target '+(P.cal||PL.cal)+'), '+avgCb+'g carbs, '+avgF+'g fat. Days: '+days.map(d=>d.day+': '+d.p+'g P / '+d.cal+' cal').join(', ')+'. Weekly Average Method. Celebrate wins. Patterns. ONE focus next week. Warm, direct, proud of her.','rep-box','rep-txt','rep-retry',null,doReport);}

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
