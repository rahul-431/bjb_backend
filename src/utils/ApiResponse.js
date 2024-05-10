class ApiResponse {
  constructor(data, message = "success") {
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
export { ApiResponse };
