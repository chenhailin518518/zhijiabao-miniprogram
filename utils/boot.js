/*
  智价宝小程序 · 启动封装
  数据层的初始化是异步的（要探测后端是否可用），页面 onLoad 里统一 await ready()，
  既能保证拿到 Store 实例，又不会出现「页面先跑、Store 还没 init」的时序问题。
  初始化只做一次，多个页面并发进入时共用同一个 Promise。
*/
const Store = require("./store.js");

let bootPromise = null;

function ready() {
  if (!bootPromise) {
    bootPromise = Store.init().catch((err) => {
      console.warn("[boot] 数据层初始化失败，降级为本地演示模式", err);
      Store.mode = "offline";
      return "offline";
    });
  }
  return bootPromise;
}

module.exports = { ready, Store };
