// 2025-12-18 23:29

const url = "https://my.ippure.com/v1/info"
const MarkIP = ($argument || 'false').toLowerCase() === 'true'

async function getIPs() {
    let info = await new Promise((resolve) => {
        $httpClient.get(url, (err, resp, data) => resolve(err ? null : JSON.parse(data)))
    })

    if (!info) {
        $done({ title: "IP 详细信息", content: "请求失败", icon: "network.slash", 'title-color': "#FF3B30" })
        return
    }

    let v4 = info.ip.includes('.') ? info.ip : info.ipv4
    let v6 = info.ip.includes(':') ? info.ip : info.ipv6

    if (v4 && !v6) {
        v6 = await new Promise((resolve) => {
            $httpClient.get("https://v6.ident.me", (err, resp, data) => resolve(err ? null : data))
        })
    } else if (v6 && !v4) {
        v4 = await new Promise((resolve) => {
            $httpClient.get("https://v4.ident.me", (err, resp, data) => resolve(err ? null : data))
        })
    }

    let v4Info = info
    if (v6 && info.ip.includes(':') && v4) {
        v4Info = await new Promise((resolve) => {
            $httpClient.get(`${url}?ip=${v4}`, (err, resp, data) => resolve(err ? null : JSON.parse(data)))
        }) || info
    }

    const formatIP = (ip) => MarkIP ? maskIP(ip) : ip
    let ipText = `IPv4：${formatIP(v4)}`
    if (v6) ipText += `\nIPv6：${formatIP(v6)}`

    const ipSource = info.isBroadcast ? "广播 IP" : "原生 IP"
    const ipAttr = info.isResidential ? "家庭宽带" : "机房 IP"
    const flag = countryFlag(info.countryCode)
    const countryZH = countryName(info.countryCode)
    const locationText = countryZH
        ? `\nIP 位置：${flag} ${countryZH}`
        : (info.countryCode ? `\nIP 位置：${flag} ${info.countryCode}` : '')

    const risk = v4Info.fraudScore
    let riskText, titleColor
    if (risk == null) {
        riskText = 'N/A'; titleColor = "#007AFF"
    } else if (risk >= 70) {
        riskText = `极高风险 (${risk}%)`; titleColor = "#FF3B30"
    } else if (risk >= 40) {
        riskText = `中等风险 (${risk}%)`; titleColor = "#FF9500"
    } else {
        riskText = `极度纯净 (${risk}%)`; titleColor = "#34C759"
    }

    const cfRisk = v4Info.cfScore
    const cfText = (cfRisk != null) ? `\nCloudflare：${cfRisk <= 20 ? cfRisk + '% 极度纯净' : cfRisk + '% 风险较大'}` : ''

    $done({
        title: "IP 详细信息",
        content: `${ipText}${locationText}\nIP 来源：${ipSource}\nIP 属性：${ipAttr}\nIP 服务商：AS${info.asn} - ${info.asOrganization}\nIP 风险值：${riskText}${cfText}`,
        icon: "network",
        'title-color': titleColor
    })
}

getIPs()

function maskIP(ip) {
    if (!ip) return ''
    if (ip.includes('.')) {
        const p = ip.split('.')
        return `${p[0]}.${p[1]}.*.*`
    }
    const p6 = ip.split(':')
    return `${p6[0]}:${p6[1]}:*:*:*:*:*:*`
}

function countryFlag(code) {
    if (!code || code.length !== 2) return 'N/A'
    if (code.toUpperCase() === 'TW') return '🇨🇳'
    return code.toUpperCase().replace(/./g, c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)))
}

