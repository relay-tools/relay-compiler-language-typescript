import { Location } from "graphql";

export class RelayTransformError extends Error {
  message: string;
  loc: Location | null;
  stack: string;

  constructor(message: string, loc: Location | undefined) {
    super(message);
    this.loc = loc || null;
    Object.setPrototypeOf(this, RelayTransformError.prototype);
  }
}
