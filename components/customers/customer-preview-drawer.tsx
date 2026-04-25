"use client"

import { useState, type ComponentType, type ReactNode } from "react"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconMail,
  IconPhone,
  IconPlus,
  IconX,
} from "@tabler/icons-react"

import { getCustomerBrandPresentation } from "@/components/customers/customer-brand"
import { CustomerInitialAvatar } from "@/components/customers/customer-initial-avatar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  customerActivityToneDotClassName,
  customerPositiveTrendBadgeClassName,
  customerPresenceDotClassName,
  customerResponseToneClassName,
  customerTicketPriorityDotClassName,
  customerTicketStatusToneClassName,
  customerTierToneClassName,
  isVipCustomerTier,
} from "@/lib/customers/presentation"
import {
  customerLifecycleLabels,
  type Customer,
  type CustomerActivityTone,
  type CustomerRecentTicket,
  type CustomerResponseTone,
  type CustomerTicketStatus,
} from "@/lib/customers/types"
import { cn } from "@/lib/utils"

type CustomerPreviewDrawerContentProps = {
  customer: Customer | null
  currentIndex?: number
  totalCount?: number
  onPrevious?: () => void
  onNext?: () => void
  onClose: () => void
}

type CustomerDetailItem = {
  label: string
  value: ReactNode
  icon?: ComponentType<{ className?: string }>
  href?: string
}

type CustomerMetricItem = {
  label: string
  value: string
  helper?: ReactNode
  tone?: "default" | "danger"
}

