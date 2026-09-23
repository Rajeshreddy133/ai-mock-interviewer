package com.aimockinterviewer.dto;

public final class AuthDtos {
    private AuthDtos() {}
    public static class RegisterRequest { private String name,email,password; public String getName(){return name;} public void setName(String v){name=v;} public String getEmail(){return email;} public void setEmail(String v){email=v;} public String getPassword(){return password;} public void setPassword(String v){password=v;} }
    public static class LoginRequest { private String email,password; public String getEmail(){return email;} public void setEmail(String v){email=v;} public String getPassword(){return password;} public void setPassword(String v){password=v;} }
    public static class LoginResponse { private String token; private String access_token; private Long userId; private String name; private String email; public LoginResponse(String token,Long userId,String name,String email){this.token=token;this.access_token=token;this.userId=userId;this.name=name;this.email=email;} public String getToken(){return token;} public String getAccess_token(){return access_token;} public Long getUserId(){return userId;} public String getName(){return name;} public String getEmail(){return email;} }
    public static class RegisterResponse { private String message; private Long userId; public RegisterResponse(String message,Long userId){this.message=message;this.userId=userId;} public String getMessage(){return message;} public Long getUserId(){return userId;} }
}
