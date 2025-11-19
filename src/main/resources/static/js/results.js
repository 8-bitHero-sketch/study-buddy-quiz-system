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
