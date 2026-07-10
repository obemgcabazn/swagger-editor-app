export type SchemaFormat = 'json' | 'yaml';

export type ValidationError = {
  message: string;
  path: string[];
};

export type SchemaValidationResult = {
  errors: ValidationError[];
  isValid: boolean;
};
