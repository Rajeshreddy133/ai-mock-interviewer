package com.aimockinterviewer.service;
import com.aimockinterviewer.entity.User;
import com.aimockinterviewer.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
@Service
public class AuthService {
    private final UserRepository repo; private final BCryptPasswordEncoder encoder=new BCryptPasswordEncoder();
    public AuthService(UserRepository repo){this.repo=repo;}
    public User register(String name,String email,String password){
        if(name==null||name.isBlank()||email==null||email.isBlank()||password==null||password.isBlank()) throw new IllegalArgumentException("Name, email and password are required");
        if(repo.existsByEmail(email)) throw new IllegalArgumentException("Email already registered");
        return repo.save(new User(name.trim(),email.trim().toLowerCase(),encoder.encode(password)));
    }
    public User login(String email,String password){
        User u=repo.findByEmail(email.trim().toLowerCase()).orElseThrow(()->new IllegalArgumentException("Invalid email or password"));
        if(!encoder.matches(password,u.getPassword())) throw new IllegalArgumentException("Invalid email or password"); return u;
    }
}
