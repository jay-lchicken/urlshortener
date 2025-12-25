import { Card, CardTitle } from "@/components/ui/card"
import { CreateNewLinkButton } from "@/components/links/create-new-link-button"


export function LinksToolbar() {
  return (
    <div>
      <Card className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          Links
        </CardTitle>
        <CreateNewLinkButton />
      </Card>
    </div>
  )
}
