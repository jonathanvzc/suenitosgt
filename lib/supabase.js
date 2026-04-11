import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://yxsestcuyqdsvicvhgzh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4c2VzdGN1eXFkc3ZpY3ZoZ3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4OTU4ODgsImV4cCI6MjA5MTQ3MTg4OH0.Pl_hHgK_s2FLlHbOx99ND9dV-Ng3YoV1T-bwlxGOQfY"
);

export default supabase;