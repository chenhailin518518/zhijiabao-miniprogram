const { ready, Store } = require("../../utils/boot.js");
const D = require("../../utils/data.js");
const ui = require("../../utils/ui.js");

/* 四个功能模块入口 */
const MODULES = [
  {
    key: "estimate",
    kicker: "Valuation",
    title: "AI 智能估价",
    desc: "按景区热度、品相、季节、供需四类系数给出建议挂牌价与合理区间，并附系数拆解。",
    tab: true,
    url: "/pages/estimate/estimate"
  },
  {
    key: "compare",
    kicker: "Compare",
    title: "全网比价",
    desc: "同款文创在官方商城、综合电商、二手平台的参考价区间并列，同时给出平台建议价。",
    url: "/pages/compare/compare"
  },
  {
    key: "market",
    kicker: "Market",
    title: "二手集市",
    desc: "个人闲置与商户尾货同场流转，支持多图实拍、商品问答、收藏与降价提醒。",
    tab: true,
    url: "/pages/market/market"
  },
  {
    key: "orders",
    kicker: "Escrow",
    title: "担保交易与售后",
    desc: "付款进入平台担保，确认收货后放款；支持发货、确认、取消、退款与评价全流程。",
    url: "/pages/orders/orders"
  }
];

/* 担保交易流程 */
const ESCROW = [
  { step: "01", title: "买家付款", desc: "款项进入平台担保账户，卖家能看到订单但拿不到钱。" },
  { step: "02", title: "卖家发货", desc: "卖家填写快递公司与运单号，订单转为待收货。" },
  { step: "03", title: "买家确认收货", desc: "确认后担保款项放给卖家，平台扣 2% 服务费。" },
  { step: "04", title: "售后与评价", desc: "可发起售后；订单完成后双方互评，结果计入信用分。" }
];

/* 首页实时数据的展示顺序与格式 */
const OVERVIEW_ROWS = [
  { key: "products", label: "在售商品" },
  { key: "scenicCount", label: "覆盖景区" },
  { key: "users", label: "注册用户" },
  { key: "estimates", label: "累计估价" },
  { key: "completedOrders", label: "完成订单" },
  { key: "gmv", label: "成交额", money: true },
  { key: "reviews", label: "累计评价" },
  { key: "avgScore", label: "平均评分" }
];

Page({
  data: {
    theme: "light",
    mode: "offline",
    loading: true,
    stats: [],
    modules: MODULES,
    escrow: ESCROW,
    categories: D.CATEGORIES,
    scenics: [],
    hot: []
  },

  async onLoad() {
    this.setData({ theme: getApp().getTheme() });
    const mode = await ready();
    this.setData({ mode });

    const scenicList = D.SCENICS.map((s) => ({
      id: s.id,
      city: s.city,
      heat: s.heat,
      level: s.level,
      intro: s.intro
    }));

    try {
      const [overview, hot] = await Promise.all([
        Store.api("/api/stats/overview"),
        Store.api("/api/products?sort=heat&limit=4")
      ]);
      this.setData({
        loading: false,
        scenics: scenicList,
        stats: this.buildStats(overview.overview),
        hot: this.decorate(hot.products || [])
      });
    } catch (err) {
      this.setData({ loading: false, scenics: scenicList });
      ui.fail(err, "首页数据加载失败");
    }
  },

  onShow() {
    this.setData({ theme: getApp().getTheme() });
  },

  async onPullDownRefresh() {
    try {
      await this.onLoad();
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  buildStats(overview) {
    if (!overview) return [];
    return OVERVIEW_ROWS.map((row) => {
      const raw = overview[row.key];
      return {
        label: row.label,
        value: row.money ? ui.money(raw) : String(raw === undefined ? 0 : raw)
      };
    });
  },

  /* 列表项补上小程序可用的图片路径与格式化字段 */
  decorate(list) {
    return list.map((p) => ({
      ...p,
      cover: ui.productImage((p.images || [])[0]),
      priceText: ui.money(p.price),
      originalText: ui.money(p.original),
      freightText: p.freight > 0 ? `运费 ${ui.money(p.freight)}` : "包邮"
    }));
  },

  goModule(e) {
    const { url, tab } = e.currentTarget.dataset;
    if (tab) wx.switchTab({ url });
    else wx.navigateTo({ url });
  },

  goCategory(e) {
    const category = e.currentTarget.dataset.category;
    /* 集市是 tabBar 页，参数只能通过全局暂存传递 */
    getApp().globalData.marketFilter = { category, ts: Date.now() };
    wx.switchTab({ url: "/pages/market/market" });
  },

  goScenic(e) {
    const scenic = e.currentTarget.dataset.scenic;
    getApp().globalData.marketFilter = { scenic, ts: Date.now() };
    wx.switchTab({ url: "/pages/market/market" });
  },

  goProduct(e) {
    wx.navigateTo({ url: `/pages/product/product?id=${e.currentTarget.dataset.id}` });
  },

  goEstimate() {
    wx.switchTab({ url: "/pages/estimate/estimate" });
  },

  goLegal() {
    wx.navigateTo({ url: "/pages/legal/legal" });
  },

  toggleTheme() {
    const theme = ui.toggleTheme(this.data.theme);
    getApp().setTheme(theme);
    this.setData({ theme });
  },

  async resetDemo() {
    const yes = await ui.confirm(
      "会清空本地新增的商品、订单、收藏与估价记录，恢复到内置演示数据。",
      "重置演示数据"
    );
    if (!yes) return;
    Store.resetLocal();
    ui.ok("已重置");
    setTimeout(() => {
      this.setData({ hot: [] });
      this.onLoad();
    }, 600);
  },

  onShareAppMessage() {
    return {
      title: "智价宝 · 景区文创闲置流转平台",
      path: "/pages/index/index"
    };
  }
});
