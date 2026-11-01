/* ================= 全站个性化配置：只改这个文件 ================= */

export const siteConfig = {
  // 站点名称（左上角 Logo 文字与页脚）
  siteName: "UyiHub",
  // Logo 图标（可选）：留空 = 使用内置的「Z」徽章 SVG；
  // 填图片路径或 URL 即可整体替换（载入页、左上角、浏览器标签页 favicon 同步生效），
  // 例如 "/images/logo.png"（图片放 public/images/ 目录）或 "https://xxx.com/logo.png"
  logo: "loge.webp",
  // 浏览器标签页标题
  pageTitle: "FQHome",
  // 问候语（简介卡片大标题）
  greet: "Hello World!",
  // 一句话介绍（也是打字机轮换的第一句）
  desc: "欢迎来到我的个人主页。",
  // 打字机轮换标语：填多项则循环打字展示；只保留一项或删掉此项则固定显示 desc
  motto: [
    "记录、分享、创造。",
    "把折腾当成生活方式。",
  ],
  // 建站日期（页脚显示「本站已运行 N 天」）
  siteStart: "2026-10-01",
  // 署名（页脚版权显示的名字）
  author: "qquyihub",
  // 署名链接（可选）：页脚署名会超链接到此地址，如你的主页仓库，留空则显示纯文字
  repo: "https://github.com/qquyihub",
  // 鼠标特效：自定义圆点光标 + 移动/点击涟漪
  clickEffect: true,
  // 天气城市（可选）：填城市 adcode 可固定显示该城市，如 "410100" 郑州；
  // 留空 = 访客自动定位：优先浏览器定位（精确到区县，需访客授权），
  // 拒绝授权或定位失败时自动回退按 IP 定位（uapis 接口，不受 CDN/代理影响）。
  // adcode 查询：https://lbs.amap.com/api/webservice/download
  weatherCity: "",
  // 背景（可选）：留空 = 默认动态极光渐变。两种用法：
  //  1. 静态图：把图片放到 public/images/background.jpg 即自动生效，无需配置
  //  2. 随机壁纸 API：填接口地址，每次打开页面随机换一张，加载失败自动回退极光渐变，如：
  //     "https://www.dmoe.cc/random.php"   （二次元随机）
  //     "https://t.alcy.cc/ycy"            （二次元随机）
  //     "https://api.paugram.com/wall/"    （二次元随机）
  //     "https://picsum.photos/1920/1080"  （风景随机，国外源国内较慢）
  //     "https://uapis.cn/api/v1/image/bing-daily?resolution=4k&format=redirect"（bing每日图）
  bgApi: "https://uapis.cn/api/v1/image/bing-daily",

  /* ---------- 公告卡（内容来自 Memos，字段对齐 Firefly 的动态配置） ---------- */
  announcement: {
    // 卡片名称，想叫「公告」「动态」「说说」都可以
    title: "公告",
    // Memos 实例地址（不要带结尾斜杠）
    apiUrl: "https://memos.fqhub.dpdns.org",
    // 只显示指定用户的动态（可选）：填 Memos 返回的 creator 标识，如 "users/yourname"；
    // 留空 = 显示所有公开动态。注意区分大小写，需与 API 返回的 creator 完全一致
    parent: "users/neo",
    // 卡片最多展示几条（置顶动态优先，其余按发布时间从新到旧）
    limit: 5,
  },

  /* ---------- 主页卡片开关 ---------- */
  // false = 隐藏对应卡片
  homeCards: {
    greet: true, // 欢迎卡（问候语/打字机文案见上方 greet/desc/motto）
    announce: true, // 公告卡（内容来自 Memos，配置见上方 announcement）
    hitokoto: true, // 一言卡
    clock: true, // 时间卡
    weather: true, // 天气卡（城市见 weatherCity）
    siteLinks: true, // 网站列表卡（内容见下方 siteLinks）
  },

  /* ---------- 「探索更多」面板（点击左上角 Logo 进入） ---------- */
  // 面板卡片排列：数组顺序 = 面板内排列顺序；删掉某项 = 隐藏该卡
  // 可选值：news 新闻 / hotlist 热榜 / music 音乐 / epic 限免 / history 历史上的今天 /
  //         monitor 站点监控 / github GitHub
  // 注：github 卡需同时配置 githubUser，music 卡需同时配置 musicPlaylist，
  //     monitor 卡需同时配置 siteMonitors，为空自动隐藏
  // 点击进入二级「探索更多」面板时，鼠标位置会绽开一朵小烟花并冒一句提示；
  // 这里是提示文案池（依次轮播），留空数组则只放烟花不显示提示
  panelTips: [],
  panelCards: ["news", "music", "monitor", "hotlist", "epic"],
  // GitHub 用户名（GitHub 卡展示 Followers / Repos 数据；不把 github 加进 panelCards 就不显示）
  githubUser: "qquyihub",
  // 网易云音乐歌单 ID（音乐播放卡），从歌单页地址栏 playlist?id=xxx 获取
  musicPlaylist: "12731883911",
  // ── 播放直链来源 ────────────────────────────────
  //   "meting"（默认）：走公共 Meting 接口，开箱即用，不依赖任何额外部署。
  //   "proxy"：走仓库自带的 serverless 解析（api/ + lib/）——注意该模式依赖 Node 运行时
  //             （node:vm 等），仅 Vercel 支持；部署在 Cloudflare Pages 时请保持 "meting"，
  //             前端调同源的 /api/url，不需要额外域名/证书/CORS。
  //            解析出的直链会直接播放（服务端已校验可播），它失效后才降级回 Meting。
  musicSource: "meting",
  // 音质：128k / 320k / flac / flac24bit
  musicQuality: "320k",
  // 站点监控卡（monitor）：检测各站点是否可访问（访客浏览器直连探测，
  // 显示连通状态与响应耗时，60 秒自动刷新）。url 需带 https://
  siteMonitors: [
    { name: "FQhub", url: "https://nav.fqhub.dpdns.org/" },
    { name: "FQ-Img", url: "https://imgbed.fqhub.dpdns.org/" },
    { name: "临时邮箱", url: "https://email.fqhub.dpdns.org/" },
    { name: "Edgeever", url: "https://edgeever.fqhub.dpdns.org/" },
    { name: "Nodewarden", url: "https://nodewarden.fqhub.dpdns.org/" },
    { name: "Memos", url: "https://memos.fqhub.dpdns.org/" },
    // { name: "博客", url: "https://blog.example.com/" },
  ],
  // 热榜平台与顺序（hotlist 卡），可用 key：
  //   weibo 微博 / bilibili B站 / v2ex V2EX / ithome IT之家 / hellogithub HelloGitHub
  //   zhihu 知乎 / juejin 掘金 / sspai 少数派
  hotPlatforms: ["bilibili", "zhihu", "weibo", "ithome"],
};

/* 外域同源代理（Cloudflare Pages Functions，见 functions/；本地由 vite server/preview proxy 提供），
   解决浏览器跨域限制：音乐卡高清封面走网易云官方搜索接口 */

// 社交链接
// icon 可选：github / mail / bilibili / telegram / qq / rss
export const socialLinks = [
  {
    name: "GitHub",
    icon: "github",
    tip: "去 GitHub 看看",
    url: "https://github.com/qquyihub",
  },
  {
    name: "Email",
    icon: "mail",
    tip: "来封邮件吧",
    url: "mailto:me@fqhub.dpdns.org",
  },
];

// 网站列表（展示在右侧「网站列表」卡片中）
// icon 可选：blog / cloud / music / video / code / star
export const siteLinks = [
  {
    name: "FQhub",
    desc: "导航站",
    icon: "star",
    url: "https://nav.fqhub.dpdns.org/",
  },
  // 想加更多站点？照着上面的格式复制一份即可，例如：
  // { name: "导航站", desc: "nav.example.com", icon: "star", url: "https://nav.example.com/" },
];