type ActivityItem = {
  title: string
  meta: string
  time: string
  tone: CustomerActivityTone
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat("en-US")

const previewSheetClassName =
  "overflow-hidden p-0 data-[side=right]:w-screen data-[side=right]:rounded-none data-[side=right]:border-l data-[side=right]:border-border/70 sm:shadow-2xl sm:data-[side=right]:top-3 sm:data-[side=right]:right-3 sm:data-[side=right]:bottom-3 sm:data-[side=right]:h-[calc(100dvh-1.5rem)] sm:data-[side=right]:w-[min(calc(100vw-1.5rem),52rem)] sm:data-[side=right]:max-w-none sm:data-[side=right]:rounded-3xl sm:data-[side=right]:border"

const OVERDUE_RATIO_BY_HEALTH = {
  healthy: 0,
  at_risk: 0.45,
  watch: 0.25,
} as const

const AVERAGE_RESPONSE_SECONDS_BY_HEALTH = {
  healthy: 2 * 60 + 15,
  watch: 8 * 60 + 30,
  at_risk: 25 * 60,
} as const

const CSAT_MAX_SCORE = 5
const RESPONSE_UPLIFT_MULTIPLIER = 3

export function CustomerPreviewDrawerContent({
  customer,
  currentIndex = -1,
  totalCount = 0,
  onPrevious,
  onNext,
  onClose,
}: CustomerPreviewDrawerContentProps) {
  const [additionalNotes, setAdditionalNotes] = useState<
    Record<string, string[]>
  >({})
  const [draftNote, setDraftNote] = useState("")

  if (!customer) return null

  const customerBrand = getCustomerBrandPresentation(
    customer.id,
    customer.companyName
  )
  const BrandIcon = customerBrand.icon
  const activities = buildActivityItems(customer)
  const responseTone = getResponseTone(customer)
  const metrics = buildMetricItems(customer)
  const contactDetails = buildContactDetails(customer)
  const companyDetails = buildCompanyDetails(customer)
  const customerNotes = additionalNotes[customer.id] ?? []
  const noteCount = (customer.notes ? 1 : 0) + customerNotes.length
  const hasNavigation = currentIndex >= 0 && totalCount > 0

  return (
    <SheetContent
      side="right"
      showCloseButton={false}
      className={previewSheetClassName}
    >
      <div className="flex h-full min-h-0 flex-col bg-background">
        <CustomerPreviewTopBar
          currentIndex={currentIndex}
          totalCount={totalCount}
          hasNavigation={hasNavigation}
          onPrevious={onPrevious}
          onNext={onNext}
          onClose={onClose}
        />

        <section className="border-b border-border/70 px-4 pt-5 pb-5">
          <div className="flex min-w-0 items-start gap-4">
            <CustomerInitialAvatar
              name={customer.primaryContactName}
              size="lg"
              badgeClassName={customerPresenceDotClassName}
            />

            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate text-xl leading-7 font-semibold">
                {customer.primaryContactName}
              </SheetTitle>
              <SheetDescription className="sr-only">
                Customer preview for {customer.primaryContactName} at{" "}
                {customer.companyName}.
              </SheetDescription>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary">{customer.companyName}</Badge>
                <Badge
                  className={cn(
                    "border-0",
                    getCustomerTierBadgeClassName(customer)
                  )}
                >
                  {getCustomerTierBadgeLabel(customer)}
                </Badge>
                <Badge variant="outline">
                  {customer.region} · {customer.timezone}
                </Badge>
                <Badge variant="outline">{formatLanguageCodes(customer)}</Badge>
                <Badge
                  className={cn(
                    "border-0",
                    customerResponseToneClassName[responseTone]
                  )}
                >
                  {customer.responseTimeLabel}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>
        </section>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[19rem_minmax(0,1fr)] md:overflow-hidden">
          <aside className="border-b border-border/70 p-4 md:min-h-0 md:overflow-y-auto md:border-r md:border-b-0">
            <PreviewSectionLabel>Contact</PreviewSectionLabel>
            <div className="flex flex-col gap-2">
              {contactDetails.map((item) => (
                <DetailField key={item.label} item={item} />
              ))}
            </div>

            <PreviewSectionLabel className="mt-4">Company</PreviewSectionLabel>
            <CustomerCompanyCard
              customer={customer}
              brandClassName={customerBrand.className}
              brandFallback={customerBrand.fallback}
              brandIcon={BrandIcon}
              details={companyDetails}
            />
          </aside>

          <main className="min-h-0 overflow-y-auto">
            <PreviewCollapsibleSection
              title="Tickets"
              badge={numberFormatter.format(customer.openTickets)}
              defaultOpen
            >
              {customer.recentTickets.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {customer.recentTickets.map((ticket) => (
                    <TicketPreviewCard key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No active ticket threads for this customer." />
              )}
            </PreviewCollapsibleSection>

            <PreviewCollapsibleSection title="Activity" defaultOpen>
              <CustomerActivityTimeline items={activities} />
            </PreviewCollapsibleSection>

            <PreviewCollapsibleSection
              title="Notes"
              badge={numberFormatter.format(noteCount)}
              defaultOpen
            >
              <NotesPanel
                initialNote={customer.notes}
                notes={customerNotes}
                draftNote={draftNote}
                onDraftNoteChange={setDraftNote}
                onAddNote={() => {
                  const normalizedNote = draftNote.trim()
                  if (!normalizedNote) return

                  setAdditionalNotes((currentNotes) => ({
                    ...currentNotes,
                    [customer.id]: [
                      ...(currentNotes[customer.id] ?? []),
                      normalizedNote,
                    ],
                  }))
                  setDraftNote("")
                }}
              />
            </PreviewCollapsibleSection>
          </main>
        </div>
      </div>
    </SheetContent>
  )
}

function CustomerPreviewTopBar({
  currentIndex,
  totalCount,
  hasNavigation,
  onPrevious,
  onNext,
  onClose,
}: {
  currentIndex: number
  totalCount: number
  hasNavigation: boolean
  onPrevious?: () => void
  onNext?: () => void
  onClose: () => void
}) {
  const canGoPrevious = hasNavigation && currentIndex > 0
  const canGoNext = hasNavigation && currentIndex < totalCount - 1

  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 px-6 py-4">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="rounded-xl"
          aria-label="Previous customer"
          disabled={!canGoPrevious}
          onClick={onPrevious}
        >
          <IconChevronLeft />
        </Button>
        <span className="min-w-20 text-center text-lg text-muted-foreground">
          {hasNavigation ? `${currentIndex + 1} / ${totalCount}` : "Preview"}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="rounded-xl"
          aria-label="Next customer"
          disabled={!canGoNext}
          onClick={onNext}
        >
          <IconChevronRight />
        </Button>
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="rounded-xl"
        >
          Assign
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="rounded-xl"
        >
          View full profile
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="rounded-xl"
          aria-label="Close customer preview"
          onClick={onClose}
        >
          <IconX />
        </Button>
      </div>
    </header>
  )
}

function MetricCard({ metric }: { metric: CustomerMetricItem }) {
  return (
    <Card
      size="sm"
      className="gap-1 rounded-xl border-0 bg-muted/55 py-3 text-center shadow-none"
    >
      <CardHeader className="px-2 py-0">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {metric.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 py-0">
        <div
          className={cn(
            "flex items-center justify-center gap-1.5 text-xl leading-6 font-semibold text-foreground",
            metric.tone === "danger" && "text-destructive"
          )}
        >
          {metric.value}
          {metric.helper}
        </div>
      </CardContent>
    </Card>
  )
}

function PreviewSectionLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "mb-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase",
        className
      )}
    >
      {children}
    </div>
  )
}