function countryName(code) {
  if (!code) return ''
  const map = {
    AC: '阿森松岛', AD: '安道尔', AE: '阿联酋', AF: '阿富汗', AG: '安提瓜和巴布达',
    AI: '安圭拉', AL: '阿尔巴尼亚', AM: '亚美尼亚', AO: '安哥拉', AQ: '南极洲',
    AR: '阿根廷', AS: '美属萨摩亚', AT: '奥地利', AU: '澳大利亚', AW: '荷属阿鲁巴',
    AX: '奥兰群岛', AZ: '阿塞拜疆', BA: '波黑共和国', BB: '巴巴多斯', BD: '孟加拉',
    BE: '比利时', BF: '布基纳法索', BG: '保加利亚', BH: '巴林', BI: '布隆迪',
    BJ: '贝宁', BL: '圣巴泰勒米', BM: '百慕大', BN: '文莱', BO: '玻利维亚',
    BQ: '荷属加勒比区', BR: '巴西', BS: '巴哈马', BT: '不丹', BV: '布韦岛',
    BW: '博茨瓦纳', BY: '白俄罗斯', BZ: '伯利兹', CA: '加拿大', CC: '科科斯群岛',
    CD: '刚果（金）', CF: '中非共和国', CG: '刚果（布）', CH: '瑞士', CI: '科特迪瓦',
    CK: '库克群岛', CL: '智利', CM: '喀麦隆', CN: '中国大陆', CO: '哥伦比亚',
    CR: '哥斯达黎加', CU: '古巴', CV: '佛得角', CW: '荷属库拉索', CX: '圣诞岛',
    CY: '塞浦路斯', CZ: '捷克', DE: '德国', DG: '迪戈加西亚', DJ: '吉布提',
    DK: '丹麦', DM: '多米尼克', DO: '多米尼加', DZ: '阿尔及利亚', EA: '休达及梅利利亚',
    EC: '厄瓜多尔', EE: '爱沙尼亚', EG: '埃及', EH: '西撒哈拉', ER: '厄立特里亚',
    ES: '西班牙', ET: '埃塞俄比亚', FI: '芬兰', FJ: '斐济', FK: '福克兰群岛',
    FM: '密克罗尼西亚', FO: '法罗群岛', FR: '法国', GA: '加蓬', GB: '英国',
    GD: '格林纳达', GE: '格鲁吉亚', GF: '法属圭亚那', GG: '根西岛', GH: '加纳',
    GI: '直布罗陀', GL: '格陵兰', GM: '冈比亚', GN: '几内亚', GP: '法属瓜德罗普',
    GQ: '赤道几内亚', GR: '希腊', GS: '南乔治亚和南桑威奇群岛', GT: '危地马拉',
    GU: '关岛', GW: '几内亚比绍', GY: '圭亚那', HK: '香港', HM: '赫德岛和麦克唐纳群岛',
    HN: '洪都拉斯', HR: '克罗地亚', HT: '海地', HU: '匈牙利', IC: '加纳利群岛',
    ID: '印尼', IE: '爱尔兰', IL: '以色列', IM: '马恩岛', IN: '印度',
    IO: '英属印度洋领地', IQ: '伊拉克', IR: '伊朗', IS: '冰岛', IT: '意大利',
    JE: '泽西岛', JM: '牙买加', JO: '约旦', JP: '日本', KE: '肯尼亚',
    KG: '吉尔吉斯斯坦', KH: '柬埔寨', KI: '基里巴斯', KM: '科摩罗', KN: '圣基茨和尼维斯',
    KP: '朝鲜', KR: '韩国', KW: '科威特', KY: '开曼群岛', KZ: '哈萨克斯坦',
    LA: '老挝', LB: '黎巴嫩', LC: '圣卢西亚', LI: '列支敦士登', LK: '斯里兰卡',
    LR: '利比里亚', LS: '莱索托', LT: '立陶宛', LU: '卢森堡', LV: '拉脱维亚',
    LY: '利比亚', MA: '摩洛哥', MC: '摩纳哥', MD: '摩尔多瓦', ME: '黑山',
    MF: '法属圣马丁', MG: '马达加斯加', MH: '马绍尔群岛', MK: '北马其顿', ML: '马里',
    MM: '缅甸', MN: '蒙古', MO: '澳门', MP: '北马里亚纳群岛', MQ: '法属马提尼克',
    MR: '毛里塔尼亚', MS: '蒙特塞拉特', MT: '马耳他', MU: '毛里求斯', MV: '马尔代夫',
    MW: '马拉维', MX: '墨西哥', MY: '马来西亚', MZ: '莫桑比克', NA: '纳米比亚',
    NC: '新喀里多尼亚', NE: '尼日尔', NF: '诺福克岛', NG: '尼日利亚', NI: '尼加拉瓜',
    NL: '荷兰', NO: '挪威', NP: '尼泊尔', NR: '瑙鲁', NU: '纽埃',
    NZ: '新西兰', OM: '阿曼', PA: '巴拿马', PE: '秘鲁', PF: '法属波利尼西亚',
    PG: '巴布亚新几内亚', PH: '菲律宾', PK: '巴基斯坦', PL: '波兰', PM: '圣皮埃尔和密克隆',
    PN: '皮特凯恩群岛', PR: '波多黎各', PS: '巴勒斯坦', PT: '葡萄牙', PW: '帕劳',
    PY: '巴拉圭', QA: '卡塔尔', RE: '法属留尼汪', RO: '罗马尼亚', RS: '塞尔维亚',
    RU: '俄罗斯', RW: '卢旺达', SA: '沙特阿拉伯', SB: '所罗门群岛', SC: '塞舌尔',
    SD: '苏丹', SE: '瑞典', SG: '新加坡', SH: '圣赫勒拿', SI: '斯洛文尼亚',
    SJ: '斯瓦尔巴和扬马延', SK: '斯洛伐克', SL: '塞拉利昂', SM: '圣马力诺', SN: '塞内加尔',
    SO: '索马里', SR: '苏里南', SS: '南苏丹', ST: '圣多美和普林西比', SV: '萨尔瓦多',
    SX: '荷属圣马丁', SY: '叙利亚', SZ: '斯威士兰', TA: '特里斯坦-达库尼亚',
    TC: '特克斯和凯科斯群岛', TD: '乍得', TF: '法属南部领地', TG: '多哥', TH: '泰国',
    TJ: '塔吉克斯坦', TK: '托克劳', TL: '东帝汶', TM: '土库曼斯坦', TN: '突尼斯',
    TO: '汤加', TR: '土耳其', TT: '特立尼达和多巴哥', TV: '图瓦卢', TW: '台湾',
    TZ: '坦桑尼亚', UA: '乌克兰', UG: '乌干达', UM: '美国本土外小岛屿', US: '美国',
    UY: '乌拉圭', UZ: '乌兹别克斯坦', VA: '梵蒂冈', VC: '圣文森特和格林纳丁斯',
    VE: '委内瑞拉', VG: '英属维尔京', VI: '美属维尔京', VN: '越南',
    VU: '瓦努阿图', WF: '瓦利斯和富图纳', WS: '萨摩亚', XK: '科索沃', YE: '也门',
    YT: '马约特', ZA: '南非', ZM: '赞比亚', ZW: '津巴布韦',
  }
  return map[code.toUpperCase()] || ''
}
