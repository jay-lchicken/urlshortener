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

type VirusTotalURLLookupResponse = {
  data?: {
    attributes?: {
      stats?: VirusTotalStats
      last_analysis_stats?: VirusTotalStats
    }
  }
}

const VIRUSTOTAL_BASE_URL = "https://www.virustotal.com/api/v3"

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getVirusTotalURLAnalysis(url: string, apiKey: string): Promise<{stats: VirusTotalStats | undefined, found: boolean}> {
  try {
      const urlHash = Buffer.from(url).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
      const res = await fetch(`${VIRUSTOTAL_BASE_URL}/urls/${urlHash}`, {
      headers: { "x-apikey": apiKey },
      })
    
    if (!res.ok) return {
      stats: undefined, found: false
    }
    
    const data = (await res.json()) as VirusTotalURLLookupResponse
    const attrs = data.data?.attributes
    const stats = attrs?.last_analysis_stats ?? attrs?.stats
    
    return { stats, found: !!stats }
  } catch {
    return { stats: undefined, found: false }
  }
}

async function submitURLForAnalysis(url: string, apiKey: string): Promise<{analysisId: string | null, stats: VirusTotalStats | undefined}> {
  try {
    const submit = await fetch(`${VIRUSTOTAL_BASE_URL}/urls`, {
      method: "POST",
      headers: { "x-apikey": apiKey, "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ url: `https://${url}` }),
    })
    
    if (!submit.ok)  return {
      analysisId: null, stats: undefined }
    
      const analysisId = (await submit.json()).data?.id
      if (!analysisId)   return {
      analysisId: null, stats: undefined
    }
    
    for (let i = 0; i < 30; i++) {
        const res = await fetch(`${VIRUSTOTAL_BASE_URL}/analyses/${analysisId}`, {
        headers: { "x-apikey": apiKey },
      })
      
      if (!res.ok) return {
        analysisId: null, stats: undefined }
      
        const data = (await res.json()) as VirusTotalAnalysisResponse
        const attrs = data.data?.attributes
        const stats = attrs?.last_analysis_stats ?? attrs?.stats
        const results = (attrs as any)?.results ?? {}
      
      if (attrs?.status === "completed" && Object.keys(results).length > 0) {
            return { analysisId, stats }
      }
      
        if (i < 29) await delay(2000)
    }
    
      return { analysisId: null, stats: undefined }
  } catch {
      return { analysisId: null, stats: undefined }
   }
}

export async function isPhishingLink(host: string): Promise<boolean> {
    const apiKey = process.env.VIRUSTOTAL_API_KEY
    if (!apiKey){
      return true
    }

    try {
       const cached = await getCachedScan(host)
       if (cached !== null) return cached

       const url = `https://${host}`
       
       const vtLookup = await getVirusTotalURLAnalysis(url, apiKey)
       if (vtLookup.found && vtLookup.stats) {
         const isMalicious = (vtLookup.stats.malicious ?? 0) > 0 || (vtLookup.stats.suspicious ?? 0) > 0
         console.log("VTLOOKUP FOUND:", host, isMalicious)
         await setCachedScan(host, isMalicious)
         return isMalicious
       }
       const { stats } = await submitURLForAnalysis(host, apiKey)
       
       if (stats) {
         console.log("VTSUBMIT RESULT:", host, stats)
         const isMalicious = (stats.malicious ?? 0) > 0 || (stats.suspicious ?? 0) > 0
         await setCachedScan(host, isMalicious)
         return isMalicious
       }

       return true
     } catch {
       return true
     }
}
