package com.aimockinterviewer.controller;
import com.aimockinterviewer.dto.ProfileDtos.*; import com.aimockinterviewer.entity.User; import com.aimockinterviewer.repository.UserRepository; import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/profile") public class ProfileController {
 private final UserRepository users; public ProfileController(UserRepository users){this.users=users;}
 @GetMapping public ProfileResponse get(Authentication a){User u=find(a);return new ProfileResponse(u.getId(),u.getName(),u.getEmail());}
 @PutMapping public ProfileResponse update(@RequestBody UpdateProfileRequest r,Authentication a){User u=find(a);if(r.getName()!=null&&!r.getName().isBlank())u.setName(r.getName().trim());if(r.getEmail()!=null&&!r.getEmail().isBlank()&&!r.getEmail().equalsIgnoreCase(u.getEmail())){if(users.existsByEmail(r.getEmail().trim().toLowerCase()))throw new IllegalArgumentException("Email already registered");u.setEmail(r.getEmail().trim().toLowerCase());}u=users.save(u);return new ProfileResponse(u.getId(),u.getName(),u.getEmail());}
 private User find(Authentication a){return users.findByEmail(a.getName()).orElseThrow(()->new RuntimeException("User not found"));}
}
