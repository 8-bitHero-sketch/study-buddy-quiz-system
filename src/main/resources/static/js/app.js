const apiRoot = '/api';

async function fetchQuizzes() {
  const res = await fetch(`${apiRoot}/quizzes`);
  return res.json();
}

async function fetchQuestions(quizId) {
  const res = await fetch(`/api/questions/quiz/${quizId}`);
  return res.json();
}

async function postSubmit(quizId, answers) {
  const res = await fetch(`${apiRoot}/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answers)
  });
  return res.json();
}

function qs(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Page behavior
window.addEventListener('load', async () => {
  // index.html: show quizzes
  const quizzesEl = document.getElementById('quizzes');
  if (quizzesEl) {
    const quizzes = await fetchQuizzes();
    quizzesEl.innerHTML = '';
    quizzes.forEach(q => {
      const li = document.createElement('li');
      li.className = 'quiz-item';
      const a = document.createElement('a');
      a.href = `/quiz.html?id=${q.id}`;
      a.textContent = `${q.title} — ${q.subject}`;
      li.appendChild(a);
      quizzesEl.appendChild(li);
    });
    return;
  }

  // quiz.html: render quiz by id
  const quizTitleEl = document.getElementById('quiz-title');
  if (quizTitleEl) {
    const id = qs('id');
    if (!id) return;
    // Fetch quiz meta
    const quiz = await fetch(`${apiRoot}/quizzes/${id}`).then(r => r.json());
    quizTitleEl.textContent = quiz.title;
    document.getElementById('quiz-desc').textContent = quiz.description || '';
    const questions = await fetchQuestions(id);
    const form = document.getElementById('quiz-form');
    form.innerHTML = '';

    questions.forEach((q, idx) => {
      const field = document.createElement('div');
      field.className = 'question';
      const h = document.createElement('h3');
      h.textContent = (idx + 1) + '. ' + q.questionText;
      field.appendChild(h);
      ['A','B','C','D'].forEach(letter => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'q_' + q.id;
        input.value = letter;
        label.appendChild(input);
        const text = document.createTextNode(' ' + (q['option' + letter] || ''));
        label.appendChild(text);
        field.appendChild(label);
        field.appendChild(document.createElement('br'));
      });
      form.appendChild(field);
    });

    document.getElementById('submit-btn').onclick = async () => {
      const answers = [];
      questions.forEach(q => {
        const chosen = document.querySelector(`input[name='q_${q.id}']:checked`);
        answers.push({ questionId: q.id, selectedAnswer: chosen ? chosen.value : null });
      });

      const result = await postSubmit(id, answers);
      // Save last result in sessionStorage and go to results page
      sessionStorage.setItem('lastQuizResult', JSON.stringify({ quizId: id, result }));
      window.location.href = `/results.html?quizId=${id}`;
    };
    return;
  }

  // results.html: read last result from sessionStorage
  const resultsArea = document.getElementById('results-area');
  if (resultsArea) {
    const stored = sessionStorage.getItem('lastQuizResult');
    if (!stored) {
      document.getElementById('summary').textContent = 'No recent quiz result found.';
      return;
    }
    const parsed = JSON.parse(stored);
    const res = parsed.result;
    document.getElementById('summary').textContent = `Score: ${res.correctAnswers}/${res.totalQuestions} (${res.scorePercent.toFixed(1)}%)`;
    const details = document.getElementById('details');
    details.innerHTML = '';
    if (res.perQuestionCorrect) {
      for (const [qId, correct] of Object.entries(res.perQuestionCorrect)) {
        const li = document.createElement('li');
        li.textContent = `Question ${qId}: `;
        li.className = correct ? 'correct' : 'incorrect';
        li.textContent += correct ? 'Correct' : 'Incorrect';
        details.appendChild(li);
      }
    }
    return;
  }
});
