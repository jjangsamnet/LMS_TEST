document.addEventListener('DOMContentLoaded', () => {
    // 모달 관련 요소
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');

    // 폼, 입력, 네비게이션 요소
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const signupName = document.getElementById('signup-name');
    const signupPassword = document.getElementById('signup-password');
    const loginEmailInput = document.getElementById('email'); // 로그인 이메일 입력 필드
    const signupNameInput = document.getElementById('signup-name'); // 회원가입 이름 입력 필드
    const confirmPassword = document.getElementById('confirm-password');
    const headerNav = document.getElementById('header-nav');
    const quizGrid = document.getElementById('quiz-grid');

    // 포커스 관리를 위한 변수
    let lastFocusedElement;

    // 로그인 상태 변수
    // 페이지 로드 시 localStorage에서 로그인 상태를 불러옴
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    let currentUser = JSON.parse(localStorage.getItem('user'));

    // 관리자 계정 초기화 함수
    function initializeAdmin() {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        // 'admin' 계정이 없는 경우에만 생성
        if (!users.some(user => user.email === 'admin')) {
            const adminUser = {
                name: '관리자',
                email: 'admin',
                password: 'admin' // 실제 운영 환경에서는 보안을 위해 더 복잡한 비밀번호를 사용해야 합니다.
            };
            users.push(adminUser);
            localStorage.setItem('users', JSON.stringify(users));
            console.log('기본 관리자 계정이 생성되었습니다. (ID: admin, PW: admin)');
        }
    }


    // 문항지 목록 렌더링 함수
    function renderQuizzes() {
        quizGrid.innerHTML = ''; // 기존 목록 초기화
        const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];

        if (quizzes.length === 0) {
            quizGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <div class="empty-state-text">아직 등록된 문항지가 없습니다.</div>
                </div>
            `;
            return;
        }

        quizzes.forEach(quiz => {
            const card = document.createElement('div');
            card.className = 'quiz-card';

            const solveButton = isLoggedIn
                ? `<button class="solve-btn" data-quiz-id="${quiz.id}">문항 풀기</button>`
                : '';

            // 이미지가 있는 문제 확인
            const hasImages = quiz.questions.some(q => q.image);
            const imageIcon = hasImages ? '<span class="icon">🖼️</span>' : '';

            card.innerHTML = `
                <div class="quiz-card-header">
                    <h3 class="quiz-card-title">${quiz.title}</h3>
                    <div class="quiz-card-meta">
                        <span class="badge">${quiz.questions.length}문제</span>
                        ${imageIcon}
                    </div>
                </div>
                <div class="quiz-card-body">
                    ${quiz.questions.slice(0, 2).map((q, idx) => {
                        const text = q.text.substring(0, 60);
                        return `<div class="question-preview">
                            ${idx + 1}. ${text}${q.text.length > 60 ? '...' : ''}
                            ${q.image ? '<span class="has-image-indicator">📷</span>' : ''}
                        </div>`;
                    }).join('')}
                    ${quiz.questions.length > 2 ? '<div class="more-questions">...</div>' : ''}
                </div>
                <div class="quiz-card-footer">
                    ${solveButton}
                </div>
            `;

            quizGrid.appendChild(card);
        });

        // '풀기' 버튼 이벤트 리스너 추가
        if (isLoggedIn) {
            document.querySelectorAll('.solve-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const quizId = btn.dataset.quizId;
                    window.location.href = `solve-quiz.html?id=${quizId}`;
                });
            });
        }
    }

    // 헤더 UI 업데이트 함수
    function updateHeader() {
        if (isLoggedIn) {
            // 로그인 상태일 때 (사용자 이름으로 환영 메시지 표시)
            headerNav.innerHTML = `
                <span>${currentUser.name}님 환영합니다!</span>
                <a href="#" id="logout-btn">로그아웃</a>
            `;
        } else {
            // 로그아웃 상태일 때
            headerNav.innerHTML = `
                <button id="login-btn" class="btn" type="button">로그인</button>
				<button id="signup-btn" class="btn" type="button">회원가입</button>
            `;
        }
    }

    // 모달 열기 함수
    function openLoginModal(e) {
        if(e) e.preventDefault();
        lastFocusedElement = document.activeElement; // 현재 포커스된 요소 저장
        loginModal.style.display = 'flex';
        loginModal.setAttribute('aria-hidden', 'false');
        loginEmailInput.focus(); // 모달이 열리면 이메일 필드에 포커스
    }

    function openSignupModal(e) {
        if(e) e.preventDefault();
        lastFocusedElement = document.activeElement; // 현재 포커스된 요소 저장
        signupModal.style.display = 'flex';
        signupModal.setAttribute('aria-hidden', 'false');
        signupNameInput.focus(); // 모달이 열리면 이름 필드에 포커스
    }

    // 모달 닫기 함수
    function closeModal() {
        loginModal.style.display = 'none';
        loginModal.setAttribute('aria-hidden', 'true');
        signupModal.style.display = 'none';
        signupModal.setAttribute('aria-hidden', 'true');

        if (lastFocusedElement) {
            lastFocusedElement.focus(); // 모달을 열었던 요소로 포커스 복원
        }
    }

    // 로그아웃 처리 함수
    function handleLogout(e) {
        e.preventDefault();
        isLoggedIn = false;
        currentUser = null;
        localStorage.removeItem('isLoggedIn'); // localStorage에서 로그인 상태 제거
        localStorage.removeItem('user'); // localStorage에서 사용자 정보 제거
        alert('로그아웃 되었습니다.');
        updateHeader();
        renderQuizzes(); // 로그아웃 시 문항지 목록 다시 렌더링
    }

    // 로그인 폼 제출 시
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const email = loginForm.email.value;
        const password = loginForm.password.value;

        const foundUser = users.find(user => user.email === email && user.password === password);

        if (!foundUser) {
            alert('이메일 또는 비밀번호가 일치하지 않습니다.');
            return;
        }

        isLoggedIn = true;
        currentUser = foundUser;

        localStorage.setItem('isLoggedIn', 'true'); // localStorage에 로그인 상태 저장
        localStorage.setItem('user', JSON.stringify(currentUser)); // localStorage에 사용자 정보 저장
        
        // 관리자 계정인지 확인
        if (currentUser.email === 'admin') {
            alert('관리자님, 환영합니다. 회원 관리 페이지로 이동합니다.');
            window.location.href = 'admin.html'; // 관리자 페이지로 리디렉션
        } else {
            alert('로그인 성공!');
            closeModal();
            updateHeader();
            renderQuizzes(); // 로그인 시 문항지 목록 다시 렌더링
        }
    });

    // 헤더 네비게이션에 이벤트 위임 적용
    headerNav.addEventListener('click', (e) => {
        const targetId = e.target.id;
        if (targetId === 'login-btn') {
            openLoginModal(e);
        } else if (targetId === 'signup-btn') {
            openSignupModal(e);
        } else if (targetId === 'logout-btn') {
            handleLogout(e);
        }
    });

    // data-close 속성을 가진 모든 요소(x 버튼, 백드롭)에 닫기 이벤트 추가
    document.querySelectorAll('[data-close]').forEach(element => {
        element.addEventListener('click', closeModal);
    });

    // 초기 화면 렌더링
    initializeAdmin(); // 관리자 계정 확인 및 생성
    updateHeader();
    renderQuizzes(); // 문항지 목록 렌더링

    // 회원가입 폼 제출 시 비밀번호 일치 검사
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault(); // 폼의 기본 제출 동작을 막음

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const newUser = {
            name: signupName.value,
            email: signupForm.email.value,
            password: signupPassword.value
        };

        if (signupPassword.value !== confirmPassword.value) {
            alert('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
            confirmPassword.focus(); // 비밀번호 확인 필드에 포커스
            return; // 함수 종료
        }

        if (users.some(user => user.email === newUser.email)) {
            alert('이미 사용 중인 이메일입니다.');
            return;
        }

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        alert('회원가입 성공!');
        closeModal(); // 모달 닫기
        signupForm.reset(); // 폼 초기화
    });
});