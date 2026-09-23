import { useState, useEffect, useRef } from "react";
import "./App.css";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const API_URL = "http://localhost:8080/api";

function App() {
  // =========================================================
  // AUTHENTICATION
  // =========================================================

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("ai_mock_user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // =========================================================
  // JWT
  // =========================================================

  const getToken = () => {
    return localStorage.getItem("ai_mock_token");
  };

  const logoutLocal = () => {
    localStorage.removeItem("ai_mock_token");
    localStorage.removeItem("ai_mock_user");

    setUser(null);

    setAuthMode("login");
    setName("");
    setEmail("");
    setPassword("");
    setLoginMessage("");

    setJobRole("");
    setInterviewType("");

    setQuestion("");
    setAnswer("");
    setEvaluation("");

    setQuestions([]);
    setAnswers([]);
    setEvaluations([]);

    setReport("");

    setResume(null);
    setResumeText("");
    setResumeMessage("");
    setResumeQuestion("");

    setSavedHistory([]);

    setDashboard(null);
    setShowDashboard(false);

    setShowProfile(false);
    setProfileEditMode(false);
    setShowSecuritySettings(false);

    setProfileName("");
    setProfileEmail("");
    setProfileMessage("");

    setCurrentPassword("");
    setNewPassword("");
    setPasswordMessage("");

    setDeletePassword("");
    setDeleteMessage("");
    setShowDeleteConfirm(false);

    setInterviewActive(false);
    setProctorMessage("");

    setIsListening(false);
    setVoiceMessage("");

    recognitionRef.current?.stop();
    recognitionRef.current = null;

    window.speechSynthesis?.cancel();
  };

  const authenticatedFetch = async (url, options = {}) => {
    const token = getToken();

    const headers = {
      ...(options.headers || {})
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      logoutLocal();
      throw new Error("SESSION_EXPIRED");
    }

    return response;
  };

  // =========================================================
  // RESUME
  // =========================================================

  const [resume, setResume] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeMessage, setResumeMessage] = useState("");
  const [resumeQuestion, setResumeQuestion] = useState("");

  // =========================================================
  // INTERVIEW SETUP
  // =========================================================

  const [jobRole, setJobRole] = useState("");
  const [interviewType, setInterviewType] = useState("");

  const [answerMode, setAnswerMode] = useState("text");

  // =========================================================
  // VOICE INTERVIEW
  // =========================================================

  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");

  const recognitionRef = useRef(null);

  // =========================================================
  // CURRENT INTERVIEW
  // =========================================================

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState("");

  // =========================================================
  // INTERVIEW DATA
  // =========================================================

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  const maxQuestions = 5;

  // =========================================================
  // LOADING
  // =========================================================

  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [nextLoading, setNextLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  // =========================================================
  // FINAL REPORT
  // =========================================================

  const [report, setReport] = useState("");

  // =========================================================
  // HISTORY
  // =========================================================

  const [savedHistory, setSavedHistory] = useState([]);

  // =========================================================
  // DASHBOARD
  // =========================================================

  const [dashboard, setDashboard] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // =========================================================
  // PROFILE
  // =========================================================

  const [showProfile, setShowProfile] = useState(false);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] =
    useState(false);

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  const [profileMessage, setProfileMessage] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // =========================================================
  // SECURE INTERVIEW MODE
  // =========================================================

  const [interviewActive, setInterviewActive] = useState(false);
  const [proctorMessage, setProctorMessage] = useState("");

  const terminateInterview = async (reason) => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;

    setIsListening(false);

    window.speechSynthesis?.cancel();

    setInterviewActive(false);

    setQuestion("");
    setAnswer("");
    setEvaluation("");

    setProctorMessage(reason);

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn("Fullscreen exit error:", error);
    }
  };

  const enterInterviewMode = async () => {
    setProctorMessage("");
    setInterviewActive(true);

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.warn("Fullscreen could not be enabled:", error);
    }
  };

  const exitInterviewMode = async (
    reason = "Interview ended by the candidate."
  ) => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;

    setIsListening(false);

    window.speechSynthesis?.cancel();

    setInterviewActive(false);

    if (reason) {
      setProctorMessage(reason);
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn("Fullscreen exit error:", error);
    }
  };

  // =========================================================
  // STRICT INTERVIEW MONITORING
  // =========================================================

  useEffect(() => {
    if (!interviewActive) {
      return;
    }

    let terminated = false;

    const terminateOnce = (message) => {
      if (terminated) {
        return;
      }

      terminated = true;

      terminateInterview(message);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        terminateOnce(
          "Interview terminated because you switched away from the interview window."
        );
      }
    };

    const handleBlur = () => {
      terminateOnce(
        "Interview terminated because the interview window lost focus."
      );
    };

    const handleFullscreenChange = () => {
      if (
        !document.fullscreenElement &&
        !document.hidden &&
        interviewActive
      ) {
        terminateOnce(
          "Interview terminated because fullscreen mode was exited."
        );
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );

      window.removeEventListener("blur", handleBlur);
    };
  }, [interviewActive]);

  // =========================================================
  // PREVENT REFRESH / CLOSE DURING INTERVIEW
  // =========================================================

  useEffect(() => {
    if (!interviewActive) {
      return;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [interviewActive]);

  // =========================================================
  // VOICE - SPEAK QUESTION
  // =========================================================

  const speakQuestion = (text) => {
    if (
      answerMode !== "voice" ||
      !text ||
      !window.speechSynthesis
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setVoiceMessage("AI interviewer is speaking...");
    };

    utterance.onend = () => {
      if (!isListening) {
        setVoiceMessage(
          "Your microphone is ready. Click Start Speaking to answer."
        );
      }
    };

    utterance.onerror = () => {
      setVoiceMessage(
        "Unable to play the question audio."
      );
    };

    window.speechSynthesis.speak(utterance);
  };

  // =========================================================
  // VOICE - START ANSWER
  // =========================================================

  const startVoiceAnswer = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceMessage(
        "Voice input is not supported in this browser. Please use Google Chrome or choose Text Interview."
      );
      return;
    }

    if (!interviewActive) {
      setVoiceMessage(
        "Start the interview before using voice input."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    window.speechSynthesis?.cancel();

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = answer || "";

    recognition.onstart = () => {
      setIsListening(true);

      setVoiceMessage(
        "Listening... speak your answer clearly."
      );
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const transcript =
          event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += `${transcript} `;
        } else {
          interimTranscript += transcript;
        }
      }

      setAnswer(
        `${finalTranscript}${interimTranscript}`.trim()
      );
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);

      if (event.error === "not-allowed") {
        setVoiceMessage(
          "Microphone permission was denied. Please allow microphone access."
        );
      } else if (event.error === "no-speech") {
        setVoiceMessage(
          "No speech detected. Please try speaking again."
        );
      } else {
        setVoiceMessage(
          "Could not capture your voice. Please try again."
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);

      setVoiceMessage(
        "Voice answer captured. Review your answer before submitting."
      );
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error(error);
      setIsListening(false);

      setVoiceMessage(
        "Unable to start microphone input."
      );
    }
  };

  // =========================================================
  // STOP VOICE
  // =========================================================

  const stopVoiceAnswer = () => {
    recognitionRef.current?.stop();
  };

  // =========================================================
  // AUTO SPEAK QUESTIONS
  // =========================================================

  useEffect(() => {
    if (
      question &&
      interviewActive &&
      answerMode === "voice"
    ) {
      const timer = setTimeout(() => {
        speakQuestion(question);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [
    question,
    interviewActive,
    answerMode
  ]);

  // =========================================================
  // CLEANUP VOICE
  // =========================================================

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // =========================================================
  // LOAD HISTORY
  // =========================================================

  useEffect(() => {
    if (!user || !getToken()) {
      return;
    }

    const loadHistory = async () => {
      try {
        const response =
          await authenticatedFetch(
            `${API_URL}/interview-history`
          );

        const data =
          await response.json();

        if (response.ok) {
          setSavedHistory(
            data.history || []
          );
        }
      } catch (error) {
        if (error.message !== "SESSION_EXPIRED") {
          console.error(
            "History loading error:",
            error
          );
        }
      }
    };

    loadHistory();
  }, [user]);

  // =========================================================
  // DASHBOARD
  // =========================================================

  const loadDashboard = async () => {
    if (!user) {
      return;
    }

    setDashboardLoading(true);

    try {
      const response =
        await authenticatedFetch(
          `${API_URL}/dashboard`
        );

      const data =
        await response.json();

      if (response.ok) {
        setDashboard(data);
        setShowDashboard(true);
        setShowProfile(false);
      } else {
        alert(
          data.detail ||
            data.message ||
            "Unable to load dashboard."
        );
      }
    } catch (error) {
      if (error.message === "SESSION_EXPIRED") {
        alert(
          "Your session has expired. Please login again."
        );
      } else {
        console.error(
          "Dashboard loading error:",
          error
        );

        alert(
          "Unable to connect to the server."
        );
      }
    } finally {
      setDashboardLoading(false);
    }
  };

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoginLoading(true);
    setLoginMessage("");

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email.trim(),
            password
          })
        }
      );

      const data =
        await response.json();

      const token =
        data.token ||
        data.access_token;

      if (response.ok && token) {
        const loggedInUser = {
          user_id: data.id,
          name: data.name,
          email: data.email
        };

        localStorage.setItem(
          "ai_mock_token",
          token
        );

        localStorage.setItem(
          "ai_mock_user",
          JSON.stringify(loggedInUser)
        );

        setUser(loggedInUser);

        setPassword("");
        setLoginMessage("");
      } else {
        setLoginMessage(
          data.detail ||
            data.message ||
            "Invalid email or password."
        );
      }
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setLoginMessage(
        "Unable to connect to the server."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // =========================================================
  // REGISTER
  // =========================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setLoginMessage(
        "Please enter your full name."
      );
      return;
    }

    if (!email.trim()) {
      setLoginMessage(
        "Please enter your email."
      );
      return;
    }

    if (password.length < 6) {
      setLoginMessage(
        "Password must be at least 6 characters."
      );
      return;
    }

    setLoginLoading(true);
    setLoginMessage("");

    try {
      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password
          })
        }
      );

      const data =
        await response.json();

      if (response.ok && data.id) {
        setAuthMode("login");
        setPassword("");

        setLoginMessage(
          "Account created successfully! Please login with your new account."
        );
      } else {
        setLoginMessage(
          data.detail ||
            data.message ||
            "Unable to create account."
        );
      }
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setLoginMessage(
        "Unable to connect to the server."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // =========================================================
  // PROFILE
  // =========================================================

  const openProfile = async () => {
    if (!user) {
      return;
    }

    setShowDashboard(false);
    setShowProfile(true);

    setProfileEditMode(false);
    setShowSecuritySettings(false);

    setProfileMessage("");
    setPasswordMessage("");
    setDeleteMessage("");

    setProfileName(user.name || "");
    setProfileEmail(user.email || "");

    setCurrentPassword("");
    setNewPassword("");

    setDeletePassword("");
    setShowDeleteConfirm(false);

    try {
      const response =
        await authenticatedFetch(
          `${API_URL}/profile`
        );

      const data =
        await response.json();

      if (response.ok && data.id) {
        setProfileName(data.name || "");
        setProfileEmail(data.email || "");

        const updatedUser = {
          ...user,
          name: data.name,
          email: data.email
        };

        setUser(updatedUser);

        localStorage.setItem(
          "ai_mock_user",
          JSON.stringify(updatedUser)
        );
      }
    } catch (error) {
      if (error.message !== "SESSION_EXPIRED") {
        console.error(
          "Profile loading error:",
          error
        );
      }
    }
  };

  // =========================================================
  // UPDATE PROFILE
  // =========================================================

  const updateProfile = async (e) => {
    e.preventDefault();

    if (
      !profileName.trim() ||
      !profileEmail.trim()
    ) {
      setProfileMessage(
        "Name and email are required."
      );
      return;
    }

    setProfileLoading(true);
    setProfileMessage("");

    try {
      const response =
        await authenticatedFetch(
          `${API_URL}/profile`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name: profileName.trim(),
              email: profileEmail
                .trim()
                .toLowerCase()
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok || !data.id) {
        setProfileMessage(
          data.detail ||
            data.message ||
            "Unable to update profile."
        );
        return;
      }

      const updatedUser = {
        ...user,
        name: data.name,
        email: data.email
      };

      setUser(updatedUser);

      localStorage.setItem(
        "ai_mock_user",
        JSON.stringify(updatedUser)
      );

      setName(data.name);
      setEmail(data.email);

      setProfileEditMode(false);

      setProfileMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      if (error.message === "SESSION_EXPIRED") {
        alert(
          "Your session has expired. Please login again."
        );
      } else {
        console.error(
          "Profile update error:",
          error
        );

        setProfileMessage(
          "Unable to connect to the server."
        );
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  const changePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      setPasswordMessage(
        "Please enter both passwords."
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage(
        "New password must be at least 6 characters."
      );
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage("");

    try {
      const response =
        await authenticatedFetch(
          `${API_URL}/change-password`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              currentPassword,
              newPassword
            })
          }
        );

      const data =
        await response.text();

      if (!response.ok) {
        setPasswordMessage(
          data ||
            "Unable to change password."
        );
        return;
      }

      setCurrentPassword("");
      setNewPassword("");

      setPasswordMessage(
        "Password changed successfully."
      );
    } catch (error) {
      if (error.message === "SESSION_EXPIRED") {
        alert(
          "Your session has expired. Please login again."
        );
      } else {
        console.error(
          "Password change error:",
          error
        );

        setPasswordMessage(
          "Unable to connect to the server."
        );
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // =========================================================
  // DELETE ACCOUNT
  // =========================================================

  const deleteAccount = async () => {
    if (!deletePassword) {
      setDeleteMessage(
        "Enter your password to delete the account."
      );
      return;
    }

    setDeleteLoading(true);
    setDeleteMessage("");

    try {
      const response =
        await authenticatedFetch(
          `${API_URL}/account`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              password: deletePassword
            })
          }
        );

      const data =
        await response.text();

      if (!response.ok) {
        setDeleteMessage(
          data ||
            "Unable to delete account."
        );
        return;
      }

      setShowDeleteConfirm(false);
      setShowProfile(false);

      logoutLocal();

      setLoginMessage(
        "Your account has been deleted successfully."
      );
    } catch (error) {
      if (error.message === "SESSION_EXPIRED") {
        alert(
          "Your session has expired. Please login again."
        );
      } else {
        console.error(
          "Account deletion error:",
          error
        );

        setDeleteMessage(
          "Unable to connect to the server."
        );
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    await exitInterviewMode();

    logoutLocal();
  };

  // =========================================================
  // GENERATE FIRST QUESTION
  // =========================================================

  const generateQuestion = async () => {
    if (!jobRole || !interviewType) {
      alert(
        "Please select a job role and interview type."
      );
      return;
    }

    setLoading(true);
    setQuestion("");
    setEvaluation("");
    setAnswer("");
    setReport("");
    setProctorMessage("");

    /*
      Enter fullscreen immediately from the button click.
      This is important because browsers only allow
      requestFullscreen reliably from a user interaction.
    */

    await enterInterviewMode();

    try {
      let firstQuestion = resumeQuestion;

      /*
        If a resume question already exists,
        use it directly and avoid another AI request.
      */

      if (!firstQuestion) {
        const response =
          await authenticatedFetch(
            `${API_URL}/interview/question`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                jobRole,
                interviewType
              })
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.detail ||
              "Unable to generate question."
          );
        }

        firstQuestion = data.question;
      }

      setQuestion(firstQuestion);

      setQuestions([firstQuestion]);
      setAnswers([]);
      setEvaluations([]);
      setReport("");
    } catch (error) {
      console.error(
        "Generate question error:",
        error
      );

      await exitInterviewMode(
        error.message === "SESSION_EXPIRED"
          ? "Your session has expired. Please login again."
          : "Unable to generate interview question. Please try again."
      );

      if (error.message === "SESSION_EXPIRED") {
        alert(
          "Your session has expired. Please login again."
        );
      } else {
        alert(
          "Unable to generate interview question."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SUBMIT ANSWER
  // =========================================================

  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert("Please enter your answer.");
      return;
    }

    if (!question) {
      alert(
        "Please generate a question first."
      );
      return;
    }

    if (!user) {
      alert("Please login first.");
      return;
    }

    setEvaluating(true);

    try {
      const response =
        await authenticatedFetch(
          `${API_URL}/interview/evaluate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              question,
              answer,
              jobRole,
              interviewType
            })
          }
        );

      const data =
        await response.json();

      if (response.ok && data.evaluation) {
        setEvaluation(data.evaluation);

        setAnswers((previous) => [
          ...previous,
          answer
        ]);

        setEvaluations((previous) => [
          ...previous,
          data.evaluation
        ]);

        try {
          const historyResponse =
            await authenticatedFetch(
              `${API_URL}/interview-history`
            );

          const historyData =
            await historyResponse.json();

          if (historyResponse.ok) {
            setSavedHistory(
              historyData.history || []
            );
          }
        } catch (historyError) {
          if (
            historyError.message !==
            "SESSION_EXPIRED"
          ) {
            console.error(
              "History refresh error:",
              historyError
            );
          }
        }
      } else {
        alert(
          data.detail ||
            data.message ||
            "Unable to evaluate answer."
        );
      }
    } catch (error) {
      if (error.message === "SESSION_EXPIRED") {
        alert(
          "Your session has expired. Please login again."
        );
      } else {
        console.error(
          "Answer evaluation error:",
          error
        );

        alert(
          "Unable to connect to the server."
        );
      }
    } finally {
      setEvaluating(false);
    }
  };

  // =========================================================
  // NEXT QUESTION
  // =========================================================

  const getNextQuestion = async () => {
    if (!jobRole || !interviewType) {
      alert(
        "Please select a job role and interview type."
      );
      return;
    }

    if (!question) {
      alert(
        "There is no previous question."
      );
      return;
    }

    setNextLoading(true);

    try {
      const response =
        await authenticatedFetch(
          `${API_URL}/interview/next-question`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              jobRole,
              interviewType,
              previousQuestion: question,
              previousAnswer: answer,
              previousEvaluation: evaluation
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.detail ||
            "Unable to generate next question."
        );
      }

      setQuestion(data.question);
      setAnswer("");
      setEvaluation("");

      setQuestions((previous) => [
        ...previous,
        data.question
      ]);
    } catch (error) {
      if (error.message === "SESSION_EXPIRED") {
        alert(
          "Your session has expired. Please login again."
        );
      } else {
        console.error(
          "Next question error:",
          error
        );

        alert(
          "Unable to generate the next question."
        );
      }
    } finally {
      setNextLoading(false);
    }
  };

  // =========================================================
  // FINAL REPORT
  // =========================================================

  const generateReport = async () => {
    if (questions.length === 0) {
      alert(
        "Please complete an interview first."
      );
      return;
    }

    if (answers.length === 0) {
      alert(
        "Please answer at least one question."
      );
      return;
    }

    setReportLoading(true);

    try {
      const response =
        await authenticatedFetch(
          `${API_URL}/interview/final-report`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              jobRole,
              interviewType,
              questions,
              answers,
              evaluations
            })
          }
        );

      const data =
        await response.json();

      if (response.ok && data.report) {
        setReport(data.report);

        await exitInterviewMode(
          "Interview completed successfully."
        );
      } else {
        alert(
          data.detail ||
            data.message ||
            "Unable to generate final report."
        );
      }
    } catch (error) {
      if (error.message === "SESSION_EXPIRED") {
        alert(
          "Your session has expired. Please login again."
        );
      } else {
        console.error(
          "Final report error:",
          error
        );

        alert(
          "Unable to connect to the server."
        );
      }
    } finally {
      setReportLoading(false);
    }
  };

  // =========================================================
  // UPLOAD RESUME
  // =========================================================

  const uploadResume = async () => {
    if (!resume) {
      setResumeMessage(
        "Please select a PDF resume."
      );
      return;
    }

    if (!jobRole || !interviewType) {
      setResumeMessage(
        "Please select the job role and interview type first."
      );
      return;
    }

    setResumeLoading(true);
    setResumeMessage("");
    setResumeQuestion("");

    const formData = new FormData();

    formData.append("file", resume);

    try {
      const uploadResponse =
        await authenticatedFetch(
          `${API_URL}/upload-resume`,
          {
            method: "POST",
            body: formData
          }
        );

      const uploadData =
        await uploadResponse.json();

      if (!uploadResponse.ok) {
        setResumeMessage(
          uploadData.detail ||
            uploadData.message ||
            "Resume upload failed."
        );
        return;
      }

      setResumeText(
        uploadData.text || ""
      );

      const questionResponse =
        await authenticatedFetch(
          `${API_URL}/generate-resume-question`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              job_role: jobRole,
              interview_type: interviewType,
              resume_text:
                uploadData.text
            })
          }
        );

      const questionData =
        await questionResponse.json();

      if (!questionResponse.ok) {
        setResumeMessage(
          questionData.detail ||
            questionData.message ||
            "Could not generate interview question."
        );
        return;
      }

      setResumeQuestion(
        questionData.question
      );

      setResumeMessage(
        "Resume analyzed successfully! Your personalized question is ready."
      );
    } catch (error) {
      if (error.message === "SESSION_EXPIRED") {
        alert(
          "Your session has expired. Please login again."
        );
      } else {
        console.error(
          "Resume upload error:",
          error
        );

        setResumeMessage(
          "Could not connect to the backend."
        );
      }
    } finally {
      setResumeLoading(false);
    }
  };

  // =========================================================
  // DASHBOARD DATA
  // =========================================================

  const scoreData = dashboard
    ? (dashboard.recent_interviews || []).map(
        (item, index) => {
          const evaluation =
            item.evaluation || "";

          const match =
            evaluation.match(
              /(?:score|rating)\s*[:\-]?\s*(\d+)(?:\s*\/\s*10)?/i
            );

          return {
            interview: `Interview ${index + 1}`,
            score: match
              ? Number(match[1])
              : 0
          };
        }
      )
    : [];

  const roleData = dashboard
    ? Object.entries(
        (dashboard.recent_interviews || []).reduce(
          (result, item) => {
            const role =
              item.job_role ||
              "Unknown";

            result[role] =
              (result[role] || 0) + 1;

            return result;
          },
          {}
        )
      ).map(
        ([job_role, count]) => ({
          job_role,
          count
        })
      )
    : [];

  // =========================================================
  // LOGIN / REGISTER SCREEN
  // =========================================================

  if (!user) {
    const isRegister =
      authMode === "register";

    return (
      <div className="login-page">
        <div className="login-card">

          <div className="login-icon">
            🤖
          </div>

          <div className="auth-badge">
            AI-POWERED INTERVIEW PLATFORM
          </div>

          <h1>
            {isRegister
              ? "Create your account"
              : "Welcome back"}
          </h1>

          <p className="auth-subtitle">
            {isRegister
              ? "Create an account and start practicing smarter with AI."
              : "Practice interviews with an AI interviewer and improve your confidence."}
          </p>

          <div className="auth-tabs">

            <button
              type="button"
              className={
                !isRegister
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() => {
                setAuthMode("login");
                setLoginMessage("");
              }}
            >
              Login
            </button>

            <button
              type="button"
              className={
                isRegister
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() => {
                setAuthMode("register");
                setLoginMessage("");
              }}
            >
              Create Account
            </button>

          </div>

          <form
            onSubmit={
              isRegister
                ? handleRegister
                : handleLogin
            }
          >

            {isRegister && (
              <div className="form-group">

                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  autoComplete="name"
                  required
                />

              </div>
            )}

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
                required
              />

            </div>

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder={
                  isRegister
                    ? "Create a password"
                    : "Enter your password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete={
                  isRegister
                    ? "new-password"
                    : "current-password"
                }
                minLength={
                  isRegister
                    ? 6
                    : undefined
                }
                required
              />

              {isRegister && (
                <small className="password-hint">
                  Use at least 6 characters.
                </small>
              )}

            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="login-button"
            >
              {loginLoading
                ? isRegister
                  ? "Creating Account..."
                  : "Logging in..."
                : isRegister
                ? "Create Account"
                : "Login"}
            </button>

          </form>

          {loginMessage && (
            <div className="login-message">
              {loginMessage}
            </div>
          )}

          <div className="auth-switch">

            {isRegister ? (
              <>
                Already have an account?

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setLoginMessage("");
                  }}
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Don't have an account?

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setLoginMessage("");
                  }}
                >
                  Create Account
                </button>
              </>
            )}

          </div>

          <div className="auth-footer">
            Secure account access • AI-powered interview practice
          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN APPLICATION
  // =========================================================

  return (
    <div
      className={`app ${
        interviewActive
          ? "secure-app"
          : ""
      }`}
    >

      {/* =====================================================
          NORMAL HEADER
      ===================================================== */}

      {!interviewActive && (
        <header className="header">

          <div className="header-content">

            <div className="brand-section">

              <div className="brand-logo">
                🤖
              </div>

              <div>
                <h1>
                  AI Mock Interviewer
                </h1>

                <p>
                  Practice. Improve. Succeed.
                </p>
              </div>

            </div>

            <div className="user-section">

              <span className="welcome-text">
                Welcome,{" "}
                <strong>
                  {user.name}
                </strong>
              </span>

              <button
                onClick={openProfile}
                className="profile-button"
              >
                👤 Profile
              </button>

              <button
                onClick={loadDashboard}
                className="dashboard-button"
                disabled={dashboardLoading}
              >
                {dashboardLoading
                  ? "Loading..."
                  : "📊 Dashboard"}
              </button>

              <button
                onClick={handleLogout}
                className="logout-button"
              >
                Logout
              </button>

            </div>

          </div>

        </header>
      )}

      {/* =====================================================
          SECURE INTERVIEW HEADER
      ===================================================== */}

      {interviewActive && (
        <div className="secure-interview-header">

          <div className="secure-brand">

            <div className="secure-logo">
              🤖
            </div>

            <div>
              <strong>
                AI Mock Interview
              </strong>

              <span>
                Secure Interview Mode
              </span>
            </div>

          </div>

          <div className="secure-session-info">

            <div className="secure-status">
              <span className="secure-status-dot"></span>
              Interview Active
            </div>

            <div className="secure-question-count">
              Question {questions.length} / {maxQuestions}
            </div>

          </div>

          <button
            className="end-interview-button"
            onClick={() =>
              exitInterviewMode(
                "Interview ended by the candidate."
              )
            }
          >
            End Interview
          </button>

        </div>
      )}

      <main
        className={`main-container ${
          interviewActive
            ? "fullscreen-interview"
            : ""
        }`}
      >

        {/* ===================================================
            PROCTOR MESSAGE
        =================================================== */}

        {proctorMessage &&
          !interviewActive && (
            <div className="proctor-message">

              <div className="proctor-icon">
                ⚠
              </div>

              <div>
                <strong>
                  Interview ended
                </strong>

                <span>
                  {proctorMessage}
                </span>
              </div>

            </div>
          )}

        {/* ===================================================
            PROFILE
        =================================================== */}

        {showProfile &&
          !interviewActive && (
            <section className="profile-page">

              <div className="profile-hero">

                <div className="profile-hero-left">

                  <div className="profile-avatar-large">
                    {(
                      profileName ||
                      user?.name ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>

                    <span className="profile-eyebrow">
                      ACCOUNT
                    </span>

                    <h2>
                      Profile & Account
                    </h2>

                    <p>
                      View your account details and manage your security settings.
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  className="profile-back-button"
                  onClick={() =>
                    setShowProfile(false)
                  }
                >
                  ← Back to Interview
                </button>

              </div>

              <div className="profile-layout">

                <div className="profile-main-card">

                  <div className="profile-card-header">

                    <div>

                      <span className="profile-card-kicker">
                        PERSONAL INFORMATION
                      </span>

                      <h3>
                        Your profile
                      </h3>

                      <p>
                        Your personal account information.
                      </p>

                    </div>

                    {!profileEditMode && (
                      <button
                        type="button"
                        className="profile-edit-button"
                        onClick={() => {
                          setProfileEditMode(true);
                          setProfileMessage("");
                        }}
                      >
                        ✎ Edit Profile
                      </button>
                    )}

                  </div>

                  {!profileEditMode ? (
                    <div className="profile-details">

                      <div className="profile-detail-item">

                        <span className="detail-icon">
                          👤
                        </span>

                        <div>

                          <span className="detail-label">
                            Full Name
                          </span>

                          <strong>
                            {profileName ||
                              user?.name ||
                              "Not provided"}
                          </strong>

                        </div>

                      </div>

                      <div className="profile-detail-item">

                        <span className="detail-icon">
                          ✉
                        </span>

                        <div>

                          <span className="detail-label">
                            Email Address
                          </span>

                          <strong>
                            {profileEmail ||
                              user?.email ||
                              "Not provided"}
                          </strong>

                        </div>

                      </div>

                      <div className="profile-detail-item">

                        <span className="detail-icon">
                          ✓
                        </span>

                        <div>

                          <span className="detail-label">
                            Account Status
                          </span>

                          <strong className="status-active">
                            Active
                          </strong>

                        </div>

                      </div>

                    </div>
                  ) : (
                    <form
                      className="profile-edit-form"
                      onSubmit={updateProfile}
                    >

                      <div className="profile-form-grid">

                        <div className="form-group">

                          <label htmlFor="profile-name">
                            Full Name
                          </label>

                          <input
                            id="profile-name"
                            type="text"
                            value={profileName}
                            onChange={(e) =>
                              setProfileName(
                                e.target.value
                              )
                            }
                            required
                          />

                        </div>

                        <div className="form-group">

                          <label htmlFor="profile-email">
                            Email Address
                          </label>

                          <input
                            id="profile-email"
                            type="email"
                            value={profileEmail}
                            onChange={(e) =>
                              setProfileEmail(
                                e.target.value
                              )
                            }
                            required
                          />

                        </div>

                      </div>

                      <div className="profile-form-actions">

                        <button
                          type="button"
                          className="profile-cancel-button"
                          onClick={() => {
                            setProfileEditMode(false);

                            setProfileName(
                              user?.name || ""
                            );

                            setProfileEmail(
                              user?.email || ""
                            );

                            setProfileMessage("");
                          }}
                          disabled={profileLoading}
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="primary-button"
                          disabled={profileLoading}
                        >
                          {profileLoading
                            ? "Saving..."
                            : "Save Changes"}
                        </button>

                      </div>

                      {profileMessage && (
                        <p className="account-message">
                          {profileMessage}
                        </p>
                      )}

                    </form>
                  )}

                </div>

                <aside className="profile-side-card">

                  <div className="security-icon">
                    🔐
                  </div>

                  <span className="profile-card-kicker">
                    SECURITY
                  </span>

                  <h3>
                    Account security
                  </h3>

                  <p>
                    Manage your password and account protection.
                  </p>

                  <button
                    type="button"
                    className="security-settings-button"
                    onClick={() => {
                      setShowSecuritySettings(
                        (value) => !value
                      );

                      setPasswordMessage("");
                    }}
                  >
                    {showSecuritySettings
                      ? "Hide Security Settings"
                      : "Manage Security"}
                  </button>

                </aside>

              </div>

              {/* SECURITY */}

              {showSecuritySettings && (
                <div className="security-panel">

                  <div className="security-panel-header">

                    <div>

                      <span className="profile-card-kicker">
                        PASSWORD
                      </span>

                      <h3>
                        Change password
                      </h3>

                      <p>
                        Update your account password securely.
                      </p>

                    </div>

                  </div>

                  <form
                    className="password-form"
                    onSubmit={changePassword}
                  >

                    <div className="profile-form-grid">

                      <div className="form-group">

                        <label htmlFor="current-password">
                          Current Password
                        </label>

                        <input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) =>
                            setCurrentPassword(
                              e.target.value
                            )
                          }
                          placeholder="Enter current password"
                          required
                        />

                      </div>

                      <div className="form-group">

                        <label htmlFor="new-password">
                          New Password
                        </label>

                        <input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) =>
                            setNewPassword(
                              e.target.value
                            )
                          }
                          placeholder="At least 6 characters"
                          minLength={6}
                          required
                        />

                      </div>

                    </div>

                    <div className="profile-form-actions">

                      <button
                        type="submit"
                        className="secondary-button"
                        disabled={passwordLoading}
                      >
                        {passwordLoading
                          ? "Changing..."
                          : "Change Password"}
                      </button>

                    </div>

                    {passwordMessage && (
                      <p className="account-message">
                        {passwordMessage}
                      </p>
                    )}

                  </form>

                  {/* DELETE ACCOUNT */}

                  <div className="danger-zone">

                    <div className="danger-content">

                      <span className="danger-icon">
                        !
                      </span>

                      <div>

                        <h3>
                          Delete account
                        </h3>

                        <p>
                          Permanently delete your account and interview history.
                        </p>

                      </div>

                    </div>

                    {!showDeleteConfirm ? (
                      <button
                        type="button"
                        className="delete-account-button"
                        onClick={() => {
                          setDeleteMessage("");
                          setDeletePassword("");
                          setShowDeleteConfirm(true);
                        }}
                      >
                        Delete Account
                      </button>
                    ) : (
                      <div className="delete-confirm-box">

                        <strong>
                          Are you sure?
                        </strong>

                        <p>
                          Enter your password to permanently delete your account.
                        </p>

                        <input
                          type="password"
                          value={deletePassword}
                          onChange={(e) =>
                            setDeletePassword(
                              e.target.value
                            )
                          }
                          placeholder="Enter your password"
                        />

                        {deleteMessage && (
                          <p className="delete-message">
                            {deleteMessage}
                          </p>
                        )}

                        <div className="delete-actions">

                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeleteMessage("");
                            }}
                            disabled={deleteLoading}
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            className="delete-account-button"
                            onClick={deleteAccount}
                            disabled={deleteLoading}
                          >
                            {deleteLoading
                              ? "Deleting..."
                              : "Yes, Delete My Account"}
                          </button>

                        </div>

                      </div>
                    )}

                  </div>

                </div>
              )}

            </section>
          )}

        {/* ===================================================
            DASHBOARD
        =================================================== */}

        {showDashboard &&
          dashboard &&
          !interviewActive &&
          !showProfile && (
            <section className="card dashboard-card">

              <div className="section-title">

                <span className="step-number">
                  📊
                </span>

                <div>

                  <h2>
                    Performance Dashboard
                  </h2>

                  <p>
                    Track your interview performance and progress
                  </p>

                </div>

              </div>

              <div className="dashboard-stats">

                <div className="stat-card">
                  <h3>
                    Total Interviews
                  </h3>

                  <div className="stat-number">
                    {dashboard.total_interviews}
                  </div>
                </div>

                <div className="stat-card">
                  <h3>
                    Average Score
                  </h3>

                  <div className="stat-number">
                    {dashboard.average_score}
                    /10
                  </div>
                </div>

                <div className="stat-card">
                  <h3>
                    Recent Attempts
                  </h3>

                  <div className="stat-number">
                    {(
                      dashboard.recent_interviews ||
                      []
                    ).length}
                  </div>
                </div>

              </div>

              {/* ROLE CHART */}

              <div className="dashboard-section">

                <h3>
                  Interviews by Job Role
                </h3>

                {roleData.length === 0 ? (
                  <div className="empty-history">
                    <p>
                      No interview data available yet.
                    </p>
                  </div>
                ) : (
                  <div className="chart-container">

                    <ResponsiveContainer
                      width="100%"
                      height={300}
                    >

                      <BarChart
                        data={roleData}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis
                          dataKey="job_role"
                          angle={-15}
                          textAnchor="end"
                          height={70}
                        />

                        <YAxis
                          allowDecimals={false}
                        />

                        <Tooltip />

                        <Bar
                          dataKey="count"
                          name="Interviews"
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  </div>
                )}

              </div>

              {/* SCORE CHART */}

              <div className="dashboard-section">

                <h3>
                  Performance Scores
                </h3>

                {scoreData.length === 0 ? (
                  <div className="empty-history">

                    <p>
                      Complete interviews to see performance analytics.
                    </p>

                  </div>
                ) : (
                  <div className="chart-container">

                    <ResponsiveContainer
                      width="100%"
                      height={300}
                    >

                      <BarChart
                        data={scoreData}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                        />

                        <XAxis
                          dataKey="interview"
                        />

                        <YAxis
                          domain={[0, 10]}
                          allowDecimals={false}
                        />

                        <Tooltip />

                        <Bar
                          dataKey="score"
                          name="Score"
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  </div>
                )}

              </div>

              {/* RECENT INTERVIEWS */}

              <div className="dashboard-section">

                <h3>
                  Recent Interviews
                </h3>

                {(
                  dashboard.recent_interviews ||
                  []
                ).length === 0 ? (
                  <div className="empty-history">

                    <p>
                      No interviews completed yet.
                    </p>

                  </div>
                ) : (
                  <div className="history-list">

                    {dashboard.recent_interviews.map(
                      (item, index) => (
                        <div
                          className="history-item"
                          key={
                            item.id ||
                            index
                          }
                        >

                          <div className="history-header">

                            <span>
                              Interview #{index + 1}
                            </span>

                            <span>
                              {item.job_role}
                            </span>

                          </div>

                          <div className="dashboard-interview-info">

                            <p>
                              <strong>
                                Type:
                              </strong>{" "}
                              {item.interview_type}
                            </p>

                            <p>
                              <strong>
                                Question:
                              </strong>{" "}
                              {item.question}
                            </p>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              <button
                className="secondary-button"
                onClick={() =>
                  setShowDashboard(false)
                }
              >
                ← Back to Interview
              </button>

            </section>
          )}

        {/* ===================================================
            INTERVIEW PAGE
        =================================================== */}

        {!showDashboard &&
          !showProfile && (
            <>

              {/* =================================================
                  SETUP
              ================================================= */}

              <section
                className={`card setup-card ${
                  interviewActive
                    ? "interview-hidden"
                    : ""
                }`}
              >

                <div className="section-title">

                  <span className="step-number">
                    1
                  </span>

                  <div>

                    <h2>
                      Interview Setup
                    </h2>

                    <p>
                      Configure your AI interview
                    </p>

                  </div>

                </div>

                <div className="setup-grid">

                  <div className="form-group">

                    <label>
                      Job Role
                    </label>

                    <select
                      value={jobRole}
                      onChange={(e) => {
                        setJobRole(
                          e.target.value
                        );

                        setResumeQuestion("");
                        setResumeText("");
                        setResumeMessage("");
                      }}
                    >

                      <option value="">
                        Select Job Role
                      </option>

                      <option value="Software Engineer">
                        Software Engineer
                      </option>

                      <option value="Frontend Developer">
                        Frontend Developer
                      </option>

                      <option value="Backend Developer">
                        Backend Developer
                      </option>

                      <option value="Full Stack Developer">
                        Full Stack Developer
                      </option>

                      <option value="Data Scientist">
                        Data Scientist
                      </option>

                      <option value="Machine Learning Engineer">
                        Machine Learning Engineer
                      </option>

                      <option value="DevOps Engineer">
                        DevOps Engineer
                      </option>

                      <option value="Product Manager">
                        Product Manager
                      </option>

                    </select>

                  </div>

                  <div className="form-group">

                    <label>
                      Interview Type
                    </label>

                    <select
                      value={interviewType}
                      onChange={(e) => {
                        setInterviewType(
                          e.target.value
                        );

                        setResumeQuestion("");
                        setResumeText("");
                        setResumeMessage("");
                      }}
                    >

                      <option value="">
                        Select Interview Type
                      </option>

                      <option value="Technical">
                        Technical
                      </option>

                      <option value="HR">
                        HR
                      </option>

                      <option value="Behavioral">
                        Behavioral
                      </option>

                      <option value="Mixed">
                        Mixed
                      </option>

                    </select>

                  </div>

                </div>

                {/* ANSWER MODE */}

                <div className="answer-mode-section">

                  <label>
                    Interview Answer Mode
                  </label>

                  <div className="answer-mode-options">

                    <button
                      type="button"
                      className={`answer-mode-option ${
                        answerMode === "voice"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        setAnswerMode("voice");

                        setVoiceMessage(
                          "AI will speak the questions and you can answer using your microphone."
                        );
                      }}
                    >

                      <span className="answer-mode-icon">
                        🎤
                      </span>

                      <span>
                        Voice Interview
                      </span>

                    </button>

                    <button
                      type="button"
                      className={`answer-mode-option ${
                        answerMode === "text"
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        setAnswerMode("text");

                        setVoiceMessage("");

                        window.speechSynthesis?.cancel();

                        recognitionRef.current?.stop();
                      }}
                    >

                      <span className="answer-mode-icon">
                        ⌨️
                      </span>

                      <span>
                        Text Interview
                      </span>

                    </button>

                  </div>

                  {answerMode === "voice" && (
                    <p className="voice-mode-hint">
                      🎙 Voice mode uses your microphone and browser speech recognition.
                      Google Chrome is recommended.
                    </p>
                  )}

                </div>

                <div className="secure-start-info">

                  <span>
                    🔒
                  </span>

                  <div>

                    <strong>
                      Secure Interview Mode
                    </strong>

                    <p>
                      The interview runs in fullscreen mode. Switching tabs or leaving the interview window will terminate the session.
                    </p>

                  </div>

                </div>

                <button
                  className="primary-button start-interview-button"
                  onClick={generateQuestion}
                  disabled={loading}
                >
                  {loading
                    ? "Generating Question..."
                    : resumeQuestion
                    ? "🚀 Start Resume Interview"
                    : "🚀 Start Interview"}
                </button>

              </section>

              {/* =================================================
                  RESUME
              ================================================= */}

              <div
                className={`resume-section ${
                  interviewActive
                    ? "interview-hidden"
                    : ""
                }`}
              >

                <div className="resume-header">

                  <div className="resume-icon">
                    📄
                  </div>

                  <div>

                    <h2>
                      Resume-Based Interview
                    </h2>

                    <p>
                      Upload your resume to generate personalized AI interview questions based on your skills and experience.
                    </p>

                  </div>

                </div>

                <div className="resume-upload-area">

                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      setResume(
                        e.target.files?.[0] ||
                          null
                      );

                      setResumeMessage("");
                      setResumeQuestion("");
                      setResumeText("");
                    }}
                  />

                  <label
                    htmlFor="resume-upload"
                    className="resume-file-label"
                  >
                    📎{" "}
                    {resume
                      ? resume.name
                      : "Choose PDF Resume"}
                  </label>

                  <button
                    className="resume-upload-button"
                    onClick={uploadResume}
                    disabled={resumeLoading}
                  >
                    {resumeLoading
                      ? "Analyzing Resume..."
                      : "Upload & Analyze Resume"}
                  </button>

                </div>

                {resumeMessage && (
                  <div className="resume-message">
                    {resumeMessage}
                  </div>
                )}

                {resumeText && (
                  <div className="resume-preview">

                    <div className="resume-success">
                      ✓
                    </div>

                    <div>

                      <h3>
                        Resume Analyzed Successfully
                      </h3>

                      <p>
                        Your resume has been processed by the AI interviewer.
                      </p>

                    </div>

                  </div>
                )}

                {resumeQuestion && (
                  <div className="resume-question">

                    <div className="resume-question-label">
                      PERSONALIZED AI QUESTION
                    </div>

                    <h3>
                      {resumeQuestion}
                    </h3>

                    <p>
                      Click{" "}
                      <strong>
                        Start Resume Interview
                      </strong>{" "}
                      above to use this as your first interview question.
                    </p>

                  </div>
                )}

              </div>

              {/* =================================================
                  CURRENT QUESTION
              ================================================= */}

              {question && (
                <section
                  className={`card interview-card ${
                    interviewActive
                      ? "active-interview-card"
                      : ""
                  }`}
                >

                  <div className="section-title">

                    <span className="step-number">
                      2
                    </span>

                    <div>

                      <h2>
                        Interview Question
                      </h2>

                      <p>
                        Question{" "}
                        {questions.length}{" "}
                        of{" "}
                        {maxQuestions}
                      </p>

                    </div>

                  </div>

                  <div className="professional-question-box">

                    <div className="question-top">

                      <span className="ai-interviewer-label">
                        <span className="ai-live-dot"></span>
                        AI INTERVIEWER
                      </span>

                      {answerMode === "voice" && (
                        <span className="voice-active-label">
                          🎙 VOICE MODE
                        </span>
                      )}

                    </div>

                    <h3>
                      {question}
                    </h3>

                    {answerMode === "voice" && (
                      <div className="ai-speaking-indicator">
                        🔊 AI will speak this question
                      </div>
                    )}

                  </div>

                  <div className="form-group">

                    <label>
                      {answerMode === "voice"
                        ? "Your Voice Answer"
                        : "Your Answer"}
                    </label>

                    {answerMode === "voice" ? (
                      <div className="voice-interview-controls">

                        <div className="voice-controls">

                          <button
                            type="button"
                            className={`voice-record-button ${
                              isListening
                                ? "recording"
                                : ""
                            }`}
                            onClick={
                              isListening
                                ? stopVoiceAnswer
                                : startVoiceAnswer
                            }
                          >

                            <span className="voice-button-icon">
                              {isListening
                                ? "⏹"
                                : "🎙"}
                            </span>

                            {isListening
                              ? "Stop Speaking"
                              : "Start Speaking"}

                          </button>

                          <button
                            type="button"
                            className="voice-replay-button"
                            onClick={() =>
                              speakQuestion(
                                question
                              )
                            }
                          >
                            🔊 Repeat Question
                          </button>

                        </div>

                        {voiceMessage && (
                          <p className="voice-message">
                            {voiceMessage}
                          </p>
                        )}

                        <textarea
                          value={answer}
                          onChange={(e) =>
                            setAnswer(
                              e.target.value
                            )
                          }
                          placeholder="Your spoken answer will appear here..."
                          rows="7"
                        />

                      </div>
                    ) : (
                      <textarea
                        value={answer}
                        onChange={(e) =>
                          setAnswer(
                            e.target.value
                          )
                        }
                        placeholder="Type your answer here..."
                        rows="7"
                      />
                    )}

                  </div>

                  <button
                    className="primary-button"
                    onClick={submitAnswer}
                    disabled={
                      evaluating
                    }
                  >
                    {evaluating
                      ? "🤖 Evaluating Answer..."
                      : "Submit Answer →"}
                  </button>

                </section>
              )}

              {/* =================================================
                  EVALUATION
              ================================================= */}

              {evaluation && (
                <section className="card evaluation-card">

                  <div className="section-title">

                    <span className="step-number">
                      3
                    </span>

                    <div>

                      <h2>
                        AI Evaluation
                      </h2>

                      <p>
                        Feedback on your answer
                      </p>

                    </div>

                  </div>

                  <div className="evaluation-box">
                    {evaluation}
                  </div>

                  {questions.length <
                  maxQuestions ? (
                    <button
                      className="secondary-button"
                      onClick={
                        getNextQuestion
                      }
                      disabled={
                        nextLoading
                      }
                    >
                      {nextLoading
                        ? "Generating Next Question..."
                        : "Next Question →"}
                    </button>
                  ) : (
                    <div className="completion-message">

                      <div className="completion-icon">
                        🎉
                      </div>

                      <h3>
                        Interview Completed!
                      </h3>

                      <p>
                        You completed all{" "}
                        {maxQuestions}{" "}
                        questions. Generate your final performance report.
                      </p>

                    </div>
                  )}

                </section>
              )}

              {/* =================================================
                  FINAL REPORT
              ================================================= */}

              {answers.length > 0 && (
                <section className="card report-card">

                  <div className="section-title">

                    <span className="step-number">
                      4
                    </span>

                    <div>

                      <h2>
                        Final Performance Report
                      </h2>

                      <p>
                        Get an overall analysis of your interview
                      </p>

                    </div>

                  </div>

                  <button
                    className="primary-button"
                    onClick={
                      generateReport
                    }
                    disabled={
                      reportLoading
                    }
                  >
                    {reportLoading
                      ? "Generating Report..."
                      : "📊 Generate Final Report"}
                  </button>

                  {report && (
                    <div className="report-box">

                      <h3>
                        📊 Interview Performance Report
                      </h3>

                      <div className="report-content">
                        {report}
                      </div>

                    </div>
                  )}

                </section>
              )}

              {/* =================================================
                  HISTORY
              ================================================= */}

              <section className="card history-card">

                <div className="section-title">

                  <span className="step-number">
                    5
                  </span>

                  <div>

                    <h2>
                      Interview History
                    </h2>

                    <p>
                      Your previous interview answers and feedback
                    </p>

                  </div>

                </div>

                {savedHistory.length === 0 ? (
                  <div className="empty-history">

                    <div className="empty-history-icon">
                      📋
                    </div>

                    <p>
                      No interview history available yet.
                    </p>

                  </div>
                ) : (
                  <div className="history-list">

                    {savedHistory.map(
                      (item, index) => (
                        <div
                          className="history-item"
                          key={
                            item.id ||
                            index
                          }
                        >

                          <div className="history-header">

                            <span>
                              Interview #{index + 1}
                            </span>

                            <span>
                              {item.job_role}
                            </span>

                          </div>

                          <div className="history-question">

                            <strong>
                              Question
                            </strong>

                            <p>
                              {item.question}
                            </p>

                          </div>

                          <div className="history-answer">

                            <strong>
                              Your Answer
                            </strong>

                            <p>
                              {item.answer}
                            </p>

                          </div>

                          <div className="history-evaluation">

                            <strong>
                              AI Evaluation
                            </strong>

                            <p>
                              {item.evaluation}
                            </p>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </section>

            </>
          )}

      </main>

      {!interviewActive && (
        <footer className="footer">

          <p>
            AI Mock Interviewer • Powered by Generative AI
          </p>

          <span>
            Secure • Intelligent • Personalized
          </span>

        </footer>
      )}

    </div>
  );
}

export default App;