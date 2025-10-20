package com.studybuddy.quiz_system;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    // Spring Data JPA automatically provides:
    // - save()
    // - findAll()
    // - findById()
    // - delete()
    // No code needed!
}