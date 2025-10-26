document.addEventListener('DOMContentLoaded', () => {
    // 관리자 권한 확인
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser || currentUser.email !== 'admin') {
        alert('접근 권한이 없습니다.');
        window.location.href = 'index.html';
        return;
    }

    const quizForm = document.getElementById('create-quiz-form');
    const questionsContainer = document.getElementById('questions-container');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const questionTemplate = document.getElementById('question-template');

    let questionCounter = 0;

    // 문제 입력 필드를 동적으로 추가하는 함수
    const addQuestion = () => {
        questionCounter++;
        const questionId = `q${questionCounter}`;

        const questionBlock = document.createElement('div');
        questionBlock.className = 'question-block';
        questionBlock.dataset.questionId = questionId;
        questionBlock.innerHTML = `
            <fieldset>
                <legend>문제 ${questionCounter}</legend>
                <div class="form-group">
                    <label for="question-text-${questionId}">문제 내용</label>
                    <textarea id="question-text-${questionId}" name="question-text" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label for="question-image-${questionId}">이미지 첨부 (선택사항)</label>
                    <input type="file" id="question-image-${questionId}" name="question-image" accept="image/*" class="file-input">
                    <div class="image-preview" id="preview-${questionId}"></div>
                </div>
                <div class="form-group options-group">
                    <label>객관식 보기 (정답에 체크하세요)</label>
                    <div class="option-item">
                        <input type="radio" name="answer-${questionId}" id="answer-${questionId}-1" value="0" required>
                        <input type="text" name="option-${questionId}" placeholder="보기 1" required>
                    </div>
                    <div class="option-item">
                        <input type="radio" name="answer-${questionId}" id="answer-${questionId}-2" value="1">
                        <input type="text" name="option-${questionId}" placeholder="보기 2" required>
                    </div>
                    <div class="option-item">
                        <input type="radio" name="answer-${questionId}" id="answer-${questionId}-3" value="2">
                        <input type="text" name="option-${questionId}" placeholder="보기 3" required>
                    </div>
                    <div class="option-item">
                        <input type="radio" name="answer-${questionId}" id="answer-${questionId}-4" value="3">
                        <input type="text" name="option-${questionId}" placeholder="보기 4" required>
                    </div>
                    <div class="option-item">
                        <input type="radio" name="answer-${questionId}" id="answer-${questionId}-5" value="4">
                        <input type="text" name="option-${questionId}" placeholder="보기 5" required>
                    </div>
                </div>
                <button type="button" class="btn-remove-question" data-question-id="${questionId}">문제 삭제</button>
            </fieldset>
        `;
        questionsContainer.appendChild(questionBlock);

        // 이미지 미리보기 기능 추가
        const imageInput = questionBlock.querySelector(`#question-image-${questionId}`);
        const preview = questionBlock.querySelector(`#preview-${questionId}`);

        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    preview.innerHTML = `
                        <img src="${event.target.result}" alt="문제 이미지">
                        <button type="button" class="btn-remove-image">이미지 제거</button>
                    `;

                    // 이미지 제거 버튼
                    preview.querySelector('.btn-remove-image').addEventListener('click', () => {
                        imageInput.value = '';
                        preview.innerHTML = '';
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    };

    // '문제 추가' 버튼 클릭 이벤트
    addQuestionBtn.addEventListener('click', addQuestion);

    // '문제 삭제' 버튼 이벤트 위임
    questionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove-question')) {
            const questionId = e.target.dataset.questionId;
            const questionBlock = document.querySelector(`[data-question-id="${questionId}"]`);
            if (questionBlock && confirm('이 문제를 삭제하시겠습니까?')) {
                questionBlock.remove();
                // 문제 번호 재정렬
                updateQuestionNumbers();
            }
        }
    });

    // 문제 번호 재정렬 함수
    function updateQuestionNumbers() {
        const questionBlocks = document.querySelectorAll('.question-block');
        questionBlocks.forEach((block, index) => {
            const legend = block.querySelector('legend');
            if (legend) {
                legend.textContent = `문제 ${index + 1}`;
            }
        });
    }

    // 폼 제출 이벤트
    quizForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const quizTitle = document.getElementById('quiz-title').value;
        if (!quizTitle.trim()) {
            alert('문항 제목을 입력해주세요.');
            return;
        }

        const questionBlocks = document.querySelectorAll('.question-block');
        if (questionBlocks.length === 0) {
            alert('하나 이상의 문제를 추가해주세요.');
            return;
        }

        const questions = [];
        let isValid = true;

        questionBlocks.forEach((block, index) => {
            const questionId = block.dataset.questionId;
            const questionText = block.querySelector('textarea[name="question-text"]').value;
            const optionInputs = block.querySelectorAll('.option-item input[type="text"]');
            const options = Array.from(optionInputs).map(input => input.value);

            // 정답 라디오 버튼에서 선택된 값 가져오기
            const selectedAnswer = block.querySelector(`input[name="answer-${questionId}"]:checked`);

            // 이미지 가져오기
            const imagePreview = block.querySelector('.image-preview img');
            const imageData = imagePreview ? imagePreview.src : null;

            if (!questionText.trim() || options.some(opt => !opt.trim())) {
                isValid = false;
            }

            if (!selectedAnswer) {
                alert(`문제 ${index + 1}의 정답을 선택해주세요.`);
                isValid = false;
                return;
            }

            const answerIndex = parseInt(selectedAnswer.value);

            questions.push({
                id: index + 1,
                text: questionText,
                image: imageData, // Base64 이미지 데이터
                options: options,
                answer: options[answerIndex], // 선택된 정답
                answerIndex: answerIndex // 정답의 인덱스
            });
        });

        if (!isValid) {
            alert('모든 문제 내용과 보기를 입력하고 정답을 선택해주세요.');
            return;
        }

        const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
        const newQuiz = {
            id: quizzes.length + 1,
            title: quizTitle,
            questions: questions,
            createdAt: new Date().toISOString()
        };

        quizzes.push(newQuiz);
        localStorage.setItem('quizzes', JSON.stringify(quizzes));

        alert('문항지가 성공적으로 저장되었습니다.');
        // 관리자 페이지로 이동
        window.location.href = 'admin.html';
    });

    // 페이지 로드 시 첫 번째 문제 필드 추가
    addQuestion();
});