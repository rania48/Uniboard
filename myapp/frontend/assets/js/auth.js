document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Match ID in login.html -> id="username"
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const result = await api.post('/auth/login', { username, password });
            if (result.access_token) {
                localStorage.setItem('token', result.access_token);
                localStorage.setItem('user', JSON.stringify(result.user));
                window.location.href = 'index.html';
            } else {
                alert(result.error || 'Erreur de connexion');
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Match IDs in register.html -> regFullName, regEmail, regPassword, regConfirmPassword, regRole
            const fullName = document.getElementById('regFullName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            const role = document.getElementById('regRole').value;

            if (password !== confirmPassword) {
                alert('Les mots de passe ne correspondent pas');
                return;
            }

            const result = await api.post('/auth/register', {
                username: fullName,
                email,
                password,
                role
            });

            if (result.message) {
                alert(result.message);
                window.location.href = 'login.html';
            } else {
                alert(result.error || 'Erreur lors de l\'inscription');
            }
        });
    }
});
