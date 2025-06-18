-- Users table is handled by Supabase Auth, but we might have a public.users table for profiles if needed.
-- For this project, we rely on auth.users.

-- Main table for the list of all available exercises in the library.
CREATE TABLE exercises_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    body_part TEXT,
    gif_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to store user-created workout programs.
CREATE TABLE user_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for the days within a user's program (e.g., Day 1: Chest & Triceps).
CREATE TABLE program_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES user_programs(id) ON DELETE CASCADE,
    day_name TEXT NOT NULL,
    "order" INT NOT NULL, -- "order" is a reserved keyword, so it's quoted.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(program_id, "order")
);

-- Junction table connecting exercises from the library to specific days in a program.
CREATE TABLE program_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_id UUID REFERENCES program_days(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises_list(id) ON DELETE CASCADE,
    sets INT,
    reps INT,
    kilo TEXT,
    notes TEXT,
    "order" INT NOT NULL
);

-- Table to store the user's calendar schedule for a specific program.
-- Assumes a user can only have one program active on their calendar at a time.
CREATE TABLE user_calendar_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE, -- one schedule per user
    program_id UUID REFERENCES user_programs(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    duration INT NOT NULL,
    duration_type TEXT NOT NULL, -- 'weeks' or 'months'
    rest_days INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to log the actual performance of an exercise on a given day.
CREATE TABLE workout_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    program_exercise_id UUID REFERENCES program_exercises(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    sets INT,
    reps INT,
    kilo NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, program_exercise_id, date) -- A user can only log a specific exercise once per day.
);

-- RLS (Row Level Security) Policies
-- Make sure to enable RLS on all tables in the Supabase UI!

-- For exercises_list, everyone can read.
CREATE POLICY "Public exercises are viewable by everyone."
ON exercises_list FOR SELECT
USING (true);

-- Users can manage their own programs.
CREATE POLICY "Users can insert their own programs."
ON user_programs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own programs."
ON user_programs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own programs."
ON user_programs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own programs."
ON user_programs FOR DELETE
USING (auth.uid() = user_id);

-- cascade policies for program_days, program_exercises
CREATE POLICY "Users can manage days for their own programs."
ON program_days FOR ALL
USING (auth.uid() = (SELECT user_id FROM user_programs WHERE id = program_id));

CREATE POLICY "Users can manage exercises for their own programs."
ON program_exercises FOR ALL
USING (
  auth.uid() = (
    SELECT up.user_id
    FROM program_days pd
    JOIN user_programs up ON pd.program_id = up.id
    WHERE pd.id = day_id
  )
);

-- users can manage their own calendar schedule.
CREATE POLICY "Users can manage their own calendar schedule."
ON user_calendar_schedule FOR ALL
USING (auth.uid() = user_id);

-- users can manage their own workout logs.
CREATE POLICY "Users can manage their own workout logs."
ON workout_logs FOR ALL
USING (auth.uid() = user_id); 