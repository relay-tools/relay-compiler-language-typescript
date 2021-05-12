import { RelayTransformError } from "./RelayTransformError";
import { GraphQLError } from "graphql";

import * as util from "util";

/**
 * In case of an error during transform, determine if it should be logged
 * to the console and/or printed in the source.
 */
export function createTransformError(error: any): string {
  if (error instanceof RelayTransformError) {
    return `Relay Transform Error: ${error.message}`;
  }

  const { sourceText, validationErrors } = error;
  if (validationErrors && sourceText) {
    const sourceLines = sourceText.split('\n');
    return validationErrors
      .map(({ message, locations }: any) => {
        return (
          'GraphQL Validation Error: ' +
          message +
          '\n' +
          locations
            .map((location: any) => {
              const preview = sourceLines[location.line - 1];
              return (
                preview &&
                [
                  '>',
                  '> ' + preview,
                  '> ' + (' ' as any as { repeat(n: number): string }).repeat(location.column - 1) + '^^^',
                ].join('\n')
              );
            })
            .filter(Boolean)
            .join('\n')
        );
      })
      .join('\n');
  }

  return util.format(
    'Relay Transform Error: %s\n\n%s',
    error.message,
    error.stack,
  );
}
