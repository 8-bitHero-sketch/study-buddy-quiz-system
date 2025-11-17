const apiRoot = '/api';

async function fetchQuizzes() {
  const res = await fetch(`${apiRoot}/quizzes`);
  return res.json();
}

async function fetchQuestions(quizId) {
  const res = await fetch(`/api/questions/quiz/${quizId}`);
  return res.json();
}

function renderQuizzes(quizzes) {
  const ul = document.getElementById('quizzes');
  ul.innerHTML = '';
  quizzes.forEach(q => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = q.title + ' (' + q.subject + ')';
    btn.onclick = () => loadQuiz(q);
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

async function loadQuiz(quiz) {
  document.getElementById('quiz-list').style.display = 'none';
  document.getElementById('quiz-area').style.display = 'block';
  document.getElementById('quiz-title').textContent = quiz.title;
  document.getElementById('quiz-desc').textContent = quiz.description || '';

  const questions = await fetchQuestions(quiz.id);
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

    const res = await fetch(`${apiRoot}/quizzes/${quiz.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers)
    });
    const result = await res.json();
    document.getElementById('result').textContent = `Score: ${result.correctAnswers}/${result.totalQuestions} (${result.scorePercent.toFixed(1)}%)`;
  };
}

window.addEventListener('load', async () => {
  const quizzes = await fetchQuizzes();
  renderQuizzes(quizzes);
});
