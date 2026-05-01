import { TicketsPage } from "@/components/tickets/tickets-page"
import { getTickets } from "@/lib/tickets/queries"

type TicketsRouteProps = {
  searchParams: Promise<{
    view?: string
    layout?: string
  }>
}

export const dynamic = "force-dynamic"

export default async function Page({ searchParams }: TicketsRouteProps) {
  const [params, tickets] = await Promise.all([searchParams, getTickets()])

  return (
    <TicketsPage
      initialView={params.view ?? null}
      initialLayout={params.layout ?? null}
      initialTickets={tickets}
    />
  )
}
