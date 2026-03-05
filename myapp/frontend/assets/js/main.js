document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check for token and redirect if missing
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Update sidebar user info
    if (user.username) {
        const usernameEl = document.querySelector('.user-meta div:first-child');
        const avatarEl = document.querySelector('.avatar-small');
        if (usernameEl) usernameEl.textContent = user.full_name || user.username;
        if (avatarEl) avatarEl.textContent = user.username.substring(0, 1).toUpperCase();
    }

    const pendingList = document.getElementById('pendingRequestsList');
    const badgeCount = document.getElementById('pendingBadge');
    const sidebarBadge = document.getElementById('sidebarPendingBadge');

    if (pendingList && badgeCount) {
        const refreshPending = async () => {
            const users = await api.get('/user/pending');

            if (Array.isArray(users)) {
                badgeCount.textContent = users.length;
                if (sidebarBadge) sidebarBadge.textContent = users.length;

                if (users.length === 0) {
                    pendingList.innerHTML = '<p style="text-align:center; padding: 20px; color: var(--text-muted); font-size: 14px;">Aucune demande en attente</p>';
                    return;
                }

                pendingList.innerHTML = users.map(user => `
                    <div class="list-item" id="user-row-${user.id}">
                        <div class="item-pfp" style="background: ${getRandomColor()}">${user.username.substring(0, 2).toUpperCase()}</div>
                        <div class="item-details">
                            <span class="name">${user.full_name || user.username}</span>
                            <span class="sub">${formatRole(user.role)} • Nouveau</span>
                        </div>
                        <div class="action-set">
                            <button class="btn-round btn-approve" onclick="handleAction(${user.id}, 'approve')">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn-round btn-reject" onclick="handleAction(${user.id}, 'reject')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            } else if (users.error) {
                pendingList.innerHTML = `<p style="text-align:center; padding: 20px; color: #ef4444; font-size: 12px;">${users.error}</p>`;
            }
        };

        window.handleAction = async (userId, action) => {
            const endpoint = `/user/${action}/${userId}`;
            let result;

            if (action === 'approve') {
                result = await api.post(endpoint, {});
            } else {
                const response = await fetch(`http://localhost:5000/api/user/reject/${userId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                result = await response.json();
            }

            if (result.message) {
                const row = document.getElementById(`user-row-${userId}`);
                if (row) row.style.opacity = '0';
                setTimeout(refreshPending, 300);
            } else {
                alert(result.error || 'Une erreur est survenue');
            }
        };

        const getRandomColor = () => {
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
            return colors[Math.floor(Math.random() * colors.length)];
        };

        const formatRole = (role) => {
            const roles = { 'student': 'Étudiant', 'teacher': 'Enseignant', 'admin': 'Admin' };
            return roles[role] || role;
        };

        refreshPending();
    }

    // Logout logic
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
});
