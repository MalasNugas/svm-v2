GRANT SELECT ON public.tweets TO anon;
CREATE POLICY "Tweets: public read" ON public.tweets FOR SELECT TO anon USING (true);