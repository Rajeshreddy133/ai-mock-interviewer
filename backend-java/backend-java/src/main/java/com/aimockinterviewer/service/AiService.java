package com.aimockinterviewer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

@Service
public class AiService {
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient client = HttpClient.newHttpClient();
    private final String apiKey, apiUrl, model;
    private final int maxTokens;

    public AiService(@Value("${groq.api.key:}") String apiKey,
                     @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}") String apiUrl,
                     @Value("${groq.model:openai/gpt-oss-20b}") String model,
                     @Value("${groq.max-completion-tokens:1200}") int maxTokens) {
        this.apiKey=apiKey; this.apiUrl=apiUrl; this.model=model; this.maxTokens=maxTokens;
    }

    private String askAI(String system,String user){
        if(apiKey==null || apiKey.isBlank()) return null;
        try{
            String body=mapper.createObjectNode().put("model",model).put("temperature",0.6).put("max_completion_tokens",maxTokens)
                .set("messages",mapper.createArrayNode()
                    .add(mapper.createObjectNode().put("role","system").put("content",system))
                    .add(mapper.createObjectNode().put("role","user").put("content",user))).toString();
            HttpRequest request=HttpRequest.newBuilder(URI.create(apiUrl)).header("Authorization","Bearer "+apiKey).header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString(body)).build();
            HttpResponse<String> response=client.send(request,HttpResponse.BodyHandlers.ofString());
            if(response.statusCode()<200 || response.statusCode()>=300) return null;
            JsonNode root=mapper.readTree(response.body());
            JsonNode content=root.path("choices").path(0).path("message").path("content");
            return content.isTextual()?content.asText().trim():null;
        }catch(Exception e){return null;}
    }

    public String generateQuestion(String jobRole,String interviewType){
        jobRole=(jobRole==null||jobRole.isBlank())?"Software Developer":jobRole;
        interviewType=(interviewType==null||interviewType.isBlank())?"Technical":interviewType;
        String ai=askAI("You are a professional interviewer. Generate exactly ONE interview question. Do not add numbering, explanations, or an answer. Keep it appropriate for the requested role and interview type.","Job role: "+jobRole+"\nInterview type: "+interviewType+"\nGenerate the next interview question.");
        return ai!=null&&!ai.isBlank()?ai:fallbackQuestion(jobRole,interviewType);
    }

    public String generateResumeQuestion(String jobRole, String interviewType, String resumeText) {
        jobRole = (jobRole == null || jobRole.isBlank()) ? "Software Developer" : jobRole;
        interviewType = (interviewType == null || interviewType.isBlank()) ? "Technical" : interviewType;
        resumeText = resumeText == null ? "" : resumeText.trim();

        if (resumeText.isBlank()) {
            return generateQuestion(jobRole, interviewType);
        }

        // Keep the prompt reasonably sized while retaining the beginning of the resume.
        String resume = resumeText.length() > 12000 ? resumeText.substring(0, 12000) : resumeText;
        String ai = askAI(
                "You are a professional interviewer. Generate exactly ONE personalized interview question " +
                "based on the candidate's resume. The question must be relevant to the requested role and " +
                "interview type and should refer to a concrete skill, project, technology, education item, " +
                "or experience found in the resume. Do not invent resume details. Do not add numbering, " +
                "explanations, or an answer.",
                "Job role: " + jobRole + "\nInterview type: " + interviewType + "\nResume:\n" + resume
        );

        return ai != null && !ai.isBlank()
                ? ai
                : "Can you explain one of the projects or experiences in your resume that is most relevant to the " + jobRole + " role?";
    }

    public String generateNextQuestion(String jobRole,String interviewType,String previousQuestion,String previousAnswer,String previousEvaluation){
        String ai=askAI("You are an adaptive interview engine. Generate exactly ONE follow-up interview question based on the candidate's previous response and evaluation. Do not add numbering or explanation. The question should test a related concept at an appropriate difficulty.","Role: "+jobRole+"\nType: "+interviewType+"\nPrevious question: "+safe(previousQuestion)+"\nCandidate answer: "+safe(previousAnswer)+"\nEvaluation: "+safe(previousEvaluation));
        if(ai!=null&&!ai.isBlank()) return ai;
        if(previousAnswer==null||previousAnswer.isBlank()) return "Could you explain your answer in more detail and give a practical example?";
        if(jobRole!=null&&jobRole.toLowerCase().contains("java")) return "What is exception handling in Java, and how would you handle exceptions in a real-world application?";
        return "Can you describe a real-world situation where you applied the concept discussed in your previous answer?";
    }

    public String evaluateAnswer(String question,String answer,String jobRole,String interviewType){
        if(answer==null||answer.isBlank()) return "No answer was provided.\n\nScore: 0/10\n\nPlease provide an answer to the question.";
        String ai=askAI("You are an expert technical and HR interview evaluator. Evaluate the candidate answer against the question. Return a concise structured evaluation with: Score: X/10, Strengths, Areas for improvement, and a short improvement tip. Be fair and specific.","Job role: "+jobRole+"\nInterview type: "+interviewType+"\nQuestion: "+safe(question)+"\nCandidate answer: "+answer);
        if(ai!=null&&!ai.isBlank()) return ai;
        int n=answer.trim().length();
        if(n<30) return "Your answer is relevant but needs more detail.\n\nScore: 5/10\n\nStrengths:\n- You attempted to answer the question.\n\nAreas for improvement:\n- Provide more explanation.\n- Include a practical example.\n- Explain your reasoning clearly.";
        if(n<100) return "Your answer shows a basic understanding of the topic.\n\nScore: 7/10\n\nStrengths:\n- Relevant response.\n- Basic understanding demonstrated.\n\nAreas for improvement:\n- Add more technical detail.\n- Provide a real-world example.";
        return "Your answer demonstrates good understanding of the topic.\n\nScore: 8/10\n\nStrengths:\n- Relevant and detailed response.\n- Good explanation.\n- Shows practical understanding.\n\nAreas for improvement:\n- Make the explanation more concise.\n- Include specific examples where appropriate.";
    }

    public String generateFinalReport(String jobRole,String interviewType,List<String> questions,List<String> answers,List<String> evaluations){
        String prompt="Job role: "+jobRole+"\nInterview type: "+interviewType+"\nQuestions: "+safeList(questions)+"\nAnswers: "+safeList(answers)+"\nEvaluations: "+safeList(evaluations);
        String ai=askAI("You are a professional interview coach. Create a final mock interview report. Include Overall Summary, Strengths, Areas for Improvement, Technical/Communication observations when applicable, and Action Plan. Do not claim hiring decisions. Use concise readable sections.",prompt);
        if(ai!=null&&!ai.isBlank()) return ai;
        return "FINAL INTERVIEW REPORT\n======================\n\nJob Role: "+jobRole+"\nInterview Type: "+interviewType+"\n\nQuestions Asked: "+size(questions)+"\nQuestions Answered: "+size(answers)+"\nAnswers Evaluated: "+size(evaluations)+"\n\nStrengths\n- Participated in the interview.\n- Attempted the questions.\n\nAreas for Improvement\n- Provide clear technical explanations.\n- Use practical examples.\n- Structure answers concisely.";
    }

    private String fallbackQuestion(String role,String type){
        if(type.equalsIgnoreCase("HR")) return "Tell me about yourself and explain why you are interested in the "+role+" role.";
        String r=role.toLowerCase();
        if(r.contains("java")) return "What is the difference between an interface and an abstract class in Java? Explain with an example.";
        if(r.contains("python")) return "What is the difference between a list, tuple, and set in Python?";
        if(r.contains("web")) return "Explain the difference between frontend and backend development.";
        return "What are the most important skills required for a "+role+" professional?";
    }
    private String safe(String s){return s==null?"":s;}
    private int size(List<?> l){return l==null?0:l.size();}
    private String safeList(List<String> l){return l==null?"[]":new ArrayList<>(l).toString();}
}
