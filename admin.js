document.addEventListener('DOMContentLoaded', () => {
    const quizTableBody = document.getElementById('quiz-table-body');
    const userTableBody = document.getElementById('user-table-body');
    const quizSelect = document.getElementById('quiz-select');
    const submissionResultsContainer = document.getElementById('submission-results-container');
    const answerModal = document.getElementById('answer-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.querySelector('.modal .close');

    // 현재 로그인한 사용자가 관리자인지 확인 (실제 운영 환경에서는 서버 측에서 권한을 확인해야 합니다)
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser || currentUser.email !== 'admin') {
        alert('접근 권한이 없습니다.');
        window.location.href = 'index.html';
        return;
    }

    // 문항지 목록을 렌더링하는 함수
    function renderQuizzes() {
        const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
        quizTableBody.innerHTML = ''; // 기존 목록 초기화

        if (quizzes.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 4;
            td.textContent = '등록된 문항지가 없습니다.';
            td.style.textAlign = 'center';
            tr.appendChild(td);
            quizTableBody.appendChild(tr);
            return;
        }

        quizzes.forEach((quiz, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><strong>${quiz.title}</strong></td>
                <td>${quiz.questions.length}개</td>
                <td>
                    <button class="btn-delete-quiz" data-quiz-id="${quiz.id}">삭제</button>
                </td>
            `;
            quizTableBody.appendChild(tr);
        });
    }

    // 사용자 목록을 렌더링하는 함수
    function renderUsers() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        userTableBody.innerHTML = ''; // 기존 목록 초기화

        // 관리자 계정은 목록에서 제외
        const normalUsers = users.filter(user => user.email !== 'admin');

        if (normalUsers.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 3;
            td.textContent = '가입된 회원이 없습니다.';
            td.style.textAlign = 'center';
            tr.appendChild(td);
            userTableBody.appendChild(tr);
            return;
        }

        normalUsers.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <button class="btn-reset-pw" data-email="${user.email}">비밀번호 초기화</button>
                    <button class="btn-delete" data-email="${user.email}">회원 삭제</button>
                </td>
            `;
            userTableBody.appendChild(tr);
        });
    }

    // 문항지 테이블 이벤트 위임 - 문항지 삭제
    quizTableBody.addEventListener('click', (e) => {
        const target = e.target;

        if (target.classList.contains('btn-delete-quiz')) {
            const quizId = parseInt(target.dataset.quizId);
            let quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
            const quiz = quizzes.find(q => q.id === quizId);

            if (quiz && confirm(`"${quiz.title}" 문항지를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
                const updatedQuizzes = quizzes.filter(q => q.id !== quizId);
                localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
                alert('문항지가 삭제되었습니다.');
                renderQuizzes(); // 목록 새로고침
            }
        }
    });

    // 사용자 테이블 이벤트 위임 - 비밀번호 초기화 및 회원 삭제
    userTableBody.addEventListener('click', (e) => {
        const target = e.target;
        const userEmail = target.dataset.email;

        if (!userEmail) return;

        let users = JSON.parse(localStorage.getItem('users')) || [];

        // 비밀번호 초기화
        if (target.classList.contains('btn-reset-pw')) {
            if (confirm(`'${userEmail}' 회원의 비밀번호를 '1234'로 초기화하시겠습니까?`)) {
                const userIndex = users.findIndex(user => user.email === userEmail);
                if (userIndex > -1) {
                    users[userIndex].password = '1234'; // 간단한 초기화 비밀번호
                    localStorage.setItem('users', JSON.stringify(users));
                    alert('비밀번호가 초기화되었습니다.');
                }
            }
        }

        // 회원 삭제
        if (target.classList.contains('btn-delete')) {
            if (confirm(`'${userEmail}' 회원을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
                const updatedUsers = users.filter(user => user.email !== userEmail);
                localStorage.setItem('users', JSON.stringify(updatedUsers));
                alert('회원이 삭제되었습니다.');
                renderUsers(); // 목록 새로고침
            }
        }
    });

    // 문항지 선택 드롭다운 초기화
    function initQuizSelect() {
        const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
        quizSelect.innerHTML = '<option value="">문항지를 선택하세요</option>';

        quizzes.forEach(quiz => {
            const option = document.createElement('option');
            option.value = quiz.id;
            option.textContent = quiz.title;
            quizSelect.appendChild(option);
        });
    }

    // 선택한 문항지의 제출 결과 렌더링
    function renderSubmissionResults(quizId) {
        const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
        const quizSubmissions = submissions.filter(s => s.quizId === parseInt(quizId));

        submissionResultsContainer.innerHTML = '';

        if (quizSubmissions.length === 0) {
            submissionResultsContainer.innerHTML = '<p class="no-data">제출된 결과가 없습니다.</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'submission-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>번호</th>
                    <th>제출자</th>
                    <th>이메일</th>
                    <th>제출 시간</th>
                    <th>상세보기</th>
                </tr>
            </thead>
            <tbody id="submission-table-body"></tbody>
        `;
        submissionResultsContainer.appendChild(table);

        const tbody = table.querySelector('#submission-table-body');

        quizSubmissions.forEach((submission, index) => {
            const tr = document.createElement('tr');
            const submittedDate = new Date(submission.submittedAt);

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${submission.userName}</td>
                <td>${submission.userId}</td>
                <td>${submittedDate.toLocaleString('ko-KR')}</td>
                <td>
                    <button class="btn-view-answers" data-submission-index="${index}">답안 보기</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // 답안 보기 버튼 이벤트 리스너
        tbody.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-view-answers')) {
                const submissionIndex = parseInt(e.target.dataset.submissionIndex);
                showAnswerDetails(quizSubmissions[submissionIndex]);
            }
        });
    }

    // 답안 상세 모달 표시
    function showAnswerDetails(submission) {
        const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
        const quiz = quizzes.find(q => q.id === submission.quizId);

        if (!quiz) {
            alert('해당 문항지를 찾을 수 없습니다.');
            return;
        }

        modalTitle.textContent = `${submission.userName}님의 답안 - ${submission.quizTitle}`;

        let html = '<div class="answer-details">';

        quiz.questions.forEach((question, qIndex) => {
            const userAnswer = submission.answers[qIndex];

            html += `
                <div class="answer-item">
                    <div class="question-header">
                        <h3>문제 ${qIndex + 1}</h3>
                    </div>
                    <div class="question-content">
                        ${question.text ? `<p class="question-text">${question.text}</p>` : ''}
                        ${question.image ? `<img src="${question.image}" alt="문제 이미지" class="question-image">` : ''}
                    </div>
                    <div class="options-list">
                        <h4>보기:</h4>
                        <ul>
                            ${question.options.map((option, optIndex) => {
                                const isUserAnswer = userAnswer === optIndex;
                                const isCorrect = question.correctAnswer === optIndex;
                                let className = 'option-item';
                                if (isUserAnswer) className += ' user-answer';
                                if (isCorrect) className += ' correct-answer';

                                return `
                                    <li class="${className}">
                                        <span class="option-number">${optIndex + 1}.</span>
                                        <div class="option-content">
                                            ${option.text ? `<span class="option-text">${option.text}</span>` : ''}
                                            ${option.image ? `<img src="${option.image}" alt="보기 이미지" class="option-image">` : ''}
                                        </div>
                                        ${isUserAnswer ? '<span class="badge badge-user">학습자 선택</span>' : ''}
                                        ${isCorrect ? '<span class="badge badge-correct">정답</span>' : ''}
                                    </li>
                                `;
                            }).join('')}
                        </ul>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        modalBody.innerHTML = html;
        answerModal.style.display = 'block';
    }

    // 문항지 선택 이벤트
    quizSelect.addEventListener('change', (e) => {
        const quizId = e.target.value;
        if (quizId) {
            renderSubmissionResults(quizId);
        } else {
            submissionResultsContainer.innerHTML = '';
        }
    });

    // 모달 닫기 이벤트
    closeModal.addEventListener('click', () => {
        answerModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === answerModal) {
            answerModal.style.display = 'none';
        }
    });

    // 페이지 로드 시 목록 렌더링
    renderQuizzes(); // 문항지 목록 렌더링
    renderUsers(); // 사용자 목록 렌더링
    initQuizSelect(); // 문항지 선택 드롭다운 초기화
});