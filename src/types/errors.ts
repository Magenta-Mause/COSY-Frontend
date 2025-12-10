import type { AxiosError } from 'axios';

export interface InvalidRequestErrorData {
  data: Record<string, string> | string;
}

export type InvalidRequestError = AxiosError<InvalidRequestErrorData>;
