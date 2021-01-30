import {
  request
} from "../../request/index.js"
const a = getApp()
Page({
  data: {
    baseUrl: a.globalData.baseUrl,
    imagesUrl: a.globalData.imagesUrl,
    statusTop: a.globalData.statusHeight,
    four: 4,
    msg: '',
    obks: {},
    order_id: '',
    mobile: '',
    address: '',
    contact: '',
    warning: '',
  },
  onLoad: function (options) {
    let that = this
    console.log(options);
    that.setData({
      order_id: options.order_id,
      warning: options.warning || '',
    })
    that.getuserfou()
  },
  onShow: function () {

  },
  goback() {
    wx.navigateBack()
  },
  goSuccess() {
    wx.navigateTo({
      url: "/pages/purchaseSuccess/purchaseSuccess"
    })
  },
  submitForm(e) {
    let that = this
    console.log(e.detail.value);
    let obk = e.detail.value
    obk.order_id = that.data.order_id
    if (obk.name == '') {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none',
        duration: 1000,
        mask: true
      })
      return false
    } else if (obk.mobile == '') {
      wx.showToast({
        title: '手机号不能为空',
      })
      return false
    } else if (obk.mobile.length != 11) {
      wx.showToast({
        title: '手机号长度有误！',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.address == '') {
      wx.showToast({
        title: '详细地址不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
    }
    // var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    var myreg = /^1\d{10}$/;
    if (!myreg.test(obk.mobile)) {
      wx.showToast({
        title: '手机号有误！',
        icon: 'none',
        duration: 1000,
      })
      return false;
    }
    that.setData({
      obks: obk
    })
    that.afterSubmit()
  },
  async afterSubmit() {
    let that = this
    try {
      const {
        data
      } = await request({
        url: 'api/index/invoiceUser',
        data: that.data.obks
      })
      console.log(data);
      that.setData({
        msg: data.msg
      })
      that.popSuccessTest()
      setTimeout(() => {
        if (that.data.warning == 1) {
          wx.navigateBack()
        } else {
          wx.navigateTo({
            url: '/pages/purchaseSuccess/purchaseSuccess'
          })
        }
      }, 1200);
    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
  async getuserfou() {
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/index/contact',
        data: {
          order_id: that.data.order_id
        }
      })
      console.log(data);
      that.setData({
        mobile: data.mobile,
        address: data.address,
        contact: data.contact,
      })
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
  popTest() {
    wx.showToast({
      title: this.data.msg,
      icon: 'none', //如果要纯文本，不要icon，将值设为'none'
      duration: 1300
    })
  },

  popSuccessTest() {
    wx.showToast({
      title: this.data.msg,
      icon: '', //默认值是success,就算没有icon这个值，就算有其他值最终也显示success
      duration: 1300, //停留时间
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
})