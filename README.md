# Study Buddy — Quiz System

Lightweight Spring Boot quiz system used for portfolio / internship application.

Features
- Quizzes with metadata (title, description, subject, createdDate)
- Questions linked to quizzes (options A-D, correct answer)
- REST API for quizzes and questions
- Create quiz + questions in a single request
- Submit answers and receive scoring result
- Minimal frontend pages: quiz list, quiz player, results

Run locally
1. Build (uses the included Maven wrapper):

```powershell
.\\mvnw.cmd -DskipTests package
```

2. Run (default port 8080):

```powershell
.\\mvnw.cmd spring-boot:run
# or run the jar on custom port:
# java -jar target\\quiz-system-0.0.1-SNAPSHOT.jar --server.port=8081
```

Frontend pages (served from Spring Boot static resources)
- `/` — `index.html` (quiz list)
- `/quiz.html?id={quizId}` — take a quiz
- `/results.html` — show last submission results

Key API endpoints
- GET `/api/quizzes` — list quizzes
- POST `/api/quizzes` — create quiz (body: `title`, `description`, `subject`)
- GET `/api/quizzes/{id}` — get quiz
- DELETE `/api/quizzes/{id}` — delete quiz
- GET `/api/questions/quiz/{id}` — get questions for a quiz
- POST `/api/questions/quiz/{id}` — add question to quiz
- POST `/api/quizzes/with-questions` — create quiz with questions (single request)
- POST `/api/quizzes/{quizId}/submit` — submit answers and receive scoring

Sample curl / PowerShell snippets
1) Get all quizzes

```powershell
Invoke-RestMethod -Uri http://localhost:8080/api/quizzes -Method GET | ConvertTo-Json -Depth 5
```

2) Create a quiz

```powershell
$body = '{"title":"Java Programming Basics","description":"CSN Week 3 coursework concepts","subject":"Programming"}'
Invoke-RestMethod -Uri http://localhost:8080/api/quizzes -Method POST -ContentType 'application/json' -Body $body
```

3) Add a question (replace `{id}`)

```powershell
$q = '{"questionText":"What is encapsulation in Java?","optionA":"Hiding data and methods","optionB":"Creating objects","optionC":"Inheriting classes","optionD":"Using interfaces","correctAnswer":"A"}'
Invoke-RestMethod -Uri "http://localhost:8080/api/questions/quiz/{id}" -Method POST -ContentType 'application/json' -Body $q
```

4) Submit answers

```powershell
$answers = '[{"questionId":1,"selectedAnswer":"A"},{"questionId":2,"selectedAnswer":"C"}]'
Invoke-RestMethod -Uri "http://localhost:8080/api/quizzes/1/submit" -Method POST -ContentType 'application/json' -Body $answers
```

Eclipse instructions (import as Maven project)
1. Install Eclipse IDE for Java Developers (or EE) and ensure the Maven (m2e) plugin is available.
2. File -> Import -> Maven -> Existing Maven Projects.
3. Select the repository folder (this project's root). Eclipse will detect the `pom.xml` and import.
4. Ensure your Eclipse workspace uses a compatible JDK (Java 17+ or the JDK used here).
5. To run the app in Eclipse: right-click `QuizSystemApplication` -> Run As -> Spring Boot App (or Java Application).

GitHub / remote connection
- If you already have a GitHub repo remote named `origin`, push with:

```powershell
git push -u origin main
```

- If you have not added a remote, create one on GitHub and then:

```powershell
git remote add origin https://github.com/<your-username>/study-buddy-quiz-system.git
git push -u origin main
```

Notes & next steps
- Consider persisting quiz attempts and adding user accounts to demonstrate more full-stack work.
- Add validation (`@Valid`) and API error handlers for production readiness.
- Add unit/integration tests for scoring and controllers.

License
- Use this repository in your portfolio. No license file is included — add one if you want to specify reuse terms.
