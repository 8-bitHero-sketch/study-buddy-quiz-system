package com.studybuddy.quiz_system.dto;

import java.util.List;

public class QuizWithQuestionsRequest {
    public String title;
    public String description;
    public String subject;
    public List<QuestionDTO> questions;

    public QuizWithQuestionsRequest() {}
}
