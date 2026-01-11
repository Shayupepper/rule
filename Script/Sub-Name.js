// 2026-01-11 12:44

/**
// 示例#flag&out=zh
 * in=zh      中文输入识别（香港）
 * in=us      EN码输入（HK）
 * in=quan    英文全称输入（Hong Kong）
 * in=flag    Emoji输入(🇭🇰)
 *
 * out=zh     输出中文（默认）
 * out=us     输出EN码（HK）
 * out=quan   输出英文全称（Hong Kong）
 * out=flag   输出Emoji(🇭🇰)
 *
 * flag=true  地区前加国旗
 * flag=false 不加（默认）
 *
 * abs=en     英文字母边界匹配（默认）
 * abs=all    全关键词匹配
 * abs=off    关闭边界匹配
 *
 * clear=true 清理信息节点（默认）
 * nx=true    删除高倍率节点
 * blnx=true  仅保留高倍率节点
 * key=true   启用关键地区过滤
 *
 * bl=true    统一倍率显示（如 3×）
 * blgd=true  识别专线/游戏等标签
 * blpx=true  专线节点前置排序
 * one=true   单一节点去掉 01
 *
 * blockquic=on/off  强制控制 block-quic
 */

const inArg = $arguments;

function boolArg(v, d = false) {
  if (v === undefined || v === null) return d;
  if (typeof v === "string") {
    const s = v.trim();
    if (s === "") return d;
    if (/^(true|1|on|yes)$/i.test(s)) return true;
    if (/^(false|0|off|no)$/i.test(s)) return false;
    return d;
  }
  return !!v;
}

const nx     = boolArg(inArg.nx, false),
      bl     = boolArg(inArg.bl, false),
      nf     = boolArg(inArg.nf, false),
      key    = boolArg(inArg.key, false),
      blgd   = boolArg(inArg.blgd, false),
      blpx   = boolArg(inArg.blpx, false),
      blnx   = boolArg(inArg.blnx, false),
      numone = boolArg(inArg.one, false),
      debug  = boolArg(inArg.debug, false),
      clear  = boolArg(inArg.clear, true),
      addflag= boolArg(inArg.flag, false),
      nm     = boolArg(inArg.nm, false);

const ABSMODE = (inArg.abs || "en").toLowerCase();

const FGF = inArg.fgf == undefined ? " " : decodeURI(inArg.fgf),
      XHFGF = inArg.sn == undefined ? " " : decodeURI(inArg.sn),
      FNAME = inArg.name == undefined ? "" : decodeURI(inArg.name),
      BLKEY = inArg.blkey == undefined ? "" : decodeURI(inArg.blkey),
      blockquic = inArg.blockquic == undefined ? "" : decodeURI(inArg.blockquic),
      nameMap = { cn: "cn", zh: "cn", us: "us", en: "us", quan: "quan", gq: "gq", flag: "gq" },
      inname = nameMap[inArg.in] || "",
      outputName = nameMap[inArg.out] || "";

