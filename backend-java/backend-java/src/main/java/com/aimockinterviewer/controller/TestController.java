package com.aimockinterviewer.controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController public class TestController {
 @GetMapping("/api/test") public String test(){return "AI Mock Interviewer Backend is working!";}
 @GetMapping("/api/protected") public String protectedEndpoint(){return "JWT authentication is working!";}
}
