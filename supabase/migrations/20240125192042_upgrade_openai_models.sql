-- WORKSPACES

UPDATE workspaces
SET default_model = 'gpt-4o'
WHERE default_model = 'gpt-4-1106-preview';

UPDATE workspaces
SET default_model = 'gpt-3.5-turbo'
WHERE default_model = 'gpt-3.5-turbo-1106';

-- PRESETS

UPDATE presets
SET model = 'gpt-4o'
WHERE model = 'gpt-4-1106-preview';

UPDATE presets
SET model = 'gpt-3.5-turbo'
WHERE model = 'gpt-3.5-turbo-1106';

-- ASSISTANTS

UPDATE assistants
SET model = 'gpt-4o'
WHERE model = 'gpt-4-1106-preview';

UPDATE assistants
SET model = 'gpt-3.5-turbo'
WHERE model = 'gpt-3.5-turbo-1106';

-- CHATS

UPDATE chats
SET model = 'gpt-4o'
WHERE model = 'gpt-4-1106-preview';

UPDATE chats
SET model = 'gpt-3.5-turbo'
WHERE model = 'gpt-3.5-turbo-1106';

-- MESSAGES

UPDATE messages
SET model = 'gpt-4o'
WHERE model = 'gpt-4-1106-preview';

UPDATE messages
SET model = 'gpt-3.5-turbo'
WHERE model = 'gpt-3.5-turbo-1106';

-- PROFILES

CREATE OR REPLACE FUNCTION create_profile_and_workspace() 
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    random_username TEXT;
BEGIN
    -- Generate a random username
    random_username := 'user' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);

    -- Create a profile for the new user
    INSERT INTO public.profiles(user_id, anthropic_api_key, azure_openai_35_turbo_id, azure_openai_45_turbo_id, azure_openai_45_vision_id, azure_openai_api_key, azure_openai_endpoint, google_gemini_api_key, has_onboarded, image_url, image_path, mistral_api_key, display_name, bio, openai_api_key, openai_organization_id, perplexity_api_key, profile_context, use_azure_openai, username)
    VALUES(
        NEW.id,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        FALSE,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        FALSE,
        random_username
    );

    INSERT INTO public.workspaces(user_id, is_home, name, default_context_length, default_model, default_prompt, default_temperature, description, embeddings_provider, include_profile_context, include_workspace_instructions, instructions)
    VALUES(
        NEW.id,
        TRUE,
        'Home',
        4096,
        'gpt-4o', -- Updated default model
        'You are helpful assistant for Korean transaction intermediary. Match sellers and buyers by checking the current inventory of sellers and the purchase requests from buyers. Preferred language is Korean. Try to make response with Korean language excepts inquiry emails. Inquiry emails needs to write in sellers preferred language. e.g. English. Email contents should be confirm by user before send. User using premium account.',
        0.5,
        'My home workspace.',
        'openai',
        TRUE,
        TRUE,
        ''
    );

    RETURN NEW;
END;
$$;
