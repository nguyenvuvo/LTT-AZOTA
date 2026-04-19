
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xác thực - chỉ học sinh mới xem được kết quả của mình
    if (!currentUser || currentUser.role !== 'student') {
        window.location.href = 'http://localhost:8000/index.html';
        return;
    }

    // Lấy ID submission từ URL (ví dụ: results.html?id=123)
    const urlParams = new URLSearchParams(window.location.search);
    const submissionId = parseInt(urlParams.get('id'));

    // Tìm submission của học sinh hiện tại (bảo mật: không xem kết quả của người khác)
    const submission = submissions.find(s => s.id === submissionId && s.studentId === currentUser.id);
    if (!submission) {
        alert('Result not found');
        window.location.href = 'http://localhost:8000/student.html';
        return;
    }

    // Tìm thông tin bài tập để hiển thị
    const assignment = assignments.find(a => a.id === submission.assignmentId);

    // Chuẩn bị HTML hiển thị kết quả
    const content = document.getElementById('resultsContent');
    let html = `<h3>${assignment.title}${submission.isPractice ? ' (Luyện Tập)' : ''}</h3><p>Điểm: ${submission.score}/${submission.total}</p><ul>`;

    // Duyệt qua từng câu hỏi để so sánh đáp án
    assignment.questions.forEach((q, i) => {
        // Lấy câu trả lời của học sinh (đã được normalize thành lowercase)
        const userAns = submission.answers[i];
        // So sánh với đáp án đúng (case-insensitive)
        const correct = userAns === q.a.toLowerCase();

        // Tạo HTML với màu sắc: xanh cho đúng, đỏ cho sai
        html += `<li style="color: ${correct ? 'green' : 'red'}">${i + 1}. ${q.q}<br>Câu trả lời của bạn: ${userAns}<br>Đáp án đúng: ${q.a}</li>`;
    });

    html += '</ul>';
    // Hiển thị kết quả lên trang
    content.innerHTML = html;
});