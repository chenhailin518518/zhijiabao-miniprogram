/*
  智价宝小程序 · 图片处理

  两条路径：
    在线模式（API_BASE 已配置）——压到长边 UPLOAD.maxEdge 后走 wx.uploadFile 上传，拿服务端 URL
    本地演示模式 —— 直接 wx.getFileSystemManager().saveFile 落盘到小程序本地文件系统，
                     返回 wxfile:// 永久路径，重启后依然能显示

  为什么本地模式不直接存 tempFilePath：临时文件在小程序退出后会被清理，
  商品图会变成空白；也不把 base64 塞进本地存储，图稍大就会撞到 10MB 的存储上限。
*/
const D = require("./data.js");
const { API_BASE } = require("./config.js");

function compress(src, quality = 82) {
  return new Promise((resolve) => {
    wx.compressImage({
      src,
      quality,
      success: (res) => resolve(res.tempFilePath),
      /* 压缩失败就用原图，不阻断流程 */
      fail: () => resolve(src)
    });
  });
}

function saveLocal(tempFilePath) {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().saveFile({
      tempFilePath,
      success: (res) => resolve(res.savedFilePath),
      fail: (err) => reject(new Error((err && err.errMsg) || "图片保存失败"))
    });
  });
}

function uploadToServer(filePath) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${API_BASE}/api/uploads`,
      filePath,
      name: "file",
      timeout: 20000,
      success: (res) => {
        let data = res.data;
        if (typeof data === "string") {
          try { data = JSON.parse(data); } catch (e) { return reject(new Error("上传返回了非 JSON 响应")); }
        }
        if (res.statusCode >= 300 || (data && data.ok === false)) {
          return reject(new Error((data && data.message) || `上传失败（${res.statusCode}）`));
        }
        resolve(data.url);
      },
      fail: (err) => reject(new Error((err && err.errMsg) || "上传失败"))
    });
  });
}

const Upload = {
  /* 选图 -> 压缩 -> 落地，返回可直接存进商品记录的路径数组 */
  async pickToPaths(count = D.UPLOAD.maxCount) {
    const remain = Math.max(1, Math.min(count, D.UPLOAD.maxCount));
    const res = await new Promise((resolve, reject) => {
      wx.chooseMedia({
        count: remain,
        mediaType: ["image"],
        sizeType: ["compressed"],
        success: resolve,
        fail: reject
      });
    });
    const files = (res.tempFiles || []).slice(0, remain);
    const paths = [];
    for (const file of files) {
      if (file.size && file.size > D.UPLOAD.maxOriginalBytes) {
        throw new Error(`单张原图不能超过 ${D.formatMb(D.UPLOAD.maxOriginalBytes)}`);
      }
      const compressed = await compress(file.tempFilePath, Math.round(D.UPLOAD.quality * 100));
      paths.push(API_BASE ? await uploadToServer(compressed) : await saveLocal(compressed));
    }
    return paths;
  },

  /* 单张版本，估价页的实拍图用 */
  async pickOne() {
    const paths = await this.pickToPaths(1);
    return paths[0] || "";
  },

  /* 是否是需要替换展示路径的本地文件 */
  isLocal(path) {
    return /^wxfile:\/\//.test(path || "") || /^http:\/\/tmp/.test(path || "");
  }
};

module.exports = Upload;
