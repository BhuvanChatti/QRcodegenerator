const form = document.getElementById('registerForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch('https://qrcodegenerator-zuzx.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.message) {
        document.getElementById('message').textContent = "Registration Successfull!! Continue to login page"
    }
    else {
        document.getElementById('message').textContent = (result.errors && result.errors.join(', '));
    }
});