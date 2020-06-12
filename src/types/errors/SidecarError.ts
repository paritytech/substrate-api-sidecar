export default class SidecarError extends Error {
  status: number = 500;

  static fromError(err: Error, msg: string): SidecarError {
    if (err instanceof SidecarError) {
      return err;
    }

    return new SidecarError(msg);
  }
};
