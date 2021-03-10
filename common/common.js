

class Response {


	SuccessResponseHandler(message = 'Success', data) {

		let body = {
			statusCode: 200,
			message: message
		};

		if (data)
			body['data'] = data;

		let resp = {
			"isBase64Encoded": false,
			"statusCode": 200,
			"headers": {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Credentials': true,
				"Access-Control-Allow-Methods": "*"
			},
			"body": JSON.stringify(body)
		}
		console.log('successResponse resp', resp)
		return resp;
	}

	BadRequestHandler(message, custom = false) {
		const toSend = {
			statusCode: 400,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Credentials': true,
				"Access-Control-Allow-Methods": "*"
			},
			body: JSON.stringify({
				statusCode: 400,
				message: custom ? message : `Bad Request. Expected ${message}`
			})
		};
		console.log(JSON.stringify(toSend), "BadRequest")
		return toSend;
	}

	InternalServerErrorHandler(message) {
		const tosend = {
			// code: Constants.HttpStatusCode.INTERNAL_SERVER_ERROR,
			statusCode: 500,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Credentials': true,
				"Access-Control-Allow-Methods": "*"
			},
			body: JSON.stringify({
				statusCode: 500,
				message: message ? message : "Internal Server Error"
			})
		};
		return tosend;
	}

}
module.exports = Response
