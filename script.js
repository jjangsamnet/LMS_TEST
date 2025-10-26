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
    const questionListUl = document.getElementById('question-ul');
    
    // 포커스 관리를 위한 변수
    let lastFocusedElement;

    // 로그인 상태 변수
    // 페이지 로드 시 localStorage에서 로그인 상태를 불러옴
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    let currentUser = JSON.parse(localStorage.getItem('user'));
    
    // 문항 데이터
    const questions = [
        { id: 1, text: '1번 문제: HTML의 기본 구조에 대해 설명하시오.' },
        { id: 2, text: '2번 문제: CSS에서 Flexbox와 Grid의 차이점은 무엇인가요?' },
        { id: 3, text: '3번 문제: JavaScript의 비동기 처리 방식에 대해 설명하시오.' }
    ];

    function renderQuestions() {
        questionListUl.innerHTML = ''; // 기존 목록 초기화
        questions.forEach(q => {
            const li = document.createElement('li');
            // 로그인 상태에 따라 '풀기' 버튼을 조건부로 추가
            const solveButtonHtml = isLoggedIn 
                ? `<button class="solve-btn" data-question-id="${q.id}">풀기</button>` 
                : '';

            li.innerHTML = `<span>${q.text}</span> ${solveButtonHtml}`;
            questionListUl.appendChild(li);
        });

        // '풀기' 버튼이 존재할 경우에만 이벤트 리스너 추가
        if (isLoggedIn) {
            document.querySelectorAll('.solve-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const questionId = btn.dataset.questionId;
                    alert(`${questionId}번 문항 풀이 페이지로 이동합니다.`);
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
        renderQuestions(); // 로그아웃 시 문항 목록 다시 렌더링
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

        alert('로그인 성공!');
        closeModal();
        updateHeader();
        renderQuestions(); // 로그인 시 문항 목록 다시 렌더링
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
    updateHeader();
    renderQuestions();

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