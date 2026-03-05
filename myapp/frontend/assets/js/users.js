document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check for token and redirect if missing
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Dynamize Date
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const today = new Date();
        let dateString = today.toLocaleDateString('fr-FR', options);
        dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
        dateEl.textContent = dateString;
    }

    // 3. User listings
    const pendingTable = document.getElementById('pendingUsersTable');
    const allTable = document.getElementById('allUsersTable');
    const badgeSidebar = document.getElementById('sidebarPendingBadge');
    const badgeTable = document.getElementById('pendingCountBadge');

    const refreshData = async () => {
        // Fetch all users
        const allUsers = await api.get('/user/all');
        if (Array.isArray(allUsers)) {
            allTable.innerHTML = allUsers.map(u => `
                <tr>
                    <td>
                        <div class="user-cell">
                            <div class="user-initials" style="background: ${getRandomColor()}">${u.username.substring(0, 2).toUpperCase()}</div>
                            <span>${u.full_name || u.username}</span>
                        </div>
                    </td>
                    <td>${u.email}</td>
                    <td><span class="role-badge ${u.role}">${formatRole(u.role)}</span></td>
                    <td>
                        <div class="status-badge ${u.is_approved ? 'status-active' : 'status-pending'}">
                            <div class="status-dot"></div>
                            <span>${u.is_approved ? 'Actif' : 'En attente'}</span>
                        </div>
                    </td>
                    <td>01/09/2024</td> <!-- Placeholder date -->
                    <td>
                        <div class="table-actions">
                            <button class="action-btn edit"><i class="fas fa-pen"></i></button>
                            <button class="action-btn delete" onclick="handleUserAction(${u.id}, 'reject')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        // Fetch pending users
        const pendingUsers = await api.get('/user/pending');
        if (Array.isArray(pendingUsers)) {
            badgeSidebar.textContent = pendingUsers.length;
            badgeTable.textContent = pendingUsers.length;

            if (pendingUsers.length === 0) {
                pendingTable.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 30px; color: var(--text-muted);">Aucune demande en attente</td></tr>';
            } else {
                pendingTable.innerHTML = pendingUsers.map(u => `
                    <tr>
                        <td>${u.full_name || u.username}</td>
                        <td>${u.email}</td>
                        <td><span class="role-badge ${u.role}">${formatRole(u.role)}</span></td>
                        <td>04/03/2026</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-text-action approve" onclick="handleUserAction(${u.id}, 'approve')">
                                    <i class="fas fa-check"></i> Approuver
                                </button>
                                <button class="btn-text-action reject" onclick="handleUserAction(${u.id}, 'reject')">
                                    <i class="fas fa-times"></i> Rejeter
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        }
    };

    window.handleUserAction = async (userId, action) => {
        const endpoint = `/user/${action}/${userId}`;
        let result;

        if (action === 'approve') {
            result = await api.post(endpoint, {});
        } else {
            const response = await fetch(`http://127.0.0.1:5000/api/user/reject/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            result = await response.json();
        }

        if (result.message) {
            refreshData();
        } else {
            alert(result.error || 'Erreur');
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

    // Logout logic
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }

    // 4. Modal Logic
    const addUserModal = document.getElementById('addUserModal');
    const openModalBtn = document.querySelector('.btn-add');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const addUserForm = document.getElementById('addUserForm');

    const toggleModal = (show) => {
        addUserModal.style.display = show ? 'flex' : 'none';
        if (!show) addUserForm.reset();
    };

    openModalBtn.addEventListener('click', () => toggleModal(true));
    closeModalBtn.addEventListener('click', () => toggleModal(false));
    cancelBtn.addEventListener('click', () => toggleModal(false));

    // Close modal if clicking outside the content
    window.addEventListener('click', (e) => {
        if (e.target === addUserModal) toggleModal(false);
    });

    // Handle form submission
    addUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const formData = {
            username: email, // Use email as username
            full_name: document.getElementById('full_name').value,
            email: email,
            password: document.getElementById('password').value,
            role: document.getElementById('role').value
        };

        try {
            const result = await api.post('/user/create', formData);
            if (result.message) {
                // Success
                toggleModal(false);
                refreshData();
                // Optional: show a success notification (if we had a toast system)
            } else {
                alert(result.error || 'Erreur lors de la création de l\'utilisateur');
            }
        } catch (error) {
            console.error('Create user error:', error);
            alert('Une erreur est survenue');
        }
    });

    refreshData();
});
