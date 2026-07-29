const ADMIN_CREDENTIALS = {
    username: 'admin',
    // SHA-256 of the admin password — never store plaintext in a public JS file
    passwordHash: '81060c4ca1deed2f73ba769bbf256ea723f894ac70e39adb9487074bc49c4752'
};

async function hashPassword(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function checkAlreadyLoggedIn() {
    const session = localStorage.getItem('tfe_admin_session');
    if (session) {
        window.location.href = 'admin.html';
    }
}

function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('errorMessage');

            const hashed = await hashPassword(password);

            if (username === ADMIN_CREDENTIALS.username && hashed === ADMIN_CREDENTIALS.passwordHash) {
                localStorage.setItem('tfe_admin_session', JSON.stringify({ 
                    username, 
                    timestamp: Date.now() 
                }));
                window.location.href = 'admin.html';
            } else {
                errorDiv.textContent = 'Invalid credentials!';
                errorDiv.classList.remove('hidden');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAlreadyLoggedIn();
    initLoginForm();
});
