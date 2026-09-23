package com.aimockinterviewer.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "interviews")
public class Interview {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String jobRole;
    @Column(nullable = false) private String interviewType;
    @Column(nullable = false, columnDefinition = "TEXT") private String question;
    @Column(nullable = false, columnDefinition = "TEXT") private String answer;
    @Column(nullable = false, columnDefinition = "TEXT") private String evaluation;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Interview() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getJobRole(){return jobRole;} public void setJobRole(String v){jobRole=v;}
    public String getInterviewType(){return interviewType;} public void setInterviewType(String v){interviewType=v;}
    public String getQuestion(){return question;} public void setQuestion(String v){question=v;}
    public String getAnswer(){return answer;} public void setAnswer(String v){answer=v;}
    public String getEvaluation(){return evaluation;} public void setEvaluation(String v){evaluation=v;}
    public User getUser(){return user;} public void setUser(User v){user=v;}
}
