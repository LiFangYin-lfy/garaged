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
    verification: [],
    searchValue: '',
    page_num: 10,
    page: 1,
  },
  onLoad: function (options) {
    let that = this
    console.log(options);
    that.setData({
      // order_id: options.order_id,
    })

  },
  onShow: function () {
    let that = this
    that.getVerification()
  },
  goback() {
    wx.navigateBack()
  },
  goDetail(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail?order_id=' + id + '&per=1'
    })
  },
  async getVerification() {
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/verifier/orderList',
        data: {
          page: that.data.page,
          page_num: that.data.page_num,
        }
      })
      console.log(data);
      that.setData({
        verification: data.data,
        current_page: data.current_page,
        last_page: data.last_page,
      })
    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
  RichScan() {
    let that = this
    wx.scanCode({
      success: (res) => {
        console.log("扫码结果");
        console.log(res);
        let path = decodeURIComponent(res.path)
        that.setData({
          img: res.result,
          path: res.path
        })
        console.log(path);
        wx.navigateTo({
          url: '/' + path
        })
      },
      fail: (res) => {
        console.log(res);
      }
    })

  },

  searchInput() {
    let that = this;
    if (that.data.searchValue != '') {

      that.setData({

      })
    } else {
      that.setData({
        msg: '请输入搜索内容'
      })
      that.popTest()
    }

  },
  getInput(e) {
    let that = this
    console.log(e.detail.value);
    if (e.detail.value != '') {
      that.setData({
        searchValue: e.detail.value,
      })
    }
    that.getConjunction()
  },
  async getConjunction() {
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: '',
        data: {
          keyword: that.data.searchValue
        }
      })
      console.log(data);
      that.setData({
        conjunction: data.list,
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