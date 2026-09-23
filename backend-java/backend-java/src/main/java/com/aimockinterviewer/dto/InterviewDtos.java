package com.aimockinterviewer.dto;

import java.util.List;

public final class InterviewDtos {
    private InterviewDtos() {}
    public static class InterviewRequest { private String jobRole, interviewType; public String getJobRole(){return jobRole;} public void setJobRole(String v){jobRole=v;} public String getInterviewType(){return interviewType;} public void setInterviewType(String v){interviewType=v;} }
    public static class NextQuestionRequest { private String jobRole,interviewType,previousQuestion,previousAnswer,previousEvaluation; public String getJobRole(){return jobRole;} public void setJobRole(String v){jobRole=v;} public String getInterviewType(){return interviewType;} public void setInterviewType(String v){interviewType=v;} public String getPreviousQuestion(){return previousQuestion;} public void setPreviousQuestion(String v){previousQuestion=v;} public String getPreviousAnswer(){return previousAnswer;} public void setPreviousAnswer(String v){previousAnswer=v;} public String getPreviousEvaluation(){return previousEvaluation;} public void setPreviousEvaluation(String v){previousEvaluation=v;} }
    public static class AnswerRequest { private String question,answer,jobRole,interviewType; public String getQuestion(){return question;} public void setQuestion(String v){question=v;} public String getAnswer(){return answer;} public void setAnswer(String v){answer=v;} public String getJobRole(){return jobRole;} public void setJobRole(String v){jobRole=v;} public String getInterviewType(){return interviewType;} public void setInterviewType(String v){interviewType=v;} }
    public static class FinalReportRequest { private String jobRole,interviewType; private List<String> questions,answers,evaluations; public String getJobRole(){return jobRole;} public void setJobRole(String v){jobRole=v;} public String getInterviewType(){return interviewType;} public void setInterviewType(String v){interviewType=v;} public List<String> getQuestions(){return questions;} public void setQuestions(List<String> v){questions=v;} public List<String> getAnswers(){return answers;} public void setAnswers(List<String> v){answers=v;} public List<String> getEvaluations(){return evaluations;} public void setEvaluations(List<String> v){evaluations=v;} }
    public static class InterviewResponse { private String question; public InterviewResponse(String v){question=v;} public String getQuestion(){return question;} }
    public static class EvaluationResponse { private String evaluation; public EvaluationResponse(String v){evaluation=v;} public String getEvaluation(){return evaluation;} }
    public static class ReportResponse { private String report; public ReportResponse(String v){report=v;} public String getReport(){return report;} }
}
