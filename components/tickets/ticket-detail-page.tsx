"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  IconArrowLeft,
  IconBook2,
  IconChevronDown,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheck,
  IconCircleDashed,
  IconDots,
  IconInfoCircle,
  IconMicrophone,
  IconMoodSmile,
  IconPaperclip,
  IconPhoto,
  IconPlus,
  IconSearch,
  IconSend,
  IconTicket,
  IconUsers,
} from "@tabler/icons-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TicketPriorityIndicator } from "@/components/tickets/ticket-priority-indicator"
import { TicketTag } from "@/components/tickets/ticket-tag"
import { currentUser, replyFromAccounts } from "@/lib/current-user"
import type {
  Ticket,
  TicketChannel,
  TicketPriority,
  TicketQueueStatus,
} from "@/lib/tickets/types"
import type {
  TicketDetail,
  TicketDetailTab,
  TicketNote,
  TicketTask,
  TicketTimelineEvent,
  TicketTimelineItem,
  TicketTimelineMessage,
} from "@/lib/tickets/detail-data"
import { cn } from "@/lib/utils"

type TicketDetailPageProps = {
  ticket: Ticket
  detail: TicketDetail
  initialTab?: TicketDetailTab
}

const detailTabs: Array<{ value: TicketDetailTab; label: string }> = [
  { value: "conversation", label: "Conversation" },
  { value: "task", label: "Task" },
  { value: "activity", label: "Activity Logs" },
  { value: "notes", label: "Notes" },
]

type RightPanelSection = "details" | "people" | "knowledge"

const rightPanelSections: Array<{
  value: RightPanelSection
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { value: "details", label: "Ticket Details", icon: IconInfoCircle },
  { value: "people", label: "People", icon: IconUsers },
  { value: "knowledge", label: "Knowledge Base", icon: IconBook2 },
]

const statusLabel: Record<TicketQueueStatus, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
}

const statusToneClassName: Record<TicketQueueStatus, string> = {
  open: "border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300",
  pending:
    "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300",
  resolved:
    "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300",
  closed:
    "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
}

const channelLabel: Record<TicketChannel, string> = {
  email: "Email",
  chat: "Chat",
  slack: "Slack",
}

const priorityLabel: Record<TicketPriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
  todo: "Todo",
}

const macroSuggestions = [
  "Thanks for the update. I am pulling the latest account context now.",
  "I have reviewed the ticket and I am aligning the next step with the account plan.",
  "If you can share the latest customer impact, I can tighten the follow-up summary.",
  "I will send back the blocker, owner, and ETA so the CSM team can close the loop.",
]

function getInitials(name?: string) {
  if (!name) return "--"

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function getTicketNumberLabel(ticket: Ticket) {
  return ticket.ticketNumber.startsWith("#-")
    ? `#TC-${ticket.ticketNumber.slice(2)}`
    : ticket.ticketNumber
}

function getTicketTypeLabel(ticket: Ticket) {
  const ticketType = ticket.ticketType ?? "incident"

  return ticketType.charAt(0).toUpperCase() + ticketType.slice(1)
}

function getAssigneePerson(ticket: Ticket) {
  if (ticket.assignee) return ticket.assignee

  return {
    name: "Unassigned",
    email: "unassigned@opensource-demo.dev",
  }
}

function TimelineAvatar({
  person,
  className,
}: {
  person?: { name: string; avatarUrl?: string; email?: string }
  className?: string
}) {
  return (
    <Avatar className={cn("border bg-background", className)} size="lg">
      {person?.avatarUrl ? (
        <AvatarImage src={person.avatarUrl} alt={person.name} />
      ) : null}
      <AvatarFallback className="text-xs">
        {getInitials(person?.name)}
      </AvatarFallback>
    </Avatar>
  )
}

function DetailStat({
  label,
  value,
  className,
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("", className)}>
      <div className="text-xs font-medium tracking-wide text-muted-foreground">
        <span>{label}</span>
      </div>
      <div className="mt-2 text-sm font-semibold text-foreground">{value}</div>
    </div>
  )
}

