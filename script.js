// Initial Mock Data
let assignments = JSON.parse(localStorage.getItem('assignments')) || [];
let studentData = {
    scores: { 'Physics': [['Alex', 90], ['Sam', 85]] },
    engagement: [['Alex', 15], ['Sam', 12]]
};

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
    if(sectionId === 'student-section') renderStudentQuizzes();
    if(sectionId === 'leaderboard-section') renderLeaderboards();
}

// Teacher Logic
function uploadAssignment() {
    const title = document.getElementById('quiz-title').value;
    const data = document.getElementById('quiz-data').value;
    
    if (title && data) {
        assignments.push({ title, questions: JSON.parse(data) });
        localStorage.setItem('assignments', JSON.stringify(assignments));
        alert("Assignment Published!");
        renderTeacherList();
    }
}

function renderTeacherList() {
    const list = document.getElementById('assignment-list');
    list.innerHTML = assignments.map(a => `<li>${a.title}</li>`).join('');
}

// Student Logic
function renderStudentQuizzes() {
    const container = document.getElementById('quiz-cards-container');
    container.innerHTML = assignments.map((a, index) => `
        <div class="card">
            <h4>${a.title}</h4>
            <button class="btn-primary" onclick="startQuiz(${index})">Take Test</button>
        </div>
    `).join('');
}

let activeQuiz = null;

function startQuiz(index) {
    activeQuiz = assignments[index];
    document.getElementById('available-quizzes').style.display = 'none';
    document.getElementById('active-quiz-area').style.display = 'block';
    document.getElementById('current-quiz-name').innerText = activeQuiz.title;
    
    const questionsHtml = activeQuiz.questions.map((q, i) => `
        <div class="question-block">
            <p>${i+1}. ${q.q}</p>
            <input type="text" id="ans-${i}" placeholder="Your answer">
        </div>
    `).join('');
    document.getElementById('questions-container').innerHTML = questionsHtml;
}

function submitQuiz() {
    let score = 0;
    let feedback = "<h4>Results:</h4>";
    
    activeQuiz.questions.forEach((q, i) => {
        const userAns = document.getElementById(`ans-${i}`).value;
        if(userAns.trim().toLowerCase() === q.a.toLowerCase()) {
            score++;
            feedback += `<p style="color:green">Q${i+1}: Correct!</p>`;
        } else {
            feedback += `<p style="color:red">Q${i+1}: Wrong. Correct answer: ${q.a}</p>`;
        }
    });

    const resultArea = document.getElementById('result-area');
    resultArea.style.display = 'block';
    resultArea.innerHTML = `${feedback} <hr> <strong>Final Score: ${score}/${activeQuiz.questions.length}</strong>`;
}

// Leaderboard Logic
function renderLeaderboards() {
    const topicList = document.getElementById('topic-leaderboard');
    const engagementList = document.getElementById('engagement-leaderboard');

    topicList.innerHTML = studentData.scores['Physics']
        .map(s => `<li>${s[0]} - ${s[1]}%</li>`).join('');
        
    engagementList.innerHTML = studentData.engagement
        .map(s => `<li>${s[0]} - ${s[1]} points</li>`).join('');
}

// Init
renderTeacherList();