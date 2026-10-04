export interface AssignmentEntry {
  date: string;
  locations: string[];
  is_completed: boolean;
  summary: string;
}

export interface AssignmentReport {
  technician: { id: number; first_name: string; last_name: string };
  assignment_report: AssignmentEntry[];
}
