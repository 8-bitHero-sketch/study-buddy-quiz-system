package com.studybuddy.quiz_system;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studybuddy.quiz_system.dto.QuizWithQuestionsRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;

@RestController
@RequestMapping("/api/admin")
public class ImportDataController {

    @Autowired
    private QuizManagementController quizManagementController;

    @Autowired
    private QuizRepository quizRepository;

    private static final Logger log = LoggerFactory.getLogger(ImportDataController.class);

    @Autowired
    private AdminLogService adminLogService;

    @GetMapping("/import-collections-quiz")
    public String importCollectionsQuiz() {
        try {
            ClassPathResource res = new ClassPathResource("data/collections_quiz.json");
            InputStream is = res.getInputStream();
            ObjectMapper mapper = new ObjectMapper();
            QuizWithQuestionsRequest req = mapper.readValue(is, QuizWithQuestionsRequest.class);

            log.info("Starting import for quiz title={}", req.title);
            adminLogService.record("Starting import for quiz title=" + req.title);

            // Idempotency: if a quiz with the same title already exists, do not create a duplicate
            if (req.title != null) {
                if (quizRepository.findByTitle(req.title).isPresent()) {
                    log.info("Import skipped - quiz already exists: {}", req.title);
                    adminLogService.record("Import skipped - quiz already exists: " + req.title);
                    return "Quiz already exists with title: " + req.title;
                }
            }

            quizManagementController.createQuizWithQuestions(req);
            log.info("Import completed for quiz title={}", req.title);
            adminLogService.record("Import completed for quiz title=" + req.title);
            return "Imported collections quiz";
        } catch (Exception e) {
            log.error("Import failed", e);
            adminLogService.record("Import failed: " + e.getMessage());
            return "Import failed: " + e.getMessage();
        }
    }

    @GetMapping("/logs")
    public Object getLogs() {
        return adminLogService.recent();
    }
}
