function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

const params = new URLSearchParams(location.search);
const quizId = params.get('quizId');
if (!quizId) {
  document.body.innerHTML = '<p>No quiz specified. Go back to <a href="/">quizzes</a>.</p>';
}

// runtime debug log buffer (displayable via debug overlay)
const __debugLogs = [];
function dbg(msg) { try { __debugLogs.push(msg); console.log('[QUIZ]',msg); } catch(e){} }

function createDebugToggle() {
  if (qs('#debugToggle')) return;
  const btn = document.createElement('div'); btn.id='debugToggle'; btn.className='debugToggle'; btn.textContent='Debug';
  btn.addEventListener('click', () => {
    const ov = document.querySelector('.debugOverlay') || (()=>{
      const d = document.createElement('div'); d.className='debugOverlay'; d.id='debugOverlay'; document.body.appendChild(d); return d; })();
    if (ov.classList.contains('visible')) { ov.classList.remove('visible'); return; }
    ov.innerHTML = '<pre style="white-space:pre-wrap">' + __debugLogs.join('\n') + '</pre>';
    ov.classList.add('visible');
  });
  document.body.appendChild(btn);
}

function renderQuestions(questions) {
  // store questions for mapping results to IDs
  window.__questions = questions || [];
  dbg('renderQuestions: loaded ' + window.__questions.length + ' questions');
  const form = qs('#quizForm');
  form.innerHTML = '';
  questions.forEach((q, idx) => {
    const div = document.createElement('div');
    div.className = 'question';
    const title = document.createElement('p');
    title.innerHTML = `<strong>${idx+1}. ${q.text}</strong>`;
    div.appendChild(title);
    const opts = q.options || [];
    const letters = ['A','B','C','D'];
    opts.forEach((opt, i) => {
      if (opt == null) return;
      const id = `q_${q.id}_opt_${i}`;
      const label = document.createElement('label');
      // prefix with letter like 'A.' and keep radio value as the letter
      label.innerHTML = `<input type="radio" name="q${q.id}" value="${letters[i]}"> <strong>${letters[i]}.</strong> ${opt}`;
      div.appendChild(label);
      div.appendChild(document.createElement('br'));
    });
    form.appendChild(div);
  });
}

function loadQuiz() {
  fetch(`/api/quizzes/${quizId}/questions`)
    .then(r => r.json())
    .then(questions => {
      // fetch quiz title
      fetch(`/api/quizzes/${quizId}`).then(r=>r.json()).then(q=> { qs('#quizTitle').textContent = q.title; });
      renderQuestions(questions);
      createDebugToggle();
      // if demo mode, start automated wrong-answer submission after a short pause
      const params = new URLSearchParams(location.search);
      const demo = params.get('demo');
      if (demo === '1') {
        // wait a moment to let UI render
        setTimeout(() => { runDemoWrong(questions); }, 800);
      }
    })
    .catch(err => { qs('#quizForm').innerHTML = '<p>Failed to load quiz.</p>'; console.error(err); });
}

function runDemoWrong(questions) {
  // build answers that are likely wrong: choose a random option for each question
  const letters = ['A','B','C','D'];
  const answers = questions.map(q => {
    // pick random letter
    const pick = letters[Math.floor(Math.random() * letters.length)];
    return { questionId: Number(q.id), answer: pick };
  });

  // post to submit endpoint directly and then redirect to results with demo flag
  fetch(`/api/quizzes/${quizId}/submit`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers })
  }).then(r => r.json()).then(res => {
    try { sessionStorage.setItem('quizResults-' + quizId, JSON.stringify(res)); } catch(e){}
    // indicate phase wrong so results can branch
    location.href = 'results.html?quizId=' + quizId + '&demo=1&phase=wrong';
  }).catch(err => console.error('Demo submit failed', err));
}

function collectAnswers() {
  const data = [];
  qsa('form#quizForm .question').forEach(div => {
    const name = qsa('input', div)[0] ? qsa('input', div)[0].name : null;
  });
  const fm = new FormData(qs('#quizForm'));
  for (const [name, value] of fm.entries()) {
    if (!name.startsWith('q')) continue;
    const id = name.substring(1); // remove leading 'q'
    data.push({ questionId: Number(id), answer: value });
  }
  return data;
}

