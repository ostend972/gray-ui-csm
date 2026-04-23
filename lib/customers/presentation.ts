import type {
  CustomerActivityTone,
  CustomerHealth,
  CustomerLifecycle,
  CustomerResponseTone,
  CustomerTicketPriority,
  CustomerTicketStatus,
} from "@/lib/customers/types"

export const customerHealthToneClassName: Record<CustomerHealth, string> = {
  healthy:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  watch:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
  at_risk:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300",
}

export const customerLifecycleToneClassName: Record<CustomerLifecycle, string> =
  {
    onboarding:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300",
    active:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
    renewal:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300",
    paused:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
    archived:
      "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
  }

export const customerResponseToneClassName: Record<
  CustomerResponseTone,
  string
> = {
  slow: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  steady: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  healthy:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
}

export const customerTicketStatusToneClassName: Record<
  CustomerTicketStatus,
  string
> = {
  resolved:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
  open: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300",
}

export const customerTicketPriorityToneClassName: Record<
  CustomerTicketPriority,
  string
> = {
  high: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  low: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
}

export const customerActivityToneDotClassName: Record<
  CustomerActivityTone,
  string
> = {
  positive: "bg-emerald-500",
  warning: "bg-amber-500",
  neutral: "bg-sky-500",
}

export function getCustomerInitials(value: string) {
  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}
