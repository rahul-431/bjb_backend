class ApiResponse {
  constructor(data, message = "success") {
    this.data = data;
    this.message = message;
  }
}
export { ApiResponse };
