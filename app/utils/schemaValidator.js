import fs from 'fs/promises';
import Ajv from 'ajv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const schema = {
	// "$schema": "http://json-schema.org/draft-04/schema#",
	"type": "object",
	"properties": {
		"planCostShares": {
			"type": "object",
			"properties": {
				"deductible": {
					"type": "integer",
					"minimum": 0
				},
				"_org": {
					"type": "string"
				},
				"copay": {
					"type": "integer",
					"minimum": 0
				},
				"objectId": {
					"type": "string"
				},
				"objectType": {
					"type": "string"
				}
			},
			"required": [
				"deductible",
				"_org",
				"copay",
				"objectId",
				"objectType"
			]
		},
		"linkedPlanServices": {
			"type": "array",
			"uniqueItems": true,
			"items": {
				"type": "object",
				"properties": {
					"linkedService": {
						"type": "object",
						"properties": {
							"_org": {
								"type": "string"
							},
							"objectId": {
								"type": "string"
							},
							"objectType": {
								"type": "string"
							},
							"name": {
								"type": "string"
							}
						},
						"required": [
							"_org",
							"objectId",
							"objectType",
							"name"
						]
					},
					"planserviceCostShares": {
						"type": "object",
						"properties": {
							"deductible": {
								"type": "integer",
								"minimum": 0
							},
							"_org": {
								"type": "string"
							},
							"copay": {
								"type": "integer",
								"minimum": 0
							},
							"objectId": {
								"type": "string"
							},
							"objectType": {
								"type": "string"
							}
						},
						"required": [
							"deductible",
							"_org",
							"copay",
							"objectId",
							"objectType"
						]
					},
					"_org": {
						"type": "string"
					},
					"objectId": {
						"type": "string"
					},
					"objectType": {
						"type": "string"
					}
				},
				"required": [
					"linkedService",
					"planserviceCostShares",
					"_org",
					"objectId",
					"objectType"
				]
			}
		},
		"_org": {
			"type": "string"
		},
		"objectId": {
			"type": "string"
		},
		"objectType": {
			"type": "string"
		},
		"planType": {
			"type": "string"
		},
		"creationDate": {
			"type": "string"
		}
	},
	"required": [
		"planCostShares",
		"linkedPlanServices",
		"_org",
		"objectId",
		"objectType",
		"planType",
		"creationDate"
	]
}


class SchemaValidator {
  constructor() {

    // Load the JSON schema from the file
    this.loadSchema();

  }

  async loadSchema() {
    try {
    // const schemaPath = '../../plan.json';
    // // const schemaPath = path.resolve(__dirname, '../../plan.json');
    // const currentModulePath = fileURLToPath(import.meta.url);
    // const currentModuleDir = dirname(currentModulePath);

    // // Resolve the absolute path to the schema file
    // const absoluteSchemaPath = new URL(schemaPath, currentModuleDir).pathname;

    //   this.schema = JSON.parse(await fs.readFile(absoluteSchemaPath, 'utf-8'));

      this.ajv = new Ajv();
      this.validate = this.ajv.compile(schema);
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
    return true;
  } else {
    console.error('Validation failed:', validator.validate.errors);
    return false;
  }
}
