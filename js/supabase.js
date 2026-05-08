// ================================================================
// KITHTHA GRAND — Supabase Connection
// ================================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://rcmqcqrilhdxkhowdpmv.supabase.co';       // ← Step 5 වලින් copy කරේ
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjbXFjcXJpbGhkeGtob3dkcG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyOTcxMjcsImV4cCI6MjA4ODg3MzEyN30.EF3-0BHR7tA2U2nA8D-lE7fyKiBh8ZtGfu_dTTmvBWU';     // ← Step 5 වලින් copy කරේ

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);