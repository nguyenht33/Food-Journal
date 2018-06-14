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
	$('.login-err').html(`<p>Incorrect username or password</p>`)
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
			$('.login-err').html(`<p>Please enter username and password</p>`)
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
	const message = err.responseJSON.message;
	$('.signin-err').html(`<p>${message}</p>`);
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
			$('.login-err').html(`<p>Please fill out all forms</p>`)
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