/*
  智价宝小程序 · 运行配置

  API_BASE 留空 -> 本地演示模式。
    数据全部落在小程序本地存储，断网也能完整演示估价、下单、订单流转、售后。
    比赛现场建议保持留空，不依赖任何服务器与网络。

  API_BASE 填 https 域名 -> 在线模式。
    需要满足三件事：域名已在微信公众平台配置为 request 合法域名、
    已完成 ICP 备案、证书受客户端信任。填错会导致全部请求被拦截。
    例：API_BASE: "https://api.example.com"
*/
const API_BASE = "";

/*
  WEATHER_DIRECT 控制是否允许小程序直连 Open-Meteo 取实时天气。
  打开的前提是把 api.open-meteo.com 加入 request 合法域名，否则请求会被微信拦截。
  比赛演示建议保持 false：拿不到天气时估价按中性因子 1.000 计算，结果照常给出。
*/
const WEATHER_DIRECT = false;

/* 主题：light 月白国风（默认） / dark 深色国风 */
const DEFAULT_THEME = "light";

/* 演示账号，登录页一键填充用 */
const DEMO_ACCOUNTS = [
  { label: "买家", nickname: "澄禾", phone: "18800000001", password: "demo1234" },
  { label: "卖家", nickname: "湖畔旧物", phone: "18800000002", password: "demo1234" },
  { label: "运营", nickname: "智价宝运营", phone: "18800000000", password: "admin888" }
];

/*
  举报理由，与 Web 版举报弹窗完全一致。
  共 7 项，超过 wx.showActionSheet 的 6 项上限，因此举报面板用页面内浮层实现，
  见 templates/report-sheet.wxml。
*/
const REPORT_REASONS = [
  "虚假宣传", "假货或仿制品", "价格欺诈", "盗图侵权", "骚扰或辱骂", "站外交易", "其他违规"
];

module.exports = { API_BASE, WEATHER_DIRECT, DEFAULT_THEME, DEMO_ACCOUNTS, REPORT_REASONS };