function DetailField({ item }: { item: CustomerDetailItem }) {
  const Icon = item.icon
  const value = (
    <span className="flex min-w-0 items-center gap-1.5">
      {Icon ? (
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      ) : null}
      <span className="truncate">{item.value}</span>
    </span>
  )

  return (
    <div className="border-b border-border/60 py-1.5 first:pt-0 last:border-b-0 last:pb-0">
      <div className="text-xs text-muted-foreground">{item.label}</div>
      {item.href ? (
        <a
          className="mt-0.5 flex text-sm leading-5 text-foreground hover:text-primary"
          href={item.href}
        >
          {value}
        </a>
      ) : (
        <div className="mt-0.5 text-sm leading-5 break-words text-foreground">
          {value}
        </div>
      )}
    </div>
  )
}

function CustomerCompanyCard({
  customer,
  brandClassName,
  brandFallback,
  brandIcon: BrandIcon,
  details,
}: {
  customer: Customer
  brandClassName: string
  brandFallback: string
  brandIcon?: ComponentType<{ className?: string }>
  details: CustomerDetailItem[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card size="sm" className="gap-0 rounded-xl py-0 shadow-none">
        <CollapsibleTrigger className="w-full text-left">
          <CardHeader className="grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-3">
            <Avatar className="size-9 border bg-background">
              <AvatarFallback
                className={cn("text-xs font-semibold", brandClassName)}
              >
                {BrandIcon ? <BrandIcon /> : brandFallback}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="truncate text-sm">
                {customer.companyName}
              </CardTitle>
              <div className="truncate text-xs text-muted-foreground">
                {customer.plan} · {numberFormatter.format(customer.seats)} seats
              </div>
            </div>
            <CardAction className="col-start-3 row-span-1 row-start-1 self-center">
              <IconChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  open && "rotate-180"
                )}
              />
            </CardAction>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <CardContent className="flex flex-col gap-1.5 px-3 py-2">
            {details.map((item) => (
              <DetailField key={item.label} item={item} />
            ))}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

function PreviewCollapsibleSection({
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string
  badge?: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <section className="border-b border-border/70 last:border-b-0">
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/35">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-lg font-semibold text-foreground">
              {title}
            </span>
            {badge ? <Badge variant="secondary">{badge}</Badge> : null}
          </span>
          <IconChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-5 pb-4">{children}</div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  )
}

function TicketPreviewCard({ ticket }: { ticket: CustomerRecentTicket }) {
  return (
    <Card size="sm" className="gap-0 rounded-xl py-0 shadow-none">
      <CardHeader className="grid-cols-[1fr_auto] gap-2 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-xs font-medium text-muted-foreground">
            {ticket.id}
          </span>
          <CardTitle className="truncate text-sm">{ticket.subject}</CardTitle>
        </div>
        <CardAction>
          <TicketStatusBadge status={ticket.status} />
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent className="grid grid-cols-3 px-0 py-0">
        <TicketMeta label="Type">{getTicketType(ticket)}</TicketMeta>
        <TicketMeta label="Priority">
          <span
            className={cn(
              "size-1.5 rounded-full",
              customerTicketPriorityDotClassName[ticket.priority]
            )}
          />
          <span className="capitalize">{ticket.priority}</span>
        </TicketMeta>
        <TicketMeta
          label={ticket.status === "resolved" ? "Closed" : "Assigned"}
        >
          {ticket.status === "resolved"
            ? ticket.requestDate
            : ticket.assigneeLabel}
        </TicketMeta>
      </CardContent>
    </Card>
  )
}

function TicketMeta({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="min-w-0 border-r border-border/70 px-3 py-2 last:border-r-0">
      <div className="truncate text-xs tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <div className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-sm text-foreground">
        {children}
      </div>
    </div>
  )
}

function TicketStatusBadge({ status }: { status: CustomerTicketStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", customerTicketStatusToneClassName[status])}
    >
      {status}
    </Badge>
  )
}

function CustomerActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <div className="flex flex-col">
      {items.map((item, index) => (
        <div
          key={`${item.title}-${item.meta}`}
          className="grid grid-cols-[1rem_1fr] gap-3 border-b border-border/70 py-2 last:border-b-0"
        >
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "mt-1.5 size-2 rounded-full",
                customerActivityToneDotClassName[item.tone]
              )}
            />
            {index < items.length - 1 ? (
              <span className="mt-1 min-h-6 w-px flex-1 bg-border" />
            ) : null}
          </div>
          <div className="min-w-0">
            <div className="text-sm leading-5 font-medium text-foreground">
              {item.title}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {item.meta}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {item.time}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
      {message}
    </div>
  )
}

function NotesPanel({
  initialNote,
  notes,
  draftNote,
  onDraftNoteChange,
  onAddNote,
}: {
  initialNote: string
  notes: string[]
  draftNote: string
  onDraftNoteChange: (nextDraft: string) => void
  onAddNote: () => void
}) {
  const [isAdding, setIsAdding] = useState(false)
  const hasNotes = Boolean(initialNote) || notes.length > 0
  const submitNote = () => {
    if (!draftNote.trim()) return
    onAddNote()
    setIsAdding(false)
  }

  return (
    <div className="flex flex-col gap-3">
      {hasNotes ? (
        <div className="flex flex-col gap-2">
          {initialNote ? (
            <NoteCard note={initialNote} label="Account note" />
          ) : null}
          {notes.map((note, index) => (
            <NoteCard
              key={`${note}-${index}`}
              note={note}
              label={`Internal note ${index + 1}`}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      )}

      {isAdding ? (
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            value={draftNote}
            placeholder="Add internal note"
            onChange={(event) => onDraftNoteChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submitNote()
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!draftNote.trim()}
            onClick={submitNote}
          >
            Add
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full rounded-xl border-dashed text-base"
          onClick={() => setIsAdding(true)}
        >
          <IconPlus data-icon="inline-start" />
          Add internal note
        </Button>
      )}
    </div>
  )
}

function NoteCard({ note, label }: { note: string; label: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background px-3 py-2">
      <div className="text-[10px] tracking-wide text-muted-foreground uppercase">
        {label}
      </div>
      <p className="mt-1 text-sm leading-5 text-foreground">{note}</p>
    </div>
  )
}

function buildMetricItems(customer: Customer): CustomerMetricItem[] {
  const overdueTickets = getEstimatedOverdueTickets(customer)
  const averageResponseSeconds = getAverageResponseSeconds(customer)
  const totalResponseSeconds = Math.max(
    averageResponseSeconds,
    averageResponseSeconds * Math.max(customer.openTickets, 1)
  )

  return [
    {
      label: "Tickets",
      value: numberFormatter.format(customer.openTickets),
    },
    {
      label: "Overdue",
      value: numberFormatter.format(overdueTickets),
      tone: overdueTickets > 0 ? "danger" : "default",
    },
    {
      label: "Avg resp.",
      value: formatResponseDuration(averageResponseSeconds),
      helper: (
        <Badge className={cn("px-1.5 py-0 text-xs", customerPositiveTrendBadgeClassName)}>
          +
          {Math.max(
            1,
            Math.round((CSAT_MAX_SCORE - customer.csat) * RESPONSE_UPLIFT_MULTIPLIER)
          )}
          %
        </Badge>
      ),
    },
    {
      label: "Total",
      value: formatResponseDuration(totalResponseSeconds, {
        includeHours: true,
      }),
    },
  ]
}

function getEstimatedOverdueTickets(customer: Customer) {
  if (customer.openTickets === 0) return 0

  const overdueRatio = OVERDUE_RATIO_BY_HEALTH[customer.health]
  if (overdueRatio > 0) {
    return Math.max(1, Math.ceil(customer.openTickets * overdueRatio))
  }

  return customer.recentTickets.some((ticket) => ticket.priority === "high")
    ? 1
    : 0
}

function getAverageResponseSeconds(customer: Customer) {
  return AVERAGE_RESPONSE_SECONDS_BY_HEALTH[customer.health]
}

function formatResponseDuration(
  totalSeconds: number,
  options: { includeHours?: boolean } = {}
) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (options.includeHours || hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

function buildContactDetails(customer: Customer): CustomerDetailItem[] {
  return [
    {
      label: "Phone",
      value: customer.phoneNumber,
      icon: IconPhone,
      href: `tel:${customer.phoneNumber.replace(/[^\d+]/g, "")}`,
    },
    {
      label: "Email",
      value: customer.primaryContactEmail,
      icon: IconMail,
      href: `mailto:${customer.primaryContactEmail}`,
    },
    {
      label: "Source",
      value: customer.source,
    },
    {
      label: "First contact",
      value: customer.firstContactDate,
    },
    {
      label: "Assignee",
      value: customer.owner.name,
    },
  ]
}

const languageCodeByName: Record<string, string> = {
  English: "EN",
  Swedish: "SV",
  Finnish: "FI",
  German: "DE",
  French: "FR",
  Spanish: "ES",
  Italian: "IT",
  Korean: "KO",
  Japanese: "JA",
  Vietnamese: "VI",
  Portuguese: "PT",
}

function formatLanguageCodes(customer: Customer) {
  return customer.languagesSpoken
    .map(
      (language) =>
        languageCodeByName[language] ?? language.slice(0, 2).toUpperCase()
    )
    .join(", ")
}

function getCustomerTierBadgeLabel(customer: Customer) {
  if (isVipCustomerTier(customer.plan, customer.annualValue)) return "VIP"
  return customer.plan
}

function getCustomerTierBadgeClassName(customer: Customer) {
  return customerTierToneClassName[
    isVipCustomerTier(customer.plan, customer.annualValue) ? "vip" : "default"
  ]
}

function getTicketType(ticket: CustomerRecentTicket) {
  if (ticket.priority === "high") return "Complaint"
  if (ticket.status === "pending") return "Task"
  return "Question"
}

function buildCompanyDetails(customer: Customer): CustomerDetailItem[] {
  return [
    {
      label: "Tier",
      value: `${customer.plan} · ${customer.segment}`,
    },
    {
      label: "Account mgr",
      value: customer.owner.name,
    },
    {
      label: "Renewal",
      value: customer.nextRenewalLabel,
    },
    {
      label: "Revenue",
      value: currencyFormatter.format(customer.annualValue),
    },
  ]
}

function buildActivityItems(customer: Customer): ActivityItem[] {
  const primaryTicket = customer.recentTickets[0]
  const secondaryTicket = customer.recentTickets[1]

  return [
    {
      title: `${customer.primaryContactName} added to contacts`,
      meta: customer.companyName,
      time: customer.firstContactDate,
      tone: "warning",
    },
    primaryTicket
      ? {
          title: `Ticket ${primaryTicket.id} ${primaryTicket.status === "resolved" ? "resolved" : "opened"}`,
          meta: primaryTicket.subject,
          time: primaryTicket.requestDate,
          tone:
            primaryTicket.status === "resolved"
              ? ("positive" as const)
              : ("neutral" as const),
        }
      : {
          title: "No open support conversations",
          meta: "Support queue is clear",
          time: customer.lastTouchDate,
          tone: "positive",
        },
    secondaryTicket
      ? {
          title: `Ticket ${secondaryTicket.id} ${secondaryTicket.status === "resolved" ? "resolved" : "opened"}`,
          meta: secondaryTicket.subject,
          time: secondaryTicket.requestDate,
          tone:
            secondaryTicket.status === "resolved"
              ? ("positive" as const)
              : ("neutral" as const),
        }
      : {
          title: `${customer.owner.name} owns the account follow-up`,
          meta: `Last touch ${customer.lastTouchLabel}`,
          time: customer.lastTouchDate,
          tone: customer.health === "healthy" ? "positive" : "neutral",
        },
    {
      title: `${customer.primaryContactName} created by ${customer.owner.name}`,
      meta: customerLifecycleLabels[customer.lifecycle],
      time: customer.firstContactDate,
      tone: "neutral",
    },
  ]
}

function getResponseTone(customer: Customer): CustomerResponseTone {
  if (customer.health === "at_risk") return "slow"
  if (customer.health === "watch") return "steady"
  return "healthy"
}
