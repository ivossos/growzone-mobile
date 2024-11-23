interface ErrorDetail {
  loc: string[];
  msg: string;
  type: string;
}

interface ErrorResponse {
  detail: ErrorDetail[] | string;
}

export class AppError {
  message: string;
  details: ErrorDetail[];

  constructor(errorResponse: ErrorResponse) {
    console.log(errorResponse)

    if(typeof errorResponse.detail === 'object') {
      this.message = errorResponse.detail.map((err) => err.msg).join(", ");
      this.details = errorResponse.detail;
    } else {
      this.message = errorResponse.detail;
      this.details = [];
    }
  }

  getMessagesByField(field: string): string[] {
    return this.details
      .filter((error) => error.loc.includes(field))
      .map((error) => error.msg);
  }
}