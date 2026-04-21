/* Dữ liệu chung và xác thực */

/* Biến toàn cục */
let users = JSON.parse(localStorage.getItem('users')) || [
    { id: 1, username: 'teacher1', password: 'pass', role: 'teacher' },
    { id: 2, username: 'student1', password: 'pass', role: 'student' },
    { id: 3, username: 'student2', password: 'pass', role: 'student' },
    { id: 4, username: 'admin', password: 'admin', role: 'admin' }
];

let pendingUsers = JSON.parse(localStorage.getItem('pendingUsers')) || [];

let assignments = JSON.parse(localStorage.getItem('assignments')) || [];

let submissions = JSON.parse(localStorage.getItem('submissions')) || [];

let currentUser = null;

// Ensure admin exists - Kiểm tra tài khoản admin tồn tại
if (!users.find(u => u.role === 'admin')) {
    users.push({ id: 4, username: 'admin', password: 'admin', role: 'admin' });
    saveData();
}

/* Hàm đăng nhập */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const role = document.getElementById('role').value;        // Lấy vai trò
            const username = document.getElementById('username').value;  // Lấy tên đăng nhập
            const password = document.getElementById('password').value;  // Lấy mật khẩu
            
            // Tìm user có username + password + role khớp
            const user = users.find(u => u.username === username && u.password === password && u.role === role);
            
            if (user) {
                // ✓ Đăng nhập thành công
                currentUser = user;
                localStorage.setItem('currentUser', JSON.stringify(user));  // Lưu user hiện tại
                
                // Chuyển hướng dựa trên vai trò
                if (role === 'teacher') {
                    window.location.href = 'teacher.html';
                } else if (role === 'student') {
                    window.location.href = 'student.html';
                } else if (role === 'admin') {
                    window.location.href = 'admin.html';
                }
            } else {
                // ✗ Đăng nhập thất bại
                document.getElementById('message').textContent = 'Thông tin đăng nhập không hợp lệ';
            }
        });
    }

    // Tải user từ localStorage nếu đã đăng nhập trước đó
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
});

/* Hàm đăng xuất */
function logout() {
    localStorage.removeItem('currentUser');  // Xóa user hiện tại
    window.location.href = 'index.html';     // Chuyển về trang đăng nhập
}

/* Hàm tiện ích */

/* Lưu dữ liệu */
function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
    localStorage.setItem('assignments', JSON.stringify(assignments));
    localStorage.setItem('submissions', JSON.stringify(submissions));
}

/* Lấy danh sách chủ đề */
function getTopics() {
    const topics = [...new Set(assignments.map(a => a.topic))];
    return topics;
}

/* Tính bảng xếp hạng */
function calculateLeaderboards() {
    const topicScores = {};   // Lưu điểm theo chủ đề: { "Toán": { "student1": [90, 85] } }
    const engagement = {};    // Lưu lượt tham gia: { "student1": 5, "student2": 3 }

    // Duyệt tất cả kết quả làm bài
    submissions.forEach(sub => {
        const assignment = assignments.find(a => a.id === sub.assignmentId);
        if (!assignment) return;
        const topic = assignment.topic;                    // Chủ đề bài tập
        const student = users.find(u => u.id === sub.studentId);
        if (!student) return;
        const name = student.username;                     // Tên học sinh

        // Lưu điểm theo chủ đề
        if (!topicScores[topic]) topicScores[topic] = {};

        if (!topicScores[topic][name]) topicScores[topic][name] = [];
        topicScores[topic][name].push(sub.score / sub.total * 100);  // Lưu % điểm

        // Đếm lượt tham gia
        if (!engagement[name]) engagement[name] = 0;
        engagement[name]++;
    });

    // Tính trung bình điểm theo chủ đề
    const topicLeaders = {};
    for (const topic in topicScores) {
        const averages = Object.entries(topicScores[topic]).map(([name, scores]) => [
            name,
            scores.reduce((a, b) => a + b, 0) / scores.length  // Trung bình cộng
        ]);
        // Sắp xếp giảm dần theo điểm
        topicLeaders[topic] = averages.sort((a, b) => b[1] - a[1]);
    }

    // Sắp xếp engagement giảm dần
    const engagementList = Object.entries(engagement).sort((a, b) => b[1] - a[1]);

    return { topicLeaders, engagementList };
}

/* Xử lý file */
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);      // Base64 string
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function displayFile(fileData, fileName) {
    if (fileData.startsWith('data:image/')) {
        return `<img src="${fileData}" alt="${fileName}" style="max-width: 100%; height: auto;">`;
    } else if (fileData.startsWith('data:application/pdf')) {
        return `<embed src="${fileData}" type="application/pdf" width="100%" height="600px">`;
    }
    return `<p>File: ${fileName}</p>`;
}