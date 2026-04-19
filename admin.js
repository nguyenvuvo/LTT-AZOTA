
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xác thực - chỉ admin mới vào được
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'http://localhost:8000/index.html';
        return;
    }

    // Hiển thị dữ liệu ban đầu
    renderPendingUsers();    // Học sinh chờ duyệt
    renderAssignments();     // Bài tập để chỉnh thời gian

    /**
     * SỰ KIỆN SUBMIT FORM TẠO GIÁO VIÊN MỚI
     * - Lấy thông tin từ form (username, password, name)
     * - Kiểm tra username không trùng với users[]
     * - Tạo user mới với role='teacher'
     * - Thêm vào users[] và lưu localStorage
     */
    document.getElementById('addTeacherForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('teacherUsername').value;
        const password = document.getElementById('teacherPassword').value;
        const name = document.getElementById('teacherName').value;

        if (username && password && name) {
            const existingUser = users.find(u => u.username === username);
            if (existingUser) {
                alert('Tên đăng nhập đã tồn tại');
                return;
            }

            const newTeacher = {
                id: Date.now(),
                username,
                password,
                name,
                role: 'teacher'
            };
            users.push(newTeacher);
            saveData();
            alert('Đã thêm giáo viên thành công');
            document.getElementById('addTeacherForm').reset();
        }
    });
});

/**
 * HIỂN THỊ DANH SÁCH HỌC SINH CHỜ DUYỆT
 * - Lấy tất cả user trong pendingUsers[]
 * - Render danh sách với nút "Duyệt" và "Từ Chối"
 */
function renderPendingUsers() {
    const list = document.getElementById('pendingUsersList');
    list.innerHTML = pendingUsers.map(u => `
        <li>
            ${u.name} (${u.username})
            <button onclick="approveUser(${u.id})">Duyệt</button>
            <button onclick="rejectUser(${u.id})">Từ Chối</button>
        </li>
    `).join('');
}

/**
 * HIỂN THỊ DANH SÁCH BÀI TẬP ĐỂ QUẢN LÝ THỜI GIAN
 * - Lấy tất cả bài tập trong assignments[]
 * - Hiển thị tiêu đề, chủ đề, thời gian hiện tại
 * - Có input để chỉnh sửa thời gian và nút "Cập Nhật"
 */
function renderAssignments() {
    const list = document.getElementById('adminAssignmentsList');
    list.innerHTML = assignments.map(a => `
        <li>
            <strong>${a.title}</strong> (${a.topic}) - Thời gian: ${a.timeLimit || 0} phút
            <input type="number" id="time-${a.id}" value="${a.timeLimit || 0}" min="0" style="width: 60px;">
            <button onclick="updateTime(${a.id})">Cập Nhật Thời Gian</button>
        </li>
    `).join('');
}

/**
 * DUYỆT HỌC SINH - CHUYỂN TỪ PENDING SANG APPROVED
 * - Tìm user trong pendingUsers[] theo ID
 * - Thay đổi status thành 'approved'
 * - Chuyển từ pendingUsers[] sang users[]
 * - Xóa khỏi pendingUsers[]
 * - Lưu localStorage và refresh danh sách
 * @param {number} id - ID của học sinh cần duyệt
 */
function approveUser(id) {
    const user = pendingUsers.find(u => u.id === id);
    if (user) {
        user.status = 'approved';
        users.push(user);
        pendingUsers = pendingUsers.filter(u => u.id !== id);
        saveData();
        renderPendingUsers();
    }
}

/**
 * TỪ CHỐI HỌC SINH - XÓA KHỎI DANH SÁCH CHỜ DUYỆT
 * - Xóa user khỏi pendingUsers[]
 * - Lưu localStorage và refresh danh sách
 * @param {number} id - ID của học sinh cần từ chối
 */
function rejectUser(id) {
    pendingUsers = pendingUsers.filter(u => u.id !== id);
    saveData();
    renderPendingUsers();
}

/**
 * CẬP NHẬT THỜI GIAN LÀM BÀI CHO BÀI TẬP
 * - Lấy giá trị từ input time-{id}
 * - Tìm bài tập theo ID và cập nhật timeLimit
 * - Lưu localStorage và refresh danh sách
 * @param {number} id - ID của bài tập cần cập nhật thời gian
 */
function updateTime(id) {
    const timeInput = document.getElementById(`time-${id}`);
    const timeLimit = parseInt(timeInput.value) || 0;
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
        assignment.timeLimit = timeLimit;
        saveData();
        renderAssignments();
    }
}