import { createClient } from "@supabase/supabase-js";
import { config } from "../config";

//Il client di Supabase: serve solo per l'accesso
export const supabase = createClient(config.supabaseUrl, config.supabaseKey);
