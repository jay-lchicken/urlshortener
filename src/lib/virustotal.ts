import { getCachedScan, setCachedScan } from "@/lib/cache"

type VirusTotalStats = {
  malicious?: number
  suspicious?: number
}

type VirusTotalAnalysisResponse = {
  data?: {
    id?: string
    attributes?: {
      status?: string
      stats?: VirusTotalStats
      last_analysis_stats?: VirusTotalStats
    }
  }
}

const VIRUSTOTAL_BASE_URL = "https://www.virustotal.com/api/v3"

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function isPhishingLink(host: string): Promise<boolean> {
   const apiKey = process.env.VIRUSTOTAL_API_KEY
   if (!apiKey){



     return true
   }

   try {
      const cached = await getCachedScan(host)
      if (cached !== null) return cached

      const submit = await fetch(`${VIRUSTOTAL_BASE_URL}/urls`, {
        method: "POST",
        headers: { "x-apikey": apiKey, "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ url: `https://${host}` }),
      })
      if (!submit.ok) return true

      const analysisId = (await submit.json()).data?.id
      if (!analysisId) return true

      for (let i = 0; i < 30; i++) {
        const res = await fetch(`${VIRUSTOTAL_BASE_URL}/analyses/${analysisId}`, {
          headers: { "x-apikey": apiKey },
        })
        if (!res.ok) return true

        const data = (await res.json()) as VirusTotalAnalysisResponse
        const attrs = data.data?.attributes
        const stats = attrs?.last_analysis_stats ?? attrs?.stats
        const results = (attrs as any)?.results ?? {}
        
        if (attrs?.status === "completed" && Object.keys(results).length > 0) {
          const isMalicious = (stats?.malicious ?? 0) > 0 || (stats?.suspicious ?? 0) > 0
          await setCachedScan(host, isMalicious)
          return isMalicious
        }

        if (i < 29) await delay(2000)
      }

      return true
    } catch {
      return true
    }
}
