class ApiResponse {
    constructor(
        statusCode, data, message = "Success", errors = []){
            this.statusCode = statusCode;
            this.data = data;
            this.message = message;
            this.errors = errors;
            this.success = statusCode < 400;

        }
}

export { ApiResponse }
export default ApiResponse
