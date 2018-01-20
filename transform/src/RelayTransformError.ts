import { Location } from "graphql";

export class RelayTransformError {
  message: string;
  loc: Location | null;
  stack: string;

  constructor(message: string, loc: Location | undefined) {
    this.message = message;
    this.loc = loc || null;
    this.stack = new Error().stack || "";
  }
}
