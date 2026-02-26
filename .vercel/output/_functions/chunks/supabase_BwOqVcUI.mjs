import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://nmmaavlzgcywpceuypzn.supabase.co";
const supabaseKey = "sb_publishable_tSHln2qnebif86Ax3ZMDtA_lN66qhQ3";
const finalUrl = supabaseUrl;
const finalKey = supabaseKey;
const supabase = createClient(finalUrl, finalKey);

export { supabase as s };
