import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hldporeuocpgdxmjzzfk.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZHBvcmV1b2NwZ2R4bWp6emZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NjgzMzgsImV4cCI6MjEwNjM0NDMzOH0.Guq3YD_4ohOp-g84eubN94jAxAaaDRZpz8rRKFZW80M"
);
