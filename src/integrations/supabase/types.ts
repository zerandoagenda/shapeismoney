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
          note_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          note: string
          note_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          note?: string
          note_type?: string
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
          operation_key: string | null
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
          operation_key?: string | null
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
          operation_key?: string | null
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
          operation_key: string | null
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
          operation_key?: string | null
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
          operation_key?: string | null
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
      anamnesis_analyses: {
        Row: {
          adherence_factors: Json
          anamnesis_id: string
          attempts: number
          client_id: string
          completed_at: string | null
          confidence: number | null
          created_at: string
          error_message: string | null
          evidence_used: Json
          executive_context: string | null
          id: string
          limiting_factors: Json
          missing_information: Json
          model: string | null
          model_version: string | null
          primary_objective: string | null
          readiness: Json
          recovery_factors: Json
          safety_level: string
          safety_notes: Json
          started_at: string | null
          status: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          adherence_factors?: Json
          anamnesis_id: string
          attempts?: number
          client_id: string
          completed_at?: string | null
          confidence?: number | null
          created_at?: string
          error_message?: string | null
          evidence_used?: Json
          executive_context?: string | null
          id?: string
          limiting_factors?: Json
          missing_information?: Json
          model?: string | null
          model_version?: string | null
          primary_objective?: string | null
          readiness?: Json
          recovery_factors?: Json
          safety_level?: string
          safety_notes?: Json
          started_at?: string | null
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          adherence_factors?: Json
          anamnesis_id?: string
          attempts?: number
          client_id?: string
          completed_at?: string | null
          confidence?: number | null
          created_at?: string
          error_message?: string | null
          evidence_used?: Json
          executive_context?: string | null
          id?: string
          limiting_factors?: Json
          missing_information?: Json
          model?: string | null
          model_version?: string | null
          primary_objective?: string | null
          readiness?: Json
          recovery_factors?: Json
          safety_level?: string
          safety_notes?: Json
          started_at?: string | null
          status?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anamnesis_analyses_anamnesis_id_fkey"
            columns: ["anamnesis_id"]
            isOneToOne: true
            referencedRelation: "client_anamnesis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamnesis_analyses_client_id_fkey"
            columns: ["client_id"]
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
      client_activations: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string
          current_stage: Database["public"]["Enums"]["activation_stage"]
          id: string
          metadata: Json
          next_action: string
          next_action_owner: string
          payment_reference: string | null
          plan: Database["public"]["Enums"]["plan_code"]
          responsible_id: string | null
          source: string
          stage_started_at: string
          started_at: string
          status: Database["public"]["Enums"]["client_activation_status"]
          target_delivery_at: string
          updated_at: string
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string
          current_stage?: Database["public"]["Enums"]["activation_stage"]
          id?: string
          metadata?: Json
          next_action?: string
          next_action_owner?: string
          payment_reference?: string | null
          plan: Database["public"]["Enums"]["plan_code"]
          responsible_id?: string | null
          source: string
          stage_started_at?: string
          started_at?: string
          status?: Database["public"]["Enums"]["client_activation_status"]
          target_delivery_at: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string
          current_stage?: Database["public"]["Enums"]["activation_stage"]
          id?: string
          metadata?: Json
          next_action?: string
          next_action_owner?: string
          payment_reference?: string | null
          plan?: Database["public"]["Enums"]["plan_code"]
          responsible_id?: string | null
          source?: string
          stage_started_at?: string
          started_at?: string
          status?: Database["public"]["Enums"]["client_activation_status"]
          target_delivery_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_activations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_activations_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_anamnesis: {
        Row: {
          client_id: string
          completed_at: string | null
          created_at: string
          created_by: string
          id: string
          sections: Json
          source: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          client_id: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          id?: string
          sections?: Json
          source?: string
          status?: string
          updated_at?: string
          version: number
        }
        Update: {
          client_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          id?: string
          sections?: Json
          source?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_anamnesis_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_anamnesis_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      client_habits: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          best_streak: number
          client_id: string
          created_at: string
          current_streak: number
          description: string | null
          ends_on: string | null
          id: string
          period: string
          pillar: string
          source: string
          starts_on: string | null
          status: string
          target_frequency: number
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          best_streak?: number
          client_id: string
          created_at?: string
          current_streak?: number
          description?: string | null
          ends_on?: string | null
          id?: string
          period?: string
          pillar: string
          source?: string
          starts_on?: string | null
          status?: string
          target_frequency: number
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          best_streak?: number
          client_id?: string
          created_at?: string
          current_streak?: number
          description?: string | null
          ends_on?: string | null
          id?: string
          period?: string
          pillar?: string
          source?: string
          starts_on?: string | null
          status?: string
          target_frequency?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_habits_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_habits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_milestones: {
        Row: {
          client_id: string
          client_shared: boolean
          created_at: string
          evidence: string
          id: string
          milestone_type: string
          recognized_at: string
          recognized_by: string
          title: string
        }
        Insert: {
          client_id: string
          client_shared?: boolean
          created_at?: string
          evidence: string
          id?: string
          milestone_type: string
          recognized_at?: string
          recognized_by: string
          title: string
        }
        Update: {
          client_id?: string
          client_shared?: boolean
          created_at?: string
          evidence?: string
          id?: string
          milestone_type?: string
          recognized_at?: string
          recognized_by?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_milestones_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_milestones_recognized_by_fkey"
            columns: ["recognized_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_operation_events: {
        Row: {
          activation_id: string | null
          actor_type: string
          client_id: string
          event_type: string
          id: string
          metadata: Json
          occurred_at: string
          summary: string
        }
        Insert: {
          activation_id?: string | null
          actor_type: string
          client_id: string
          event_type: string
          id?: string
          metadata?: Json
          occurred_at?: string
          summary: string
        }
        Update: {
          activation_id?: string | null
          actor_type?: string
          client_id?: string
          event_type?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_operation_events_activation_id_fkey"
            columns: ["activation_id"]
            isOneToOne: false
            referencedRelation: "client_activations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_operation_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_relationships: {
        Row: {
          attention_level: string
          attention_reason: string | null
          client_id: string
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          current_commitment: string | null
          id: string
          journey_evidence: Json
          journey_phase: string
          last_activity: string | null
          last_checkin: string | null
          last_human_contact: string | null
          next_action: string | null
          next_action_due_at: string | null
          protocol_status: Database["public"]["Enums"]["protocol_status"] | null
          relationship_state: string
          responsible_user: string | null
          state_evidence: Json
          updated_at: string
        }
        Insert: {
          attention_level?: string
          attention_reason?: string | null
          client_id: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          current_commitment?: string | null
          id?: string
          journey_evidence?: Json
          journey_phase?: string
          last_activity?: string | null
          last_checkin?: string | null
          last_human_contact?: string | null
          next_action?: string | null
          next_action_due_at?: string | null
          protocol_status?:
            | Database["public"]["Enums"]["protocol_status"]
            | null
          relationship_state?: string
          responsible_user?: string | null
          state_evidence?: Json
          updated_at?: string
        }
        Update: {
          attention_level?: string
          attention_reason?: string | null
          client_id?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          current_commitment?: string | null
          id?: string
          journey_evidence?: Json
          journey_phase?: string
          last_activity?: string | null
          last_checkin?: string | null
          last_human_contact?: string | null
          next_action?: string | null
          next_action_due_at?: string | null
          protocol_status?:
            | Database["public"]["Enums"]["protocol_status"]
            | null
          relationship_state?: string
          responsible_user?: string | null
          state_evidence?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_relationships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_relationships_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_relationships_responsible_user_fkey"
            columns: ["responsible_user"]
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
      community_comments: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          body: string
          created_at: string
          id: string
          image_mime_type: string | null
          image_path: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          image_mime_type?: string | null
          image_path?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          image_mime_type?: string | null
          image_path?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_saves: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_saves_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contextual_comments: {
        Row: {
          author_id: string
          client_id: string
          context_id: string | null
          context_type: string
          created_at: string
          id: string
          message: string
          parent_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          author_id: string
          client_id: string
          context_id?: string | null
          context_type: string
          created_at?: string
          id?: string
          message: string
          parent_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          client_id?: string
          context_id?: string | null
          context_type?: string
          created_at?: string
          id?: string
          message?: string
          parent_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contextual_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contextual_comments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contextual_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "contextual_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contextual_comments_resolved_by_fkey"
            columns: ["resolved_by"]
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
          ai_original: Json | null
          approved_at: string | null
          approved_by: string | null
          behavior_goal: string | null
          capacity_goal: string | null
          client_id: string
          contingency_rules: Json
          created_at: string
          created_by: string
          final_version: Json | null
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
          ai_original?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          behavior_goal?: string | null
          capacity_goal?: string | null
          client_id: string
          contingency_rules?: Json
          created_at?: string
          created_by: string
          final_version?: Json | null
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
          ai_original?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          behavior_goal?: string | null
          capacity_goal?: string | null
          client_id?: string
          contingency_rules?: Json
          created_at?: string
          created_by?: string
          final_version?: Json | null
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
            foreignKeyName: "cycle_strategies_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
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
      exercise_import_batches: {
        Row: {
          completed_at: string | null
          created_at: string
          cursor_url: string | null
          discovered_count: number
          duplicate_count: number
          error_count: number
          error_summary: string | null
          id: string
          imported_count: number
          processed_count: number
          requested_by: string
          source_catalog_url: string
          source_name: string
          started_at: string | null
          status: string
          updated_at: string
          updated_count: number
          without_video_count: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          cursor_url?: string | null
          discovered_count?: number
          duplicate_count?: number
          error_count?: number
          error_summary?: string | null
          id?: string
          imported_count?: number
          processed_count?: number
          requested_by: string
          source_catalog_url: string
          source_name: string
          started_at?: string | null
          status?: string
          updated_at?: string
          updated_count?: number
          without_video_count?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          cursor_url?: string | null
          discovered_count?: number
          duplicate_count?: number
          error_count?: number
          error_summary?: string | null
          id?: string
          imported_count?: number
          processed_count?: number
          requested_by?: string
          source_catalog_url?: string
          source_name?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          updated_count?: number
          without_video_count?: number
        }
        Relationships: []
      }
      exercise_import_items: {
        Row: {
          batch_id: string
          created_at: string
          error_message: string | null
          exercise_id: string | null
          id: string
          image_storage_path: string | null
          processed_at: string | null
          raw_metadata: Json
          source_external_id: string | null
          source_name: string | null
          source_url: string
          status: string
          updated_at: string
          video_storage_path: string | null
        }
        Insert: {
          batch_id: string
          created_at?: string
          error_message?: string | null
          exercise_id?: string | null
          id?: string
          image_storage_path?: string | null
          processed_at?: string | null
          raw_metadata?: Json
          source_external_id?: string | null
          source_name?: string | null
          source_url: string
          status?: string
          updated_at?: string
          video_storage_path?: string | null
        }
        Update: {
          batch_id?: string
          created_at?: string
          error_message?: string | null
          exercise_id?: string | null
          id?: string
          image_storage_path?: string | null
          processed_at?: string | null
          raw_metadata?: Json
          source_external_id?: string | null
          source_name?: string | null
          source_url?: string
          status?: string
          updated_at?: string
          video_storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_import_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "exercise_import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_import_items_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_library"
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
          common_errors_list: string[]
          created_at: string
          description: string | null
          difficulty: string | null
          equipment: string | null
          equipment_options: string[]
          execution_cues: string[]
          fatigue_cost: string | null
          id: string
          image_storage_path: string | null
          image_url: string | null
          import_status: string
          joint_considerations: string[]
          last_synced_at: string | null
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
          source_attribution: string | null
          source_authorized: boolean
          source_external_id: string | null
          source_image_url: string | null
          source_name: string | null
          source_url: string | null
          source_video_url: string | null
          stability_requirement: string | null
          technique: string | null
          video_storage_path: string | null
          video_url: string | null
        }
        Insert: {
          active?: boolean
          aliases?: string[]
          alternatives?: string[]
          avatar_animation_url?: string | null
          category?: string | null
          common_errors?: string | null
          common_errors_list?: string[]
          created_at?: string
          description?: string | null
          difficulty?: string | null
          equipment?: string | null
          equipment_options?: string[]
          execution_cues?: string[]
          fatigue_cost?: string | null
          id?: string
          image_storage_path?: string | null
          image_url?: string | null
          import_status?: string
          joint_considerations?: string[]
          last_synced_at?: string | null
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
          source_attribution?: string | null
          source_authorized?: boolean
          source_external_id?: string | null
          source_image_url?: string | null
          source_name?: string | null
          source_url?: string | null
          source_video_url?: string | null
          stability_requirement?: string | null
          technique?: string | null
          video_storage_path?: string | null
          video_url?: string | null
        }
        Update: {
          active?: boolean
          aliases?: string[]
          alternatives?: string[]
          avatar_animation_url?: string | null
          category?: string | null
          common_errors?: string | null
          common_errors_list?: string[]
          created_at?: string
          description?: string | null
          difficulty?: string | null
          equipment?: string | null
          equipment_options?: string[]
          execution_cues?: string[]
          fatigue_cost?: string | null
          id?: string
          image_storage_path?: string | null
          image_url?: string | null
          import_status?: string
          joint_considerations?: string[]
          last_synced_at?: string | null
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
          source_attribution?: string | null
          source_authorized?: boolean
          source_external_id?: string | null
          source_image_url?: string | null
          source_name?: string | null
          source_url?: string | null
          source_video_url?: string | null
          stability_requirement?: string | null
          technique?: string | null
          video_storage_path?: string | null
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
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience_id?: string
          id?: string
          status?: string
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
      food_log_entries: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          estimate_confirmed: boolean
          fat: number | null
          food_name: string
          id: string
          logged_at: string
          meal_name: string
          protein: number | null
          quantity: number | null
          source: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          estimate_confirmed?: boolean
          fat?: number | null
          food_name: string
          id?: string
          logged_at?: string
          meal_name: string
          protein?: number | null
          quantity?: number | null
          source?: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          estimate_confirmed?: boolean
          fat?: number | null
          food_name?: string
          id?: string
          logged_at?: string
          meal_name?: string
          protein?: number | null
          quantity?: number | null
          source?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_log_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_logs: {
        Row: {
          client_id: string
          completed: boolean
          created_at: string
          habit_id: string
          id: string
          log_date: string
          note: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          completed?: boolean
          created_at?: string
          habit_id: string
          id?: string
          log_date?: string
          note?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          completed?: boolean
          created_at?: string
          habit_id?: string
          id?: string
          log_date?: string
          note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "client_habits"
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
          capacity: number | null
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
          capacity?: number | null
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
          capacity?: number | null
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
      mindset_signals: {
        Row: {
          client_id: string
          confidence: number | null
          created_at: string
          description: string
          evidence: Json
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          signal_type: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          confidence?: number | null
          created_at?: string
          description: string
          evidence?: Json
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          signal_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          confidence?: number | null
          created_at?: string
          description?: string
          evidence?: Json
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          signal_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mindset_signals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mindset_signals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_reviews: {
        Row: {
          confidence: number
          consistency: number
          created_at: string
          energy: number
          id: string
          month_start: string
          notes: string | null
          productivity: number
          professional_performance: number
          quality_time: number
          revenue: number | null
          schedule_control: number
          sim_score: number | null
          sleep: number
          stress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence: number
          consistency: number
          created_at?: string
          energy: number
          id?: string
          month_start: string
          notes?: string | null
          productivity: number
          professional_performance: number
          quality_time: number
          revenue?: number | null
          schedule_control: number
          sim_score?: number | null
          sleep: number
          stress: number
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number
          consistency?: number
          created_at?: string
          energy?: number
          id?: string
          month_start?: string
          notes?: string | null
          productivity?: number
          professional_performance?: number
          quality_time?: number
          revenue?: number | null
          schedule_control?: number
          sim_score?: number | null
          sleep?: number
          stress?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_generation_jobs: {
        Row: {
          activation_id: string | null
          attempts: number
          client_id: string
          completed_at: string | null
          created_at: string
          error_code: string | null
          error_message: string | null
          id: string
          last_attempt_at: string | null
          missing_prerequisites: Json
          plan_id: string | null
          readiness_snapshot: Json
          started_at: string | null
          status: Database["public"]["Enums"]["nutrition_generation_status"]
          trigger_source: string
          updated_at: string
        }
        Insert: {
          activation_id?: string | null
          attempts?: number
          client_id: string
          completed_at?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          missing_prerequisites?: Json
          plan_id?: string | null
          readiness_snapshot?: Json
          started_at?: string | null
          status?: Database["public"]["Enums"]["nutrition_generation_status"]
          trigger_source: string
          updated_at?: string
        }
        Update: {
          activation_id?: string | null
          attempts?: number
          client_id?: string
          completed_at?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          missing_prerequisites?: Json
          plan_id?: string | null
          readiness_snapshot?: Json
          started_at?: string | null
          status?: Database["public"]["Enums"]["nutrition_generation_status"]
          trigger_source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_generation_jobs_activation_id_fkey"
            columns: ["activation_id"]
            isOneToOne: false
            referencedRelation: "client_activations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_generation_jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_generation_jobs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plans"
            referencedColumns: ["id"]
          },
        ]
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
          purpose: string | null
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
          purpose?: string | null
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
          purpose?: string | null
          reference_asset_url?: string | null
          required?: boolean
          slot_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      pillar_insights: {
        Row: {
          advance: string | null
          anamnesis_analysis_id: string | null
          bottleneck: string | null
          client_id: string
          components: Json
          created_at: string
          id: string
          next_action: string | null
          pillar: string
          score: number | null
          score_id: string | null
          sources: Json
        }
        Insert: {
          advance?: string | null
          anamnesis_analysis_id?: string | null
          bottleneck?: string | null
          client_id: string
          components?: Json
          created_at?: string
          id?: string
          next_action?: string | null
          pillar: string
          score?: number | null
          score_id?: string | null
          sources?: Json
        }
        Update: {
          advance?: string | null
          anamnesis_analysis_id?: string | null
          bottleneck?: string | null
          client_id?: string
          components?: Json
          created_at?: string
          id?: string
          next_action?: string | null
          pillar?: string
          score?: number | null
          score_id?: string | null
          sources?: Json
        }
        Relationships: [
          {
            foreignKeyName: "pillar_insights_anamnesis_analysis_id_fkey"
            columns: ["anamnesis_analysis_id"]
            isOneToOne: false
            referencedRelation: "anamnesis_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pillar_insights_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pillar_insights_score_id_fkey"
            columns: ["score_id"]
            isOneToOne: false
            referencedRelation: "sim_scores"
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
      relationship_alerts: {
        Row: {
          attention_level: string
          client_id: string
          created_at: string
          due_at: string
          id: string
          owner_id: string
          priority: string
          reason: string
          resolved_at: string | null
          source: string
          source_entity_id: string | null
          status: string
          suggested_action: string | null
          updated_at: string
        }
        Insert: {
          attention_level: string
          client_id: string
          created_at?: string
          due_at: string
          id?: string
          owner_id: string
          priority: string
          reason: string
          resolved_at?: string | null
          source: string
          source_entity_id?: string | null
          status?: string
          suggested_action?: string | null
          updated_at?: string
        }
        Update: {
          attention_level?: string
          client_id?: string
          created_at?: string
          due_at?: string
          id?: string
          owner_id?: string
          priority?: string
          reason?: string
          resolved_at?: string | null
          source?: string
          source_entity_id?: string | null
          status?: string
          suggested_action?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_alerts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_alerts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_commitments: {
        Row: {
          action: string
          client_id: string
          client_shared: boolean
          completed_at: string | null
          confirmation_criterion: string
          created_at: string
          created_by: string
          deadline: string
          dose_or_frequency: string
          id: string
          intervention_id: string | null
          responsible_id: string
          review_date: string
          status: string
          updated_at: string
        }
        Insert: {
          action: string
          client_id: string
          client_shared?: boolean
          completed_at?: string | null
          confirmation_criterion: string
          created_at?: string
          created_by: string
          deadline: string
          dose_or_frequency: string
          id?: string
          intervention_id?: string | null
          responsible_id: string
          review_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          action?: string
          client_id?: string
          client_shared?: boolean
          completed_at?: string | null
          confirmation_criterion?: string
          created_at?: string
          created_by?: string
          deadline?: string
          dose_or_frequency?: string
          id?: string
          intervention_id?: string | null
          responsible_id?: string
          review_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_commitments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_commitments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_commitments_intervention_id_fkey"
            columns: ["intervention_id"]
            isOneToOne: false
            referencedRelation: "relationship_interventions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_commitments_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_contacts: {
        Row: {
          channel: string
          client_id: string
          contact_type: string
          contacted_at: string
          context: string | null
          created_at: string
          created_by: string
          facts: string
          id: string
          intervention_summary: string | null
          next_action: string | null
          next_action_due_at: string | null
          objective: string
          outcome: string | null
          responsible_id: string
          status: string
          updated_at: string
        }
        Insert: {
          channel: string
          client_id: string
          contact_type: string
          contacted_at?: string
          context?: string | null
          created_at?: string
          created_by: string
          facts: string
          id?: string
          intervention_summary?: string | null
          next_action?: string | null
          next_action_due_at?: string | null
          objective: string
          outcome?: string | null
          responsible_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          channel?: string
          client_id?: string
          contact_type?: string
          contacted_at?: string
          context?: string | null
          created_at?: string
          created_by?: string
          facts?: string
          id?: string
          intervention_summary?: string | null
          next_action?: string | null
          next_action_due_at?: string | null
          objective?: string
          outcome?: string | null
          responsible_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_contacts_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_evidence: {
        Row: {
          client_id: string
          created_at: string
          created_by: string
          evidence_type: string
          fact: string
          id: string
          observed_at: string
          source: string
          source_entity_id: string | null
          weight: number
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by: string
          evidence_type: string
          fact: string
          id?: string
          observed_at?: string
          source: string
          source_entity_id?: string | null
          weight: number
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string
          evidence_type?: string
          fact?: string
          id?: string
          observed_at?: string
          source?: string
          source_entity_id?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "relationship_evidence_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_evidence_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_hypotheses: {
        Row: {
          client_id: string
          confidence: number
          created_at: string
          created_by: string | null
          created_by_type: string
          evidence_ids: Json
          gap_type: string
          hypothesis: string
          id: string
          is_predominant: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          confidence: number
          created_at?: string
          created_by?: string | null
          created_by_type?: string
          evidence_ids?: Json
          gap_type: string
          hypothesis: string
          id?: string
          is_predominant?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          confidence?: number
          created_at?: string
          created_by?: string | null
          created_by_type?: string
          evidence_ids?: Json
          gap_type?: string
          hypothesis?: string
          id?: string
          is_predominant?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_hypotheses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_hypotheses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_hypotheses_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_interventions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attention_level: string
          channel: string
          client_id: string
          created_at: string
          created_by: string
          draft_message: string | null
          evidence_ids: Json
          executed_at: string | null
          final_message: string | null
          id: string
          journey_phase: string
          last_commitment: string | null
          objective: string
          possible_questions: Json
          predominant_gap: string | null
          prisma_annotate: string
          prisma_interpret: string
          prisma_mobilize: string
          prisma_perceive: string
          prisma_recognize: string
          prisma_simplify: string
          recent_data: Json
          relationship_state: string
          review_date: string
          smallest_next_step: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          attention_level: string
          channel: string
          client_id: string
          created_at?: string
          created_by: string
          draft_message?: string | null
          evidence_ids?: Json
          executed_at?: string | null
          final_message?: string | null
          id?: string
          journey_phase: string
          last_commitment?: string | null
          objective: string
          possible_questions?: Json
          predominant_gap?: string | null
          prisma_annotate: string
          prisma_interpret: string
          prisma_mobilize: string
          prisma_perceive: string
          prisma_recognize: string
          prisma_simplify: string
          recent_data?: Json
          relationship_state: string
          review_date: string
          smallest_next_step: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          attention_level?: string
          channel?: string
          client_id?: string
          created_at?: string
          created_by?: string
          draft_message?: string | null
          evidence_ids?: Json
          executed_at?: string | null
          final_message?: string | null
          id?: string
          journey_phase?: string
          last_commitment?: string | null
          objective?: string
          possible_questions?: Json
          predominant_gap?: string | null
          prisma_annotate?: string
          prisma_interpret?: string
          prisma_mobilize?: string
          prisma_perceive?: string
          prisma_recognize?: string
          prisma_simplify?: string
          recent_data?: Json
          relationship_state?: string
          review_date?: string
          smallest_next_step?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_interventions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_interventions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_interventions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_sla_policies: {
        Row: {
          active: boolean
          created_at: string
          id: string
          priority: string
          product_key: string
          response_minutes: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          priority: string
          product_key: string
          response_minutes: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          priority?: string
          product_key?: string
          response_minutes?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relationship_sla_policies_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      relationship_timeline: {
        Row: {
          actor_id: string | null
          client_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json
          occurred_at: string
          source: string
          source_entity_id: string | null
          summary: string
          title: string
          visibility: string
        }
        Insert: {
          actor_id?: string | null
          client_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          occurred_at?: string
          source: string
          source_entity_id?: string | null
          summary: string
          title: string
          visibility?: string
        }
        Update: {
          actor_id?: string | null
          client_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          source?: string
          source_entity_id?: string | null
          summary?: string
          title?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_timeline_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationship_timeline_client_id_fkey"
            columns: ["client_id"]
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
      training_generation_jobs: {
        Row: {
          activation_id: string | null
          attempts: number
          client_id: string
          created_at: string
          cycle_id: string | null
          error_code: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          last_attempt_at: string | null
          last_error: string | null
          missing_prerequisites: Json
          program_id: string | null
          readiness_snapshot: Json
          started_at: string | null
          status: Database["public"]["Enums"]["training_generation_status"]
          trigger_source: string
          updated_at: string
        }
        Insert: {
          activation_id?: string | null
          attempts?: number
          client_id: string
          created_at?: string
          cycle_id?: string | null
          error_code?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          last_attempt_at?: string | null
          last_error?: string | null
          missing_prerequisites?: Json
          program_id?: string | null
          readiness_snapshot?: Json
          started_at?: string | null
          status?: Database["public"]["Enums"]["training_generation_status"]
          trigger_source: string
          updated_at?: string
        }
        Update: {
          activation_id?: string | null
          attempts?: number
          client_id?: string
          created_at?: string
          cycle_id?: string | null
          error_code?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          last_attempt_at?: string | null
          last_error?: string | null
          missing_prerequisites?: Json
          program_id?: string | null
          readiness_snapshot?: Json
          started_at?: string | null
          status?: Database["public"]["Enums"]["training_generation_status"]
          trigger_source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_generation_jobs_activation_id_fkey"
            columns: ["activation_id"]
            isOneToOne: false
            referencedRelation: "client_activations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_generation_jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_generation_jobs_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycle_strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_generation_jobs_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "workout_programs"
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
          import_source: string
          mime_type: string | null
          original_filename: string | null
          parsed_payload: Json | null
          program_id: string | null
          source_text: string | null
          status: string
          storage_path: string | null
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
          import_source?: string
          mime_type?: string | null
          original_filename?: string | null
          parsed_payload?: Json | null
          program_id?: string | null
          source_text?: string | null
          status?: string
          storage_path?: string | null
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
          import_source?: string
          mime_type?: string | null
          original_filename?: string | null
          parsed_payload?: Json | null
          program_id?: string | null
          source_text?: string | null
          status?: string
          storage_path?: string | null
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
      activate_client_plan_transaction: {
        Args: {
          _actor_id: string
          _client_id: string
          _payment_reference?: string
          _plan: Database["public"]["Enums"]["plan_code"]
          _source: string
        }
        Returns: {
          active_subscription_id: string
          previous_plan: Database["public"]["Enums"]["plan_code"]
        }[]
      }
    }
    Enums: {
      activation_stage:
        | "PAYMENT_CONFIRMED"
        | "ONBOARDING_REQUIRED"
        | "BASELINE_REQUIRED"
        | "PHOTO_PROTOCOL_REQUIRED"
        | "ASSESSMENT_PROCESSING"
        | "ASSESSMENT_REVIEW"
        | "CYCLE_STRATEGY"
        | "TRAINING_GENERATION"
        | "TRAINING_REVIEW"
        | "NUTRITION_BUILD"
        | "FINAL_REVIEW"
        | "READY_TO_PUBLISH"
        | "ACTIVE_PROTOCOL"
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
        | "relationship"
        | "nutrition"
        | "specialist"
        | "beta_member"
        | "member"
      client_activation_status:
        | "ACTIVE"
        | "BLOCKED"
        | "READY"
        | "COMPLETED"
        | "CANCELLED"
      nutrition_generation_status:
        | "WAITING_DATA"
        | "READY"
        | "GENERATING"
        | "DRAFT_READY"
        | "HUMAN_REVIEW"
        | "PUBLISHED"
        | "FAILED"
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
      training_generation_status:
        | "WAITING_PREREQUISITES"
        | "READY"
        | "GENERATING"
        | "NEEDS_LIBRARY"
        | "DRAFT_READY"
        | "HUMAN_REVIEW"
        | "APPROVED"
        | "PUBLISHED"
        | "FAILED"
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
      activation_stage: [
        "PAYMENT_CONFIRMED",
        "ONBOARDING_REQUIRED",
        "BASELINE_REQUIRED",
        "PHOTO_PROTOCOL_REQUIRED",
        "ASSESSMENT_PROCESSING",
        "ASSESSMENT_REVIEW",
        "CYCLE_STRATEGY",
        "TRAINING_GENERATION",
        "TRAINING_REVIEW",
        "NUTRITION_BUILD",
        "FINAL_REVIEW",
        "READY_TO_PUBLISH",
        "ACTIVE_PROTOCOL",
      ],
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
        "relationship",
        "nutrition",
        "specialist",
        "beta_member",
        "member",
      ],
      client_activation_status: [
        "ACTIVE",
        "BLOCKED",
        "READY",
        "COMPLETED",
        "CANCELLED",
      ],
      nutrition_generation_status: [
        "WAITING_DATA",
        "READY",
        "GENERATING",
        "DRAFT_READY",
        "HUMAN_REVIEW",
        "PUBLISHED",
        "FAILED",
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
      training_generation_status: [
        "WAITING_PREREQUISITES",
        "READY",
        "GENERATING",
        "NEEDS_LIBRARY",
        "DRAFT_READY",
        "HUMAN_REVIEW",
        "APPROVED",
        "PUBLISHED",
        "FAILED",
      ],
    },
  },
} as const
