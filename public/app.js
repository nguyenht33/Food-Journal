// function makeLoginRequest(username, password) {
// 	console.log('made login request')
// 	$.ajax({
// 		url: 'api/auth/login',
// 		type: 'POST',
// 		contentType: 'application/json',
// 		data: JSON.stringify({
// 							username: username, 
// 							password: password
// 		}),
// 		dataType: 'json',
// 		success: tokenSuccess,
// 		error: tokenError
// 	});
// }

// function tokenError(err) {
// 	alert('Incorrect username or password');
// }

// function tokenSuccess(res) {
// 	const authToken = res.authToken,
// 				userId = res.userId;
// 	localStorage.setItem('authToken', JSON.stringify(authToken));
// 	// console.log(authToken, userId);
// 	getUsersData(authToken, userId);
// }

// function getUsersData(authToken, userId) {
// 	$.ajax({
// 		url: `api/users/${userId}`,
// 		type: 'GET',
// 		headers: {
//         'Authorization': `Bearer ${authToken}`,
//     },
// 		success: function(data) {
// 			return console.log(data);
// 		},
// 		error: function(err) {
// 			return console.log(err);
// 		}
// 	});
// }

// function handleLoginSubmit() {
// 	$('#js-login-form').on('submit', (e) => {
// 		e.preventDefault();
// 		const username = $('#login-user').val(),
// 					password = $('#login-pwd').val();

// 		if (username === '' || password === '') {
// 			alert('please enter username and password');
// 		} else {
// 			makeLoginRequest(username, password);
// 		}
// 	});
// }

//////////////////////

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
			console.log(res);
		},
		error: function(err) {
			console.log(err.status);
		}
	});
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
	handleLoginSubmit();
	handleSignupSubmit();
}

$(init)