// Login
function makeLoginRequest(username, password) {
	$.ajax({
		url: 'api/auth/login',
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify({
							username: username, 
							password: password
		}),
		dataType: 'json',
		success: loginSuccess,
		error: loginError
	});
}

function loginError(err) {
	console.log(err);
	alert('Incorrect username or password ');
}

function loginSuccess(res) {
	localStorage.setItem('user', JSON.stringify(res.user));
	window.location = '/dashboard';
}

function handleLoginSubmit() {
	$('#js-login-form').on('submit', (e) => {
		e.preventDefault();
		const username = $('#login-user').val(),
					password = $('#login-pwd').val();

		if (username === '' || password === '') {
			alert('please enter username and password');
		} else {
			makeLoginRequest(username, password);
		}
	});
}

// Sign Up
function makeSignupRequest(username, email, password, firstname, lastname) {
	const data = JSON.stringify({
							username: username,
							email: email, 
							password: password,
							firstname: firstname,
							lastname: lastname
	});
	$.ajax({
		url: 'api/users',
		type: 'POST',
		contentType: 'application/json',
		data: data,
		dataType: 'json',
		success: function(res) {
			makeLoginRequest(username, password);
		},
		error: signupError,
	});
}

function signupError(err) {
	console.log(err);
}

function handleSignupSubmit() {
	$('#js-signup-form').on('submit', (e) => {
		e.preventDefault();
		const username = $('#signup-username').val(),
					email = $('#signup-email').val(),
					password = $('#signup-pwd').val(),
					lastname = $('#signup-last-name').val(),
					firstname = $('#signup-first-name').val();
		if (username === '' || email === '' || password === '' || firstname ==='' || lastname ==='') {
			alert('Please fill out all required field');
		} else {
			makeSignupRequest(username, email, password, firstname, lastname);
		}
	});
}

function init() {
	handleSignupSubmit();
	handleLoginSubmit();
}

$(init)