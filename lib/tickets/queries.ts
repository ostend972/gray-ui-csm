import { createClient } from "@/lib/supabase/server"
import type {
  Ticket,
  TicketCategoryKey,
  TicketChannel,
  TicketHealth,
  TicketPriority,
  TicketQueueStatus,
} from "@/lib/tickets/types"

type TicketViewRow = {
  id: string
  number: number
  subject: string
  description: string | null
  status: TicketQueueStatus
  priority: TicketPriority
  channel: TicketChannel
  category: TicketCategoryKey
  tags: string[] | null
  escalated: boolean
  due_at: string | null
  created_at: string
  updated_at: string
  assignee_id: string | null
  assignee_name: string | null
  assignee_email: string | null
  assignee_avatar: string | null
  customer_id: string | null
  customer_name: string | null
  customer_email: string | null
  account_id: string | null
  account_name: string | null
  past_due: boolean
  effective_health: TicketHealth
}

function mapRow(row: TicketViewRow, currentUserId: string | null): Ticket {
  return {
    id: row.id,
    ticketNumber: `#-${String(row.number).padStart(3, "0")}`,
    subject: row.subject,
    queueStatus: row.status,
    boardOrder: row.number,
    health: row.effective_health,
    channel: row.channel,
    trend: "flat",
    assignee: row.assignee_id
      ? {
          name: row.assignee_name ?? row.assignee_email ?? "Unknown",
          email: row.assignee_email ?? undefined,
          avatarUrl: row.assignee_avatar ?? undefined,
        }
      : undefined,
    requester: row.customer_id
      ? {
          name: row.customer_name ?? row.customer_email ?? "Customer",
          email: row.customer_email ?? undefined,
        }
      : undefined,
    tags: row.tags ?? [],
    category: row.category,
    priority: row.priority,
    mine: !!currentUserId && row.assignee_id === currentUserId,
    escalated: row.escalated,
    pastDue: row.past_due,
  }
}

export async function getTickets(): Promise<Ticket[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from("ticket_view")
    .select("*")
    .order("number", { ascending: true })
  if (error) {
    console.error("[getTickets]", error.message)
    return []
  }
  return (data as TicketViewRow[]).map((row) => mapRow(row, user?.id ?? null))
}
