-- Topic mental models share overview access and remain private D1 content.
ALTER TABLE diary_projects ADD COLUMN mental_model TEXT DEFAULT NULL
  CHECK (mental_model IS NULL OR (json_valid(mental_model) AND json_type(mental_model) = 'object'));
