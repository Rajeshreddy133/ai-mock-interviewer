package com.aimockinterviewer.dto;
public final class ProfileDtos {
    private ProfileDtos(){}
    public static class ProfileResponse { private Long id; private String name,email; public ProfileResponse(Long id,String name,String email){this.id=id;this.name=name;this.email=email;} public Long getId(){return id;} public String getName(){return name;} public String getEmail(){return email;} }
    public static class UpdateProfileRequest { private String name,email; public String getName(){return name;} public void setName(String v){name=v;} public String getEmail(){return email;} public void setEmail(String v){email=v;} }
    public static class ChangePasswordRequest { private String currentPassword,newPassword; public String getCurrentPassword(){return currentPassword;} public void setCurrentPassword(String v){currentPassword=v;} public String getNewPassword(){return newPassword;} public void setNewPassword(String v){newPassword=v;} }
    public static class DeleteAccountRequest { private String password; public String getPassword(){return password;} public void setPassword(String v){password=v;} }
}
