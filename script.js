function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegister() {
    document.getElementById('registerModal').style.display = 'block';
}

// Fechar modais quando clicar fora
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Manipular envio dos formulários
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // Aqui você implementará a lógica de login
});

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // Aqui você implementará a lógica de registro
}); 