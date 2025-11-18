package com.studybuddy.quiz_system;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

@SpringBootTest
@AutoConfigureMockMvc
public class ImportDataControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private QuizRepository quizRepository;
    @Autowired
    private QuestionRepository questionRepository;

    @Test
    public void importEndpoint_runs_and_is_idempotent() throws Exception {
        // First import should report Imported collections quiz (or similar success text)
        mockMvc.perform(get("/api/admin/import-collections-quiz").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic("admin","password")))
            .andExpect(status().isOk())
            .andExpect(content().string(org.hamcrest.Matchers.containsString("Imported")));

        // Verify DB state - quiz created and 15 questions
        var qOpt = quizRepository.findByTitle("Java Collections Basics");
        org.assertj.core.api.Assertions.assertThat(qOpt).isPresent();
        var quiz = qOpt.get();
        var questions = questionRepository.findByQuizId(quiz.getId());
        org.assertj.core.api.Assertions.assertThat(questions).hasSize(15);

        // Second import should indicate the quiz already exists
        mockMvc.perform(get("/api/admin/import-collections-quiz").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic("admin","password")))
            .andExpect(status().isOk())
            .andExpect(content().string(org.hamcrest.Matchers.containsString("already exists")));
    }
}
