class HandleError extends Error {
	constructor(public message: string, public statusCode: number, public isSuccess: boolean) {
		super(message)
	}
}

export default HandleError
