package com.studybuddy.quiz_system;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studybuddy.quiz_system.dto.QuizWithQuestionsRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;

@RestController
@RequestMapping("/api/admin")
public class ImportDataController {

    @Autowired
    private QuizManagementController quizManagementController;

    @GetMapping("/import-collections-quiz")
    public String importCollectionsQuiz() {
        try {
            ClassPathResource res = new ClassPathResource("data/collections_quiz.json");
            InputStream is = res.getInputStream();
            ObjectMapper mapper = new ObjectMapper();
            QuizWithQuestionsRequest req = mapper.readValue(is, QuizWithQuestionsRequest.class);
            quizManagementController.createQuizWithQuestions(req);
            return "Imported collections quiz";
        } catch (Exception e) {
            e.printStackTrace();
            return "Import failed: " + e.getMessage();
        }
    }
}
