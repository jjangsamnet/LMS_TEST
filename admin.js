document.addEventListener('DOMContentLoaded', () => {
    const userTableBody = document.getElementById('user-table-body');
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // 관리자가 아니거나 로그인 상태가 아니면 메인 페이지로 리디렉션
    if (!currentUser || currentUser.email !== 'admin') {
        alert('접근 권한이 없습니다.');
        window.location.href = 'index.html';
        return;
    }

    // localStorage에서 모든 사용자 목록을 가져옴
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // 사용자 목록이 비어있는 경우
    if (users.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 2;
        td.textContent = '등록된 회원이 없습니다.';
        tr.appendChild(td);
        userTableBody.appendChild(tr);
        return;
    }

    // 테이블에 사용자 데이터를 채움
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${user.name}</td><td>${user.email}</td>`;
        userTableBody.appendChild(tr);
    });
});