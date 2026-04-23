"use client"

import { IconArrowUpRight, IconX } from "@tabler/icons-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getCustomerBrandPresentation } from "@/components/customers/customer-brand"
import {
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  customerActivityToneDotClassName,
  customerHealthToneClassName,
  customerLifecycleToneClassName,
  customerResponseToneClassName,
  customerTicketPriorityToneClassName,
  customerTicketStatusToneClassName,
  getCustomerInitials,
} from "@/lib/customers/presentation"
import {
  customerHealthLabels,
  customerLifecycleLabels,
  type Customer,
  type CustomerActivityTone,
  type CustomerRecentTicket,
  type CustomerResponseTone,
  type CustomerTicketPriority,
  type CustomerTicketStatus,
} from "@/lib/customers/types"
import { cn } from "@/lib/utils"

type CustomerDetailItem = {
  label: string
  value: React.ReactNode
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

const customerEmailChipClassName =
  "rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300"

function CustomerHealthBadge({ health }: { health: Customer["health"] }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "justify-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        customerHealthToneClassName[health]
      )}
    >
      {customerHealthLabels[health]}
    </Badge>
  )
}

function CustomerLifecycleBadge({
  lifecycle,
}: {
  lifecycle: Customer["lifecycle"]
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "justify-center rounded-full px-2.5 py-1 text-[11px] font-medium",
        customerLifecycleToneClassName[lifecycle]
      )}
    >
      {customerLifecycleLabels[lifecycle]}
    </Badge>
  )
}

