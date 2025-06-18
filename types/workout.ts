export interface Exercise {
  id: string;
  exercise_id?: string;
  name: string;
  body_part?: string;
  gif_url?: string | number;
  sets?: number | null;
  reps?: number | null;
  weight?: number | null;
  kilo?: number | null;
  notes?: string | null;
  targetMuscles?: string[];
  instructions?: string;
}

export interface WorkoutDay {
  id: string;
  name: string;
  exercises: Exercise[];
  notes?: string;
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  days: WorkoutDay[];
  calendarEvents?: CalendarWorkoutEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface CalendarWorkoutEvent {
  id: string;
  programId: string;
  dayId: string;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  description: string;
  isRestDay: boolean;
} 