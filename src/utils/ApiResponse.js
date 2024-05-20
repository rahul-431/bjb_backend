class ApiResponse {
  constructor(data = null, message = "success") {
    this.data = data;
    this.message = message;
  }
}
export { ApiResponse };
