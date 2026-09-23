# AI Mock Interviewer - Java Backend

Spring Boot 4.1.1 + Java 21 + MySQL + JWT + Groq AI.

## 1. Create the database

```sql
CREATE DATABASE ai_mock_interviewer;
```

## 2. Set environment variables in PowerShell

```powershell
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"
$env:GROQ_API_KEY="YOUR_GROQ_API_KEY"
$env:JWT_SECRET_KEY="a-long-random-secret-at-least-32-characters"
```

You can omit `GROQ_API_KEY` while testing. The backend will use a local fallback AI so the app still runs.

## 3. Start

From this folder:

```powershell
.\mvnw.cmd spring-boot:run
```

If Maven is installed globally:

```powershell
mvn spring-boot:run
```

## 4. Test

Open:

`http://localhost:8080/api/test`

Expected:

`AI Mock Interviewer Backend is working!`

## Groq

The backend uses Groq's OpenAI-compatible Chat Completions endpoint. Default model: `openai/gpt-oss-20b`.

Do not put your Groq key in React or commit it to GitHub.
