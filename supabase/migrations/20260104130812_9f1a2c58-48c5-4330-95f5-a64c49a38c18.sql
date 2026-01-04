-- Create nutrition_goals table for storing user goals
CREATE TABLE public.nutrition_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  current NUMERIC NOT NULL DEFAULT 0,
  target NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'g',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE public.nutrition_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for nutrition_goals
CREATE POLICY "Users can view their own goals"
ON public.nutrition_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
ON public.nutrition_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.nutrition_goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON public.nutrition_goals FOR DELETE
USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_nutrition_goals_user_id ON public.nutrition_goals(user_id);

-- Add trigger for updating timestamps
CREATE TRIGGER update_nutrition_goals_updated_at
  BEFORE UPDATE ON public.nutrition_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();