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
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string
          client_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_id: string
          client_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string
          client_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_audit_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      admin_notifications: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          message: string
          notification_type: string
          read_at: string | null
          recipient_id: string
          target_path: string | null
          title: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          message: string
          notification_type: string
          read_at?: string | null
          recipient_id: string
          target_path?: string | null
          title: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          message?: string
          notification_type?: string
          read_at?: string | null
          recipient_id?: string
          target_path?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_tasks: {
        Row: {
          assignee_id: string | null
          client_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_photos: {
        Row: {
          assessment_id: string
          captured_at: string
          client_id: string
          id: string
          mime_type: string
          slot_id: string
          storage_path: string
          version: number
        }
        Insert: {
          assessment_id: string
          captured_at?: string
          client_id: string
          id?: string
          mime_type: string
          slot_id: string
          storage_path: string
          version?: number
        }
        Update: {
          assessment_id?: string
          captured_at?: string
          client_id?: string
          id?: string
          mime_type?: string
          slot_id?: string
          storage_path?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "assessment_photos_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_photos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_photos_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "photo_protocol_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          assessment_type: string
          client_id: string
          created_at: string
          cycle_id: string | null
          hypotheses: Json
          id: string
          observations: Json
          previous_assessment_id: string | null
          protocol_code: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          assessment_type: string
          client_id: string
          created_at?: string
          cycle_id?: string | null
          hypotheses?: Json
          id?: string
          observations?: Json
          previous_assessment_id?: string | null
          protocol_code?: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          assessment_type?: string
          client_id?: string
          created_at?: string
          cycle_id?: string | null
          hypotheses?: Json
          id?: string
          observations?: Json
          previous_assessment_id?: string | null
          protocol_code?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycle_strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_previous_assessment_id_fkey"
            columns: ["previous_assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      client_assignments: {
        Row: {
          active: boolean
          assigned_by: string
          assignment_role: string
          client_id: string
          created_at: string
          id: string
          staff_id: string
        }
        Insert: {
          active?: boolean
          assigned_by: string
          assignment_role: string
          client_id: string
          created_at?: string
          id?: string
          staff_id: string
        }
        Update: {
          active?: boolean
          assigned_by?: string
          assignment_role?: string
          client_id?: string
          created_at?: string
          id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_subscriptions: {
        Row: {
          billing_cycle: string | null
          cancelled_at: string | null
          created_at: string
          created_by: string
          id: string
          plan: Database["public"]["Enums"]["plan_code"]
          previous_plan: Database["public"]["Enums"]["plan_code"] | null
          renewal_date: string | null
          start_date: string | null
          status: string
          subscription_value: number | null
          tracking_source: string
          updated_at: string
          updated_by: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by: string
          id?: string
          plan: Database["public"]["Enums"]["plan_code"]
          previous_plan?: Database["public"]["Enums"]["plan_code"] | null
          renewal_date?: string | null
          start_date?: string | null
          status?: string
          subscription_value?: number | null
          tracking_source?: string
          updated_at?: string
          updated_by: string
          user_id: string
        }
        Update: {
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string
          id?: string
          plan?: Database["public"]["Enums"]["plan_code"]
          previous_plan?: Database["public"]["Enums"]["plan_code"] | null
          renewal_date?: string | null
          start_date?: string | null
          status?: string
          subscription_value?: number | null
          tracking_source?: string
          updated_at?: string
          updated_by?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_subscriptions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_subscriptions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_subscriptions_user_id_fkey"
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
      cycle_priorities: {
        Row: {
          confidence: number
          created_at: string
          cycle_id: string
          evidence: Json
          id: string
          priority_type: string
          reason: string
          sort_order: number
          target: string
        }
        Insert: {
          confidence: number
          created_at?: string
          cycle_id: string
          evidence?: Json
          id?: string
          priority_type: string
          reason: string
          sort_order?: number
          target: string
        }
        Update: {
          confidence?: number
          created_at?: string
          cycle_id?: string
          evidence?: Json
          id?: string
          priority_type?: string
          reason?: string
          sort_order?: number
          target?: string
        }
        Relationships: [
          {
            foreignKeyName: "cycle_priorities_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycle_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      cycle_strategies: {
        Row: {
          behavior_goal: string | null
          capacity_goal: string | null
          client_id: string
          contingency_rules: Json
          created_at: string
          created_by: string
          id: string
          limitations: string[]
          maintenance_regions: string[]
          minimum_week: Json
          priority_regions: string[]
          review_date: string | null
          session_duration: number
          start_date: string
          status: string
          strategy_summary: string
          structural_goal: string | null
          success_metrics: Json
          target_date: string | null
          updated_at: string
          visual_goal: string | null
          weekly_frequency: number
        }
        Insert: {
          behavior_goal?: string | null
          capacity_goal?: string | null
          client_id: string
          contingency_rules?: Json
          created_at?: string
          created_by: string
          id?: string
          limitations?: string[]
          maintenance_regions?: string[]
          minimum_week?: Json
          priority_regions?: string[]
          review_date?: string | null
          session_duration: number
          start_date: string
          status?: string
          strategy_summary?: string
          structural_goal?: string | null
          success_metrics?: Json
          target_date?: string | null
          updated_at?: string
          visual_goal?: string | null
          weekly_frequency: number
        }
        Update: {
          behavior_goal?: string | null
          capacity_goal?: string | null
          client_id?: string
          contingency_rules?: Json
          created_at?: string
          created_by?: string
          id?: string
          limitations?: string[]
          maintenance_regions?: string[]
          minimum_week?: Json
          priority_regions?: string[]
          review_date?: string | null
          session_duration?: number
          start_date?: string
          status?: string
          strategy_summary?: string
          structural_goal?: string | null
          success_metrics?: Json
          target_date?: string | null
          updated_at?: string
          visual_goal?: string | null
          weekly_frequency?: number
        }
        Relationships: [
          {
            foreignKeyName: "cycle_strategies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_strategies_created_by_fkey"
            columns: ["created_by"]
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
          aliases: string[]
          alternatives: string[]
          avatar_animation_url: string | null
          category: string | null
          common_errors: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          equipment: string | null
          execution_cues: string[]
          fatigue_cost: string | null
          id: string
          image_url: string | null
          joint_considerations: string[]
          level: string | null
          mobility_requirement: string | null
          movement_pattern: string | null
          muscle_group: string
          name: string
          notes: string | null
          primary_muscles: string[]
          progressions: string[]
          red_flags: string[]
          regressions: string[]
          secondary_muscles: string[]
          stability_requirement: string | null
          technique: string | null
          video_url: string | null
        }
        Insert: {
          active?: boolean
          aliases?: string[]
          alternatives?: string[]
          avatar_animation_url?: string | null
          category?: string | null
          common_errors?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          equipment?: string | null
          execution_cues?: string[]
          fatigue_cost?: string | null
          id?: string
          image_url?: string | null
          joint_considerations?: string[]
          level?: string | null
          mobility_requirement?: string | null
          movement_pattern?: string | null
          muscle_group: string
          name: string
          notes?: string | null
          primary_muscles?: string[]
          progressions?: string[]
          red_flags?: string[]
          regressions?: string[]
          secondary_muscles?: string[]
          stability_requirement?: string | null
          technique?: string | null
          video_url?: string | null
        }
        Update: {
          active?: boolean
          aliases?: string[]
          alternatives?: string[]
          avatar_animation_url?: string | null
          category?: string | null
          common_errors?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          equipment?: string | null
          execution_cues?: string[]
          fatigue_cost?: string | null
          id?: string
          image_url?: string | null
          joint_considerations?: string[]
          level?: string | null
          mobility_requirement?: string | null
          movement_pattern?: string | null
          muscle_group?: string
          name?: string
          notes?: string | null
          primary_muscles?: string[]
          progressions?: string[]
          red_flags?: string[]
          regressions?: string[]
          secondary_muscles?: string[]
          stability_requirement?: string | null
          technique?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      exercise_set_logs: {
        Row: {
          created_at: string
          effort: number | null
          effort_type: string | null
          id: string
          load: number | null
          notes: string | null
          pain: number | null
          reps: number | null
          session_id: string
          set_number: number
          technique_ok: boolean | null
          user_id: string
          workout_exercise_id: string
        }
        Insert: {
          created_at?: string
          effort?: number | null
          effort_type?: string | null
          id?: string
          load?: number | null
          notes?: string | null
          pain?: number | null
          reps?: number | null
          session_id: string
          set_number: number
          technique_ok?: boolean | null
          user_id: string
          workout_exercise_id: string
        }
        Update: {
          created_at?: string
          effort?: number | null
          effort_type?: string | null
          id?: string
          load?: number | null
          notes?: string | null
          pain?: number | null
          reps?: number | null
          session_id?: string
          set_number?: number
          technique_ok?: boolean | null
          user_id?: string
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_set_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_set_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_set_logs_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_interests: {
        Row: {
          created_at: string
          experience_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_interests_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "member_experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_content_views: {
        Row: {
          content_id: string
          id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          content_id: string
          id?: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          content_id?: string
          id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_content_views_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "member_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_content_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_contents: {
        Row: {
          active: boolean
          asset_path: string | null
          body: string
          category: string
          content_type: string
          cover_url: string | null
          created_at: string
          created_by: string | null
          duration_label: string | null
          excerpt: string
          eyebrow: string | null
          featured: boolean
          id: string
          minimum_plan: Database["public"]["Enums"]["plan_code"]
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          asset_path?: string | null
          body: string
          category: string
          content_type: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          duration_label?: string | null
          excerpt: string
          eyebrow?: string | null
          featured?: boolean
          id?: string
          minimum_plan?: Database["public"]["Enums"]["plan_code"]
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          asset_path?: string | null
          body?: string
          category?: string
          content_type?: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          duration_label?: string | null
          excerpt?: string
          eyebrow?: string | null
          featured?: boolean
          id?: string
          minimum_plan?: Database["public"]["Enums"]["plan_code"]
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_contents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_experiences: {
        Row: {
          active: boolean
          cover_url: string | null
          created_at: string
          description: string
          id: string
          location: string | null
          minimum_plan: Database["public"]["Enums"]["plan_code"]
          slug: string
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          cover_url?: string | null
          created_at?: string
          description: string
          id?: string
          location?: string | null
          minimum_plan?: Database["public"]["Enums"]["plan_code"]
          slug: string
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          cover_url?: string | null
          created_at?: string
          description?: string
          id?: string
          location?: string | null
          minimum_plan?: Database["public"]["Enums"]["plan_code"]
          slug?: string
          starts_at?: string | null
          title?: string
          updated_at?: string
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
      pain_reports: {
        Row: {
          associated_symptoms: string | null
          classification: string
          created_at: string
          history: string | null
          id: string
          intensity: number
          location: string
          onset: string | null
          professional_followup: string | null
          provoking_movement: string | null
          radiation: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          session_id: string | null
          status: string
          user_id: string
          workout_exercise_id: string | null
        }
        Insert: {
          associated_symptoms?: string | null
          classification: string
          created_at?: string
          history?: string | null
          id?: string
          intensity: number
          location: string
          onset?: string | null
          professional_followup?: string | null
          provoking_movement?: string | null
          radiation?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          session_id?: string | null
          status?: string
          user_id: string
          workout_exercise_id?: string | null
        }
        Update: {
          associated_symptoms?: string | null
          classification?: string
          created_at?: string
          history?: string | null
          id?: string
          intensity?: number
          location?: string
          onset?: string | null
          professional_followup?: string | null
          provoking_movement?: string | null
          radiation?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          session_id?: string | null
          status?: string
          user_id?: string
          workout_exercise_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pain_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pain_reports_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pain_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pain_reports_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      perception_actions: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          day_number: number
          id: string
          instruction: string
          scan_id: string
          title: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          day_number: number
          id?: string
          instruction: string
          scan_id: string
          title: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          day_number?: number
          id?: string
          instruction?: string
          scan_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "perception_actions_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "perception_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      perception_findings: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          impact: string
          recommendation: string
          scan_id: string
          sort_order: number
          title: string
          type: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          impact: string
          recommendation: string
          scan_id: string
          sort_order?: number
          title: string
          type: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          impact?: string
          recommendation?: string
          scan_id?: string
          sort_order?: number
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "perception_findings_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "perception_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      perception_scan_images: {
        Row: {
          created_at: string
          id: string
          image_type: string
          mime_type: string
          scan_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_type: string
          mime_type: string
          scan_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          image_type?: string
          mime_type?: string
          scan_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "perception_scan_images_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "perception_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      perception_scans: {
        Row: {
          admin_note: string | null
          appearance_score: number | null
          body_language_score: number | null
          coherence_score: number | null
          context: string
          context_score: number | null
          created_at: string
          desired_signals: string[]
          error_message: string | null
          id: string
          model: string | null
          new_scan_requested_at: string | null
          next_action: string | null
          posture_score: number | null
          presence_score: number | null
          priority: string | null
          provider: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["perception_scan_status"]
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          appearance_score?: number | null
          body_language_score?: number | null
          coherence_score?: number | null
          context: string
          context_score?: number | null
          created_at?: string
          desired_signals?: string[]
          error_message?: string | null
          id?: string
          model?: string | null
          new_scan_requested_at?: string | null
          next_action?: string | null
          posture_score?: number | null
          presence_score?: number | null
          priority?: string | null
          provider?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["perception_scan_status"]
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          appearance_score?: number | null
          body_language_score?: number | null
          coherence_score?: number | null
          context?: string
          context_score?: number | null
          created_at?: string
          desired_signals?: string[]
          error_message?: string | null
          id?: string
          model?: string | null
          new_scan_requested_at?: string | null
          next_action?: string | null
          posture_score?: number | null
          presence_score?: number | null
          priority?: string | null
          provider?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["perception_scan_status"]
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perception_scans_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perception_scans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_protocol_slots: {
        Row: {
          active: boolean
          analysis_tags: string[]
          camera_orientation: string | null
          created_at: string
          framing_rules: string | null
          id: string
          instruction_text: string | null
          pose_code: string | null
          protocol_code: string
          public_name: string | null
          reference_asset_url: string | null
          required: boolean
          slot_number: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          analysis_tags?: string[]
          camera_orientation?: string | null
          created_at?: string
          framing_rules?: string | null
          id?: string
          instruction_text?: string | null
          pose_code?: string | null
          protocol_code?: string
          public_name?: string | null
          reference_asset_url?: string | null
          required?: boolean
          slot_number: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          analysis_tags?: string[]
          camera_orientation?: string | null
          created_at?: string
          framing_rules?: string | null
          id?: string
          instruction_text?: string | null
          pose_code?: string | null
          protocol_code?: string
          public_name?: string | null
          reference_asset_url?: string | null
          required?: boolean
          slot_number?: number
          updated_at?: string
        }
        Relationships: []
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
      product_usage_events: {
        Row: {
          entity_id: string | null
          event_type: string
          id: string
          metadata: Json
          module: string
          occurred_at: string
          user_id: string
        }
        Insert: {
          entity_id?: string | null
          event_type: string
          id?: string
          metadata?: Json
          module: string
          occurred_at?: string
          user_id: string
        }
        Update: {
          entity_id?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          module?: string
          occurred_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_usage_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      select_benefits: {
        Row: {
          active: boolean
          coupon_code: string | null
          created_at: string
          description: string
          ends_at: string | null
          external_url: string | null
          id: string
          minimum_plan: Database["public"]["Enums"]["plan_code"]
          partner_id: string
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          coupon_code?: string | null
          created_at?: string
          description: string
          ends_at?: string | null
          external_url?: string | null
          id?: string
          minimum_plan?: Database["public"]["Enums"]["plan_code"]
          partner_id: string
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          coupon_code?: string | null
          created_at?: string
          description?: string
          ends_at?: string | null
          external_url?: string | null
          id?: string
          minimum_plan?: Database["public"]["Enums"]["plan_code"]
          partner_id?: string
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "select_benefits_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "select_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      select_collections: {
        Row: {
          active: boolean
          cover_url: string | null
          created_at: string
          description: string
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          cover_url?: string | null
          created_at?: string
          description: string
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          cover_url?: string | null
          created_at?: string
          description?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      select_partners: {
        Row: {
          active: boolean
          category: string
          cover_url: string | null
          created_at: string
          description: string
          featured: boolean
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
          why_selected: string
        }
        Insert: {
          active?: boolean
          category: string
          cover_url?: string | null
          created_at?: string
          description: string
          featured?: boolean
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
          why_selected: string
        }
        Update: {
          active?: boolean
          category?: string
          cover_url?: string | null
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
          why_selected?: string
        }
        Relationships: []
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
      technique_videos: {
        Row: {
          client_id: string
          created_at: string
          cues: string[]
          exercise_id: string | null
          id: string
          mime_type: string
          next_check: string | null
          observations: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          storage_path: string
          workout_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          cues?: string[]
          exercise_id?: string | null
          id?: string
          mime_type: string
          next_check?: string | null
          observations?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_path: string
          workout_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          cues?: string[]
          exercise_id?: string | null
          id?: string
          mime_type?: string
          next_check?: string | null
          observations?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          storage_path?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technique_videos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technique_videos_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technique_videos_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technique_videos_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      training_decisions: {
        Row: {
          ai_original: Json | null
          alteration: string | null
          alteration_reason: string | null
          approval_status: string
          author_id: string | null
          author_type: string
          client_id: string
          confidence: number | null
          created_at: string
          cycle_id: string | null
          decision: string
          decision_date: string
          decision_type: string
          evidence_ids: Json
          final_version: Json | null
          id: string
          program_id: string | null
          reason: string
          review_date: string | null
          supersedes_decision_id: string | null
        }
        Insert: {
          ai_original?: Json | null
          alteration?: string | null
          alteration_reason?: string | null
          approval_status?: string
          author_id?: string | null
          author_type: string
          client_id: string
          confidence?: number | null
          created_at?: string
          cycle_id?: string | null
          decision: string
          decision_date?: string
          decision_type: string
          evidence_ids?: Json
          final_version?: Json | null
          id?: string
          program_id?: string | null
          reason: string
          review_date?: string | null
          supersedes_decision_id?: string | null
        }
        Update: {
          ai_original?: Json | null
          alteration?: string | null
          alteration_reason?: string | null
          approval_status?: string
          author_id?: string | null
          author_type?: string
          client_id?: string
          confidence?: number | null
          created_at?: string
          cycle_id?: string | null
          decision?: string
          decision_date?: string
          decision_type?: string
          evidence_ids?: Json
          final_version?: Json | null
          id?: string
          program_id?: string | null
          reason?: string
          review_date?: string | null
          supersedes_decision_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_decisions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_decisions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_decisions_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycle_strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_decisions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_decisions_supersedes_decision_id_fkey"
            columns: ["supersedes_decision_id"]
            isOneToOne: false
            referencedRelation: "training_decisions"
            referencedColumns: ["id"]
          },
        ]
      }
      training_imports: {
        Row: {
          client_id: string
          created_at: string
          cycle_id: string | null
          error_message: string | null
          extracted_text: string | null
          id: string
          mime_type: string
          original_filename: string
          parsed_payload: Json | null
          program_id: string | null
          status: string
          storage_path: string
          updated_at: string
          uploaded_by: string
          version: number
        }
        Insert: {
          client_id: string
          created_at?: string
          cycle_id?: string | null
          error_message?: string | null
          extracted_text?: string | null
          id?: string
          mime_type: string
          original_filename: string
          parsed_payload?: Json | null
          program_id?: string | null
          status?: string
          storage_path: string
          updated_at?: string
          uploaded_by: string
          version?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          cycle_id?: string | null
          error_message?: string | null
          extracted_text?: string | null
          id?: string
          mime_type?: string
          original_filename?: string
          parsed_payload?: Json | null
          program_id?: string | null
          status?: string
          storage_path?: string
          updated_at?: string
          uploaded_by?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_imports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_imports_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycle_strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_imports_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_imports_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_knowledge_documents: {
        Row: {
          active: boolean
          content: string
          created_at: string
          created_by: string | null
          document_type: string
          id: string
          is_primary: boolean
          storage_path: string | null
          title: string
          updated_at: string
          version: string | null
        }
        Insert: {
          active?: boolean
          content: string
          created_at?: string
          created_by?: string | null
          document_type: string
          id?: string
          is_primary?: boolean
          storage_path?: string | null
          title: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          active?: boolean
          content?: string
          created_at?: string
          created_by?: string | null
          document_type?: string
          id?: string
          is_primary?: boolean
          storage_path?: string | null
          title?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_knowledge_documents_created_by_fkey"
            columns: ["created_by"]
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
          activity: string | null
          attention_level: string | null
          body_feeling: string | null
          cardio: string | null
          completed_workouts: number
          created_at: string
          decision_classification: string | null
          did_not_work: string | null
          energy: number | null
          event: string | null
          focus: number | null
          free_text: string | null
          hydration: number | null
          id: string
          next_obstacle: string | null
          nutrition: number | null
          pain: number | null
          planned_workouts: number
          productivity: number | null
          professional_performance: number | null
          quality_time: number | null
          relationships: number | null
          schedule_change: string | null
          schedule_control: number | null
          sleep: number | null
          sleep_hours: number | null
          stress: number | null
          travel: string | null
          user_id: string
          week_start: string
          weight_kg: number | null
          worked: string | null
        }
        Insert: {
          activity?: string | null
          attention_level?: string | null
          body_feeling?: string | null
          cardio?: string | null
          completed_workouts?: number
          created_at?: string
          decision_classification?: string | null
          did_not_work?: string | null
          energy?: number | null
          event?: string | null
          focus?: number | null
          free_text?: string | null
          hydration?: number | null
          id?: string
          next_obstacle?: string | null
          nutrition?: number | null
          pain?: number | null
          planned_workouts?: number
          productivity?: number | null
          professional_performance?: number | null
          quality_time?: number | null
          relationships?: number | null
          schedule_change?: string | null
          schedule_control?: number | null
          sleep?: number | null
          sleep_hours?: number | null
          stress?: number | null
          travel?: string | null
          user_id: string
          week_start: string
          weight_kg?: number | null
          worked?: string | null
        }
        Update: {
          activity?: string | null
          attention_level?: string | null
          body_feeling?: string | null
          cardio?: string | null
          completed_workouts?: number
          created_at?: string
          decision_classification?: string | null
          did_not_work?: string | null
          energy?: number | null
          event?: string | null
          focus?: number | null
          free_text?: string | null
          hydration?: number | null
          id?: string
          next_obstacle?: string | null
          nutrition?: number | null
          pain?: number | null
          planned_workouts?: number
          productivity?: number | null
          professional_performance?: number | null
          quality_time?: number | null
          relationships?: number | null
          schedule_change?: string | null
          schedule_control?: number | null
          sleep?: number | null
          sleep_hours?: number | null
          stress?: number | null
          travel?: string | null
          user_id?: string
          week_start?: string
          weight_kg?: number | null
          worked?: string | null
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
          evidence_relation: Json
          execution_notes: string | null
          exercise_id: string
          id: string
          initial_load: number | null
          notes: string | null
          pain_rule: string | null
          priority_relation: string | null
          reason_for_inclusion: string | null
          rep_max: number | null
          rep_min: number | null
          reps: string
          rest_seconds: number
          sequence: number
          sets: number
          substitution_group_id: string | null
          target_effort: number | null
          target_effort_type: string
          target_rpe: number | null
          tempo: string | null
          video_reference: string | null
          workout_id: string
        }
        Insert: {
          evidence_relation?: Json
          execution_notes?: string | null
          exercise_id: string
          id?: string
          initial_load?: number | null
          notes?: string | null
          pain_rule?: string | null
          priority_relation?: string | null
          reason_for_inclusion?: string | null
          rep_max?: number | null
          rep_min?: number | null
          reps?: string
          rest_seconds?: number
          sequence?: number
          sets?: number
          substitution_group_id?: string | null
          target_effort?: number | null
          target_effort_type?: string
          target_rpe?: number | null
          tempo?: string | null
          video_reference?: string | null
          workout_id: string
        }
        Update: {
          evidence_relation?: Json
          execution_notes?: string | null
          exercise_id?: string
          id?: string
          initial_load?: number | null
          notes?: string | null
          pain_rule?: string | null
          priority_relation?: string | null
          reason_for_inclusion?: string | null
          rep_max?: number | null
          rep_min?: number | null
          reps?: string
          rest_seconds?: number
          sequence?: number
          sets?: number
          substitution_group_id?: string | null
          target_effort?: number | null
          target_effort_type?: string
          target_rpe?: number | null
          tempo?: string | null
          video_reference?: string | null
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
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          creation_source: string
          cycle_id: string | null
          ends_on: string | null
          id: string
          notes: string | null
          objective: string | null
          parent_program_id: string | null
          primary_goal: string | null
          published_at: string | null
          rejected_at: string | null
          starts_on: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          version: number
          why_this_plan: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          creation_source?: string
          cycle_id?: string | null
          ends_on?: string | null
          id?: string
          notes?: string | null
          objective?: string | null
          parent_program_id?: string | null
          primary_goal?: string | null
          published_at?: string | null
          rejected_at?: string | null
          starts_on?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          version?: number
          why_this_plan?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          creation_source?: string
          cycle_id?: string | null
          ends_on?: string | null
          id?: string
          notes?: string | null
          objective?: string | null
          parent_program_id?: string | null
          primary_goal?: string | null
          published_at?: string | null
          rejected_at?: string | null
          starts_on?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          version?: number
          why_this_plan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_programs_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_programs_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycle_strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_programs_parent_program_id_fkey"
            columns: ["parent_program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
            referencedColumns: ["id"]
          },
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
          client_comment: string | null
          completed_at: string | null
          completion_percent: number | null
          duration_minutes: number | null
          exercise_log: Json
          id: string
          notes: string | null
          session_pain: number | null
          session_rpe: number | null
          started_at: string
          status: string
          user_id: string
          workout_id: string | null
        }
        Insert: {
          client_comment?: string | null
          completed_at?: string | null
          completion_percent?: number | null
          duration_minutes?: number | null
          exercise_log?: Json
          id?: string
          notes?: string | null
          session_pain?: number | null
          session_rpe?: number | null
          started_at?: string
          status?: string
          user_id: string
          workout_id?: string | null
        }
        Update: {
          client_comment?: string | null
          completed_at?: string | null
          completion_percent?: number | null
          duration_minutes?: number | null
          exercise_log?: Json
          id?: string
          notes?: string | null
          session_pain?: number | null
          session_rpe?: number | null
          started_at?: string
          status?: string
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
          objective: string | null
          program_id: string
          sequence: number
          variant_type: string
        }
        Insert: {
          created_at?: string
          estimated_minutes?: number | null
          id?: string
          name: string
          notes?: string | null
          objective?: string | null
          program_id: string
          sequence?: number
          variant_type?: string
        }
        Update: {
          created_at?: string
          estimated_minutes?: number | null
          id?: string
          name?: string
          notes?: string | null
          objective?: string | null
          program_id?: string
          sequence?: number
          variant_type?: string
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
        | "content"
        | "analyst"
      perception_scan_status:
        | "processing"
        | "ai_completed"
        | "reviewed"
        | "failed"
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
        "content",
        "analyst",
      ],
      perception_scan_status: [
        "processing",
        "ai_completed",
        "reviewed",
        "failed",
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
