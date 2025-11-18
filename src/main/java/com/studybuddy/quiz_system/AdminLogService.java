package com.studybuddy.quiz_system;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

@Service
public class AdminLogService {

    private final LinkedList<String> events = new LinkedList<>();
    private final int max = 200;

    public synchronized void record(String msg) {
        String record = Instant.now().toString() + " - " + msg;
        events.addFirst(record);
        while (events.size() > max) events.removeLast();
    }

    public synchronized List<String> recent() {
        return Collections.unmodifiableList(new ArrayList<>(events));
    }
}
