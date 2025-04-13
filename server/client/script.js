document.getElementById('lgout').addEventListener('click', function (e) {
	localStorage.removeItem('token');
	window.location.href=('login.html');
});
document.getElementById('qr-form').addEventListener('submit', function (e) {
	e.preventDefault();

	const id = document.getElementById('qr-id').value;
	const price = document.getElementById('qr-price').value;
	const data = { id, price };

	const token = localStorage.getItem("token");

	fetch('https://qrcodegenerator-zuzx.onrender.com/generate-qr', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({ data })
	})
		.then(response => {
			if (!response.ok) throw new Error("Unauthorized or error in generation");
			return response.blob();
		})
		.then(blob => {
			const qrImage = document.createElement('img');
			const qrImageUrl = URL.createObjectURL(blob);
			qrImage.src = qrImageUrl;
			const qrResultDiv = document.getElementById('qr-result');
			qrResultDiv.innerHTML = '';
			qrResultDiv.appendChild(qrImage);
		})
		.catch(error => {
			console.error('Error generating QR code:', error);
			alert("Please login to generate QR codes");
			window.location.href = "login.html";
		});
});
