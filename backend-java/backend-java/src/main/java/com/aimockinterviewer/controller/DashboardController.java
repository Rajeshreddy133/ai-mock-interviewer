package com.aimockinterviewer.controller;
import com.aimockinterviewer.dto.DashboardResponse; import com.aimockinterviewer.entity.Interview; import com.aimockinterviewer.entity.User; import com.aimockinterviewer.repository.InterviewRepository; import com.aimockinterviewer.repository.UserRepository; import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*; import java.util.List;
@RestController @RequestMapping("/api/dashboard") public class DashboardController {
 private final InterviewRepository repo; private final UserRepository users; public DashboardController(InterviewRepository repo,UserRepository users){this.repo=repo;this.users=users;}
 @GetMapping public DashboardResponse get(Authentication auth){User u=users.findByEmail(auth.getName()).orElseThrow(()->new RuntimeException("User not found"));List<Interview> list=repo.findByUserOrderByIdDesc(u);int answers=(int)list.stream().filter(i->i.getAnswer()!=null&&!i.getAnswer().trim().isEmpty()).count();return new DashboardResponse(list.size(),list.size(),answers);}
}
