-- Database migration script to add input_data column to questions table
-- This enables support for test case input data for programs using input() functions

-- Add input_data column to questions table
ALTER TABLE questions 
ADD COLUMN input_data TEXT COMMENT 'Input data for test cases (for programs that use input() function). Multiple inputs can be separated by newlines';

-- Optional: Update existing questions with empty input_data if needed
-- UPDATE questions SET input_data = '' WHERE input_data IS NULL; 