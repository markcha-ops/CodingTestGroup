-- Add test_cases column to questions table
ALTER TABLE questions ADD COLUMN test_cases TEXT;

-- Add input_data column to questions table
ALTER TABLE questions ADD COLUMN input_data TEXT;

-- Add is_test_case column to questions table
ALTER TABLE questions ADD COLUMN is_test_case BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN questions.test_cases IS 'Test cases in JSON format for multiple input-output pairs. Example: [{"input": [5,10], "output": "123"}, {"input": [2,40], "output": "456"}]';
COMMENT ON COLUMN questions.input_data IS 'Simple input data for the question. Used when test_cases is not provided.';
COMMENT ON COLUMN questions.is_test_case IS 'Boolean flag to indicate whether the question uses test cases (true) or simple input data (false).'; 