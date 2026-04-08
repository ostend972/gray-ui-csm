"use client"

import { useMemo, useState } from "react"
import {
  IconBrandSlack,
  IconCheck,
  IconChevronDown,
  IconCircleDot,
  IconClock,
  IconDots,
  IconExternalLink,
  IconLink,
  IconLock,
  IconMail,
  IconMessage2,
  IconMoodSmile,
  IconPaperclip,
  IconPhoto,
  IconSparkles,
  IconTicket,
  IconX,
} from "@tabler/icons-react"

import { TicketPriorityIndicator } from "@/components/tickets/ticket-priority-indicator"
import { TicketTag } from "@/components/tickets/ticket-tag"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { currentUser } from "@/lib/current-user"
import type {
  Ticket,
  TicketAssignee,
  TicketCategoryKey,
  TicketChannel,
  TicketPriority,
  TicketQueueStatus,
} from "@/lib/tickets/types"
import { cn } from "@/lib/utils"

type TicketDrawerProps = {
  open: boolean
  ticket: Ticket | null
  assigneeOptions: TicketAssignee[]
  draftMessage: string
  onDraftMessageChange: (nextDraft: string) => void
  onOpenChange: (open: boolean) => void
  onUpdateTicket: (ticketId: string, updater: (ticket: Ticket) => Ticket) => void
  onSubmitMessage: (ticketId: string) => void
}

const statusOptions: TicketQueueStatus[] = [
  "open",
  "pending",
  "resolved",
  "closed",
]
const priorityOptions: TicketPriority[] = [
  "urgent",
  "high",
  "medium",
  "low",
  "todo",
]
const categoryOptions: TicketCategoryKey[] = [
  "billing",
  "technical",
  "account-login",
  "subscription",
  "other",
]
const channelOptions: TicketChannel[] = ["email", "chat", "slack"]

const statusLabel: Record<TicketQueueStatus, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
}

const categoryLabel: Record<TicketCategoryKey, string> = {
  billing: "Billing",
  technical: "Technical",
  "account-login": "Access",
  subscription: "Subscription",
  other: "Other",
}

const channelLabel: Record<TicketChannel, string> = {
  email: "Email",
  chat: "Chat",
  slack: "Slack",
}

function getStatusIcon(status: TicketQueueStatus) {
  if (status === "open") return <IconCircleDot className="size-4" />
  if (status === "pending") return <IconClock className="size-4" />
  if (status === "resolved") return <IconCheck className="size-4" />
  return <IconLock className="size-4" />
}

function getChannelIcon(channel: TicketChannel) {
  if (channel === "email") return <IconMail className="size-4" />
  if (channel === "slack") return <IconBrandSlack className="size-4" />
  return <IconMessage2 className="size-4" />
}

