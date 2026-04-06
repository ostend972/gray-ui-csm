import {
  IconCheck,
  IconCircleDot,
  IconClock,
  IconDots,
  IconLock,
  IconPlus,
} from "@tabler/icons-react"

import { TicketCard } from "@/components/tickets/ticket-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Ticket, TicketQueueStatus } from "@/lib/tickets/types"
import { cn } from "@/lib/utils"

type TicketColumnProps = {
  columnKey: TicketQueueStatus
  title: string
  tickets: Ticket[]
  draggingTicketId?: string | null
  isDropTarget?: boolean
  onTicketDragStart?: (
    ticketId: string,
    event: React.DragEvent<HTMLDivElement>
  ) => void
  onTicketDragEnd?: () => void
  onColumnDragOver?: (event: React.DragEvent<HTMLElement>) => void
  onColumnDrop?: (event: React.DragEvent<HTMLElement>) => void
}

function getColumnIcon(columnKey: TicketQueueStatus) {
  if (columnKey === "open") {
    return <IconCircleDot className="size-4 text-muted-foreground" />
  }

  if (columnKey === "pending") {
    return <IconClock className="size-4 text-muted-foreground" />
  }

  if (columnKey === "resolved") {
    return <IconCheck className="size-4 text-muted-foreground" />
  }

  return <IconLock className="size-4 text-muted-foreground" />
}

export function TicketColumn({
  columnKey,
  title,
  tickets,
  draggingTicketId,
  isDropTarget,
  onTicketDragStart,
  onTicketDragEnd,
  onColumnDragOver,
  onColumnDrop,
}: TicketColumnProps) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-2 rounded-2xl border border-transparent bg-muted/40 p-2 transition-colors",
        isDropTarget ? "border-primary/50 bg-primary/5" : ""
      )}
      onDragOver={onColumnDragOver}
      onDrop={onColumnDrop}
      data-column-key={columnKey}
    >
      <header className="flex h-9 items-center justify-between">
        <div className="flex items-center gap-1.5">
          {getColumnIcon(columnKey)}
          <span className="text-xs font-medium text-foreground">{title}</span>
          <Badge
            variant="ghost"
            className="h-4 px-0 text-xs text-muted-foreground"
          >
            {tickets.length}
          </Badge>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon-sm" className="size-7 rounded-xl">
            <IconPlus className="size-4" />
            <span className="sr-only">Create ticket in {title}</span>
          </Button>
          <Button variant="ghost" size="icon-sm" className="size-7 rounded-xl">
            <IconDots className="size-4" />
            <span className="sr-only">Column options for {title}</span>
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2 pb-2">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            draggable
            isDragging={draggingTicketId === ticket.id}
            onDragStart={(event) => onTicketDragStart?.(ticket.id, event)}
            onDragEnd={onTicketDragEnd}
          />
        ))}
      </div>
    </section>
  )
}
