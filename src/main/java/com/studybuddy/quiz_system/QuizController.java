package com.studybuddy.quiz_system;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {
    
    @Autowired
    private QuizRepository quizRepository;
    
    @Autowired
    private QuestionRepository questionRepository;
    
    // Get all quizzes
    @GetMapping
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }
    
    // Get single quiz by ID
    @GetMapping("/{id}")
    public Quiz getQuizById(@PathVariable Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + id));
    }
    
    // Create new quiz
    @PostMapping
    public Quiz createQuiz(@RequestBody Quiz quiz) {
        return quizRepository.save(quiz);
    }
    
    // Delete quiz
    @DeleteMapping("/{id}")
    public String deleteQuiz(@PathVariable Long id) {
        quizRepository.deleteById(id);
        return "Quiz deleted successfully!";
    }

    // Get all questions for a quiz (returns question id, text and options A-D)
    @GetMapping("/{id}/questions")
    public List<QuestionDTO> getQuestionsForQuiz(@PathVariable Long id) {
        List<Question> questions = questionRepository.findByQuizId(id);
        return questions.stream().map(q -> new QuestionDTO(
                q.getId(),
                q.getQuestionText(),
                Arrays.asList(q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD())
        )).collect(Collectors.toList());
    }

    // Demo helper: return correct answers for a quiz (questionId -> correct letter)
    @GetMapping("/{id}/answers")
    public List<AnswerKey> getAnswerKeys(@PathVariable Long id) {
        List<Question> questions = questionRepository.findByQuizId(id);
        return questions.stream().map(q -> new AnswerKey(q.getId(), q.getCorrectAnswer())).collect(Collectors.toList());
    }

    // Submit answers for a quiz and receive score + per-question results
    @PostMapping("/{id}/submit")
    public SubmitResponse submitQuizAnswers(@PathVariable Long id, @RequestBody SubmitRequest request) {
        List<Question> questions = questionRepository.findByQuizId(id);
        Map<Long, Question> byId = new HashMap<>();
        for (Question q : questions) byId.put(q.getId(), q);

        int total = questions.size();
        List<QuestionResult> results = request.answers.stream().map(a -> {
            Question q = byId.get(a.questionId);
            String correct = q != null && q.getCorrectAnswer() != null ? q.getCorrectAnswer().trim().toUpperCase() : null;
            String given = a.answer != null ? a.answer.trim().toUpperCase() : null;
            boolean ok = correct != null && given != null && correct.equals(given);
            return new QuestionResult(q != null ? q.getQuestionText() : "(unknown)", given, correct, ok);
        }).collect(Collectors.toList());

        int score = (int) results.stream().filter(r -> r.correct).count();

        return new SubmitResponse(total, score, results);
    }

    // DTOs used by the API
    public static class QuestionDTO {
        public Long id;
        public String text;
        public java.util.List<String> options;

        public QuestionDTO(Long id, String text, java.util.List<String> options) {
            this.id = id;
            this.text = text;
            this.options = options;
        }
    }

    public static class SubmitRequest {
        public java.util.List<Answer> answers;

        public static class Answer {
            public Long questionId;
            public String answer;
        }
    }

    public static class SubmitResponse {
        public int total;
        public int score;
        public java.util.List<QuestionResult> results;

        public SubmitResponse(int total, int score, java.util.List<QuestionResult> results) {
            this.total = total;
            this.score = score;
            this.results = results;
        }
    }

    public static class QuestionResult {
        public String question;
        public String given;
        public String correctAnswer;
        public boolean correct;

        public QuestionResult(String question, String given, String correctAnswer, boolean correct) {
            this.question = question;
            this.given = given;
            this.correctAnswer = correctAnswer;
            this.correct = correct;
        }
    }

    public static class AnswerKey {
        public Long questionId;
        public String correct;
        public AnswerKey(Long qid, String correct) { this.questionId = qid; this.correct = correct; }
    }
}
