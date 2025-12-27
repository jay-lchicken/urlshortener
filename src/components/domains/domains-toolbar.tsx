import { Card, CardTitle } from "@/components/ui/card"
import { CreateDomainButton } from "@/components/domains/create-domain-button"

export function DomainsToolbar({ cnameTarget }: { cnameTarget: string }) {
  return (
    <Card className="flex flex-row items-center justify-between p-4">
      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
        Domains
      </CardTitle>
      <CreateDomainButton cnameTarget={cnameTarget} />
    </Card>
  )
}
