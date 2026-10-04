import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Download, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchDashboardUsers } from "@/components/Admin/Dashboard/dashboardData";
import { ADMIN_USER_DIRECTORY_QUERY_KEY } from "@/hooks/useAdminUserDirectory";
import { buildApiUrl, createApiError, privateFetch } from "@/lib/api";
import type { AssignmentReport as AssignmentReportData } from "@/types/assignmentReport";
import { exportAssignmentReport, getCompletedAssignments, isAssignmentReport } from "@/utils/assignmentReport";
import { appToast } from "@/utils/appToast";

const months = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(2000, index, 1)),
}));

export default function AssignmentReport() {
  const [open, setOpen] = useState(false);
  const [technicianId, setTechnicianId] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const usersQuery = useQuery({
    queryKey: ADMIN_USER_DIRECTORY_QUERY_KEY,
    queryFn: fetchDashboardUsers,
    enabled: open,
    staleTime: 30_000,
  });
  const technicians = (usersQuery.data ?? []).filter((user) => user.role.toLowerCase() === "technician");
  const reportQuery = useQuery({
    queryKey: ["admin-assignment-report", technicianId, month],
    enabled: open && technicianId !== "",
    queryFn: async ({ signal }): Promise<AssignmentReportData> => {
      const params = new URLSearchParams({ technician_id: technicianId, month_date: String(month) });
      const response = await privateFetch(buildApiUrl(`/api/reports/assignment/?${params}`), { signal });
      const data: unknown = await response.json();
      if (!response.ok) {
        const detail = typeof data === "object" && data !== null && "detail" in data && typeof data.detail === "string" ? data.detail : "Failed to load assignments.";
        throw createApiError(response.status, detail);
      }
      if (!isAssignmentReport(data)) throw new Error("Invalid assignment report response.");
      return data;
    },
  });
  const entries = reportQuery.data ? getCompletedAssignments(reportQuery.data) : [];
  const exportReport = () => {
    if (!reportQuery.data || reportQuery.isFetching) return;
    try {
      exportAssignmentReport(reportQuery.data, month);
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : "Failed to export the assignment form.");
    }
  };

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <Button variant="outline" className="h-[42px] rounded-xl bg-white"><ClipboardList size={16} />Assignment Form</Button>
    </DialogTrigger>
    <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>Technician Assignment Form</DialogTitle>
        <DialogDescription>Monthly completed assignments</DialogDescription>
      </DialogHeader>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5 font-medium">Technician
          <select value={technicianId} onChange={(event) => setTechnicianId(event.target.value)} disabled={usersQuery.isLoading || usersQuery.isError}
            className="mt-1.5 h-10 w-full rounded-lg border border-input bg-white px-3 font-normal">
            <option value="">{usersQuery.isLoading ? "Loading technicians..." : "Select technician"}</option>
            {technicians.map((user) => <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>)}
          </select>
        </label>
        <label className="space-y-1.5 font-medium">Month
          <select value={month} onChange={(event) => setMonth(Number(event.target.value))} className="mt-1.5 h-10 w-full rounded-lg border border-input bg-white px-3 font-normal">
            {months.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>
      {usersQuery.isError && <div role="alert" className="text-red-600">Failed to load technicians. <button type="button" className="underline" onClick={() => void usersQuery.refetch()}>Retry</button></div>}
      {reportQuery.isFetching ? <div role="status" className="flex items-center justify-center gap-2 py-10"><LoaderCircle size={18} className="animate-spin" />Loading assignments...</div>
        : reportQuery.isError ? <div role="alert" className="py-6 text-red-600">{reportQuery.error.message} <button type="button" className="underline" onClick={() => void reportQuery.refetch()}>Retry</button></div>
        : technicianId === "" ? <p className="py-10 text-center text-muted-foreground">Select a technician.</p>
        : entries.length === 0 ? <p className="py-10 text-center text-muted-foreground">No completed assignments for this month.</p>
        : <div className="min-h-0 overflow-auto rounded-lg border">
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Tasks</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{entries.map((entry, index) => <TableRow key={`${entry.date}-${index}`}>
              <TableCell className="align-top whitespace-nowrap">{entry.date}</TableCell>
              <TableCell className="min-w-48 max-w-md whitespace-normal align-top">{entry.summary || "-"}</TableCell>
              <TableCell className="whitespace-normal align-top">{entry.locations.join(", ")}</TableCell>
              <TableCell className="align-top"><span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">Completed</span></TableCell>
            </TableRow>)}</TableBody>
          </Table>
        </div>}
      <div className="flex justify-end border-t pt-3">
        <Button onClick={exportReport} disabled={entries.length === 0 || reportQuery.isFetching || reportQuery.isError} className="primary-bg-color text-white"><Download size={16} />Export PDF</Button>
      </div>
    </DialogContent>
  </Dialog>;
}
