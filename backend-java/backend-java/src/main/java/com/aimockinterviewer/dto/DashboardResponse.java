package com.aimockinterviewer.dto;
public class DashboardResponse {
    private int totalInterviews,totalQuestions,totalAnswers;
    public DashboardResponse(int a,int q,int ans){totalInterviews=a;totalQuestions=q;totalAnswers=ans;}
    public int getTotalInterviews(){return totalInterviews;} public int getTotalQuestions(){return totalQuestions;} public int getTotalAnswers(){return totalAnswers;}
}
