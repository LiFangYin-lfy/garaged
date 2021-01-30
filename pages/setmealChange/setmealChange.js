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
    setmeal: [],
    status: '', //车辆状态:1=新车投保,2=次新车投保
    contract_id: '',
  },
  onLoad: function (options) {
    let that = this
    console.log(options);
    that.setData({
      status: options.statusSuccess || 16,
      contract_id: options.contract_id || 2
    })
  },
  onShow: function () {
    this.getSetmeal()
  },
  goback() {
    wx.navigateBack()
  },
  setmealDetail(e) {
    let that = this
    let contract_id = that.data.contract_id
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/setmealDetail/setmealDetail?package_id=' + id + '&contract_id=' + contract_id
    })
  },
  async getSetmeal() {
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/index/packageList',
        data: {
          status: that.data.status
        }
      })
      console.log(data);
      that.setData({
        setmeal: data
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