/* QUIZ.JS - Thực hiện bài kiểm tra */

/* Khởi tạo trang */
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xác thực - chỉ học sinh mới vào được
    if (!currentUser || currentUser.role !== 'student') {
        window.location.href = 'index.html';
        return;
    }

    // Lấy tham số từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const assignmentId = parseInt(urlParams.get('id'));
    const isPractice = urlParams.get('practice') === 'true';  // Flag luyện tập

    // Tìm bài tập từ ID
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) {
        alert('Bài tập không tìm thấy');
        window.history.back();
        return;
    }

    // Hiển thị tiêu đề (thêm " (Luyện Tập)" nếu là luyện tập)
    document.getElementById('quizTitle').textContent =
        isPractice ? `${assignment.title} (Luyện Tập)` : assignment.title;

    // Hiển thị file đính kèm nếu có
    if (assignment.fileData) {
        document.getElementById('assignmentFile').innerHTML =
            displayFile(assignment.fileData, assignment.fileName);
    }

    // Render tất cả câu hỏi
    const container = document.getElementById('questionsContainer');
    container.innerHTML = assignment.questions.map((q, i) => `
        <div class="question-block">
            <p>${i + 1}. ${q.q}</p>
            <input type="text" name="answer${i}" required>
        </div>
    `).join('');

    /* Bộ đếm giờ */
    let timeLeft = (assignment.timeLimit || 0) * 60; // Chuyển phút -> giây
    const timerElement = document.getElementById('timer');

    if (timeLeft > 0) {
        // Có giới hạn thời gian
        const timer = setInterval(() => {
            // Tính phút và giây để hiển thị
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;

            // Cập nhật hiển thị (format: MM:SS)
            timerElement.textContent = `Thời gian còn lại: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            // Giảm thời gian còn lại
            timeLeft--;

            // Nếu hết giờ: auto-submit
            if (timeLeft < 0) {
                clearInterval(timer);           // Dừng bộ đếm
                alert('Hết thời gian!');
                // Trigger submit event (sẽ chấm điểm và lưu)
                document.getElementById('quizForm').dispatchEvent(new Event('submit'));
            }
        }, 1000);  // Chạy mỗi 1 giây
    } else {
        // Không có giới hạn thời gian
        timerElement.textContent = 'Không giới hạn thời gian';
    }

    /* Sự kiện submit form */
    document.getElementById('quizForm').addEventListener('submit', (e) => {
        e.preventDefault();

        // Bước 1-2: Thu thập câu trả lời (trim & lowercase)
        const answers = [];
        assignment.questions.forEach((q, i) => {
            const input = document.querySelector(`input[name="answer${i}"]`);
            answers.push(input.value.trim().toLowerCase());
        });

        // Bước 3-4: Chấm điểm (so sánh case-insensitive)
        let score = 0;
        assignment.questions.forEach((q, i) => {
            // So sánh: câu trả lời học sinh vs đáp án (đều lowercase)
            if (answers[i] === q.a.toLowerCase()) {
                score++;
            }
        });

        // Bước 5: Tạo submission object
        const submission = {
            id: Date.now(),                        // ID duy nhất từ timestamp
            studentId: currentUser.id,             // ID của học sinh làm bài
            assignmentId,                          // ID bài tập
            answers,                               // Mảng câu trả lời (lowercase)
            score,                                 // Số câu trả lời đúng
            total: assignment.questions.length,    // Tổng số câu hỏi
            submittedAt: new Date().toISOString(), // Thời gian nộp bài
            isPractice                             // Flag: có phải luyện tập?
        };

        // Bước 6: Thêm vào submissions[] và lưu
        submissions.push(submission);
        saveData();

        // Bước 7: Chuyển sang trang kết quả
        window.location.href = `results.html?id=${submission.id}`;
    });
});