import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yxhdblivxbrszkbcciqb.supabase.co'
const supabaseKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4aGRibGl2eGJyc3prYmNjaXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTczOTE4NzksImV4cCI6MjAzMjk2Nzg3OX0.DF3fJe6AFR0N-owQRfM3-mWD5cfFf_u-tolpFVFUsSo`
export const supabase = createClient(supabaseUrl, supabaseKey)