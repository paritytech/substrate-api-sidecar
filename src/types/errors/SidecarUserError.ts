import SidecarError from "./SidecarError";

export default class SidecarUserError implements SidecarError {
  name: 'SidecarUserError';
  message: string;
  stack: undefined;
  status: number;

  constructor(message: string, status?: number) {
    this.message = message;
    this.status = status || 400;
  }
}