function TimelineEventCard({ item }: { item: TicketTimelineEvent }) {
  const toneClassName =
    item.tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
      : item.tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
        : "border-border bg-background text-foreground"

  return (
    <div className="flex gap-3">
      <div
        className={cn(
          "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border",
          toneClassName
        )}
      >
        <IconTicket className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">{item.title}</span>
          <span className="text-muted-foreground">{item.timestamp}</span>
        </div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {item.detail}
        </p>
      </div>
    </div>
  )
}

function TimelineMessageCard({ item }: { item: TicketTimelineMessage }) {
  const isOutbound = item.direction === "outbound"

  return (
    <div className="flex gap-3">
      <TimelineAvatar person={item.author} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">
            {item.author.name}
          </span>
          <span className="text-muted-foreground">{item.timestamp}</span>
          <Badge
            variant="outline"
            className="h-5 rounded-full px-2 text-[11px]"
          >
            {channelLabel[item.channel]}
          </Badge>
          {isOutbound ? (
            <Badge
              variant="secondary"
              className="h-5 rounded-full px-2 text-[11px]"
            >
              Reply
            </Badge>
          ) : null}
        </div>
        <div
          className={cn(
            "mt-2 text-sm leading-6 text-foreground"
          )}
        >
          {item.body}
        </div>
      </div>
    </div>
  )
}

function NoteCard({ note }: { note: TicketNote }) {
  return (
    <div className="flex gap-3 rounded-2xl border bg-background/70 p-4">
      <TimelineAvatar person={note.author} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">
            {note.author.name}
          </span>
          <span className="text-muted-foreground">{note.timestamp}</span>
          <Badge
            variant="outline"
            className="h-5 rounded-full px-2 text-[11px]"
          >
            Internal
          </Badge>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {note.body}
        </p>
      </div>
    </div>
  )
}

function TaskRow({
  task,
  onToggle,
}: {
  task: TicketTask
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition hover:border-primary/30 hover:bg-primary/5",
        task.completed ? "bg-muted/40" : "bg-background"
      )}
    >
      {task.completed ? (
        <IconCircleCheck className="mt-0.5 size-5 text-emerald-600" />
      ) : (
        <IconCircleDashed className="mt-0.5 size-5 text-muted-foreground" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              "text-sm font-semibold",
              task.completed
                ? "text-muted-foreground line-through"
                : "text-foreground"
            )}
          >
            {task.title}
          </span>
          {task.completed ? (
            <Badge variant="secondary" className="rounded-full">
              Done
            </Badge>
          ) : (
            <Badge variant="outline" className="rounded-full">
              Open
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {task.detail}
        </p>
      </div>
    </button>
  )
}

