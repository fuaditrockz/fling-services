exports.errorResponse = (message, status) => ({
	success: false,
	message: message,
	status: status
})

exports.successResponseWithData = (response, message, status) => ({
	success: true,
	message: message,
	status: status,
	data: response
})

exports.successResponseWithoutData = (response, message, status) => ({
	success: true,
	message: message,
	status: status,
	data: response
})

exports.registerResponse = (message, status, response) => ({
	success: true,
	message: message,
	status: status,
	data: response
})