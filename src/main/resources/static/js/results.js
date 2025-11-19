function qs(sel){return document.querySelector(sel)}
function qsa(sel){return Array.from(document.querySelectorAll(sel))}

const params = new URLSearchParams(location.search);
const quizId = params.get('quizId');
const key = 'quizResults-' + quizId;
let res = null;
try { res = JSON.parse(sessionStorage.getItem(key)); } catch(e) { res = null; }

const area = qs('#resultsArea');
if (!res) {
  area.innerHTML = '<p>No results found. Please take the quiz first.</p>';
  return;
}

const demoMode = params.get('demo') === '1';
const phase = params.get('phase') || null;

// demo safety: avoid infinite auto-correct loops by limiting retries
const autoCorrectRetryKey = 'demoAutoCorrectRetry-' + quizId;
let autoCorrectRetries = Number(sessionStorage.getItem(autoCorrectRetryKey) || 0);

// results page debug & effects utilities
const __resLogs = [];
function resDbg(msg){ try{ __resLogs.push(msg); console.log('[RESULTS]',msg);}catch(e){} }

function createResultsDebugToggle(){
  if (qs('#debugToggleR')) return;
  const btn = document.createElement('div'); btn.id='debugToggleR'; btn.className='debugToggle'; btn.textContent='Debug';
  btn.style.top = '64px';
  btn.addEventListener('click', ()=>{
    let ov = qs('#debugOverlayR');
    if (!ov){ ov = document.createElement('div'); ov.id='debugOverlayR'; ov.className='debugOverlay'; document.body.appendChild(ov); }
    if (ov.classList.contains('visible')){ ov.classList.remove('visible'); return; }
    ov.innerHTML = '<pre style="white-space:pre-wrap">' + __resLogs.join('\n') + '</pre>';
    ov.classList.add('visible');
  });
  document.body.appendChild(btn);
}

function createCelebrationCanvas(){
  if (qs('#celebrationCanvas')) return qs('#celebrationCanvas');
  const c = document.createElement('canvas'); c.id='celebrationCanvas'; document.body.appendChild(c);
  function resize(){ c.width = window.innerWidth; c.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  return c;
}

function launchParticles(durationMs){
  const canvas = createCelebrationCanvas();
  const ctx = canvas.getContext('2d');
  const particles = [];
  const colors = ['#ffd24d','#ff9a9e','#a1c4fd','#7ef0d5'];
  function spawnBurst(x,y,count,spread,layer){
    for(let i=0;i<count;i++){ const angle = Math.random()*Math.PI*2; const speed = Math.random()*spread + (layer*0.6);
      particles.push({x,y, vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed - (1.2*layer), life:Math.random()*0.9+0.6, age:0, r: (2+Math.random()*6)*(1+layer*0.6), color: colors[Math.floor(Math.random()*colors.length)], opacity:1 - 0.25*layer}); }
  }
  // layered bursts
  const cx = canvas.width/2, cy = canvas.height*0.55;
  spawnBurst(cx, cy, 36, 4, 0);
  spawnBurst(cx, cy, 22, 6, 1);
  spawnBurst(cx, cy, 12, 10, 2);

  let last = performance.now();
  const ttl = durationMs || 2200;
  const endAt = performance.now() + ttl;
  function step(now){
    const dt = Math.min(0.05, (now-last)/1000); last = now;
    ctx.clearRect(0,0,canvas.width, canvas.height);
    // trail layer: slightly translucent background to create trailing effect
    ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillRect(0,0,canvas.width, canvas.height);
    for(let i=particles.length-1;i>=0;i--){ const p = particles[i]; p.age += dt; if(p.age > p.life){ particles.splice(i,1); continue; } p.vy += 80*dt; p.x += p.vx; p.y += p.vy*dt*60; const t = 1 - (p.age/p.life); ctx.beginPath(); ctx.fillStyle = `rgba(${hexToRgb(p.color)},${t*p.opacity})`; ctx.arc(p.x,p.y,p.r*t,0,Math.PI*2); ctx.fill(); }
    if(now < endAt || particles.length>0){ requestAnimationFrame(step); } else { try{ canvas.remove(); }catch(e){} }
  }
  requestAnimationFrame(step);
}

function hexToRgb(hex){ const c = hex.replace('#',''); const num = parseInt(c,16); return `${(num>>16)&255},${(num>>8)&255},${num&255}`; }

function playCelebrationSound(){
  try{
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const now = ac.currentTime;
    const g = ac.createGain(); g.connect(ac.destination); g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.6, now+0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now+1.8);
    // layered sine bursts
    [0,3,7].forEach((m,i)=>{
      const o = ac.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(440*(1+0.08*i)*(1+0.02*m), now+0.01 + i*0.04); o.connect(g); o.start(now+0.01 + i*0.04); o.stop(now+0.8 + i*0.1);
    });
  }catch(e){ console.warn('Audio failed', e); }
}