const FG = ['🇦🇨','🇦🇩','🇦🇪','🇦🇫','🇦🇬','🇦🇮','🇦🇱','🇦🇲','🇦🇴','🇦🇶','🇦🇷','🇦🇸','🇦🇹','🇦🇺','🇦🇼','🇦🇽','🇦🇿','🇧🇦','🇧🇧','🇧🇩','🇧🇪','🇧🇫','🇧🇬','🇧🇭','🇧🇮','🇧🇯','🇧🇱','🇧🇲','🇧🇳','🇧🇴','🇧🇶','🇧🇷','🇧🇸','🇧🇹','🇧🇻','🇧🇼','🇧🇾','🇧🇿','🇨🇦','🇨🇨','🇨🇩','🇨🇫','🇨🇬','🇨🇭','🇨🇮','🇨🇰','🇨🇱','🇨🇲','🇨🇳','🇨🇴','🇨🇵','🇨🇷','🇨🇺','🇨🇻','🇨🇼','🇨🇽','🇨🇾','🇨🇿','🇩🇪','🇩🇬','🇩🇯','🇩🇰','🇩🇲','🇩🇴','🇩🇿','🇪🇦','🇪🇨','🇪🇪','🇪🇬','🇪🇭','🇪🇷','🇪🇸','🇪🇹','🇪🇺','🇫🇮','🇫🇯','🇫🇰','🇫🇲','🇫🇴','🇫🇷','🇬🇦','🇬🇧','🇬🇩','🇬🇪','🇬🇫','🇬🇬','🇬🇭','🇬🇮','🇬🇱','🇬🇲','🇬🇳','🇬🇵','🇬🇶','🇬🇷','🇬🇸','🇬🇹','🇬🇺','🇬🇼','🇬🇾','🇭🇰','🇭🇲','🇭🇳','🇭🇷','🇭🇹','🇭🇺','🇮🇨','🇮🇩','🇮🇪','🇮🇱','🇮🇲','🇮🇳','🇮🇴','🇮🇶','🇮🇷','🇮🇸','🇮🇹','🇯🇪','🇯🇲','🇯🇴','🇯🇵','🇰🇪','🇰🇬','🇰🇭','🇰🇮','🇰🇲','🇰🇳','🇰🇵','🇰🇷','🇰🇼','🇰🇾','🇰🇿','🇱🇦','🇱🇧','🇱🇨','🇱🇮','🇱🇰','🇱🇷','🇱🇸','🇱🇹','🇱🇺','🇱🇻','🇱🇾','🇲🇦','🇲🇨','🇲🇩','🇲🇪','🇲🇫','🇲🇬','🇲🇭','🇲🇰','🇲🇱','🇲🇲','🇲🇳','🇲🇴','🇲🇵','🇲🇶','🇲🇷','🇲🇸','🇲🇹','🇲🇺','🇲🇻','🇲🇼','🇲🇽','🇲🇾','🇲🇿','🇳🇦','🇳🇨','🇳🇪','🇳🇫','🇳🇬','🇳🇮','🇳🇱','🇳🇴','🇳🇵','🇳🇷','🇳🇺','🇳🇿','🇴🇲','🇵🇦','🇵🇪','🇵🇫','🇵🇬','🇵🇭','🇵🇰','🇵🇱','🇵🇲','🇵🇳','🇵🇷','🇵🇸','🇵🇹','🇵🇼','🇵🇾','🇶🇦','🇷🇪','🇷🇴','🇷🇸','🇷🇺','🇷🇼','🇸🇦','🇸🇧','🇸🇨','🇸🇩','🇸🇪','🇸🇬','🇸🇭','🇸🇮','🇸🇯','🇸🇰','🇸🇱','🇸🇲','🇸🇳','🇸🇴','🇸🇷','🇸🇸','🇸🇹','🇸🇻','🇸🇽','🇸🇾','🇸🇿','🇹🇦','🇹🇨','🇹🇩','🇹🇫','🇹🇬','🇹🇭','🇹🇯','🇹🇰','🇹🇱','🇹🇲','🇹🇳','🇹🇴','🇹🇷','🇹🇹','🇹🇻','🇨🇳','🇹🇿','🇺🇦','🇺🇬','🇺🇲','🇺🇸','🇺🇾','🇺🇿','🇻🇦','🇻🇨','🇻🇪','🇻🇬','🇻🇮','🇻🇳','🇻🇺','🇼🇫','🇼🇸','🇽🇰','🇾🇪','🇾🇹','🇿🇦','🇿🇲','🇿🇼'];
const EN = ['AC','AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AS','AT','AU','AW','AX','AZ','BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ','CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CP','CR','CU','CV','CW','CX','CY','CZ','DE','DG','DJ','DK','DM','DO','DZ','EA','EC','EE','EG','EH','ER','ES','ET','EU','FI','FJ','FK','FM','FO','FR','GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY','HK','HM','HN','HR','HT','HU','IC','ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT','JE','JM','JO','JP','KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ','LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY','MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ','NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ','OM','PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY','QA','RE','RO','RS','RU','RW','SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SY','SZ','TA','TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ','UA','UG','UM','US','UY','UZ','VA','VC','VE','VG','VI','VN','VU','WF','WS','XK','YE','YT','ZA','ZM','ZW'];
const ZH = ['阿森松岛','安道尔','阿联酋','阿富汗','安提瓜','安圭拉','阿尔巴尼亚','亚美尼亚','安哥拉','南极','阿根廷','萨摩亚','奥地利','澳大利亚','阿鲁巴','奥兰群岛','阿塞拜疆','波黑','巴巴多斯','孟加拉','比利时','布基纳法索','保加利亚','巴林','布隆迪','贝宁','圣巴泰勒米','百慕大','文莱','玻利维亚','荷属加勒比','巴西','巴哈马','不丹','布韦岛','博茨瓦纳','白俄罗斯','伯利兹','加拿大','科科斯群岛','刚果(金)','中非','刚果(布)','瑞士','科特迪瓦','库克群岛','智利','喀麦隆','中国','哥伦比亚','克利珀顿岛','哥斯达黎加','古巴','佛得角','库拉索','圣诞岛','塞浦路斯','捷克','德国','迭戈加西亚','吉布提','丹麦','多米尼克','多米尼加','阿尔及利亚','休达和梅利利亚','厄瓜多尔','爱沙尼亚','埃及','西撒哈拉','厄立特里亚','西班牙','埃塞俄比亚','欧盟','芬兰','斐济','福克兰群岛','密克罗尼西亚','法罗群岛','法国','加蓬','英国','格林纳达','格鲁吉亚','法属圭亚那','根西岛','加纳','直布罗陀','格陵兰','冈比亚','几内亚','瓜德罗普','赤道几内亚','希腊','南乔治亚','危地马拉','关岛','几内亚比绍','圭亚那','香港','赫德岛','洪都拉斯','克罗地亚','海地','匈牙利','加那利群岛','印尼','爱尔兰','以色列','马恩岛','印度','英属印度洋领地','伊拉克','伊朗','冰岛','意大利','泽西岛','牙买加','约旦','日本','肯尼亚','吉尔吉斯','柬埔寨','基里巴斯','科摩罗','圣基茨和尼维斯','朝鲜','韩国','科威特','开曼群岛','哈萨克斯坦','老挝','黎巴嫩','圣卢西亚','列支敦士登','斯里兰卡','利比里亚','莱索托','立陶宛','卢森堡','拉脱维亚','利比亚','摩洛哥','摩纳哥','摩尔多瓦','黑山','法属圣马丁','马达加斯加','马绍尔','马其顿','马里','缅甸','蒙古','澳门','北马里亚纳','马提尼克','毛里塔尼亚','蒙特塞拉特','马耳他','毛里求斯','马尔代夫','马拉维','墨西哥','马来西亚','莫桑比克','纳米比亚','新喀里多尼亚','尼日尔','诺福克岛','尼日利亚','尼加拉瓜','荷兰','挪威','尼泊尔','瑙鲁','纽埃','新西兰','阿曼','巴拿马','秘鲁','法属波利尼西亚','巴布亚新几内亚','菲律宾','巴基斯坦','波兰','圣皮埃尔和密克隆','皮特凯恩','波多黎各','巴勒斯坦','葡萄牙','帕劳','巴拉圭','卡塔尔','留尼汪','罗马尼亚','塞尔维亚','俄罗斯','卢旺达','沙特阿拉伯','所罗门群岛','塞舌尔','苏丹','瑞典','新加坡','圣赫勒拿','斯洛文尼亚','斯瓦尔巴','斯洛伐克','塞拉利昂','圣马力诺','塞内加尔','索马里','苏里南','南苏丹','圣多美和普林西比','萨尔瓦多','荷属圣马丁','叙利亚','斯威士兰','特里斯坦-达库尼亚','特克斯和凯科斯','乍得','法属南部领地','多哥','泰国','塔吉克斯坦','托克劳','东帝汶','土库曼斯坦','突尼斯','汤加','土耳其','特立尼达和多巴哥','图瓦卢','台湾','坦桑尼亚','乌克兰','乌干达','美属本土外岛','美国','乌拉圭','乌兹别克','梵蒂冈','圣文森特','委内瑞拉','英属维京','美属维京','越南','瓦努阿图','瓦利斯和富图纳','萨摩亚','科索沃','也门','马约特','南非','赞比亚','津巴布韦'];
const QC = ['Ascension Island','Andorra','United Arab Emirates','Afghanistan','Antigua and Barbuda','Anguilla','Albania','Armenia','Angola','Antarctica','Argentina','American Samoa','Austria','Australia','Aruba','Åland Islands','Azerbaijan','Bosnia and Herzegovina','Barbados','Bangladesh','Belgium','Burkina Faso','Bulgaria','Bahrain','Burundi','Benin','Saint Barthélemy','Bermuda','Brunei','Bolivia','Bonaire','Brazil','Bahamas','Bhutan','Bouvet Island','Botswana','Belarus','Belize','Canada','Cocos Islands','Congo-Kinshasa','Central African Republic','Congo-Brazzaville','Switzerland','Ivory Coast','Cook Islands','Chile','Cameroon','China','Colombia','Clipperton Island','Costa Rica','Cuba','Cape Verde','Curaçao','Christmas Island','Cyprus','Czech Republic','Germany','Diego Garcia','Djibouti','Denmark','Dominica','Dominican Republic','Algeria','Ceuta & Melilla','Ecuador','Estonia','Egypt','Western Sahara','Eritrea','Spain','Ethiopia','European Union','Finland','Fiji','Falkland Islands','Micronesia','Faroe Islands','France','Gabon','United Kingdom','Grenada','Georgia','French Guiana','Guernsey','Ghana','Gibraltar','Greenland','Gambia','Guinea','Guadeloupe','Equatorial Guinea','Greece','South Georgia','Guatemala','Guam','Guinea-Bissau','Guyana','Hong Kong','Heard Island','Honduras','Croatia','Haiti','Hungary','Canary Islands','Indonesia','Ireland','Israel','Isle of Man','India','British Indian Ocean Territory','Iraq','Iran','Iceland','Italy','Jersey','Jamaica','Jordan','Japan','Kenya','Kyrgyzstan','Cambodia','Kiribati','Comoros','Saint Kitts and Nevis','North Korea','South Korea','Kuwait','Cayman Islands','Kazakhstan','Laos','Lebanon','Saint Lucia','Liechtenstein','Sri Lanka','Liberia','Lesotho','Lithuania','Luxembourg','Latvia','Libya','Morocco','Monaco','Moldova','Montenegro','Saint Martin','Madagascar','Marshall Islands','North Macedonia','Mali','Myanmar','Mongolia','Macau','Northern Mariana Islands','Martinique','Mauritania','Montserrat','Malta','Mauritius','Maldives','Malawi','Mexico','Malaysia','Mozambique','Namibia','New Caledonia','Niger','Norfolk Island','Nigeria','Nicaragua','Netherlands','Norway','Nepal','Nauru','Niue','New Zealand','Oman','Panama','Peru','French Polynesia','Papua New Guinea','Philippines','Pakistan','Poland','Saint Pierre and Miquelon','Pitcairn Islands','Puerto Rico','Palestine','Portugal','Palau','Paraguay','Qatar','Réunion','Romania','Serbia','Russia','Rwanda','Saudi Arabia','Solomon Islands','Seychelles','Sudan','Sweden','Singapore','Saint Helena','Slovenia','Svalbard and Jan Mayen','Slovakia','Sierra Leone','San Marino','Senegal','Somalia','Suriname','South Sudan','São Tomé and Príncipe','El Salvador','Sint Maarten','Syria','Eswatini','Tristan da Cunha','Turks and Caicos Islands','Chad','French Southern Territories','Togo','Thailand','Tajikistan','Tokelau','Timor-Leste','Turkmenistan','Tunisia','Tonga','Turkey','Trinidad and Tobago','Tuvalu','Taiwan','Tanzania','Ukraine','Uganda','U.S. Outlying Islands','United States','Uruguay','Uzbekistan','Vatican City','Saint Vincent','Venezuela','British Virgin Islands','U.S. Virgin Islands','Vietnam','Vanuatu','Wallis and Futuna','Samoa','Kosovo','Yemen','Mayotte','South Africa','Zambia','Zimbabwe'];