function getTicketInitials(ticket: Ticket) {
  const name = ticket.assignee?.name

  if (!name) return "--"

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function buildTriageSummary(ticket: Ticket) {
  const urgency =
    ticket.priority === "urgent" || ticket.health === "breached" || ticket.pastDue
      ? "high urgency"
      : ticket.priority === "high" || ticket.health === "warning"
        ? "elevated urgency"
        : "normal urgency"

  const summary = `${categoryLabel[ticket.category]} request from ${channelLabel[
    ticket.channel
  ].toLowerCase()} with ${urgency}.`

  const nextStep = ticket.queueStatus === "pending"
    ? "Follow up with the customer and unblock the next decision."
    : ticket.queueStatus === "resolved"
      ? "Confirm resolution and close the loop with the customer."
      : ticket.assignee
        ? `Coordinate next response with ${ticket.assignee.name}.`
        : "Assign an owner and send the first clear response."

  const latestPreview =
    ticket.channel === "email"
      ? "Customer shared context and expects a concrete next step in the next reply."
      : ticket.channel === "slack"
        ? "Conversation is active and needs a fast operational answer to maintain momentum."
        : "Customer is waiting in chat and likely benefits from a concise, actionable response."

  return {
    summary,
    nextStep,
    latestPreview,
  }
}

function MetadataField({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </div>
      {children}
    </div>
  )
}

function SelectFieldButton({ children }: { children?: React.ReactNode }) {
  return (
    <Button
      variant="outline"
      className="h-10 w-full justify-between rounded-2xl border-border/70 bg-background px-3 font-normal"
    >
      <span className="inline-flex min-w-0 items-center gap-2 truncate">
        {children}
      </span>
      <IconChevronDown className="size-4 text-muted-foreground" />
    </Button>
  )
}

export function TicketDrawer({
  open,
  ticket,
  ...props
}: TicketDrawerProps) {
  const [expandedByTicketId, setExpandedByTicketId] = useState<
    Record<string, boolean>
  >({})
  const isExpanded = ticket ? expandedByTicketId[ticket.id] ?? false : false

  return (
    <Sheet open={open} onOpenChange={props.onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(
          "data-[side=right]:top-0 data-[side=right]:right-0 data-[side=right]:bottom-0 data-[side=right]:h-dvh data-[side=right]:w-screen data-[side=right]:rounded-none data-[side=right]:border-l data-[side=right]:border-border/70 p-0 sm:data-[side=right]:top-3 sm:data-[side=right]:right-3 sm:data-[side=right]:bottom-3 sm:data-[side=right]:h-[calc(100dvh-1.5rem)] sm:data-[side=right]:max-w-none sm:data-[side=right]:w-[min(calc(100vw-1.5rem),clamp(32rem,34vw,44rem))] sm:data-[side=right]:rounded-[28px] sm:data-[side=right]:border sm:shadow-2xl",
          isExpanded &&
            "lg:data-[side=right]:w-[min(calc(100vw-2rem),clamp(44rem,46vw,60rem))]"
        )}
      >
        {ticket ? (
          <TicketDrawerPanel
            key={ticket.id}
            ticket={ticket}
            isExpanded={isExpanded}
            onExpandedChange={(nextExpanded) =>
              setExpandedByTicketId((currentState) => ({
                ...currentState,
                [ticket.id]: nextExpanded,
              }))
            }
            {...props}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function TicketDrawerPanel({
  ticket,
  isExpanded,
  onExpandedChange,
  assigneeOptions,
  draftMessage,
  onDraftMessageChange,
  onOpenChange,
  onUpdateTicket,
  onSubmitMessage,
}: Omit<TicketDrawerProps, "open" | "ticket"> & {
  ticket: Ticket
  isExpanded: boolean
  onExpandedChange: (nextExpanded: boolean) => void
}) {
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false)

  const triageSummary = useMemo(() => buildTriageSummary(ticket), [ticket])

  const sortedAssigneeOptions = useMemo(() => {
    const nextOptions = [...assigneeOptions]

    if (!nextOptions.some((assignee) => assignee.name === currentUser.name)) {
      nextOptions.unshift({
        name: currentUser.name,
        avatarUrl: currentUser.avatar,
      })
    }

    return nextOptions.sort((left, right) => left.name.localeCompare(right.name))
  }, [assigneeOptions])

  const updateTicket = (updater: (currentTicket: Ticket) => Ticket) => {
    onUpdateTicket(ticket.id, updater)
  }

  const handleAssignToMe = () => {
    updateTicket((currentTicket) => ({
      ...currentTicket,
      assignee: {
        name: currentUser.name,
        avatarUrl: currentUser.avatar,
      },
      mine: true,
    }))
  }

  const handleResolve = () => {
    updateTicket((currentTicket) => ({
      ...currentTicket,
      queueStatus: "resolved",
    }))
  }

  return (
    <div
      className="flex h-full flex-col overflow-hidden bg-background/95 backdrop-blur-xl"
    >
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/95 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/60 text-foreground shadow-sm">
              <IconTicket className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                  {ticket.ticketNumber}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground">
                  {getStatusIcon(ticket.queueStatus)}
                  {statusLabel[ticket.queueStatus]}
                </span>
                <TicketTag tone={ticket.health} className="h-6" />
                {ticket.escalated ? (
                  <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-300">
                    Escalated
                  </span>
                ) : null}
                {ticket.pastDue ? (
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                    Past due
                  </span>
                ) : null}
              </div>
              <SheetTitle className="line-clamp-2 text-[1.05rem] leading-7 font-semibold text-foreground">
                {ticket.subject}
              </SheetTitle>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-2xl"
              aria-label={isExpanded ? "Collapse drawer" : "Expand drawer"}
              onClick={() => onExpandedChange(!isExpanded)}
            >
              <IconExternalLink className="size-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="rounded-2xl"
                    aria-label="More ticket actions"
                  />
                }
              >
                <IconDots className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-52">
                <DropdownMenuItem onClick={handleAssignToMe}>
                  Assign to me
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleResolve}>
                  Resolve ticket
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    updateTicket((currentTicket) => ({
                      ...currentTicket,
                      assignee: undefined,
                      mine: false,
                    }))
                  }
                >
                  Unassign
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-2xl"
              aria-label="Close drawer"
              onClick={() => onOpenChange(false)}
            >
              <IconX className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-2xl"
            onClick={handleAssignToMe}
          >
            Assign to me
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-2xl"
            onClick={handleResolve}
          >
            Resolve
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <section className="rounded-[24px] border border-border/70 bg-muted/25 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <IconSparkles className="size-4 text-muted-foreground" />
                Triage Summary
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-2xl"
              aria-label={
                isSummaryCollapsed ? "Expand triage summary" : "Collapse triage summary"
              }
              onClick={() =>
                setIsSummaryCollapsed((currentValue) => !currentValue)
              }
            >
              <IconChevronDown
                className={cn(
                  "size-4 transition-transform",
                  isSummaryCollapsed && "-rotate-90"
                )}
              />
            </Button>
          </div>

          {!isSummaryCollapsed ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-[20px] border border-border/60 bg-background px-4 py-3">
                <div className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                  Issue Summary
                </div>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {triageSummary.summary}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] border border-border/60 bg-background px-4 py-3">
                  <div className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                    Assignee
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {ticket.assignee?.name ?? "Unassigned"}
                  </p>
                </div>
                <div className="rounded-[20px] border border-border/60 bg-background px-4 py-3">
                  <div className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                    Category
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {categoryLabel[ticket.category]}
                  </p>
                </div>
              </div>

              <div className="rounded-[20px] border border-border/60 bg-background px-4 py-3">
                <div className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                  Next Step
                </div>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {triageSummary.nextStep}
                </p>
              </div>

              <div className="rounded-[20px] border border-dashed border-border/70 bg-background/80 px-4 py-3">
                <div className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                  Latest Message Preview
                </div>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {triageSummary.latestPreview}
                </p>
              </div>
            </div>
          ) : null}
        </section>

        <section className="mt-5 space-y-4 rounded-[24px] border border-border/70 bg-card p-4 shadow-sm">
          <div>
            <div className="text-sm font-medium text-foreground">Main Content</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Inline ticket metadata updates apply immediately to the current board or table behind the drawer.
            </p>
          </div>

          <MetadataField label="Subject">
            <Input
              value={ticket.subject}
              onChange={(event) => {
                const nextSubject = event.target.value
                updateTicket((currentTicket) => ({
                  ...currentTicket,
                  subject: nextSubject,
                }))
              }}
              className="h-11 rounded-2xl border-border/70 bg-background"
            />
          </MetadataField>

          <MetadataField label="Status">
            <div className="grid grid-cols-2 gap-2 rounded-[22px] border border-border/70 bg-muted/25 p-1 sm:grid-cols-4">
              {statusOptions.map((status) => {
                const isActive = ticket.queueStatus === status

                return (
                  <Button
                    key={status}
                    type="button"
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "justify-start rounded-[18px] px-3",
                      !isActive && "text-muted-foreground"
                    )}
                    onClick={() =>
                      updateTicket((currentTicket) => ({
                        ...currentTicket,
                        queueStatus: status,
                      }))
                    }
                  >
                    {getStatusIcon(status)}
                    {statusLabel[status]}
                  </Button>
                )
              })}
            </div>
          </MetadataField>

          <div className="grid gap-4 sm:grid-cols-2">
            <MetadataField label="Priority">
              <DropdownMenu>
                <DropdownMenuTrigger render={<SelectFieldButton />}>
                  <TicketPriorityIndicator priority={ticket.priority} />
                  <span className="capitalize">{ticket.priority}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-44">
                  <DropdownMenuRadioGroup
                    value={ticket.priority}
                    onValueChange={(value) =>
                      updateTicket((currentTicket) => ({
                        ...currentTicket,
                        priority: value as TicketPriority,
                      }))
                    }
                  >
                    {priorityOptions.map((priority) => (
                      <DropdownMenuRadioItem key={priority} value={priority}>
                        <span className="inline-flex items-center gap-2">
                          <TicketPriorityIndicator priority={priority} />
                          <span className="capitalize">{priority}</span>
                        </span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </MetadataField>

            <MetadataField label="Assignee">
              <DropdownMenu>
                <DropdownMenuTrigger render={<SelectFieldButton />}>
                  <Avatar className="size-6 border bg-background" size="sm">
                    {ticket.assignee?.avatarUrl ? (
                      <AvatarImage
                        src={ticket.assignee.avatarUrl}
                        alt={ticket.assignee.name}
                      />
                    ) : null}
                    <AvatarFallback>{getTicketInitials(ticket)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {ticket.assignee?.name ?? "Unassigned"}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-52">
                  <DropdownMenuItem
                    onClick={() =>
                      updateTicket((currentTicket) => ({
                        ...currentTicket,
                        assignee: undefined,
                        mine: false,
                      }))
                    }
                  >
                    Unassigned
                  </DropdownMenuItem>
                  {sortedAssigneeOptions.map((assignee) => (
                    <DropdownMenuItem
                      key={assignee.name}
                      onClick={() =>
                        updateTicket((currentTicket) => ({
                          ...currentTicket,
                          assignee,
                          mine: assignee.name === currentUser.name,
                        }))
                      }
                    >
                      {assignee.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </MetadataField>

            <MetadataField label="Category">
              <DropdownMenu>
                <DropdownMenuTrigger render={<SelectFieldButton />}>
                  <span>{categoryLabel[ticket.category]}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-44">
                  <DropdownMenuRadioGroup
                    value={ticket.category}
                    onValueChange={(value) =>
                      updateTicket((currentTicket) => ({
                        ...currentTicket,
                        category: value as TicketCategoryKey,
                      }))
                    }
                  >
                    {categoryOptions.map((category) => (
                      <DropdownMenuRadioItem key={category} value={category}>
                        {categoryLabel[category]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </MetadataField>

            <MetadataField label="Channel">
              <DropdownMenu>
                <DropdownMenuTrigger render={<SelectFieldButton />}>
                  {getChannelIcon(ticket.channel)}
                  <span>{channelLabel[ticket.channel]}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-44">
                  <DropdownMenuRadioGroup
                    value={ticket.channel}
                    onValueChange={(value) =>
                      updateTicket((currentTicket) => ({
                        ...currentTicket,
                        channel: value as TicketChannel,
                      }))
                    }
                  >
                    {channelOptions.map((channel) => (
                      <DropdownMenuRadioItem key={channel} value={channel}>
                        <span className="inline-flex items-center gap-2">
                          {getChannelIcon(channel)}
                          <span>{channelLabel[channel]}</span>
                        </span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </MetadataField>
          </div>
        </section>
      </div>

      <footer className="sticky bottom-0 z-20 border-t border-border/70 bg-background/95 px-5 py-4 backdrop-blur-xl">
        <div className="rounded-[24px] border border-border/70 bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-foreground">Message</div>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span>From</span>
                <span className="rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-foreground">
                  {currentUser.email}
                </span>
              </div>
            </div>
          </div>

          <textarea
            value={draftMessage}
            onChange={(event) => onDraftMessageChange(event.target.value)}
            placeholder="Write the next customer-facing reply or internal context here..."
            className="mt-4 min-h-32 w-full resize-none rounded-[20px] border border-border/70 bg-background px-4 py-3 text-sm leading-6 outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          />

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-2xl"
            >
              <IconMoodSmile className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-2xl"
            >
              <IconPaperclip className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-2xl"
            >
              <IconLink className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-2xl"
            >
              <IconPhoto className="size-4" />
            </Button>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              className="rounded-2xl"
              disabled={draftMessage.trim().length === 0}
              onClick={() => onSubmitMessage(ticket.id)}
            >
              Send reply
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
