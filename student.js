/* STUDENT.JS - Bối học sinh xem bài tập */

/* Khởi tạo trang */
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xác thực - chỉ học sinh mới vào được
    if (!currentUser || currentUser.role !== 'student') {
        window.location.href = 'http://localhost:8000/index.html';
        return;
    }

    // Hiển thị 2 phần chính
    renderAssignments();    // Bài tập chưa làm
    renderResults();        // Kết quả bài tập đã làm
});

/* Hiển thị danh sách bài tập có sẵn */
function renderAssignments() {
    const container = document.getElementById('assignmentCards');

    // Bước 1: Lấy tất cả submission của học sinh hiện tại
    const userSubmissions = submissions.filter(s => s.studentId === currentUser.id);

    // Bước 2: Lấy ID các bài tập đã làm (bỏ qua isPractice)
    const takenIds = userSubmissions
        .filter(s => !s.isPractice)  // Chỉ tính bài tập thực, không tính luyện tập
        .map(s => s.assignmentId);

    // Bước 3: Filter ra bài tập chưa làm
    const available = assignments.filter(a => !takenIds.includes(a.id));

    // Bước 4: Render HTML card
    container.innerHTML = available.map(a => `
        <div class="card">
            <h4>${a.title}</h4>
            <p>Topic: ${a.topic}</p>
            <p>Questions: ${a.questions.length}</p>
            <button class="btn-primary" onclick="startQuiz(${a.id})">Take Quiz</button>
        </div>
    `).join('');
}

/* Hiển thị danh sách kết quả bài làm */
function renderResults() {
    const list = document.getElementById('resultsList');

    // Lấy tất cả bài làm của học sinh hiện tại
    const userSubmissions = submissions.filter(s => s.studentId === currentUser.id);

    // Render HTML
    list.innerHTML = userSubmissions.map(s => {
        // Tìm thông tin bài tập từ assignment ID
        const assignment = assignments.find(a => a.id === s.assignmentId);

        // Nếu là luyện tập: thêm " (Luyện Tập)"
        const practiceLabel = s.isPractice ? ' (Luyện Tập)' : '';

        return `<li>${assignment.title}${practiceLabel}: ${s.score}/${s.total} <a href="http://localhost:8000/results.html?id=${s.id}">Xem Chi Tiết</a></li>`;
    }).join('');
}

/* Điều hướng về trang quiz */
function startQuiz(id) {
    // Chuyển đến trang quiz với URL parameter: ?id=123
    window.location.href = `http://localhost:8000/quiz.html?id=${id}`;
}