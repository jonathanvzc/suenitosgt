type ErrorWithMessage = {
  message?: string;
};

type ErrorWithResponse = {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
};

export const getErrorMessage = (
  error: unknown,
  fallback = "Ha ocurrido un error"
) => {
  if (!error) return fallback;

  if (typeof error === "string") {
    return error;
  }

  const maybeResponse = error as ErrorWithResponse;
  const responseMessage =
    maybeResponse.response?.data?.message || maybeResponse.response?.data?.error;

  if (responseMessage) {
    return responseMessage;
  }

  const maybeError = error as ErrorWithMessage;

  if (maybeError.message) {
    return maybeError.message;
  }

  return fallback;
};
