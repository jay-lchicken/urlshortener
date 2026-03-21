import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { CreateDomainButton } from "@/components/domains/create-domain-button"
import { Badge } from "@/components/ui/badge"

export function DomainsToolbar({
  cnameTarget,
  totalDomains,
}: {
  cnameTarget: string
  totalDomains: number
}) {
  return (
    <Card className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col items-start gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Domains
          </CardTitle>
          <Badge variant="outline">{totalDomains} total</Badge>
          {cnameTarget ? (
            <Badge className="bg-secondary text-secondary-foreground">
              CNAME ready
            </Badge>
          ) : (
            <Badge variant="outline">CNAME not set</Badge>
          )}
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          Please email us at linxy@techtime.coffee once you have finished setting
          up your DNS records so that the “no available server” message no
          longer appears when accessing your website via your custom domain.
          This verification step helps prevent fraud. Please note that DNS
          changes may take up to 48 hours to fully propagate and for the updates
          to be reflected on our side. There have been known issues if you are
          using Cloudflare as a DNS Provider, if you experience so, please
          contact us at linxy@techtime.coffee.
        </CardDescription>
      </div>
      <CreateDomainButton cnameTarget={cnameTarget} />
    </Card>
  )
}