const specialRegex = [
  /(\d\.)?\d+×/,
  /IPLC|IEPL|Kern|Edge|Pro|Std|Exp|Biz|Fam|Game|Buy|Zx|LB|Game/,
];

const nameclear =
  /(套餐|到期|有效|剩余|版本|已用|过期|失联|测试|官方|网址|备用|群|TEST|客服|网站|获取|订阅|流量|机场|下次|官址|联系|邮箱|工单|学术|USE|USED|TOTAL|EXPIRE|EMAIL)/i;

const regexArray=[/ˣ²/, /ˣ³/, /ˣ⁴/, /ˣ⁵/, /ˣ⁶/, /ˣ⁷/, /ˣ⁸/, /ˣ⁹/, /ˣ¹⁰/, /ˣ²⁰/, /ˣ³⁰/, /ˣ⁴⁰/, /ˣ⁵⁰/, /专线/, /(IPLC|I-P-L-C)/i, /(IEPL|I-E-P-L)/i, /核心/, /边缘/, /高级/, /标准/, /特殊/, /实验/, /商宽/, /家宽/, /家庭宽带/,/游戏|game/i, /购物/, /LB/, /cloudflare/i, /\budp\b/i, /\bgpt\b/i, /udpn\b/, ];
const valueArray= [ "2×","3×","4×","5×","6×","7×","8×","9×","10×","20×","30×","40×","50×","DL","IPLC","IEPL","Kern","Edge","Pro","Std","Spec","Exp","Biz","Fam","Game","Buy","LB","CF","UDP","GPT","UDPN"];

