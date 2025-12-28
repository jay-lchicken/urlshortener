import {Card, CardDescription, CardTitle} from "@/components/ui/card"
import { CreateDomainButton } from "@/components/domains/create-domain-button"

export function DomainsToolbar({ cnameTarget }: { cnameTarget: string }) {
  return (
    <Card className="flex flex-row items-center justify-between p-4">
      <div className={"flex flex-col items-start gap-2"}>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
        Domains
      </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mr-4">
Please email us at linxy@techtime.coffee once you have finished setting up your DNS records so that the “no available server” message no longer appears when accessing your website via your custom domain. This verification step helps prevent fraud. Please note that DNS changes may take up to 48 hours to fully propagate and for the updates to be reflected on our side. There have been known issues if you are using Cloudflare as a DNS Provider, if you experience so, please contact us at linxy@techtime.coffee.        </CardDescription>
      </div>
      <CreateDomainButton cnameTarget={cnameTarget} />
    </Card>
  )
}
