import SidecarError from "./SidecarError";

export default class SidecarUserError extends SidecarError {
  name: 'SidecarUserError';
  message: string;
  status: number = 400;

  constructor(message: string, status?: number) {
    super();
    this.message = message;
    if (status) {
      this.status = status;
    }
  }
}
