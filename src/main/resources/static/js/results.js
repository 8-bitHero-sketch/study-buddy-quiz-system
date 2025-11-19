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
  const tryBtn = document.createElement('button'); tryBtn.className='tryAgainBtn'; tryBtn.textContent='Try again';
  tryBtn.addEventListener('click', onTryAgain);
  actions.appendChild(tryBtn);
  area.appendChild(actions);

  // show animation depending on score
  if (res.score === res.total && res.total > 0) {
    showCelebration();
  } else {
    showEncouragement();
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
