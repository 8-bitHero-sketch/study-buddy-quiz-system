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
      label.innerHTML = `<input type="radio" name="q${q.id}" value="${letters[i]}"> ${opt}`;
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
    })
    .catch(err => { qs('#quizForm').innerHTML = '<p>Failed to load quiz.</p>'; console.error(err); });
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
    const out = qs('#results');
    out.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'resultsHeader';
    header.innerHTML = `<h2>Score: ${res.score} / ${res.total}</h2>`;
    out.appendChild(header);

    const list = document.createElement('div');
    list.className = 'resultsList';
    res.results.forEach(rq => {
      const d = document.createElement('div');
      d.className = 'resultItem';
      d.innerHTML = `<p><b>${rq.question}</b><br>Your answer: ${rq.given || '(none)'} — ${rq.correct ? '<span class="ok">Correct</span>' : '<span class="bad">Wrong</span>'}<br>Correct answer: ${rq.correctAnswer || '(unknown)'} </p>`;
      list.appendChild(d);
    });
    out.appendChild(list);

    // Try again button
    const actions = document.createElement('div');
    actions.className = 'resultsActions';
    const tryBtn = document.createElement('button');
    tryBtn.textContent = 'Try again';
    tryBtn.className = 'tryAgainBtn';
    tryBtn.addEventListener('click', () => {
      // reset form selections
      qsa('input[type=radio]').forEach(i => i.checked = false);
      out.innerHTML = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    actions.appendChild(tryBtn);
    out.appendChild(actions);

    // Celebration for perfect score
    if (res.score === res.total && res.total > 0) {
      showCelebration(out);
    } else {
      hideCelebration();
    }

    window.scrollTo(0, document.body.scrollHeight);
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