function render() {
  area.innerHTML = '';
  const header = document.createElement('div'); header.className='resultsHeader'; header.innerHTML = `<h2>Score: ${res.score} / ${res.total}</h2>`; area.appendChild(header);
  const list = document.createElement('div'); list.className='resultsList';
  res.results.forEach(rq => {
    const d = document.createElement('div'); d.className='resultItem';
    d.innerHTML = `<p><b>${rq.question}</b><br>Your answer: ${rq.given || '(none)'} — ${rq.correct ? '<span class="ok">Correct</span>' : '<span class="bad">Wrong</span>'}<br>Correct answer: ${rq.correctAnswer || '(unknown)'}</p>`;
    list.appendChild(d);
  });
  area.appendChild(list);

  const actions = document.createElement('div'); actions.className='resultsActions';
  const tryBtn = document.createElement('button');
  tryBtn.className='tryAgainBtn resultsTryCenter';
  tryBtn.textContent='Try again';
  tryBtn.addEventListener('click', onTryAgain);
  actions.appendChild(tryBtn);
  area.appendChild(actions);
  try{ createResultsDebugToggle(); resDbg('Rendered results, score='+res.score+' total='+res.total); }catch(e){}

  // show animation depending on score
  if (res.score === res.total && res.total > 0) {
    showCelebration();
    // if demo mode, after brief celebration, restart the cycle
    if (demoMode) {
      setTimeout(() => {
        // short encouraging overlay then restart demo loop
        showShortMessage('I believe in you ✨', 1400, () => {
          // go back to quiz and run demo again
          location.href = 'quiz.html?quizId=' + quizId + '&demo=1';
        });
      }, 2500);
    }
  } else {
    showEncouragement();
    // if demo mode and this page was reached as the wrong-phase, auto-submit correct answers after a pause
    if (demoMode && phase === 'wrong') {
      // safety: avoid infinite auto-correct loops
      if (autoCorrectRetries >= 3) {
        console.warn('Demo auto-correct retries exceeded, stopping demo loop.');
        showShortMessage('Demo stopped after repeated retries', 2200, () => {});
        return;
      }
      // wait 1.5s then fetch correct answers and post them
      setTimeout(() => {
        // increment and store retry count
        autoCorrectRetries += 1;
        try { sessionStorage.setItem(autoCorrectRetryKey, String(autoCorrectRetries)); } catch(e){}
        fetch(`/api/quizzes/${quizId}/answers`).then(r=>r.json()).then(keys => {
          const answers = keys.map(k => ({ questionId: Number(k.questionId), answer: (k.correct || '').trim().toUpperCase() }));
          // submit correct answers
          fetch(`/api/quizzes/${quizId}/submit`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers })
          }).then(r=>r.json()).then(newRes => {
            try { sessionStorage.setItem('quizResults-' + quizId, JSON.stringify(newRes)); } catch(e){}
            res = newRes;
            // re-render to show perfect result and celebration
            render();
          }).catch(e=>{
            console.error('Auto-correct submit failed', e);
            showShortMessage('Auto-correct failed', 1600);
          });
        }).catch(e=>{
          console.error('Failed to fetch answer keys', e);
          showShortMessage('Failed to fetch answer keys', 1600);
        });
      }, 1500);
    }
  }
}

