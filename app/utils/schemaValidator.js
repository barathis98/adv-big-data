import fs from 'fs/promises';
import Ajv from 'ajv';

class SchemaValidator {
  constructor() {
    // Load the JSON schema from the file
    this.loadSchema();
  }

  async loadSchema() {
    try {
      const schemaPath = 'path/to/plan.json';
      this.schema = JSON.parse(await fs.readFile(schemaPath, 'utf-8'));
      this.ajv = new Ajv();
      this.validate = this.ajv.compile(this.schema);
    } catch (error) {
      console.error('Error loading schema:', error);
    }
  }

  validateObject(obj) {
    // Validate the object against the schema
    return this.validate(obj);
  }
}

export async function validateJsonObject(jsonObject) {
  const validator = new SchemaValidator();

  await validator.loadSchema();

  // Validate the JSON object
  const validationResult = validator.validateObject(jsonObject);

  // Check the result
  if (validationResult) {
    console.log('Validation successful!');
  } else {
    console.error('Validation failed:', validator.validate.errors);
  }
}
