import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import { useAuthStore } from '@/stores/auth'
const anon: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlremtlZmh0cW93bXlkemNnam15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA0NDY1NTYsImV4cCI6MjAwNjAyMjU1Nn0.9_kdViVmNAF6i5O-Y81t2QEvPvoqiI05onomwT5EDAw'
const url: string = 'https://ikzkefhtqowmydzcgjmy.supabase.co'

const supabase = createClient<Database>(url, anon)

supabase.auth.onAuthStateChange((event, session) => {

  const authStore = useAuthStore()

  authStore.user = session?.user || null;

});

export { supabase }

//subscribe realtime changes