export function CustomerPreviewDrawerContent({
  customer,
  onClose,
}: {
  customer: Customer | null
  onClose: () => void
}) {
  const customerBrand = customer
    ? getCustomerBrandPresentation(customer.id, customer.companyName)
    : null

  if (!customer) return null

  const detailGroups = buildCustomerDetailGroups(customer)
  const activities = buildActivityItems(customer)
  const responseStatus = getResponseStatus(customer)
  const responseTone = getResponseTone(customer)

  return (
    <SheetContent
      side="right"
      showCloseButton={false}
      className="overflow-hidden p-0 data-[side=right]:w-screen data-[side=right]:rounded-none data-[side=right]:border-l data-[side=right]:border-border/70 sm:shadow-2xl sm:data-[side=right]:top-3 sm:data-[side=right]:right-3 sm:data-[side=right]:bottom-3 sm:data-[side=right]:h-[calc(100dvh-1.5rem)] sm:data-[side=right]:w-[min(calc(100vw-1.5rem),clamp(68rem,86vw,88rem))] sm:data-[side=right]:max-w-none sm:data-[side=right]:rounded-[22px] sm:data-[side=right]:border"
    >
      <div className="flex h-full flex-col overflow-hidden bg-background">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/95 px-6 py-5 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <Avatar className="size-16 border bg-background">
                <AvatarFallback
                  className={cn("font-semibold", customerBrand?.className)}
                >
                  {customerBrand?.icon ? (
                    <customerBrand.icon className="size-7" />
                  ) : (
                    getCustomerInitials(customer.primaryContactName)
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <SheetTitle className="truncate text-[2rem] leading-none font-semibold tracking-tight">
                  {customer.primaryContactName}
                </SheetTitle>
                <SheetDescription className="mt-2 flex items-center gap-2 text-base">
                  <span className="font-medium text-foreground">
                    {customer.companyName}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span>{customer.primaryContactEmail}</span>
                </SheetDescription>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full border-0 bg-emerald-50 px-3 py-1 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {customer.owner.name}
                  </Badge>
                  <Badge className="rounded-full border-0 bg-muted px-3 py-1 text-muted-foreground">
                    {customer.lastTouchLabel}
                  </Badge>
                  <CustomerHealthBadge health={customer.health} />
                  <CustomerLifecycleBadge lifecycle={customer.lifecycle} />
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(customer.website, "_blank", "noopener,noreferrer")
                }
              >
                Visit site
                <IconArrowUpRight className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full text-muted-foreground"
                aria-label="Close drawer"
                onClick={onClose}
              >
                <IconX className="size-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
          <section className="min-h-0 overflow-y-auto border-b border-border/70 bg-muted/20 px-6 py-6 lg:border-r lg:border-b-0">
            <div className="mx-auto max-w-2xl space-y-6">
              <div className="rounded-[28px] border border-border/70 bg-card px-5 py-6 shadow-sm">
                <div className="text-center">
                  <div className="mx-auto flex size-28 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.9),_rgba(236,72,153,0.75))] text-white shadow-[0_18px_50px_-24px_rgba(129,140,248,0.75)]">
                    <span className="text-3xl font-semibold tracking-tight">
                      {getCustomerInitials(customer.primaryContactName)}
                    </span>
                  </div>
                  <div className="mt-5 flex items-center justify-center gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      {customer.primaryContactName}
                    </h2>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2 text-base">
                    <span className="font-medium text-foreground">
                      {customer.companyName}
                    </span>
                  </div>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                    {customer.summary}
                  </p>
                </div>

                <div className="mt-6 overflow-hidden rounded-[24px] border border-border/70 bg-background">
                  <div className="divide-y divide-border/70">
                    {detailGroups.map((group, index) => (
                      <DetailRow
                        key={index}
                        items={group}
                        twoColumn={group.length === 2}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="min-h-0 overflow-y-auto px-6 py-6">
            <div className="mx-auto max-w-2xl space-y-5">
              <PanelSection title="Overview">
                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricCard
                    label="Renewal"
                    value={customer.nextRenewalLabel}
                    caption="Contract timeline"
                  />
                  <MetricCard
                    label="ARR"
                    value={currencyFormatter.format(customer.annualValue)}
                    caption={`${numberFormatter.format(customer.seats)} seats`}
                  />
                  <MetricCard
                    label="Open tickets"
                    value={numberFormatter.format(customer.openTickets)}
                    caption={`CSAT ${customer.csat.toFixed(1)} / 5`}
                  />
                  <MetricCard
                    label="Response"
                    value={customer.responseTimeLabel}
                    caption={responseStatus}
                    tone={responseTone}
                  />
                </div>

                <div className="mt-4 rounded-2xl border border-border/70 bg-background px-4 py-4">
                  <div className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                    Summary
                  </div>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {customer.notes}
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {customer.riskSignals.map((risk) => (
                    <div
                      key={risk}
                      className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3"
                    >
                      <span className="mt-1 size-2 rounded-full bg-amber-500" />
                      <p className="text-sm text-foreground">{risk}</p>
                    </div>
                  ))}
                </div>
              </PanelSection>

              <PanelSection
                title="Ticket active"
                action={
                  <span className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                    {customer.recentTickets.length} threads
                  </span>
                }
              >
                {customer.recentTickets.length > 0 ? (
                  <div className="space-y-3">
                    {customer.recentTickets.map((ticket) => (
                      <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No active ticket threads for this customer right now." />
                )}
              </PanelSection>

              <PanelSection title="Activity">
                <div className="space-y-3">
                  {activities.map((item) => (
                    <ActivityCard
                      key={`${item.title}-${item.meta}`}
                      item={item}
                    />
                  ))}
                </div>
              </PanelSection>
            </div>
          </section>
        </div>
      </div>
    </SheetContent>
  )
}

function DetailRow({
  items,
  twoColumn,
}: {
  items: CustomerDetailItem[]
  twoColumn: boolean
}) {
  return (
    <div
      className={cn(
        "grid",
        twoColumn ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
      )}
    >
      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className={cn(
            "px-6 py-5",
            twoColumn && index === 0 && "sm:border-r sm:border-border/70"
          )}
        >
          <div className="text-[15px] text-muted-foreground">{item.label}</div>
          <div className="mt-2 text-[1.05rem] leading-7 font-medium break-words text-foreground">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}

function PanelSection({
  title,
  children,
  action,
}: {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <section className="rounded-[28px] border border-border/70 bg-card px-5 py-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {action}
      </div>
      <div className="mt-4 space-y-0">{children}</div>
    </section>
  )
}

function MetricCard({
  label,
  value,
  caption,
  tone = "default",
}: {
  label: string
  value: string
  caption: string
  tone?: "default" | "slow" | "steady" | "healthy"
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-background px-4 py-4",
        tone !== "default" && customerResponseToneClassName[tone]
      )}
    >
      <div className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-foreground">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{caption}</div>
    </div>
  )
}

function TicketCard({ ticket }: { ticket: CustomerRecentTicket }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
            {ticket.id}
          </div>
          <p className="mt-1 text-sm font-medium text-foreground">
            {ticket.subject}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <TicketStatusBadge status={ticket.status} />
          <TicketPriorityBadge priority={ticket.priority} />
        </div>
      </div>
      <div className="mt-3 grid gap-3 border-t border-border/70 pt-3 text-sm sm:grid-cols-2">
        <div>
          <div className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
            Assigned to
          </div>
          <div className="mt-1 font-medium text-foreground">
            {ticket.assigneeLabel}
          </div>
        </div>
        <div>
          <div className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
            Request date
          </div>
          <div className="mt-1 font-medium text-foreground">
            {ticket.requestDate}
          </div>
        </div>
      </div>
    </div>
  )
}

function TicketStatusBadge({ status }: { status: CustomerTicketStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full capitalize",
        customerTicketStatusToneClassName[status]
      )}
    >
      {status}
    </Badge>
  )
}

function TicketPriorityBadge({
  priority,
}: {
  priority: CustomerTicketPriority
}) {
  return (
    <Badge
      className={cn(
        "rounded-full border-0 capitalize",
        customerTicketPriorityToneClassName[priority]
      )}
    >
      {priority}
    </Badge>
  )
}

function ActivityCard({ item }: { item: ActivityItem }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3">
      <span
        className={cn(
          "mt-1 size-2 rounded-full",
          customerActivityToneDotClassName[item.tone]
        )}
      />
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">{item.title}</p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {item.time}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{item.meta}</p>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-background px-4 py-6 text-sm text-muted-foreground">
      {message}
    </div>
  )
}

function buildCustomerDetailGroups(customer: Customer): CustomerDetailItem[][] {
  return [
    [
      {
        label: "Source",
        value: customer.source,
      },
      {
        label: "Response time",
        value: (
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-sm",
              customerResponseToneClassName[getResponseTone(customer)]
            )}
          >
            {customer.responseTimeLabel}
          </span>
        ),
      },
    ],
    [
      {
        label: "Phone number",
        value: customer.phoneNumber,
      },
      {
        label: "Assignee",
        value: customer.owner.name,
      },
    ],
    [
      {
        label: "Email",
        value: (
          <div className="flex flex-wrap gap-2">
            <span className={customerEmailChipClassName}>
              {customer.primaryContactEmail}
            </span>
            {customer.alternateEmails.map((email) => (
              <span key={email} className={customerEmailChipClassName}>
                {email}
              </span>
            ))}
          </div>
        ),
      },
    ],
    [
      {
        label: "Location",
        value: customer.region,
      },
      {
        label: "Company",
        value: customer.companyName,
      },
    ],
    [
      {
        label: "Language spoken",
        value: customer.languagesSpoken.join(", "),
      },
      {
        label: "First contact",
        value: customer.firstContactDate,
      },
    ],
    [
      {
        label: "Timezone",
        value: customer.timezone,
      },
      {
        label: "Description",
        value: customer.summary,
      },
    ],
  ]
}

