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
                    <textarea id="question-text-${questionId}" name="question-text" rows="3" required placeholder="문제 내용을 입력하세요"></textarea>
                </div>
                <div class="form-group">
                    <label for="question-image-${questionId}">이미지 첨부 (선택사항)</label>
                    <div class="image-upload-area">
                        <input type="file" id="question-image-${questionId}" name="question-image" accept="image/*" class="file-input">
                        <div class="paste-hint">💡 Ctrl+V를 눌러 캡처한 이미지를 붙여넣을 수 있습니다</div>
                    </div>
                    <div class="image-preview" id="preview-${questionId}"></div>
                </div>
                <div class="form-group options-group">
                    <label>객관식 보기 (정답에 체크하세요)</label>
                    <div class="option-item" data-option-index="0">
                        <input type="radio" name="answer-${questionId}" id="answer-${questionId}-1" value="0" required>
                        <div class="option-content">
                            <input type="text" name="option-text-${questionId}" placeholder="보기 1 (텍스트 또는 Ctrl+V로 이미지)" class="option-text-input">
                            <div class="option-image-preview" data-option-id="${questionId}-0"></div>
                        </div>
                    </div>
                    <div class="option-item" data-option-index="1">
                        <input type="radio" name="answer-${questionId}" id="answer-${questionId}-2" value="1">
                        <div class="option-content">
                            <input type="text" name="option-text-${questionId}" placeholder="보기 2 (텍스트 또는 Ctrl+V로 이미지)" class="option-text-input">
                            <div class="option-image-preview" data-option-id="${questionId}-1"></div>
                        </div>
                    </div>
                    <div class="option-item" data-option-index="2">
                        <input type="radio" name="answer-${questionId}" id="answer-${questionId}-3" value="2">
                        <div class="option-content">
                            <input type="text" name="option-text-${questionId}" placeholder="보기 3 (텍스트 또는 Ctrl+V로 이미지)" class="option-text-input">
                            <div class="option-image-preview" data-option-id="${questionId}-2"></div>
                        </div>
                    </div>
                    <div class="option-item" data-option-index="3">
                        <input type="radio" name="answer-${questionId}" id="answer-${questionId}-4" value="3">
                        <div class="option-content">
                            <input type="text" name="option-text-${questionId}" placeholder="보기 4 (텍스트 또는 Ctrl+V로 이미지)" class="option-text-input">
                            <div class="option-image-preview" data-option-id="${questionId}-3"></div>
                        </div>
                    </div>
                    <div class="option-item" data-option-index="4">
                        <input type="radio" name="answer-${questionId}" id="answer-${questionId}-5" value="4">
                        <div class="option-content">
                            <input type="text" name="option-text-${questionId}" placeholder="보기 5 (텍스트 또는 Ctrl+V로 이미지)" class="option-text-input">
                            <div class="option-image-preview" data-option-id="${questionId}-4"></div>
                        </div>
                    </div>
                </div>
                <button type="button" class="btn-remove-question" data-question-id="${questionId}">문제 삭제</button>
            </fieldset>
        `;
        questionsContainer.appendChild(questionBlock);

        // 이미지 미리보기 기능 추가
        const imageInput = questionBlock.querySelector(`#question-image-${questionId}`);
        const preview = questionBlock.querySelector(`#preview-${questionId}`);
        const imageUploadArea = questionBlock.querySelector('.image-upload-area');

        // 이미지 표시 함수
        function displayImage(imageData) {
            preview.innerHTML = `
                <img src="${imageData}" alt="문제 이미지">
                <button type="button" class="btn-remove-image">이미지 제거</button>
            `;

            // 이미지 제거 버튼
            preview.querySelector('.btn-remove-image').addEventListener('click', () => {
                imageInput.value = '';
                preview.innerHTML = '';
            });
        }

        // 파일 선택 이벤트
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    displayImage(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });

        // 전체 문제 블록에 붙여넣기 이벤트 (클립보드 이미지)
        questionBlock.addEventListener('paste', (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];

                // 이미지 타입인지 확인
                if (item.type.indexOf('image') !== -1) {
                    e.preventDefault(); // 기본 붙여넣기 동작 방지

                    const blob = item.getAsFile();
                    const reader = new FileReader();

                    reader.onload = (event) => {
                        displayImage(event.target.result);
                    };

                    reader.readAsDataURL(blob);
                    break;
                }
            }
        });

        // 드래그 앤 드롭 기능
        imageUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            imageUploadArea.classList.add('dragover');
        });

        imageUploadArea.addEventListener('dragleave', () => {
            imageUploadArea.classList.remove('dragover');
        });

        imageUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            imageUploadArea.classList.remove('dragover');

            const file = e.dataTransfer.files[0];
            if (file && file.type.indexOf('image') !== -1) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    displayImage(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });

        // 보기 이미지 붙여넣기 기능
        const optionItems = questionBlock.querySelectorAll('.option-item');
        optionItems.forEach((optionItem) => {
            const optionPreview = optionItem.querySelector('.option-image-preview');

            // 보기 이미지 표시 함수
            function displayOptionImage(imageData) {
                optionPreview.innerHTML = `
                    <img src="${imageData}" alt="보기 이미지">
                    <button type="button" class="btn-remove-option-image">×</button>
                `;

                // 이미지 제거 버튼
                optionPreview.querySelector('.btn-remove-option-image').addEventListener('click', (e) => {
                    e.stopPropagation();
                    optionPreview.innerHTML = '';
                });
            }

            // 보기 아이템에 붙여넣기 이벤트
            optionItem.addEventListener('paste', (e) => {
                const items = e.clipboardData?.items;
                if (!items) return;

                for (let i = 0; i < items.length; i++) {
                    const item = items[i];

                    if (item.type.indexOf('image') !== -1) {
                        e.preventDefault();

                        const blob = item.getAsFile();
                        const reader = new FileReader();

                        reader.onload = (event) => {
                            displayOptionImage(event.target.result);
                        };

                        reader.readAsDataURL(blob);
                        break;
                    }
                }
            });
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

            // 보기 데이터 수집 (텍스트와 이미지)
            const optionItems = block.querySelectorAll('.option-item');
            const options = [];

            optionItems.forEach((optionItem) => {
                const textInput = optionItem.querySelector('.option-text-input');
                const imagePreview = optionItem.querySelector('.option-image-preview img');

                options.push({
                    text: textInput.value.trim(),
                    image: imagePreview ? imagePreview.src : null
                });
            });

            // 정답 라디오 버튼에서 선택된 값 가져오기
            const selectedAnswer = block.querySelector(`input[name="answer-${questionId}"]:checked`);

            // 문제 이미지 가져오기
            const imagePreview = block.querySelector('.image-preview img');
            const imageData = imagePreview ? imagePreview.src : null;

            // 유효성 검사: 각 보기에 텍스트나 이미지가 있어야 함
            const hasValidOptions = options.every(opt => opt.text || opt.image);

            if (!questionText.trim() || !hasValidOptions) {
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
                options: options, // { text: string, image: string|null }[] 형태
                answer: options[answerIndex], // 선택된 정답 (객체)
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