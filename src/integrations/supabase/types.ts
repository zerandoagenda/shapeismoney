export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_notes: {
        Row: {
          author_id: string
          created_at: string
          id: string
          note: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          note: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          note?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_events_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          energy: number | null
          hydration: number | null
          id: string
          nutrition_on_track: boolean | null
          pain: number | null
          sleep_quality: number | null
          stress: number | null
          trained: boolean | null
          user_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          energy?: number | null
          hydration?: number | null
          id?: string
          nutrition_on_track?: boolean | null
          pain?: number | null
          sleep_quality?: number | null
          stress?: number | null
          trained?: boolean | null
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          energy?: number | null
          hydration?: number | null
          id?: string
          nutrition_on_track?: boolean | null
          pain?: number | null
          sleep_quality?: number | null
          stress?: number | null
          trained?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_checkins_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_library: {
        Row: {
          active: boolean
          avatar_animation_url: string | null
          category: string | null
          common_errors: string | null
          created_at: string
          description: string | null
          equipment: string | null
          id: string
          image_url: string | null
          level: string | null
          muscle_group: string
          name: string
          notes: string | null
          technique: string | null
          video_url: string | null
        }
        Insert: {
          active?: boolean
          avatar_animation_url?: string | null
          category?: string | null
          common_errors?: string | null
          created_at?: string
          description?: string | null
          equipment?: string | null
          id?: string
          image_url?: string | null
          level?: string | null
          muscle_group: string
          name: string
          notes?: string | null
          technique?: string | null
          video_url?: string | null
        }
        Update: {
          active?: boolean
          avatar_animation_url?: string | null
          category?: string | null
          common_errors?: string | null
          created_at?: string
          description?: string | null
          equipment?: string | null
          id?: string
          image_url?: string | null
          level?: string | null
          muscle_group?: string
          name?: string
          notes?: string | null
          technique?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      nutrition_meal_items: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          fat: number | null
          food_name: string
          id: string
          item_order: number
          meal_id: string
          notes: string | null
          protein: number | null
          quantity: number | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          food_name: string
          id?: string
          item_order?: number
          meal_id: string
          notes?: string | null
          protein?: number | null
          quantity?: number | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          food_name?: string
          id?: string
          item_order?: number
          meal_id?: string
          notes?: string | null
          protein?: number | null
          quantity?: number | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_meal_items_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "nutrition_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_meals: {
        Row: {
          created_at: string
          id: string
          instructions: string | null
          meal_order: number
          name: string
          nutrition_plan_id: string
          suggested_time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          instructions?: string | null
          meal_order?: number
          name: string
          nutrition_plan_id: string
          suggested_time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          instructions?: string | null
          meal_order?: number
          name?: string
          nutrition_plan_id?: string
          suggested_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_meals_nutrition_plan_id_fkey"
            columns: ["nutrition_plan_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_plans: {
        Row: {
          calorie_target: number | null
          carbs_target: number | null
          created_at: string
          created_by: string | null
          fat_target: number | null
          id: string
          notes: string | null
          objective: string | null
          protein_target: number | null
          published_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          water_target_ml: number | null
        }
        Insert: {
          calorie_target?: number | null
          carbs_target?: number | null
          created_at?: string
          created_by?: string | null
          fat_target?: number | null
          id?: string
          notes?: string | null
          objective?: string | null
          protein_target?: number | null
          published_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          water_target_ml?: number | null
        }
        Update: {
          calorie_target?: number | null
          carbs_target?: number | null
          created_at?: string
          created_by?: string | null
          fat_target?: number | null
          id?: string
          notes?: string | null
          objective?: string | null
          protein_target?: number | null
          published_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          water_target_ml?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_responses: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: number
          id: string
          responses: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: number
          id?: string
          responses?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: number
          id?: string
          responses?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_responses_profile_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_entitlements: {
        Row: {
          enabled: boolean
          feature_key: string
          id: string
          plan: Database["public"]["Enums"]["plan_code"]
        }
        Insert: {
          enabled?: boolean
          feature_key: string
          id?: string
          plan: Database["public"]["Enums"]["plan_code"]
        }
        Update: {
          enabled?: boolean
          feature_key?: string
          id?: string
          plan?: Database["public"]["Enums"]["plan_code"]
        }
        Relationships: [
          {
            foreignKeyName: "plan_entitlements_plan_fkey"
            columns: ["plan"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["code"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          code: Database["public"]["Enums"]["plan_code"]
          description: string | null
          name: string
        }
        Insert: {
          active?: boolean
          code: Database["public"]["Enums"]["plan_code"]
          description?: string | null
          name: string
        }
        Update: {
          active?: boolean
          code?: Database["public"]["Enums"]["plan_code"]
          description?: string | null
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_path: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          company: string | null
          country: string | null
          country_code: string | null
          created_at: string
          first_name: string
          height_cm: number | null
          id: string
          job_title: string | null
          last_name: string
          onboarding_completed_at: string | null
          phone: string | null
          plan: Database["public"]["Enums"]["plan_code"]
          profession: string | null
          sex: string | null
          state: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          avatar_path?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          first_name?: string
          height_cm?: number | null
          id: string
          job_title?: string | null
          last_name?: string
          onboarding_completed_at?: string | null
          phone?: string | null
          plan?: Database["public"]["Enums"]["plan_code"]
          profession?: string | null
          sex?: string | null
          state?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          avatar_path?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          first_name?: string
          height_cm?: number | null
          id?: string
          job_title?: string | null
          last_name?: string
          onboarding_completed_at?: string | null
          phone?: string | null
          plan?: Database["public"]["Enums"]["plan_code"]
          profession?: string | null
          sex?: string | null
          state?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      protocol_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          protocol_id: string
          status: Database["public"]["Enums"]["protocol_status"]
          user_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          protocol_id: string
          status: Database["public"]["Enums"]["protocol_status"]
          user_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          protocol_id?: string
          status?: Database["public"]["Enums"]["protocol_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocol_status_history_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocol_status_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      protocols: {
        Row: {
          approved_at: string | null
          created_at: string
          created_by: string | null
          draft_data: Json
          id: string
          objective: string | null
          published_at: string | null
          status: Database["public"]["Enums"]["protocol_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          created_by?: string | null
          draft_data?: Json
          id?: string
          objective?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["protocol_status"]
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          created_by?: string | null
          draft_data?: Json
          id?: string
          objective?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["protocol_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocols_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sim_scores: {
        Row: {
          bottleneck: string | null
          capacity: number
          coherence_level: string | null
          construction: number
          created_at: string
          execution: number
          governance: number
          id: string
          perception: number
          priority: string | null
          recommendation: string | null
          source: string
          strongest_pillar: string | null
          total: number
          user_id: string
        }
        Insert: {
          bottleneck?: string | null
          capacity: number
          coherence_level?: string | null
          construction: number
          created_at?: string
          execution: number
          governance: number
          id?: string
          perception: number
          priority?: string | null
          recommendation?: string | null
          source?: string
          strongest_pillar?: string | null
          total: number
          user_id: string
        }
        Update: {
          bottleneck?: string | null
          capacity?: number
          coherence_level?: string | null
          construction?: number
          created_at?: string
          execution?: number
          governance?: number
          id?: string
          perception?: number
          priority?: string | null
          recommendation?: string | null
          source?: string
          strongest_pillar?: string | null
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sim_scores_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_reviews: {
        Row: {
          completed_workouts: number
          created_at: string
          energy: number | null
          focus: number | null
          id: string
          nutrition: number | null
          planned_workouts: number
          productivity: number | null
          professional_performance: number | null
          quality_time: number | null
          relationships: number | null
          schedule_control: number | null
          sleep: number | null
          stress: number | null
          user_id: string
          week_start: string
        }
        Insert: {
          completed_workouts?: number
          created_at?: string
          energy?: number | null
          focus?: number | null
          id?: string
          nutrition?: number | null
          planned_workouts?: number
          productivity?: number | null
          professional_performance?: number | null
          quality_time?: number | null
          relationships?: number | null
          schedule_control?: number | null
          sleep?: number | null
          stress?: number | null
          user_id: string
          week_start: string
        }
        Update: {
          completed_workouts?: number
          created_at?: string
          energy?: number | null
          focus?: number | null
          id?: string
          nutrition?: number | null
          planned_workouts?: number
          productivity?: number | null
          professional_performance?: number | null
          quality_time?: number | null
          relationships?: number | null
          schedule_control?: number | null
          sleep?: number | null
          stress?: number | null
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reviews_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          exercise_id: string
          id: string
          initial_load: number | null
          notes: string | null
          reps: string
          rest_seconds: number
          sequence: number
          sets: number
          target_rpe: number | null
          workout_id: string
        }
        Insert: {
          exercise_id: string
          id?: string
          initial_load?: number | null
          notes?: string | null
          reps?: string
          rest_seconds?: number
          sequence?: number
          sets?: number
          target_rpe?: number | null
          workout_id: string
        }
        Update: {
          exercise_id?: string
          id?: string
          initial_load?: number | null
          notes?: string | null
          reps?: string
          rest_seconds?: number
          sequence?: number
          sets?: number
          target_rpe?: number | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_programs: {
        Row: {
          created_at: string
          created_by: string | null
          ends_on: string | null
          id: string
          notes: string | null
          objective: string | null
          starts_on: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ends_on?: string | null
          id?: string
          notes?: string | null
          objective?: string | null
          starts_on?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ends_on?: string | null
          id?: string
          notes?: string | null
          objective?: string | null
          starts_on?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_programs_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          completed_at: string | null
          completion_percent: number | null
          duration_minutes: number | null
          exercise_log: Json
          id: string
          notes: string | null
          started_at: string
          user_id: string
          workout_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completion_percent?: number | null
          duration_minutes?: number | null
          exercise_log?: Json
          id?: string
          notes?: string | null
          started_at?: string
          user_id: string
          workout_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completion_percent?: number | null
          duration_minutes?: number | null
          exercise_log?: Json
          id?: string
          notes?: string | null
          started_at?: string
          user_id?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          estimated_minutes: number | null
          id: string
          name: string
          notes: string | null
          program_id: string
          sequence: number
        }
        Insert: {
          created_at?: string
          estimated_minutes?: number | null
          id?: string
          name: string
          notes?: string | null
          program_id: string
          sequence?: number
        }
        Update: {
          created_at?: string
          estimated_minutes?: number | null
          id?: string
          name?: string
          notes?: string | null
          program_id?: string
          sequence?: number
        }
        Relationships: [
          {
            foreignKeyName: "workouts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role:
        | "student"
        | "coach"
        | "nutritionist"
        | "support"
        | "manager"
        | "admin"
        | "admin_master"
      plan_code: "free" | "paid" | "plus" | "premium"
      protocol_status:
        | "data_received"
        | "in_analysis"
        | "building"
        | "in_review"
        | "approved"
        | "published"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "student",
        "coach",
        "nutritionist",
        "support",
        "manager",
        "admin",
        "admin_master",
      ],
      plan_code: ["free", "paid", "plus", "premium"],
      protocol_status: [
        "data_received",
        "in_analysis",
        "building",
        "in_review",
        "approved",
        "published",
      ],
    },
  },
} as const
