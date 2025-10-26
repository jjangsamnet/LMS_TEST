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
        questionBlock.innerHTML = `
            <fieldset>
                <legend>문제 ${questionCounter}</legend>
                <div class="form-group">
                    <label for="question-text-${questionId}">문제 내용</label>
                    <input type="text" id="question-text-${questionId}" name="question-text" required>
                </div>
                <div class="form-group options-group">
                    <label>객관식 보기 (첫 번째 보기가 정답)</label>
                    <input type="text" name="option-${questionId}" placeholder="정답 보기" required>
                    <input type="text" name="option-${questionId}" placeholder="오답 보기 1" required>
                    <input type="text" name="option-${questionId}" placeholder="오답 보기 2" required>
                    <input type="text" name="option-${questionId}" placeholder="오답 보기 3" required>
                </div>
            </fieldset>
        `;
        questionsContainer.appendChild(questionBlock);
    };

    // '문제 추가' 버튼 클릭 이벤트
    addQuestionBtn.addEventListener('click', addQuestion);

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
            const questionText = block.querySelector('input[name="question-text"]').value;
            const optionInputs = block.querySelectorAll('input[name^="option-"]');
            const options = Array.from(optionInputs).map(input => input.value);

            if (!questionText.trim() || options.some(opt => !opt.trim())) {
                isValid = false;
            }

            questions.push({
                id: index + 1,
                text: questionText,
                options: options,
                answer: options[0] // 첫 번째 옵션을 정답으로 가정
            });
        });

        if (!isValid) {
            alert('모든 문제 내용과 보기를 입력해주세요.');
            return;
        }

        const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
        const newQuiz = {
            id: quizzes.length + 1,
            title: quizTitle,
            questions: questions
        };

        quizzes.push(newQuiz);
        localStorage.setItem('quizzes', JSON.stringify(quizzes));

        alert('문항이 성공적으로 저장되었습니다.');
        quizForm.reset();
        questionsContainer.innerHTML = '';
        questionCounter = 0;
        addQuestion(); // 새 문항 작성을 위해 첫 번째 문제 필드 추가
    });

    // 페이지 로드 시 첫 번째 문제 필드 추가
    addQuestion();
});