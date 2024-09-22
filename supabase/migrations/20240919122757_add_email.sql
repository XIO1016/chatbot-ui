-- FUNCTION: update_updated_at_column

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

-- TABLE --

CREATE TABLE IF NOT EXISTS email_account
(
    -- ID
    id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- RELATIONSHIPS
    user_id                   UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,

    -- METADATA
    created_at                TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMPTZ,

    -- REQUIRED FIELDS
    email                     TEXT        NOT NULL UNIQUE CHECK (char_length(email) <= 255),
    email_key                 TEXT        NOT NULL CHECK (char_length(email_key) <= 1000)  -- Access key or token
);

-- INDEXES --

CREATE INDEX idx_email_account_user_id ON email_account (user_id);

-- RLS --

ALTER TABLE email_account
    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to own email accounts"
    ON email_account
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- TRIGGERS --

CREATE TRIGGER update_email_account_updated_at
    BEFORE UPDATE
    ON email_account
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
