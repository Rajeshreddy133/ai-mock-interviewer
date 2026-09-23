package com.aimockinterviewer.controller;

import com.aimockinterviewer.service.AiService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ResumeController {

    private final AiService aiService;

    public ResumeController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping(value = "/upload-resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadResume(@RequestParam("file") MultipartFile file,
                                            Authentication authentication) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select a PDF resume.");
        }

        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();

        if (!filename.endsWith(".pdf") && !contentType.equals("application/pdf")) {
            throw new IllegalArgumentException("Only PDF resumes are supported.");
        }

        String text;
        try (PDDocument document = PDDocument.load(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            text = stripper.getText(document).trim();
        }

        if (text.isBlank()) {
            throw new IllegalArgumentException("Could not extract text from this PDF. Please upload a text-based PDF resume.");
        }

        return Map.of("text", text);
    }

    @PostMapping("/generate-resume-question")
    public Map<String, String> generateResumeQuestion(@RequestBody ResumeQuestionRequest request,
                                                      Authentication authentication) {
        String question = aiService.generateResumeQuestion(
                request.job_role(),
                request.interview_type(),
                request.resume_text()
        );
        return Map.of("question", question);
    }

    public record ResumeQuestionRequest(
            String job_role,
            String interview_type,
            String resume_text
    ) {}
}
