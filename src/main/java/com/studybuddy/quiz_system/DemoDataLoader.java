package com.studybuddy.quiz_system;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;

@Component
public class DemoDataLoader implements CommandLineRunner {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    private static final String DEMO_TITLE = "Demo: Keep Testing Me!";

    @Override
    public void run(String... args) throws Exception {
        // If demo quiz already exists, do nothing (idempotent)
        if (quizRepository.findByTitle(DEMO_TITLE).isPresent()) return;

        Quiz quiz = new Quiz();
        quiz.setTitle(DEMO_TITLE);
        quiz.setDescription("A short 5-question demo quiz to try the UI.");
        quiz.setSubject("Demo");
        quiz = quizRepository.save(quiz);

        List<Question> questions = new ArrayList<>();

        Question q1 = new Question();
        q1.setQuiz(quiz);
        q1.setQuestionText("Which keyword declares a constant value in Java?");
        q1.setOptionA("final");
        q1.setOptionB("const");
        q1.setOptionC("static");
        q1.setOptionD("immutable");
        q1.setCorrectAnswer("A");
        questions.add(q1);

        Question q2 = new Question();
        q2.setQuiz(quiz);
        q2.setQuestionText("Which data structure uses LIFO order?");
        q2.setOptionA("Queue");
        q2.setOptionB("Stack");
        q2.setOptionC("Map");
        q2.setOptionD("Set");
        q2.setCorrectAnswer("B");
        questions.add(q2);

        Question q3 = new Question();
        q3.setQuiz(quiz);
        q3.setQuestionText("Which method starts a Java application?");
        q3.setOptionA("init()");
        q3.setOptionB("start()");
        q3.setOptionC("main()");
        q3.setOptionD("run()");
        q3.setCorrectAnswer("C");
        questions.add(q3);

        Question q4 = new Question();
        q4.setQuiz(quiz);
        q4.setQuestionText("Which loop guarantees the body runs at least once?");
        q4.setOptionA("for");
        q4.setOptionB("while");
        q4.setOptionC("do-while");
        q4.setOptionD("foreach");
        q4.setCorrectAnswer("C");
        questions.add(q4);

        Question q5 = new Question();
        q5.setQuiz(quiz);
        q5.setQuestionText("Which collection preserves insertion order and allows duplicates?");
        q5.setOptionA("HashSet");
        q5.setOptionB("ArrayList");
        q5.setOptionC("HashMap");
        q5.setOptionD("TreeSet");
        q5.setCorrectAnswer("B");
        questions.add(q5);

        questionRepository.saveAll(questions);
    }
}