const nameblnx = /(高倍|(?!1)2+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;
const namenx   = /(高倍|(?!1)(0\.|\d)+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;

const keya = /港|Hong|HK|新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US|韩|土耳其|TR|Turkey|Korea|KR||||||/i;
const keyb = /(((1|2|3|4)\d)|(香港|Hong|HK) 0[5-9]|((新加坡|SG|Singapore|日本|Japan|JP|美国|United States|US|韩|土耳其|TR|Turkey|Korea|KR) 0[3-9]))/i;

const rurekey = {
  GB: /UK/g,
  "B-G-P": /BGP/g,
  "I-E-P-L": /IEPL/gi,
  "I-P-L-C": /IPLC/gi,
  "Russia Moscow": /Moscow/g,
  "Korea Chuncheon": /Chuncheon|Seoul/g,
  "Hong Kong": /Hongkong|HONG KONG/gi,
  "United Kingdom London": /London|Great Britain/g,
  "Taiwan TW 台湾 ": /(台|Tai\s?wan|TW).*?|.*?(台|Tai\s?wan|TW)/g,
  "United States": /USA|Los Angeles|San Jose|Silicon Valley|Michigan/g,
  澳大利亚: /澳洲|墨尔本|悉尼|土澳/g,
  德国: /法兰克福/g,
  台湾: /新台|新北|台(?!.*线)/g,
  日本: /东京|大坂/g,
  新加坡: /狮城/g,
  美国: /波特兰|芝加哥|哥伦布|纽约|硅谷|俄勒冈|西雅图/g,
  韩国: /春川|首尔/g,
  英国: /伦敦/g,
  俄罗斯: /莫斯科/g,
  土耳其: /伊斯坦布尔/g,
  泰国: /曼谷/g,
  法国: /巴黎/g,
  印尼: /雅加达/g,
  印度: /孟买/g,
  阿联酋: /迪拜/gi,
  沙特阿拉伯: /利雅得/gi,
  家宽: /家庭宽带|家庭|住宅/g,
};

let GetK = false, AMK = [];
function ObjKA(i) {
  GetK = true;
  AMK = Object.entries(i).filter(([k]) => k && k.trim() !== "");
}

const EN_SET = new Set(EN);
function escapeReg(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }
function isAsciiWord(s){ return /^[A-Za-z0-9]+$/.test(s); }
function matchWithBoundary(name, key){
  if (ABSMODE === "off") return name.includes(key);
  if (ABSMODE === "en") {
    if (EN_SET.has(key)) {
      const re = new RegExp(`(?:^|[^A-Za-z])${escapeReg(key)}(?:[^A-Za-z]|$)`,"i");
      return re.test(name);
    }
    return name.includes(key);
  }
  const ascii = isAsciiWord(key);
  const re = ascii
    ? new RegExp(`(?:^|[^A-Za-z0-9])${escapeReg(key)}(?:[^A-Za-z0-9]|$)`,"i")
    : new RegExp(`(?:^|[^\\u4e00-\\u9fffA-Za-z0-9])${escapeReg(key)}(?:[^\\u4e00-\\u9fffA-Za-z0-9]|$)`,"i");
  return re.test(name);
}

function operator(pro) {
  const Allmap = {};
  const outList = getList(outputName);
  let inputList, retainKey = "";

  if (inname !== "") {
    inputList = [getList(inname)];
  } else {
    inputList = [ZH, QC, EN];
  }

  inputList.forEach((arr) => {
    arr.forEach((value, valueIndex) => {
      if (value && String(value).trim() !== "") {
        Allmap[value] = outList[valueIndex];
      }
    });
  });

  if (clear || nx || blnx || key) {
    pro = pro.filter((res) => {
      const resname = res.name;
      const keep =
        !(clear && nameclear.test(resname)) &&
        !(nx && namenx.test(resname)) &&
        !(blnx && !nameblnx.test(resname)) &&
        !(key && !(keya.test(resname) && /2|4|6|7/i.test(resname)));
      return keep;
    });
  }

  const BLKEYS = BLKEY ? BLKEY.split("+") : "";

  pro.forEach((e) => {
    let bktf = false, ens = e.name;

    Object.keys(rurekey).forEach((ikey) => {
      if (rurekey[ikey].test(e.name)) {
        e.name = e.name.replace(rurekey[ikey], ikey);
        if (BLKEY) {
          bktf = true;
          let BLKEY_REPLACE = "", re = false;
          BLKEYS.forEach((i) => {
            if (i.includes(">") && ens.includes(i.split(">")[0])) {
              if (rurekey[ikey].test(i.split(">")[0])) e.name += " " + i.split(">")[0];
              if (i.split(">")[1]) { BLKEY_REPLACE = i.split(">")[1]; re = true; }
            } else {
              if (ens.includes(i)) e.name += " " + i;
            }
            retainKey = re ? BLKEY_REPLACE : BLKEYS.filter((items) => e.name.includes(items));
          });
        }
      }
    });

    if (blockquic == "on") e["block-quic"]="on";
    else if (blockquic == "off") e["block-quic"]="off";
    else delete e["block-quic"];

    if (!bktf && BLKEY) {
      let BLKEY_REPLACE = "", re = false;
      BLKEYS.forEach((i) => {
        if (i.includes(">") && e.name.includes(i.split(">")[0])) {
          if (i.split(">")[1]) { BLKEY_REPLACE = i.split(">")[1]; re = true; }
        }
      });
      retainKey = re ? BLKEY_REPLACE : BLKEYS.filter((items) => e.name.includes(items));
    }

    let ikey = "", ikeys = "";
    if (blgd) {
      regexArray.forEach((regex, idx) => { if (regex.test(e.name)) ikeys = valueArray[idx]; });
    }

    if (bl) {
      const match = e.name.match(/((倍率|X|x|×)\D?((\d{1,3}\.)?\d+)\D?)|((\d{1,3}\.)?\d+)(倍|X|x|×)/);
      if (match) {
        const rev = match[0].match(/(\d[\d.]*)/)[0];
        if (rev !== "1") ikey = rev + "×";
      }
    }

    if (!GetK) ObjKA(Allmap);

    const findKey = AMK.find(([k]) => matchWithBoundary(e.name, k));

    let firstName = "", nNames = "";
    if (nf) firstName = FNAME; else nNames = FNAME;

    if (findKey?.[1]) {
      const findKeyValue = findKey[1];
      let keyover = [], usflag = "";
      if (addflag) {
        const idx = getList(outputName).indexOf(findKeyValue);
        if (idx !== -1) usflag = FG[idx] || "";
      }
      keyover = keyover.concat(firstName, usflag, nNames, findKeyValue, retainKey, ikey, ikeys).filter(Boolean);
      e.name = keyover.join(FGF);
    } else {
      if (nm) e.name = FNAME + FGF + e.name; else e.name = null;
    }
  });

  pro = pro.filter((e) => e.name !== null);
  jxh(pro);
  if (numone) oneP(pro);
  if (blpx) pro = fampx(pro);
  return pro;
}

function getList(arg) {
  switch (arg) {
    case "us": return EN;
    case "gq": return FG;
    case "quan": return QC;
    default: return ZH;
  }
}

function jxh(e){
  const n=e.reduce((e,n)=>{
    const t=e.find((e)=>e.name===n.name);
    if(t){ t.count++; t.items.push({...n,name:`${n.name}${XHFGF}${t.count.toString().padStart(2,"0")}`});}
    else { e.push({name:n.name,count:1,items:[{...n,name:`${n.name}${XHFGF}01`}],});}
    return e;
  },[]);
  const t=(typeof Array.prototype.flatMap==='function'?n.flatMap((e)=>e.items):n.reduce((a,e)=>a.concat(e.items),[]));
  e.splice(0,e.length,...t); return e;
}

function oneP(e){
  const t=e.reduce((e,t)=>{
    const n=t.name.replace(/[^A-Za-z0-9\u00C0-\u017F\u4E00-\u9FFF]+\d+$/,"");
    if(!e[n]) e[n]=[]; e[n].push(t); return e;
  },{});
  for(const e in t){
    if(t[e].length===1 && t[e][0].name.endsWith("01")){
      t[e][0].name=t[e][0].name.replace(/[^.]01/,"");
    }
  }
  return e;
}

function fampx(pro){
  const wis=[], wnout=[];
  for(const proxy of pro){
    const fan=specialRegex.some((regex)=>regex.test(proxy.name));
    if(fan) wis.push(proxy); else wnout.push(proxy);
  }
  const sps=wis.map((proxy)=>specialRegex.findIndex((regex)=>regex.test(proxy.name)));
  wis.sort((a,b)=> sps[wis.indexOf(a)]-sps[wis.indexOf(b)] || a.name.localeCompare(b.name));
  wnout.sort((a,b)=> pro.indexOf(a)-pro.indexOf(b));
  return wnout.concat(wis);
}
