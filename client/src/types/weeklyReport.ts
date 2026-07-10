export type ApiWeeklyReport = {
  id: number;
  report_code: string;
  title: string;
  content: {
    technician_name?: string;
    ai_content_summary?: string;
    repair_log_summary?: Record<string, number>;
  };
  status: string;
  created_at: string;
  updated_at: string;
  technician: number;
};

export type WeeklyReport = {
  id: number;
  reportCode: string;
  title: string;
  technicianName: string;
  summary: string;
  repairLogSummary: Record<string, number>;
  status: string;
  createdAt: string;
  updatedAt: string;
  technicianId: number;
};
