/*
  智价宝小程序 · 通用工具
  格式化 / 反馈 / 主题，页面里到处要用的零散能力集中在这里，避免各页面各写一份。
*/

/* 金额：整数不带小数，非整数保留两位 */
function money(value) {
  const n = Math.round(Number(value) || 0);
  return `¥${n}`;
}

function formatDate(input) {
  if (!input) return "";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function formatDateTime(input) {
  if (!input) return "";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  const p = (n) => String(n).padStart(2, "0");
  return `${formatDate(d)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* 相对时间：今天 / 昨天 / N 天前 */
function fromNow(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const day = Math.floor(diff / 86400000);
  if (day <= 0) return "今天";
  if (day === 1) return "昨天";
  if (day < 30) return `${day} 天前`;
  return formatDate(d);
}

/* 商品图片：站点字典里存的是 Web 相对路径，小程序里替换为本地 assets 路径 */
function productImage(path) {
  if (!path) return "/assets/img/product-pin.webp";
  return `/${String(path).replace(/^\/+/, "")}`;
}

function toast(title, icon = "none") {
  wx.showToast({ title: String(title || ""), icon, duration: 1800 });
}

function ok(title) {
  wx.showToast({ title: String(title || "操作成功"), icon: "success", duration: 1500 });
}

function loading(title = "处理中") {
  wx.showLoading({ title, mask: true });
}

function hideLoading() {
  try { wx.hideLoading(); } catch (e) { /* ignore */ }
}

function confirm(content, title = "请确认") {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmColor: "#244853",
      success: (res) => resolve(!!res.confirm),
      fail: () => resolve(false)
    });
  });
}

function prompt(content, title = "请输入", placeholder = "") {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      editable: true,
      placeholderText: placeholder,
      confirmColor: "#244853",
      success: (res) => resolve(res.confirm ? String(res.content || "").trim() : null),
      fail: () => resolve(null)
    });
  });
}

/* 统一处理 err：把 Error 的 message 弹出来，避免每个页面写一遍 try/catch 提示 */
function fail(err, fallback = "操作失败") {
  const message = (err && err.message) || fallback;
  wx.showToast({ title: message, icon: "none", duration: 2200 });
}

/* 主题读写：所有页面在 onShow 时同步一次，保证跨页切换后颜色一致 */
const THEME_KEY = "zhijiabao-theme";

function getTheme() {
  try { return wx.getStorageSync(THEME_KEY) || ""; } catch (e) { return ""; }
}

function setTheme(theme) {
  try { wx.setStorageSync(THEME_KEY, theme); } catch (e) { /* ignore */ }
}

function toggleTheme(current) {
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

module.exports = {
  money,
  formatDate,
  formatDateTime,
  fromNow,
  productImage,
  toast,
  ok,
  loading,
  hideLoading,
  confirm,
  prompt,
  fail,
  getTheme,
  setTheme,
  toggleTheme
};
