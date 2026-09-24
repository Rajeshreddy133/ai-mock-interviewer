package com.aimockinterviewer.controller;
import java.util.List;
import com.aimockinterviewer.dto.InterviewDtos.*; import com.aimockinterviewer.entity.Interview; import com.aimockinterviewer.entity.User; import com.aimockinterviewer.repository.InterviewRepository; import com.aimockinterviewer.repository.UserRepository; import com.aimockinterviewer.service.AiService; import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/interview") public class InterviewController {
 private final AiService ai; private final InterviewRepository interviews; private final UserRepository users;
 public InterviewController(AiService ai,InterviewRepository interviews,UserRepository users){this.ai=ai;this.interviews=interviews;this.users=users;}
 @PostMapping("/question")
    public InterviewResponse question(
            @RequestBody InterviewRequest r,
            Authentication authentication) {

        User user = users.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> previousQuestions = interviews
                .findTop20ByUserOrderByIdDesc(user)
                .stream()
                .map(Interview::getQuestion)
                .filter(q -> q != null && !q.isBlank())
                .toList();

        String question = ai.generateQuestion(
                r.getJobRole(),
                r.getInterviewType(),
                previousQuestions
        );

        return new InterviewResponse(question);
    }
 @PostMapping("/next-question") public InterviewResponse next(@RequestBody NextQuestionRequest r){return new InterviewResponse(ai.generateNextQuestion(r.getJobRole(),r.getInterviewType(),r.getPreviousQuestion(),r.getPreviousAnswer(),r.getPreviousEvaluation()));}
 @PostMapping("/evaluate") public EvaluationResponse evaluate(@RequestBody AnswerRequest r,Authentication authentication){String evaluation=ai.evaluateAnswer(r.getQuestion(),r.getAnswer(),r.getJobRole(),r.getInterviewType()); User u=users.findByEmail(authentication.getName()).orElseThrow(()->new RuntimeException("User not found")); Interview i=new Interview();i.setJobRole(r.getJobRole());i.setInterviewType(r.getInterviewType());i.setQuestion(r.getQuestion());i.setAnswer(r.getAnswer());i.setEvaluation(evaluation);i.setUser(u);interviews.save(i);return new EvaluationResponse(evaluation);}
 @PostMapping("/final-report") public ReportResponse report(@RequestBody FinalReportRequest r){return new ReportResponse(ai.generateFinalReport(r.getJobRole(),r.getInterviewType(),r.getQuestions(),r.getAnswers(),r.getEvaluations()));}
}
