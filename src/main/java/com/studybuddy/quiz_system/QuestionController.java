package com.studybuddy.quiz_system;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuizRepository quizRepository;

    @GetMapping("/quiz/{quizId}")
    public List<Question> getQuestionsForQuiz(@PathVariable Long quizId) {
        return questionRepository.findByQuizId(quizId);
    }

    @PostMapping("/quiz/{quizId}")
    public Question addQuestionToQuiz(@PathVariable Long quizId, @RequestBody Question question) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found: " + quizId));
        question.setQuiz(quiz);
        return questionRepository.save(question);
    }
}
