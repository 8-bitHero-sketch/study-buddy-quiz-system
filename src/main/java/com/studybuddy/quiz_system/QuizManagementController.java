package com.studybuddy.quiz_system;

import com.studybuddy.quiz_system.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class QuizManagementController {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    // Create quiz with questions in one request
    @PostMapping("/quizzes/with-questions")
    public Quiz createQuizWithQuestions(@RequestBody QuizWithQuestionsRequest req) {
        Quiz quiz = new Quiz();
        quiz.setTitle(req.title);
        quiz.setDescription(req.description);
        quiz.setSubject(req.subject);
        Quiz saved = quizRepository.save(quiz);

        if (req.questions != null && !req.questions.isEmpty()) {
            List<Question> toSave = new ArrayList<>();
            for (QuestionDTO qdto : req.questions) {
                Question q = new Question();
                q.setQuiz(saved);
                q.setQuestionText(qdto.questionText);
                q.setOptionA(qdto.optionA);
                q.setOptionB(qdto.optionB);
                q.setOptionC(qdto.optionC);
                q.setOptionD(qdto.optionD);
                q.setCorrectAnswer(qdto.correctAnswer);
                toSave.add(q);
            }
            questionRepository.saveAll(toSave);
        }

        return saved;
    }

    // Submit answers for a quiz and get score
    @PostMapping("/quizzes/{quizId}/submit")
    public QuizResultDTO submitQuizAnswers(@PathVariable Long quizId, @RequestBody List<AnswerDTO> answers) {
        List<Question> questions = questionRepository.findByQuizId(quizId);
        Map<Long, Question> questionMap = new HashMap<>();
        for (Question q : questions) questionMap.put(q.getId(), q);

        int total = 0;
        int correct = 0;
        Map<Long, Boolean> perQuestion = new HashMap<>();

        if (answers != null) {
            for (AnswerDTO a : answers) {
                total++;
                Question q = questionMap.get(a.questionId);
                boolean isCorrect = false;
                if (q != null && a.selectedAnswer != null) {
                    String expected = q.getCorrectAnswer();
                    isCorrect = expected != null && expected.equalsIgnoreCase(a.selectedAnswer.trim());
                }
                if (isCorrect) correct++;
                perQuestion.put(a.questionId, isCorrect);
            }
        }

        QuizResultDTO result = new QuizResultDTO();
        result.totalQuestions = total;
        result.correctAnswers = correct;
        result.scorePercent = total == 0 ? 0.0 : ((double) correct / total) * 100.0;
        result.perQuestionCorrect = perQuestion;
        return result;
    }
}
