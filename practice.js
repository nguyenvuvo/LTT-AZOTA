/* PRACTICE.JS - Trang luyện tập cho học sinh */

document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xác thực - chỉ học sinh mới vào được
    if (!currentUser || currentUser.role !== 'student') {
        window.location.href = 'http://localhost:8000/index.html';
        return;
    }

    // Hiển thị tất cả bài tập xếp theo chủ đề
    renderPracticeByTopic();
});

/* Hiển thị danh sách bài tập theo chủ đề */
function renderPracticeByTopic() {
    const container = document.getElementById('topicsContainer');

    // Bước 1: Lấy danh sách topic duy nhất
    const topics = [...new Set(assignments.map(a => a.topic))];
    
    // Bước 2-3: Render card cho mỗi topic
    container.innerHTML = topics.map(topic => {
        // Filter bài tập của topic này
        const topicAssignments = assignments.filter(a => a.topic === topic);

        return `
            <div class="card topic-card">
                <h3>📖 ${topic}</h3>
                <div class="assignments-grid">
                    ${topicAssignments.map(a => `
                        <div class="assignment-item">
                            <h4>${a.title}</h4>
                            <p>${a.questions.length} câu hỏi | ${a.timeLimit || 0} phút</p>
                            <button class="btn-primary" onclick="startPractice(${a.id})">Luyện Tập</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

/* Bắt đầu luyện tập */
function startPractice(id) {
    // Chuyển đến quiz với tham số: ?id=123&practice=true
    window.location.href = `http://localhost:8000/quiz.html?id=${id}&practice=true`;
}