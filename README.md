# 🚀 NextGenHack: Intelligent Auto Coding Assistant
**Problem Statement 21: Intelligent Auto Coding Assistant for Programming Skill Development**

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)

An interactive, AI-powered coding environment designed to bridge the gap between competitive programming and real-world software engineering. Built by team **CodEEBuzZ** (Techie Papa) for NextGenHack.

---

## 🎯 The Problem
Students often lack structured feedback and personalized practice support in programming courses. Traditional platforms act as "black boxes" that only tell a student if they passed or failed, without explaining *why* or teaching them how to write cleaner code.

## 💡 Our Solution
We built an Intelligent Auto Coding Assistant that doesn't just evaluate code—it actively mentors the student. 

### ✨ Key Features
* **💻 Transparent Execution Sandbox:** Powered by JDoodle, students can see exact outputs and error traces in a seamless, resizable terminal.
* **🤖 Interactive AI Mentor:** Integrated with Google's Gemini 2.5 Flash. Students can ask for hints, approaches, and bug fixes *without* the AI giving away the final answer.
* **📊 Code Quality Analysis:** A dedicated tool that instantly evaluates the student's submitted code, providing Time Complexity (Big O), Space Complexity, and cleanliness suggestions.
* **📚 Dynamic Problem Bank:** Problems, test cases, and runnable boilerplates are dynamically fetched from a Supabase PostgreSQL database.

---

## 🏗️ System Architecture & Data Flow

```mermaid
graph TD
    A[Student Browser] -->|Selects Problem| B(React Frontend)
    B -->|Fetches Problem Data| C[(Supabase DB)]
    C -->|Returns Boilerplate| B
    B -->|User Writes Code| D{Action Triggered}
    
    D -->|Clicks 'Run'| E[Node.js / Express Backend]
    E -->|Sends Code| F[JDoodle Compiler API]
    F -->|Returns Output| E
    E -->|Displays Terminal| B
    
    D -->|Clicks 'Ask AI' / 'Analyze'| G[Gemini AI Engine]
    G -->|Context: Code + Prompt| H(AI Mentor Module)
    H -->|Generates Markdown Hint| B
    
    classDef default fill:#1e1e1e,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef db fill:#0d1117,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef ai fill:#312e81,stroke:#8b5cf6,stroke-width:2px,color:#fff;
    class C db;
    class G,H ai;
