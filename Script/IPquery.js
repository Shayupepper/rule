// 2026-02-14 00:48

 const args       = Object.fromEntries(($argument||"").split("&").map(s=>{ const [k,...v]=s.split("="); return [k, v.join("=")] }))
 const MarkIP     = args.MaskIP === "1"
 const timeout    = 5000
 const entryGroup = (args.group || $argument?.split("&")[0] || "").trim()

 const urlIpPure  = "https://my.ippure.com/v1/info"

 const toFlag = cc => cc==="TW" ? "🇨🇳" : cc ? String.fromCodePoint(...cc.split("").map(c => 127397+c.charCodeAt(0))) : ""

 const formatIP = ip => !MarkIP ? ip : ip ? ip.includes(".") ? ip.split(".").slice(0,2).concat(["*","*"]).join(".") : ip.substring(0,9)+"..." : ""

 const httpGet = (url, t=timeout) => new Promise(r => {
 const s = setTimeout(() => r(null), t)
 $httpClient.get(url, (e,_,d) => {
   clearTimeout(s)
 try { r(JSON.parse(d)) } catch { r(null) }
 })
})

 async function queryIP(ip, deep=false) {
 let info=null, asInfo=null

 if(deep) {
   info = await httpGet(`https://ipinfo.io/${ip}/json`)
 const cc = (info?.country || "").toUpperCase()
 if(cc === "CN") asInfo = await httpGet(`http://ip-api.com/json/${ip}?fields=status,countryCode,as`)
 else asInfo = {as: info?.org, countryCode: info?.country}
 } else {
   [info, asInfo] = await Promise.all([
     httpGet(`https://ipinfo.io/${ip}/json`),
     httpGet(`http://ip-api.com/json/${ip}?fields=status,countryCode,regionName,city,isp,as`)
   ])
 }

 const org    = info?.org || asInfo?.as || ""
 const asnNum = org.split(" ")[0].replace("AS","")
 const area   = org.replace(/^AS\d+\s*/,"").replace(/\(([^)]*)\)/g," $1 ").replace(/\s+/g," ").trim()
 const cc     = (info?.country || asInfo?.countryCode || "").toUpperCase()

 return {asnNum, area, flag: toFlag(cc), countryCode: cc}
}

 const getDeepPolicy = async n => {
 let c = n
 for(let i=0; i<10; i++) {
 const nxt = await new Promise(r => $httpAPI("GET", `/v1/policy_groups/select?group_name=${encodeURIComponent(c)}`, {}, d => r(d?.policy)))
 if(!nxt || nxt === c) break
   c = nxt
 }
 return c
}

 const getInboundIP = () => new Promise(r => $httpAPI("GET", "/v1/requests/recent", {}, d => {
 const req = (d.requests || []).find(rq => rq.remoteAddress && /(ipinfo|ip-api|ippure)\.com/.test(rq.URL) && /\(Proxy\)/.test(rq.remoteAddress))
 r(req ? req.remoteAddress.replace(/\s*\(Proxy\)\s*/,"") : null)
}))

 const buildBlock = (t, v4, v6, i, p) => {
 const sup = v4 && v6
 let o = ""
 if(v4) o += `${p}${t}${sup?"⁴":""}: ${formatIP(v4)}\n`
 if(v6) o += `${p}${t}${sup?"⁶":""}: ${formatIP(v6)}\n`
 if(i.flag && i.countryCode) o += `${p}区域: ${i.flag} ${i.countryCode}\n`
 if(i.asnNum) o += `${p}ASN: AS${i.asnNum}\n`
 if(i.area)   o += `${p}ASO: ${i.area}\n`
 return o.trim()
}

 async function getIPs() {
 const nodeName = await getDeepPolicy(entryGroup || "Proxy")
 const isDirect = nodeName === "DIRECT"
 const prefix   = isDirect ? "本地 IP " : "代理 IP "

 const [exitData, v4Fallback, resPure, exitIP6Raw] = await Promise.all([
   httpGet("https://ipinfo.io/json"),
   httpGet("https://api4.ipify.org?format=json"),
   httpGet(urlIpPure),
   httpGet("https://api6.ipify.org?format=json")
 ])

 const exitIP6  = exitIP6Raw?.ip?.includes(":") ? exitIP6Raw.ip : null
 const exitIPv4 = exitData?.ip?.includes(":") ? v4Fallback?.ip||null : exitData?.ip||v4Fallback?.ip||null
 const exitIP   = exitIPv4 || exitIP6

 if(!exitIP) return $done({title:"请求失败", content:"N/A", icon:"network.slash", "title-color":"#007AFF"})

 const inboundIP   = await getInboundIP()
 const queryTarget = isDirect ? exitIP : inboundIP||exitIP

 const [inboundInfo, exitInfo] = isDirect
   ? await queryIP(queryTarget, true).then(r => [r, r])
   : await Promise.all([queryIP(queryTarget), queryIP(exitIP)])

 const ipBlocks = []
 if(isDirect) ipBlocks.push(buildBlock("入口", exitIPv4, null, inboundInfo, prefix))
 if(!isDirect && inboundIP && inboundIP !== "127.0.0.1") ipBlocks.push(buildBlock("入口", inboundIP, null, inboundInfo, prefix))
 ipBlocks.push(buildBlock("出口", exitIPv4, exitIP6, exitInfo, prefix))

 const risk      = resPure?.fraudScore ?? null
 const riskTable = [[15,"极度纯净"],[25,"纯净"],[40,"中性"],[50,"轻度风险"],[70,"中度风险"],[Infinity,"极高风险"]]
 const riskLabel = risk==null ? "N/A" : riskTable.find(([n]) => risk<=n)[1]

 const meta = [
   ...(resPure ? [`${prefix}来源: ${resPure.isBroadcast   ? "广播 IP" : "原生 IP"}`,
                  `${prefix}属性: ${resPure.isResidential ? "住宅 IP" : "机房 IP"}`] : []),
   `${prefix}风险值: ${risk==null ? "N/A" : `${risk}% ${riskLabel}`}`
 ]

 const content = ipBlocks.join("\n\n")+"\n\n"+meta.join("\n")
 $done({title: nodeName, content, icon:"network", "title-color":"#007AFF"})
}

getIPs()
