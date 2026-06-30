/**
 * Shared Type Definitions for Last-Minute Life Saver
 */

export type Priority = 'Critical' | 'Medium' | 'Low';
export type Category = 'Academic' | 'Work' | 'Personal' | 'Financial' | 'Social';

export interface Task {
  id: string;
  task_name: string;
  deadline: string; // YYYY-MM-DD HH:MM:SS
  estimated_duration_minutes: number;
  priority: Priority;
  category: Category;
  completed: boolean;
  xp_awarded?: number;
  verification_image?: string;
  micro_steps?: MicroStep[];
  reality_check?: RealityCheck;
}

export interface MicroStep {
  step_number: number;
  actionable_instruction: string;
  duration_minutes: number;
}

export interface RealityCheck {
  immediate_consequence: string;
  downstream_benefit: string;
  schedule_stress_impact: 'Safe' | 'Manageable' | 'Critical';
  conversational_reality_check: string;
  harm_reduction_compromise: string;
}

export interface SurvivalScheduleItem {
  start_time: string;
  end_time: string;
  action: string;
}

export interface CrisisPlan {
  crisis_assessment: string;
  survival_schedule: SurvivalScheduleItem[];
  commander_parting_words: string;
}

export interface NudgeRequest {
  task_name: string;
  time_remaining: string;
  tier: 'Supportive' | 'Firm Warning' | 'Panic Attack';
}

export interface VerificationResult {
  verified: boolean;
  confidence_score: number;
  inspector_feedback: string;
  xp_awarded: number;
}

export interface UserStats {
  total_xp: number;
  completed_tasks_count: number;
  critical_tasks_resolved: number;
  streak_days: number;
}
