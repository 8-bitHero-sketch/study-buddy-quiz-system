package com.studybuddy.quiz_system.dto;

import java.util.Map;

public class QuizResultDTO {
    public int totalQuestions;
    public int correctAnswers;
    public double scorePercent;
    public Map<Long, Boolean> perQuestionCorrect;

    public QuizResultDTO() {}
}
