import { formatError, DocumentNode, GraphQLSchema } from 'graphql';
import { ValidationContext } from 'graphql/validation/validate';

interface ValidationRule {
	(context: ValidationContext): any;
}

export const GLOBAL_RULES: ValidationRule[];
export const LOCAL_RULES: ValidationRule[];
export function validateOrThrow(document: DocumentNode, schema: GraphQLSchema, rules: ValidationRule[]): void;
