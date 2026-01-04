-- Create user_meals table for storing meal data
CREATE TABLE public.user_meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  meal_name TEXT NOT NULL,
  calories NUMERIC NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  meal_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_meals ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_meals
CREATE POLICY "Users can view their own meals"
ON public.user_meals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meals"
ON public.user_meals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meals"
ON public.user_meals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meals"
ON public.user_meals FOR DELETE
USING (auth.uid() = user_id);

-- Add index for faster queries by user
CREATE INDEX idx_user_meals_user_id ON public.user_meals(user_id);
CREATE INDEX idx_user_meals_meal_time ON public.user_meals(meal_time);

-- Add trigger for updating timestamps
CREATE TRIGGER update_user_meals_updated_at
  BEFORE UPDATE ON public.user_meals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();