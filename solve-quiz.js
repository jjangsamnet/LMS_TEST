document.addEventListener('DOMContentLoaded', () => {
    // URL에서 퀴즈 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = parseInt(urlParams.get('id'));

    // 로그인 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = JSON.parse(localStorage.getItem('user'));

    if (!isLoggedIn || !currentUser) {
        alert('로그인이 필요합니다.');
        window.location.href = 'index.html';
        return;
    }

    // 퀴즈 데이터 로드
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const quiz = quizzes.find(q => q.id === quizId);

    if (!quiz) {
        alert('문항지를 찾을 수 없습니다.');
        window.location.href = 'index.html';
        return;
    }

    // 요소 참조
    const quizTitleElement = document.getElementById('quiz-title');
    const questionContainer = document.getElementById('question-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const resultContainer = document.getElementById('result-container');

    // 상태 변수
    let currentQuestionIndex = 0;
    let userAnswers = new Array(quiz.questions.length).fill(null);

    // 퀴즈 제목 설정
    quizTitleElement.textContent = quiz.title;

    // 문제 렌더링 함수
    function renderQuestion() {
        const question = quiz.questions[currentQuestionIndex];

        let questionHTML = `
            <div class="question-card">
                <div class="question-header">
                    <h2>문제 ${currentQuestionIndex + 1}</h2>
                </div>
                <div class="question-body">
        `;

        // 문제 텍스트
        if (question.text) {
            questionHTML += `<p class="question-text">${question.text}</p>`;
        }

        // 문제 이미지
        if (question.image) {
            questionHTML += `<div class="question-image">
                <img src="${question.image}" alt="문제 이미지">
            </div>`;
        }

        // 보기들
        questionHTML += `<div class="options-list">`;

        question.options.forEach((option, index) => {
            const isChecked = userAnswers[currentQuestionIndex] === index;
            const optionId = `option-${currentQuestionIndex}-${index}`;

            questionHTML += `
                <div class="option-card ${isChecked ? 'selected' : ''}" data-option-index="${index}">
                    <input type="radio"
                           name="answer"
                           id="${optionId}"
                           value="${index}"
                           ${isChecked ? 'checked' : ''}>
                    <label for="${optionId}">
                        <span class="option-number">${index + 1}</span>
                        <div class="option-content-wrapper">
            `;

            // 보기 텍스트
            if (option.text) {
                questionHTML += `<span class="option-text">${option.text}</span>`;
            }

            // 보기 이미지
            if (option.image) {
                questionHTML += `<div class="option-image">
                    <img src="${option.image}" alt="보기 ${index + 1} 이미지">
                </div>`;
            }

            questionHTML += `
                        </div>
                    </label>
                </div>
            `;
        });

        questionHTML += `</div></div></div>`;

        questionContainer.innerHTML = questionHTML;

        // 보기 클릭 이벤트
        const optionCards = questionContainer.querySelectorAll('.option-card');
        optionCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                // 모든 카드에서 selected 클래스 제거
                optionCards.forEach(c => c.classList.remove('selected'));
                // 클릭된 카드에 selected 클래스 추가
                card.classList.add('selected');

                // 라디오 버튼 체크
                const radio = card.querySelector('input[type="radio"]');
                radio.checked = true;

                // 답안 저장
                userAnswers[currentQuestionIndex] = index;
            });
        });

        // 진행 상황 업데이트
        updateProgress();
    }

    // 진행 상황 업데이트
    function updateProgress() {
        const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${currentQuestionIndex + 1} / ${quiz.questions.length}`;

        // 버튼 상태 업데이트
        prevBtn.disabled = currentQuestionIndex === 0;

        if (currentQuestionIndex === quiz.questions.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }
    }

    // 이전 문제
    prevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion();
        }
    });

    // 다음 문제
    nextBtn.addEventListener('click', () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        }
    });

    // 제출하기
    submitBtn.addEventListener('click', () => {
        // 답하지 않은 문제 확인
        const unanswered = userAnswers.findIndex(answer => answer === null);

        if (unanswered !== -1) {
            if (!confirm(`${unanswered + 1}번 문제에 답하지 않았습니다. 제출하시겠습니까?`)) {
                return;
            }
        }

        if (!confirm('정말 제출하시겠습니까?')) {
            return;
        }

        // 채점
        showResult();
    });

    // 결과 표시 (제출 완료 메시지)
    function showResult() {
        // 답안을 localStorage에 저장 (선택사항)
        const submission = {
            quizId: quiz.id,
            quizTitle: quiz.title,
            userId: currentUser.email,
            userName: currentUser.name,
            answers: userAnswers,
            submittedAt: new Date().toISOString()
        };

        // 제출 기록 저장
        const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
        submissions.push(submission);
        localStorage.setItem('submissions', JSON.stringify(submissions));

        let resultHTML = `
            <div class="result-card submit-success">
                <div class="success-icon">✓</div>
                <h2>문항 제출이 되었습니다</h2>
                <p class="success-message">수고하셨습니다.</p>

                <div class="submit-info">
                    <p><strong>문항지:</strong> ${quiz.title}</p>
                    <p><strong>제출자:</strong> ${currentUser.name}</p>
                    <p><strong>제출 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
                </div>

                <div class="result-actions">
                    <a href="index.html" class="btn btn-primary">메인으로 돌아가기</a>
                </div>
            </div>
        `;

        resultContainer.innerHTML = resultHTML;
        resultContainer.style.display = 'block';
        document.querySelector('.quiz-solve-container').style.display = 'none';
    }

    // 초기 문제 렌더링
    renderQuestion();
});
