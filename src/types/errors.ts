export interface InvalidRequestError {
  response: {
    data: {
      data: Record<string, string> | string;
    };
  };
}
