import { Location } from "graphql";

export class RelayTransformError extends Error {
  loc: Location | null;

  constructor(message: string, loc: Location | undefined) {
    super(message);
    this.loc = loc || null;
    Object.setPrototypeOf(this, RelayTransformError.prototype);
  }
}
