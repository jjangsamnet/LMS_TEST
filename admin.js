document.addEventListener('DOMContentLoaded', () => {
    const userTableBody = document.getElementById('user-table-body');

    // 현재 로그인한 사용자가 관리자인지 확인 (실제 운영 환경에서는 서버 측에서 권한을 확인해야 합니다)
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser || currentUser.email !== 'admin') {
        alert('접근 권한이 없습니다.');
        window.location.href = 'index.html';
        return;
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

    // 이벤트 위임을 사용하여 테이블 내 버튼 클릭 처리
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

    // 페이지 로드 시 사용자 목록 렌더링
    renderUsers();
});