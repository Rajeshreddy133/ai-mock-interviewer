package com.aimockinterviewer.controller;
import com.aimockinterviewer.dto.AuthDtos.*; import com.aimockinterviewer.entity.User; import com.aimockinterviewer.service.AuthService; import com.aimockinterviewer.service.JwtService; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") public class AuthController {
 private final AuthService auth; private final JwtService jwt; public AuthController(AuthService auth,JwtService jwt){this.auth=auth;this.jwt=jwt;}
 @PostMapping("/register") public RegisterResponse register(@RequestBody RegisterRequest r){User u=auth.register(r.getName(),r.getEmail(),r.getPassword());return new RegisterResponse("Registration successful",u.getId());}
 @PostMapping("/login") public LoginResponse login(@RequestBody LoginRequest r){User u=auth.login(r.getEmail(),r.getPassword());return new LoginResponse(jwt.generateToken(u.getEmail()),u.getId(),u.getName(),u.getEmail());}
}
