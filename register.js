
document.addEventListener('DOMContentLoaded', () => {
    /**
     * SỰ KIỆN SUBMIT FORM ĐĂNG KÝ
     * Các bước:
     * 1. Lấy thông tin từ form (username, password, name)
     * 2. Kiểm tra form không trống
     * 3. Kiểm tra username không trùng với users[] hoặc pendingUsers[]
     * 4. Tạo user mới với role='student' và status='pending'
     * 5. Thêm vào pendingUsers[]
     * 6. Lưu vào localStorage
     * 7. Hiển thị thông báo chờ duyệt
     */
    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();

        // Lấy thông tin từ form
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value;

        // Validate: form không trống
        if (username && password && name) {
            // Kiểm tra username đã tồn tại trong users[]?
            const existingUser = users.find(u => u.username === username);
            // Kiểm tra username đã tồn tại trong pendingUsers[]?
            const pendingUser = pendingUsers.find(u => u.username === username);

            // Nếu username trùng: hiển thị lỗi
            if (existingUser || pendingUser) {
                document.getElementById('message').textContent = 'Tên đăng nhập đã tồn tại';
                return;
            }

            // Tạo user object mới
            const newUser = {
                id: Date.now(),              // ID duy nhất từ timestamp
                username,                    // Tên đăng nhập (duy nhất)
                password,                    // Mật khẩu (bảo mật: nên hash, nhưng hiện tại lưu plain)
                name,                        // Tên hiển thị của học sinh
                role: 'student',             // Luôn là 'student' khi đăng ký
                status: 'pending'            // Chờ admin duyệt
            };

            // Thêm vào danh sách chờ duyệt
            pendingUsers.push(newUser);
            // Lưu vào localStorage
            saveData();
            // Hiển thị thông báo thành công
            document.getElementById('message').textContent = 'Đăng ký thành công! Chờ admin duyệt.';
            // Reset form
            document.getElementById('registerForm').reset();
        }
    });
});