export function TicketDetailPage({
  ticket,
  detail,
  initialTab = "conversation",
}: TicketDetailPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchTab = searchParams.get("tab")

  const [queueStatus, setQueueStatus] = useState<TicketQueueStatus>(
    ticket.queueStatus
  )
  const [timeline, setTimeline] = useState(detail.timeline)
  const [tasks, setTasks] = useState(detail.tasks)
  const [notes, setNotes] = useState(detail.notes)
  const [draftMessage, setDraftMessage] = useState("")
  const [noteDraft, setNoteDraft] = useState("")
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
  const [activeRightPanelSection, setActiveRightPanelSection] =
    useState<RightPanelSection>("details")
  const [replyFrom, setReplyFrom] = useState(
    replyFromAccounts[0]?.address ?? ""
  )
  const [templateQuery, setTemplateQuery] = useState("")

  const selectedReplyAccount =
    replyFromAccounts.find((account) => account.address === replyFrom) ??
    replyFromAccounts[0]

  const filteredMacros = macroSuggestions.filter((macro) =>
    macro.toLowerCase().includes(templateQuery.trim().toLowerCase())
  )

  const conversationItems = timeline.filter(
    (item) => item.kind === "message" || item.kind === "event"
  )
  const activityItems = timeline.filter((item) => item.kind === "event")

  const agent = ticket.assignee ?? {
    name: currentUser.name,
    avatarUrl: currentUser.avatar,
    email: currentUser.email,
  }

  const activeTab = detailTabs.some((tab) => tab.value === searchTab)
    ? (searchTab as TicketDetailTab)
    : initialTab

  const updateTab = (nextTab: TicketDetailTab) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.set("tab", nextTab)

    router.replace(`${pathname}?${nextSearchParams.toString()}`, {
      scroll: false,
    })
  }

  const appendTimelineEvent = (event: TicketTimelineItem) => {
    setTimeline((currentTimeline) => [...currentTimeline, event])
  }

  const handleSubmitReply = (nextStatus?: TicketQueueStatus) => {
    const trimmedDraft = draftMessage.trim()

    if (trimmedDraft) {
      appendTimelineEvent({
        id: `${ticket.id}-reply-${Date.now()}`,
        kind: "message",
        timestamp: "Now",
        direction: "outbound",
        author: agent,
        channel: ticket.channel,
        body: trimmedDraft,
      })
      setDraftMessage("")
    }

    if (nextStatus) {
      setQueueStatus(nextStatus)
      appendTimelineEvent({
        id: `${ticket.id}-status-${Date.now()}`,
        kind: "event",
        timestamp: "Now",
        title: `Ticket status changed to ${statusLabel[nextStatus]}`,
        detail: `The ticket is now marked as ${statusLabel[nextStatus].toLowerCase()}.`,
        tone:
          nextStatus === "closed" || nextStatus === "resolved"
            ? "success"
            : "neutral",
      })
    }
  }

  const handleAddInternalNote = () => {
    const trimmedNote = noteDraft.trim()
    if (!trimmedNote) return

    const nextNote: TicketNote = {
      id: `${ticket.id}-note-${Date.now()}`,
      author: agent,
      timestamp: "Now",
      body: trimmedNote,
    }

    setNotes((currentNotes) => [nextNote, ...currentNotes])
    appendTimelineEvent({
      id: `${ticket.id}-internal-note-${Date.now()}`,
      kind: "note",
      timestamp: "Now",
      author: agent,
      body: trimmedNote,
    })
    setNoteDraft("")
  }

  const handleMacroInsert = (macro: string) => {
    setDraftMessage((currentDraft) =>
      [currentDraft.trim(), macro].filter(Boolean).join("\n\n")
    )
  }

  const ticketNumberLabel = getTicketNumberLabel(ticket)
  const assignee = getAssigneePerson(ticket)
  const activeRightPanel = rightPanelSections.find(
    (section) => section.value === activeRightPanelSection
  )

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 rounded-xl px-3"
          onClick={() => router.push("/tickets")}
        >
          <IconArrowLeft className="size-4" />
          Back to Tickets
        </Button>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-9 rounded-xl"
                  aria-label="More actions"
                />
              }
            >
              <IconDots className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuItem onClick={() => updateTab("activity")}>
                View activity log
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateTab("notes")}>
                Open internal notes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/tickets")}>
                Back to ticket list
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="inline-flex overflow-hidden rounded-2xl border border-transparent">
            <Button
              type="button"
              className="rounded-r-none"
              onClick={() => handleSubmitReply("closed")}
            >
              Submit as Closed
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="default"
                    size="icon-sm"
                    className="btn-primary-chrome h-9 rounded-l-none border-l border-l-white/10 px-2"
                    aria-label="More submit actions"
                  />
                }
              >
                <IconChevronDown className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-52">
                <DropdownMenuItem onClick={() => handleSubmitReply("pending")}>
                  Submit as Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSubmitReply("resolved")}>
                  Submit as Resolved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSubmitReply(undefined)}>
                  Send reply only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <section className="shrink-0">
        <div className="space-y-3 pl-3 pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              {ticketNumberLabel}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                statusToneClassName[queueStatus]
              )}
            >
              {statusLabel[queueStatus]}
            </Badge>
            {ticket.escalated ? (
              <Badge
                variant="destructive"
                className="rounded-full px-2.5 py-1 text-[11px]"
              >
                Escalated
              </Badge>
            ) : null}
          </div>

          <h1 className="max-w-5xl text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {ticket.subject}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="inline-flex items-center gap-2">
              <span>Channel</span>
              <Badge
                variant="outline"
                className="h-5 rounded-full px-2 text-[11px]"
              >
                {channelLabel[ticket.channel]}
              </Badge>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="inline-flex items-center gap-2">
              <span>Type</span>
              <span className="font-medium text-foreground">
                {getTicketTypeLabel(ticket)}
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <TicketPriorityIndicator priority={ticket.priority} />
                Priority
              </span>
              <span className="font-medium text-foreground">
                {priorityLabel[ticket.priority]}
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="inline-flex items-center gap-2">
              <span>Account</span>
              <span className="font-medium text-foreground">
                {detail.accountName}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div
        className={cn(
          "grid min-h-0 flex-1 gap-4",
          isRightPanelOpen
            ? "xl:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)]"
            : "xl:grid-cols-[minmax(0,1fr)_3.5rem]"
        )}
      >
        <section className="min-h-0 overflow-hidden pt-10">
          <Tabs
            value={activeTab}
            onValueChange={(value) => updateTab(value as TicketDetailTab)}
            className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col"
          >
            <div className="shrink-0 border-b px-4">
              <TabsList
                variant="line"
                className="w-full justify-start gap-2 rounded-none p-0"
              >
                {detailTabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent
              value="conversation"
              className="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
            >
              <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-8">
                  {conversationItems.map((item) => {
                    if (item.kind === "message") {
                      return <TimelineMessageCard key={item.id} item={item} />
                    }

                    return <TimelineEventCard key={item.id} item={item} />
                  })}
                </div>
              </div>

              <div className="shrink-0 bg-background/95 px-6 py-5 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <TimelineAvatar
                    person={{
                      name: currentUser.name,
                      avatarUrl: currentUser.avatar,
                      email: currentUser.email,
                    }}
                  />
                  <div className="min-w-0 flex-1 overflow-hidden rounded-3xl border bg-background shadow-sm">
                    <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3 text-sm">
                      <span className="text-muted-foreground">Via</span>
                      <Badge
                        variant="outline"
                        className="h-6 rounded-full px-2.5"
                      >
                        {channelLabel[ticket.channel]}
                      </Badge>
                      <span className="text-muted-foreground">From</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              type="button"
                              variant="secondary"
                              className="h-8 rounded-full px-3 font-medium"
                            />
                          }
                        >
                          {selectedReplyAccount?.label}
                          <IconChevronDown className="size-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-72 p-2">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="px-2 pb-3 text-base font-semibold text-foreground">
                              Select account
                            </DropdownMenuLabel>
                            <DropdownMenuRadioGroup
                              value={replyFrom}
                              onValueChange={setReplyFrom}
                            >
                              {replyFromAccounts.map((account) => (
                                <DropdownMenuRadioItem
                                  key={account.address}
                                  value={account.address}
                                  className="mb-2 rounded-xl border border-border/70 px-3 py-3"
                                >
                                  <div className="min-w-0">
                                    <div className="truncate font-medium">
                                      {account.label}
                                    </div>
                                    <div className="truncate text-xs text-muted-foreground">
                                      {account.description}
                                    </div>
                                  </div>
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => router.push("/accounts")}
                          >
                            Manage accounts
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <textarea
                      value={draftMessage}
                      onChange={(event) => setDraftMessage(event.target.value)}
                      placeholder="Comment or type '/' for commands"
                      className="min-h-40 w-full resize-none bg-transparent px-4 py-3 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground/70"
                    />

                    <div className="border-t px-3 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-lg text-muted-foreground"
                          >
                            <span className="text-base font-medium">T</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-lg text-muted-foreground"
                          >
                            <IconMoodSmile className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-lg text-muted-foreground"
                          >
                            <IconPaperclip className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-lg text-muted-foreground"
                          >
                            <IconMicrophone className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="rounded-lg text-muted-foreground"
                          >
                            <IconPhoto className="size-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="ml-1 h-9 rounded-xl px-3 text-sm font-medium"
                                />
                              }
                            >
                              Macros
                              <IconChevronDown className="size-4 text-muted-foreground" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              className="w-[19rem] rounded-2xl p-0"
                            >
                              <div className="border-b border-border/70 px-4 py-3">
                                <div className="text-sm font-semibold text-foreground">
                                  Add Macros
                                </div>
                                <div className="relative mt-3">
                                  <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    value={templateQuery}
                                    onChange={(event) =>
                                      setTemplateQuery(event.target.value)
                                    }
                                    placeholder="Search macros"
                                    className="h-10 rounded-xl border-border/70 pl-9"
                                  />
                                </div>
                              </div>
                              <div className="scrollbar-hidden max-h-72 overflow-y-auto px-2 py-2">
                                <div className="px-2 py-2 text-xs font-medium text-muted-foreground">
                                  Suggested replies
                                </div>
                                {filteredMacros.map((macro) => (
                                  <button
                                    key={macro}
                                    type="button"
                                    className="w-full rounded-xl px-2 py-2 text-left text-sm text-foreground/80 transition hover:bg-muted"
                                    onClick={() => handleMacroInsert(macro)}
                                  >
                                    {macro}
                                  </button>
                                ))}
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 rounded-xl px-3 text-sm font-medium"
                            onClick={() => handleSubmitReply("closed")}
                          >
                            End Chat
                          </Button>
                          <Button
                            type="button"
                            className="h-9 rounded-xl px-4"
                            onClick={() => handleSubmitReply()}
                            disabled={!draftMessage.trim()}
                          >
                            Send
                            <IconSend className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="task"
              className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
            >
              <div className="scrollbar-hidden h-full overflow-y-auto px-6 py-6">
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={() =>
                        setTasks((currentTasks) =>
                          currentTasks.map((currentTask) =>
                            currentTask.id === task.id
                              ? {
                                  ...currentTask,
                                  completed: !currentTask.completed,
                                }
                              : currentTask
                          )
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="activity"
              className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
            >
              <div className="scrollbar-hidden h-full overflow-y-auto px-6 py-6">
                <div className="space-y-8 border-l border-border/70 pl-6">
                  {activityItems.map((item) => (
                    <TimelineEventCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="notes"
              className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
            >
              <div className="scrollbar-hidden h-full overflow-y-auto px-6 py-6">
                <div className="space-y-4">
                  <div className="rounded-3xl border bg-background p-4">
                    <div className="flex items-start gap-3">
                      <TimelineAvatar
                        person={{
                          name: currentUser.name,
                          avatarUrl: currentUser.avatar,
                          email: currentUser.email,
                        }}
                      />
                      <div className="min-w-0 flex-1 space-y-3">
                        <textarea
                          value={noteDraft}
                          onChange={(event) => setNoteDraft(event.target.value)}
                          placeholder="Write an internal note..."
                          className="min-h-28 w-full resize-none rounded-2xl border bg-background px-4 py-3 text-sm leading-6 outline-none placeholder:text-muted-foreground/70"
                        />
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-muted-foreground">
                            Only the support team can see this note.
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-xl"
                            onClick={handleAddInternalNote}
                            disabled={!noteDraft.trim()}
                          >
                            Add note
                            <IconPlus className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {notes.map((note) => (
                      <NoteCard key={note.id} note={note} />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <aside className="min-h-0">
          <div className="flex h-full min-h-0 overflow-hidden">
            <div className="flex w-14 shrink-0 flex-col items-center gap-2 p-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-9 rounded-xl"
                onClick={() => setIsRightPanelOpen((isOpen) => !isOpen)}
                aria-label={
                  isRightPanelOpen ? "Collapse right panel" : "Expand right panel"
                }
              >
                {isRightPanelOpen ? (
                  <IconChevronsRight className="size-4" />
                ) : (
                  <IconChevronsLeft className="size-4" />
                )}
              </Button>

              {rightPanelSections.map((section) => {
                const SectionIcon = section.icon
                const isActive = activeRightPanelSection === section.value

                return (
                  <Button
                    key={section.value}
                    type="button"
                    variant={isActive ? "secondary" : "ghost"}
                    size="icon-sm"
                    className="size-9 rounded-xl"
                    aria-label={section.label}
                    aria-pressed={isActive}
                    onClick={() => {
                      setActiveRightPanelSection(section.value)
                      setIsRightPanelOpen(true)
                    }}
                  >
                    <SectionIcon className="size-4" />
                  </Button>
                )
              })}
            </div>

            {isRightPanelOpen ? (
              <div className={cn("min-h-0 flex-1 p-2", "border-l")}>
                <div className="flex h-full min-h-0 flex-col">
                  <div className="shrink-0 px-4 py-3">
                    <h2 className="text-sm font-semibold text-foreground">
                      {activeRightPanel?.label}
                    </h2>
                  </div>

                  <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto p-4">
                    {activeRightPanelSection === "details" ? (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <DetailStat
                          label="Queue status"
                          value={
                            <span className="inline-flex items-center gap-2">
                              <span
                                className={cn(
                                  "size-2 rounded-full",
                                  queueStatus === "closed"
                                    ? "bg-zinc-500"
                                    : queueStatus === "resolved"
                                      ? "bg-emerald-500"
                                      : queueStatus === "pending"
                                        ? "bg-amber-500"
                                        : "bg-sky-500"
                                )}
                              />
                              {statusLabel[queueStatus]}
                            </span>
                          }
                        />
                        <DetailStat
                          label="Priority"
                          value={
                            <span className="inline-flex items-center gap-2">
                              <TicketPriorityIndicator priority={ticket.priority} />
                              {priorityLabel[ticket.priority]}
                            </span>
                          }
                        />
                        <DetailStat
                          label="Health"
                          value={<TicketTag tone={ticket.health} />}
                        />
                        <DetailStat
                          label="Channel"
                          value={channelLabel[ticket.channel]}
                        />
                        <DetailStat label="Opened" value={detail.openedAt} />
                        <DetailStat
                          label="SLA"
                          value={detail.responseSla}
                          className="col-span-2"
                        />
                        <DetailStat
                          label="Next due"
                          value={detail.nextDue}
                          className="col-span-2"
                        />
                        <DetailStat label="Assigned to" value={assignee.name} />
                      </div>
                    ) : null}

                    {activeRightPanelSection === "people" ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <TimelineAvatar person={detail.customer} />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground">
                              {detail.customer.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Requester
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex items-center gap-3">
                          <TimelineAvatar person={assignee} />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground">
                              {assignee.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Assignee
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex items-start gap-3">
                          <div className="flex size-10 items-center justify-center rounded-2xl border bg-muted text-muted-foreground">
                            <IconUsers className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground">
                              Support team
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Reply from {selectedReplyAccount?.label ?? "Support"} and
                              keep the thread in sync.
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {activeRightPanelSection === "knowledge" ? (
                      <div className="space-y-3">
                        <h3 className="text-base font-semibold text-foreground">
                          Knowledge Base
                        </h3>
                        <p className="text-sm leading-6 text-muted-foreground">
                          This module is prepared for linked playbooks, known
                          issues, and ticket-specific references.
                        </p>
                        <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                          Connect KB sources here in the next iteration.
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  )
}