qs('#submitBtn').addEventListener('click', (e) => {
  e.preventDefault();
  const answers = collectAnswers();
  // require an answer for each question before submitting
  const expected = (window.__questions || []).length;
  if (answers.length < expected) {
    showShortMessage('Please answer all questions before submitting', 1600);
    dbg(`Submit blocked: answered ${answers.length}/${expected}`);
    return;
  }

  fetch(`/api/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers })
  }).then(r => r.json()).then(res => {
    // Save results for the results page and redirect there
    try {
      sessionStorage.setItem('quizResults-' + quizId, JSON.stringify(res));
    } catch (e) { console.warn('sessionStorage not available', e); }
    dbg('Submitted answers: ' + JSON.stringify(answers));
    dbg('Server response: ' + JSON.stringify(res));
    // attempt tracking: map result entries back to question IDs using stored questions
    try {
      const qmap = (window.__questions || []).reduce((acc,q)=>{ acc[(q.text||q.questionText||'').trim()]=q.id; return acc; }, {});
      (res.results||[]).forEach(rq => {
        const keyText = (rq.question||'').trim();
        const qid = qmap[keyText];
        if (!qid) return;
        const attemptKey = `attempts-${quizId}-${qid}`;
        let attempts = Number(sessionStorage.getItem(attemptKey)||0);
        if (!rq.correct) { attempts += 1; sessionStorage.setItem(attemptKey, String(attempts)); dbg(`Question ${qid} wrong, attempts=${attempts}`); }
        else { sessionStorage.removeItem(attemptKey); dbg(`Question ${qid} correct, resetting attempts`); }
        if (attempts >= 3) {
          // disable inputs for that question and show Try Again to restart
          const inputs = document.querySelectorAll(`input[name='q${qid}']`);
          inputs.forEach(i=>i.disabled=true);
          // create a central Try Again control
          const retry = document.createElement('button'); retry.textContent='Try Again'; retry.className='resultsTryCenter'; retry.style.display='block'; retry.style.margin='20px auto';
          retry.addEventListener('click', ()=>{ // restart quiz
            // clear attempts and reload
            (window.__questions||[]).forEach(q=> sessionStorage.removeItem(`attempts-${quizId}-${q.id}`));
            location.href = `quiz.html?quizId=${quizId}`;
          });
          // avoid duplicate retry buttons
          if (!document.querySelector('.container .resultsTryCenter')) document.querySelector('.container').appendChild(retry);
        }
      });
    } catch(e){ dbg('Attempt tracking failed: '+e); }
    // If everything is correct, show celebration here first to avoid
    // animation timing issues when immediately navigating away.
    if (res && typeof res.score === 'number' && res.score === res.total && res.total > 0) {
      try { sessionStorage.setItem('quizResults-' + quizId, JSON.stringify(res)); } catch(e){}
      showCelebration();
      // after celebration, go to results to show detailed breakdown
      setTimeout(() => { location.href = 'results.html?quizId=' + quizId; }, 2400);
      return;
    }

    // If not all correct, prompt Try Again and clear radio selections so
    // the user can retry cleanly
    const anyWrong = !(res && typeof res.score === 'number' && res.score === res.total);
    if (anyWrong) {
      showShortMessage('Some answers were incorrect — try again', 1400);
      // clear all selected radios so user must pick again
      qsa('input[type=radio][name^="q"]').forEach(i=>{ try { i.checked = false; } catch(e){} });
      dbg('Cleared radio selections after wrong submit');
    }

    // navigate to results view (shows breakdown and Try Again control)
    location.href = 'results.html?quizId=' + quizId;
  }).catch(err => { console.error(err); alert('Submit failed'); });
});

loadQuiz();

// Celebration overlay helpers
function createCelebration() {
  if (qs('#celebrationOverlay')) return;
  const ov = document.createElement('div');
  ov.id = 'celebrationOverlay';
  ov.innerHTML = `
    <div class="celebrationContent">
      <div class="fireworks">\n      </div>
      <div class="balloons">
        <div class="balloon b1"></div>
        <div class="balloon b2"></div>
        <div class="balloon b3"></div>
      </div>
      <h1 class="congrats">Congratulations!</h1>
      <p class="congratsSub">You scored a perfect 100% 🎉</p>
      <button id="closeCelebration" class="tryAgainBtn">Close</button>
    </div>`;
  document.body.appendChild(ov);
  qs('#closeCelebration').addEventListener('click', () => { hideCelebration(); });
}

function showCelebration(container) {
  createCelebration();
  const ov = qs('#celebrationOverlay');
  ov.classList.add('visible');
}

function hideCelebration() {
  const ov = qs('#celebrationOverlay');
  if (!ov) return;
  ov.classList.remove('visible');
  setTimeout(() => { ov.remove(); }, 900);
}

// Small transient message overlay used for validation and short notices
function showShortMessage(text, ms, cb){
  const id = 'quizShortMsg';
  if (qs('#'+id)) return;
  const ov = document.createElement('div'); ov.id = id; ov.className='shortMsgOverlay';
  ov.innerHTML = `<div class="shortMsgContent"><div class="stars">✶ ✦ ✶</div><div class="msg">${text}</div></div>`;
  document.body.appendChild(ov);
  setTimeout(()=>{ ov.classList.add('visible'); }, 20);
  setTimeout(()=>{ ov.classList.remove('visible'); setTimeout(()=>{ try{ ov.remove(); }catch(e){} if(cb) cb(); },300); }, ms || 1400);
}
