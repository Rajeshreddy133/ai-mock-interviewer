package com.aimockinterviewer.controller;
import com.aimockinterviewer.dto.InterviewHistoryResponse; import com.aimockinterviewer.entity.Interview; import com.aimockinterviewer.entity.User; import com.aimockinterviewer.repository.InterviewRepository; import com.aimockinterviewer.repository.UserRepository; import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*; import java.util.List;
@RestController @RequestMapping("/api/interview-history") public class InterviewHistoryController {
 private final InterviewRepository repo; private final UserRepository users; public InterviewHistoryController(InterviewRepository repo,UserRepository users){this.repo=repo;this.users=users;}
 @GetMapping public InterviewHistoryResponse get(Authentication auth){User u=users.findByEmail(auth.getName()).orElseThrow(()->new RuntimeException("User not found"));List<Interview> list=repo.findByUserOrderByIdDesc(u);return new InterviewHistoryResponse(list.stream().map(i->new InterviewHistoryResponse.InterviewItem(i.getId(),i.getJobRole(),i.getInterviewType(),i.getQuestion(),i.getAnswer(),i.getEvaluation())).toList());}
}
