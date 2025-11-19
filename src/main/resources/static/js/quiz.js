function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

const params = new URLSearchParams(location.search);
const quizId = params.get('quizId');
if (!quizId) {
  document.body.innerHTML = '<p>No quiz specified. Go back to <a href="/">quizzes</a>.</p>';
}

function renderQuestions(questions) {
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
  fetch(`/api/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers })
  }).then(r => r.json()).then(res => {
    // Save results for the results page and redirect there
    try {
      sessionStorage.setItem('quizResults-' + quizId, JSON.stringify(res));
    } catch (e) { console.warn('sessionStorage not available', e); }
    // navigate to results view
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
