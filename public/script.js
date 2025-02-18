document.addEventListener('DOMContentLoaded', function() {
    // Elementos
    const btnLogin = document.querySelector('.btn-login');
    const btnRegister = document.querySelector('.btn-register');
    const startButton = document.querySelector('.start-button');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeBtns = document.querySelectorAll('.close-btn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Abrir modais
    btnLogin.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.style.display = 'flex';
    });

    btnRegister.addEventListener('click', function(e) {
        e.preventDefault();
        registerModal.style.display = 'flex';
    });

    startButton.addEventListener('click', function(e) {
        e.preventDefault();
        registerModal.style.display = 'flex';
    });

    // Fechar modais
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        });
    });

    // Login
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = this.email.value;
        const password = this.password.value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                alert('Login realizado com sucesso!');
                location.reload();
            } else {
                alert(data.error || 'Erro ao fazer login');
            }
        } catch (error) {
            alert('Erro ao conectar ao servidor');
        }
    });

    // Registro
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = this.name.value;
        const email = this.email.value;
        const password = this.password.value;

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Cadastro realizado com sucesso!');
                registerModal.style.display = 'none';
                loginModal.style.display = 'flex';
            } else {
                alert(data.error || 'Erro ao cadastrar');
            }
        } catch (error) {
            alert('Erro ao conectar ao servidor');
        }
    });

    // Verificar login
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        const navButtons = document.querySelector('.nav-buttons');
        navButtons.innerHTML = `
            <div class="user-profile">
                <span>Olá, ${user.name}</span>
                <a href="#" class="btn-logout">Sair</a>
            </div>
        `;
        startButton.style.display = 'none';

        // Logout
        document.querySelector('.btn-logout').addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            location.reload();
        });
    }
});