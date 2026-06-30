import TicketToolbar from "./TicketToolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const tickets = [
  {
    id: "TK-001",
    issue: "Projector not working",
    requester: "John Doe",
    laboratory: "Lab 1",
    status: "Pending",
    date: "Jun 29, 2026",
  },
  {
    id: "TK-002",
    issue: "Computer won't boot",
    requester: "Jane Smith",
    laboratory: "Lab 2",
    status: "Ongoing",
    date: "Jun 28, 2026",
  },
  {
    id: "TK-003",
    issue: "Internet connection lost",
    requester: "Michael Reyes",
    laboratory: "Lab 3",
    status: "Resolved",
    date: "Jun 27, 2026",
  },
];

export default function ManageTicket() {
  return (
    <div className="flex flex-col p-3 w-full gap-4">
      <TicketToolbar />

      <div className="rounded-2xl border bg-white overflow-hidden border-primary-color">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-accent">Ticket ID</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Laboratory</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  {ticket.id}
                </TableCell>

                <TableCell>{ticket.issue}</TableCell>

                <TableCell>{ticket.requester}</TableCell>

                <TableCell>{ticket.laboratory}</TableCell>

                <TableCell>
                  <span
                    className={`
                      rounded-full px-3 py-1 text-xs font-medium
                      ${
                        ticket.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : ticket.status === "Ongoing"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }
                    `}
                  >
                    {ticket.status}
                  </span>
                </TableCell>

                <TableCell>{ticket.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}