function buildActivityItems(customer: Customer): ActivityItem[] {
  return [
    {
      title: `${customer.owner.name} owns the account follow-up`,
      meta: `Last touch ${customer.lastTouchLabel}`,
      time: customer.lastTouchDate,
      tone: customer.health === "healthy" ? "positive" : "neutral",
    },
    {
      title: `${numberFormatter.format(customer.openTickets)} open support conversations are in flight`,
      meta:
        customer.openTickets > 0
          ? (customer.recentTickets[0]?.subject ?? "Coverage required")
          : "No blocking ticket work right now",
      time: customer.recentTickets[0]
        ? customer.recentTickets[0].requestDate
        : customer.lastTouchDate,
      tone: customer.openTickets > 2 ? "warning" : "neutral",
    },
    {
      title: customer.nextRenewalLabel,
      meta: `Lifecycle is ${customerLifecycleLabels[customer.lifecycle].toLowerCase()}`,
      time: customer.nextRenewalLabel.replace("Renews in ", ""),
      tone: customer.lifecycle === "renewal" ? "warning" : "positive",
    },
  ]
}

function getResponseTone(customer: Customer): CustomerResponseTone {
  if (customer.health === "at_risk") return "slow"
  if (customer.health === "watch") return "steady"
  return "healthy"
}

function getResponseStatus(customer: Customer) {
  if (customer.health === "at_risk") return "Needs immediate follow-up"
  if (customer.health === "watch") return "Monitor closely"
  return "Working smoothly"
}
