
/**
 * KHỞI TẠO - KHI TRANG LOAD
 * - Kiểm tra người dùng đã đăng nhập chưa
 * - Nếu chưa: chuyển hướng về trang đăng nhập
 * - Hiển thị bảng xếp hạng cho tất cả bài tập
 */
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xác thực - phải đăng nhập mới xem được
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    // Hiển thị bảng xếp hạng
    renderAssignmentLeaderboards();
});

/**
 * HIỂN THỊ BẢNG XẾP HẠNG CHO TẤT CẢ BÀI TẬP
 *
 * Cách hoạt động:
 * 1. Lặp qua TỪNG bài tập trong assignments[]
 * 2. Với mỗi bài tập:
 *    - Lọc ra submissions của bài tập đó (chỉ bài làm thực, không luyện tập)
 *    - Tạo object leaderboard: { username: [danh sách điểm %] }
 *    - Tính điểm trung bình cho mỗi học sinh
 *    - Sắp xếp theo điểm giảm dần
 *    - Render HTML với rank classes (rank-1, rank-2, rank-3)
 */
function renderAssignmentLeaderboards() {
    const container = document.getElementById('assignmentLeaderboards');

    container.innerHTML = assignments.map(assignment => {
        // Bước 1: Lọc submissions của bài tập này (chỉ bài làm thực)
        const assignmentSubmissions = submissions.filter(
            s => s.assignmentId === assignment.id && !s.isPractice
        );

        // Bước 2: Tạo object leaderboard để nhóm điểm theo học sinh
        const leaderboard = {};

        assignmentSubmissions.forEach(sub => {
            // Tìm thông tin học sinh từ user ID
            const student = users.find(u => u.id === sub.studentId);
            if (student) {
                // Khởi tạo mảng điểm nếu chưa có
                if (!leaderboard[student.username]) {
                    leaderboard[student.username] = [];
                }
                // Thêm điểm % vào mảng (score/total * 100)
                leaderboard[student.username].push(sub.score / sub.total * 100);
            }
        });

        // Bước 3: Tính trung bình và sắp xếp
        const sorted = Object.entries(leaderboard)
            .map(([name, scores]) => [
                name,
                scores.reduce((a, b) => a + b, 0) / scores.length  // Trung bình cộng
            ])
            .sort((a, b) => b[1] - a[1]);  // Sắp xếp giảm dần theo điểm

        // Bước 4: Render HTML cho bài tập này
        return `
            <div class="card leaderboard-card">
                <h3>📋 ${assignment.title} <span class="topic-badge">${assignment.topic}</span></h3>
                <ol class="leaderboard-list">
                    ${sorted.length > 0 ?
                        sorted.map((item, idx) => `
                            <li class="rank-${idx + 1}">  <!-- CSS class: rank-1=vàng, rank-2=bạc, rank-3=đồng -->
                                <span class="rank">#${idx + 1}</span>
                                <span class="name">${item[0]}</span>
                                <span class="score">${item[1].toFixed(1)}%</span>
                            </li>
                        `).join('')
                        : '<li>Chưa có ai làm bài</li>'
                    }
                </ol>
            </div>
        `;
    }).join('');
}