function onTryAgain(){
  // show short encouraging overlay then redirect back to quiz
  showShortMessage('I believe in you ✨', 1400, () => {
    // navigate back to quiz
    location.href = 'quiz.html?quizId=' + quizId;
  });
}

function showShortMessage(text, ms, cb){
  const id = 'shortMsgOverlay';
  if (qs('#'+id)) return;
  const ov = document.createElement('div'); ov.id = id; ov.className='shortMsgOverlay';
  ov.innerHTML = `<div class="shortMsgContent"><div class="stars">✶ ✦ ✶</div><div class="msg">${text}</div></div>`;
  document.body.appendChild(ov);
  setTimeout(()=>{ ov.classList.add('visible'); }, 30);
  setTimeout(()=>{ ov.classList.remove('visible'); setTimeout(()=>{ ov.remove(); if(cb) cb(); },300); }, ms);
}

function showCelebration(){
  // simple confetti overlay reuse from quiz.js
  if (qs('#celebrationOverlay')) return; // already shown
  const ov = document.createElement('div'); ov.id='celebrationOverlay'; ov.className='visible';
  ov.innerHTML = `<div class="celebrationContent"><div class="fireworks"></div><div class="balloons"><div class="balloon b1"></div><div class="balloon b2"></div><div class="balloon b3"></div></div><h1 class="congrats">Congratulations!</h1><p class="congratsSub">You scored a perfect 100% 🎉</p><button id="closeCelebration" class="tryAgainBtn">Close</button></div>`;
  document.body.appendChild(ov);
  qs('#closeCelebration').addEventListener('click', ()=>{ ov.remove(); });
  // Also display percent big
  const pct = Math.round((res.score / Math.max(1,res.total)) * 100);
  const big = document.createElement('div'); big.className='celebrationPercent'; big.innerHTML = `<div style="font-size:48px;font-weight:900;color:#ffd24d">${pct}%</div>`;
  ov.querySelector('.celebrationContent').appendChild(big);
  // launch particle effects and sound
  try { launchParticles(2400); playCelebrationSound(); } catch(e){ resDbg('Particles/sound failed: '+e); }

  // If demo mode, launch a runner element that moves from bottom -> top, then return to start page to loop demo
  if (demoMode) {
    try {
      // reset retry counter on success
      sessionStorage.removeItem(autoCorrectRetryKey);
    } catch(e){}

    const runner = document.createElement('div');
    runner.id = 'celebrationRunner';
    runner.style.position = 'fixed';
    runner.style.left = '50%';
    runner.style.bottom = '0px';
    runner.style.transform = 'translateX(-50%)';
    runner.style.width = '80px';
    runner.style.height = '80px';
    runner.style.borderRadius = '50%';
    runner.style.background = 'radial-gradient(circle at 30% 30%, #ffd24d, #f39c12)';
    runner.style.zIndex = 10000;
    document.body.appendChild(runner);

    // animate upward and then redirect to root to restart demo
    const anim = runner.animate([
      { transform: 'translate(-50%, 0vh) scale(1)' },
      { transform: 'translate(-50%, -110vh) scale(1.1)' }
    ], { duration: 2400, easing: 'cubic-bezier(.2,.8,.2,1)' });

    anim.onfinish = () => {
      try { ov.remove(); } catch(e){}
      try { runner.remove(); } catch(e){}
      // small delay so animation cleanup looks smooth
      setTimeout(() => { location.href = '/'; }, 220);
    };
  }
}

function showEncouragement(){
  // gentle encouragement panel at top
  if (qs('#encourageOverlay')) return;
  const ov = document.createElement('div'); ov.id='encourageOverlay'; ov.className='encourage';
  ov.innerHTML = `<div class="encourageContent"><div class="encourageStars">✶ ✦</div><div class="encourageMsg">You can do it — try again!</div></div>`;
  document.body.appendChild(ov);
  setTimeout(()=> ov.classList.add('visible'), 20);
}

render();
