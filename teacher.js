/* TEACHER.JS - Quản lý bài tập của giáo viên */

/* Khởi tạo trang */
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xác thực - chỉ giáo viên mới vào được
    if (!currentUser || currentUser.role !== 'teacher') {
        window.location.href = 'http://localhost:8000/index.html';
        return;
    }

    // Hiển thị bài tập từ lần trước
    renderAssignments();

    // Xử lý sự kiện khi chọn file
    const fileInput = document.getElementById('file');
    const preview = document.getElementById('filePreview');

    /* Sự kiện chọn file */
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Chuyển file thành Base64 string
                const dataURL = await readFileAsDataURL(file);
                // Hiển thị preview (ảnh hoặc PDF embed)
                preview.innerHTML = displayFile(dataURL, file.name);
            } catch (error) {
                alert('Lỗi khi đọc file');
            }
        } else {
            preview.innerHTML = '';
        }
    });

    /* Sự kiện submit form tạo bài tập */
    document.getElementById('assignmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Lấy thông tin từ form
        const title = document.getElementById('title').value;
        const topic = document.getElementById('topic').value;
        const timeLimit = parseInt(document.getElementById('timeLimit').value) || 0;
        const fileInput = document.getElementById('file');
        const file = fileInput.files[0];

        // Chuyển file thành Base64 nếu có
        let fileData = null;
        let fileName = null;
        if (file) {
            fileData = await readFileAsDataURL(file);
            fileName = file.name;
        }

        // Thu thập tất cả câu hỏi (select all .question elements)
        const questions = [];
        document.querySelectorAll('.question').forEach(q => {
            const qText = q.querySelector('.q-text').value;
            const qAnswer = q.querySelector('.q-answer').value;
            if (qText && qAnswer) {
                questions.push({ q: qText, a: qAnswer });  // Lưu thành {q: câu hỏi, a: đáp án}
            }
        });

        // Validate: kiểm tra form đầy đủ
        if (title && topic && questions.length > 0) {
            // Tạo object bài tập
            const newAssignment = {
                id: Date.now(),              // ID duy nhất từ timestamp
                title,                       // Tên bài tập
                topic,                       // Chủ đề (Toán, Lý, v.v...)
                timeLimit,                   // Thời gian làm bài (phút)
                fileData,                    // Base64 string của file
                fileName,                    // Tên file gốc
                questions,                   // Mảng {q, a}
                createdBy: currentUser.id    // ID giáo viên tạo
            };

            // Thêm vào danh sách assignments toàn cụ
            assignments.push(newAssignment);
            // Lưu vào localStorage
            saveData();
            // Refresh danh sách trên giao diện
            renderAssignments();
            // Reset form về trạng thái ban đầu
            document.getElementById('assignmentForm').reset();
            preview.innerHTML = '';
            document.getElementById('questions').innerHTML = `
                <div class="question">
                    <label>Câu hỏi 1:</label>
                    <input type="text" class="q-text" required>
                    <label>Đáp án:</label>
                    <input type="text" class="q-answer" required>
                    <button type="button" onclick="removeQuestion(this)">Xóa</button>
                </div>
            `;
            alert('Bài tập đã được xuất bản thành công!');
        } else {
            alert('Vui lòng điền đầy đủ thông tin và ít nhất 1 câu hỏi');
        }
    });
});

/* Quản lý câu hỏi */

/* Thêm câu hỏi mới */
function addQuestion() {
    const questionsDiv = document.getElementById('questions');
    // Đếm số câu hỏi hiện tại (số div.question)
    const questionCount = questionsDiv.children.length + 1;

    // Tạo element mới
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';
    questionDiv.innerHTML = `
        <label>Câu hỏi ${questionCount}:</label>
        <input type="text" class="q-text" required>
        <label>Đáp án:</label>
        <input type="text" class="q-answer" required>
        <button type="button" onclick="removeQuestion(this)">Xóa</button>
    `;

    // Thêm vào container
    questionsDiv.appendChild(questionDiv);
}

/* Xóa câu hỏi */
function removeQuestion(button) {
    // Xóa parent element (div.question)
    button.parentElement.remove();
}

/* Hiển thị danh sách bài tập */
function renderAssignments() {
    const list = document.getElementById('assignmentList');

    // Filter: chỉ lấy bài tập của giáo viên hiện tại
    const myAssignments = assignments.filter(a => a.createdBy === currentUser.id);

    // Render HTML
    list.innerHTML = myAssignments.map(a => `
        <li>
            <strong>${a.title}</strong> (${a.topic}) - ${a.questions.length} câu hỏi
            <button onclick="deleteAssignment(${a.id})">Xóa</button>
        </li>
    `).join('');
}

/* Xóa bài tập */
function deleteAssignment(id) {
    // Xóa từ assignments[]
    assignments = assignments.filter(a => a.id !== id);
    // Xóa tất cả submission của bài tập này
    submissions = submissions.filter(s => s.assignmentId !== id);
    // Cập nhật localStorage
    saveData();
    // Refresh danh sách
    renderAssignments();
}