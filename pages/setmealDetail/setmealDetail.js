import {
  request
} from "../../request/index.js"
const a = getApp()
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    baseUrl: a.globalData.baseUrl,
    imagesUrl: a.globalData.imagesUrl,
    statusTop: a.globalData.statusHeight,
    four: 4,
    msg: '',
    content: '',
    SetDeatil: '',
    package_id: '',
    contract_id: '',
  },
  onLoad: function (options) {
    let that = this
    console.log(options);
    that.setData({
      package_id: options.package_id,
      contract_id: options.contract_id
    })
    that.getSetDeatil()
  },
  onShow: function () {

  },
  goback() {
    wx.navigateBack()
  },
  orderNow(e) {
    let that = this
    let package_id = that.data.package_id
    let contract_id = that.data.contract_id
    let price = e.currentTarget.dataset.price
    wx.navigateTo({
      url: '/pages/contract/contract?package_id=' + package_id + '&contract_id=' + contract_id + '&price=' + price
    })
  },
  async getSetDeatil() {
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/index/packageInfo',
        data: {
          package_id: that.data.package_id,
          contract_id: that.data.contract_id,
        }
      })
      console.log(data);
      that.setData({
        SetDeatil: data,
        content: data.content
      })
      WxParse.wxParse('content', 'html', that.data.content, that, 5);
    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },

  async public() {
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: '',
        data: {
          goods_id: that.data.goods_id
        }
      })
      console.log(data);
      that.setData({
        public: data
      })
    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
  text(details) {
    var texts = ''; //待拼接的内容
    while (details.indexOf('<img') != -1) { //寻找img 循环
      texts += details.substring('0', details.indexOf('<img') + 4); //截取到<img前面的内容
      details = details.substring(details.indexOf('<img') + 4); //<img 后面的内容
      if (details.indexOf('style=') != -1 && details.indexOf('style=') < details.indexOf('>')) {
        texts += details.substring(0, details.indexOf('style="') + 7) + "max-width:100%!important;height:auto;margin:0 auto; display:block;"; //从 <img 后面的内容 截取到style= 加上自己要加的内容
        details = details.substring(details.indexOf('style="') + 7); //style后面的内容拼接
      } else {
        texts += 'style="max-width:100%!important;height:auto;margin:0 auto; display:block;" ';
      }
    }
    while (details.indexOf('<td') != -1) { //寻找img 循环
      texts += details.substring('0', details.indexOf('<td') + 4); //截取到<img前面的内容
      details = details.substring(details.indexOf('<td') + 4); //<img 后面的内容
      if (details.indexOf('style=') != -1 && details.indexOf('style=') < details.indexOf('>')) {
        texts += details.substring(0, details.indexOf('style="') + 7) + "max-width:100%!important;height:auto;margin:0 auto;display:block; "; //从 <img 后面的内容 截取到style= 加上自己要加的内容
        details = details.substring(details.indexOf('style="') + 7); //style后面的内容拼接
      } else {
        texts += 'style="max-width:100%!important;height:auto;margin:0 auto;" ';
      }
    }
    texts += details; //最后拼接的内容
    // console.log(texts)
    return texts;
  },
  popTest() {
    wx.showToast({
      title: this.data.msg,
      icon: 'none', //如果要纯文本，不要icon，将值设为'none'
      duration: 1300
    })
  },
  goLogin() {
    wx.showModal({
      title: '提示',
      content: '您尚未登录，前往登录',
      success: function (res) {
        if (res.confirm) {
          wx.navigateTo({
            // url: '/pages/authorization/authorization'
          })

        } else {
          wx.switchTab({
            url: '/pages/home/home'
          })
        }
      }
    })
  },
  popSuccessTest() {
    wx.showToast({
      title: this.data.msg,
      icon: '', //默认值是success,就算没有icon这个值，就算有其他值最终也显示success
      duration: 1300, //停留时间
    })
  },
})