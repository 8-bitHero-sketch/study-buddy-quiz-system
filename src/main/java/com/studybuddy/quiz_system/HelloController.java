package com.studybuddy.quiz_system;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;




	
	@RestController
	public class HelloController {
	    
	    @GetMapping("/")
	    public String hello() {
	        return "Hello from Quiz System! Spring Boot is working!";
	    }
	    
	    @GetMapping("/status")
	    public String status() {
	        return "Quiz System API is running successfully!";
	    }
	
	
}
