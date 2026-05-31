ALTER TABLE public.tweets ADD COLUMN IF NOT EXISTS processed_text text;
ALTER TABLE public.tweets ADD COLUMN IF NOT EXISTS split text;
ALTER TABLE public.tweets ADD COLUMN IF NOT EXISTS predicted_sentiment text;
DELETE FROM public.tweets;