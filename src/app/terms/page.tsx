import { TermsContent } from "@/components/terms/terms-content"

export default function TermsPage() {

  return (
    <div className="min-h-svh bg-muted px-6 py-12 md:px-10">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border bg-card p-6 text-card-foreground shadow-sm md:p-10">
        <TermsContent />
      </div>
    </div>
  )
}
