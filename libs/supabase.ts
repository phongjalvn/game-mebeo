import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabase = createClient<Database>(
  'https://pllcsmqausjxabmozleb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsbGNzbXFhdXNqeGFibW96bGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzA4MzA2ODIsImV4cCI6MTk4NjQwNjY4Mn0.b6SVKjDi7SHWOttkMF9BfbGaAzwVp3j3xFHiRYbqc60',
  {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

export default supabase
