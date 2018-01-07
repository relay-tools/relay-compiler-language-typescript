import { DocumentNode, GraphQLSchema, ValidationContext } from 'graphql';

interface ValidationRule {
	(context: ValidationContext): any;
}

export const GLOBAL_RULES: ValidationRule[];
export const LOCAL_RULES: ValidationRule[];
export function validateOrThrow(document: DocumentNode, schema: GraphQLSchema, rules: ValidationRule[]): void;
