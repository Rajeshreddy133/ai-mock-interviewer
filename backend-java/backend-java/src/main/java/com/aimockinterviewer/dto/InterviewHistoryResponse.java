package com.aimockinterviewer.dto;
import java.util.List;
public class InterviewHistoryResponse {
    private List<InterviewItem> history;
    public InterviewHistoryResponse(List<InterviewItem> history){this.history=history;}
    public List<InterviewItem> getHistory(){return history;}
    public static class InterviewItem { private Long id; private String jobRole,interviewType,question,answer,evaluation; public InterviewItem(Long id,String jobRole,String interviewType,String question,String answer,String evaluation){this.id=id;this.jobRole=jobRole;this.interviewType=interviewType;this.question=question;this.answer=answer;this.evaluation=evaluation;} public Long getId(){return id;} public String getJobRole(){return jobRole;} public String getInterviewType(){return interviewType;} public String getQuestion(){return question;} public String getAnswer(){return answer;} public String getEvaluation(){return evaluation;} }
}
