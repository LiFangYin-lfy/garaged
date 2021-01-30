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
    verification: {},
    identity: '',
    order_id: '',
    contract_url: '',
    session_key: '',
    contracTurl: '',
    clickButton: false,
    showDialog: false,
    showDialog2: true,
    count: '',
    listError: '',
  },
  onLoad: function (options) {
    let that = this
    console.log(options);
    if (options.scene) {
      that.setData({
        order_id: options.scene,
      })
    }
  },
  onShow: function () {
    let that = this
    let token = wx.getStorageSync('token')
    if (token) {
      that.getVerification()
    } else {
      wx.showModal({
        title: '提示',
        content: '您尚未登录，是否登录',
        success: function (res) {
          if (res.confirm) {
            that.showModal()
          } else {

          }
        }
      })
    }
  },
  goback() {
    wx.navigateBack()
  },

  async getVerification() {
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/verifier/orderInfo',
        data: {
          order_id: that.data.order_id
        }
      })
      console.log(data);
      that.setData({
        verification: data,
        identity: Number(data.contract.identity),
        contract_url: data.contract.contract_url,
      })

      console.log(that.data.identity);
    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
  lookContract() {
    let that = this
    let url = that.data.contract_url;
    console.log(url);
    wx.downloadFile({
      url: url,
      success(res) {
        console.log(res)
        wx.openDocument({
          filePath: res.tempFilePath
        })
      }
    })
  },
  async confirm() {
    let that = this
    that.setData({
      clickButton: true
    })

    try {
      const {
        data
      } = await request({
        url: 'api/verifier/careAdd',
        data: {
          order_id: that.data.order_id,
          current_kilometers: that.data.count
        }
      })
      console.log(data);
      if (data.code == 1) {
        // wx.showModal({
        //   //  title: '提示',
        //   content: data.msg,
        //   success: function (res) {
        //     if (res.confirm) {
        //      
        //     }
        //   }
        // })
        that.setData({
          listError: data.msg
        })
        that.toggleDialog()
        // that.popSuccessTest()
      } else {
        that.setData({
          msg: data.msg
        })
        that.popTest()
      }
      // setTimeout(() => {
      //   wx.navigateBack()
      // }, 1000);
      setTimeout(() => {
        that.setData({
          clickButton: false
        })
      }, 1400);

    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
  getWord() {
    let that = this
    let url = that.data.contract_url;
    wx.downloadFile({
      url: url,
      success(res) {
        console.log(res)
        wx.openDocument({
          filePath: res.tempFilePath
        })
      }
    })
  },
  showModal() { //显示对话框
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 100)
  },
  hideModal() { //隐藏对话框
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 100)
  },
  getLogin() {
    let that = this
    wx.login({
      async success(res) {
        try {
          const {
            data: {
              data
            }
          } = await request({
            url: '/api/user/get_session_key',
            method: "POST",
            data: {
              code: res.code
            }
          })
          console.log(data);
          that.setData({
            session_key: data.session_key
          })
        } catch (err) {
          console.log(err);
          that.setData({
            msg: err.msg
          })
          that.popTest()
        }
      }
    })
  },
  async wechatWarranty(e) { // 立即授权
    let that = this;
    try {
      const {
        data
      } = await request({
        url: 'api/user/authority',
        method: "POST",
        data: {
          iv: e.detail.iv,
          encryptData: e.detail.encryptedData,
          sessionKey: that.data.session_key
        }
      })
      console.log(data);
      if (data.code == 1) {
        that.setData({
          msg: data.msg,
        })
        that.popSuccessTest()
        wx.setStorageSync('token', data.data.token)
        that.hideModal()

        that.getCustomer()
        that.getUserIndex()
      }
    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }

  },
  toggleDialog() {
    this.setData({
      showDialog: !this.data.showDialog
    })
  },
  goswitchTab2() {
    if (this.data.count != '') {
      this.setData({
        showDialog2: !this.data.showDialog2
      })
    } else {
      a.popTest('当前公里数不能为空')
    }

  },
  getCount(e) {
    this.setData({
      count: e.detail.value
    })
  },
  goswitchTab() {
    wx.switchTab({
      url: '/pages/customerCenter/customerCenter'
    })
    this.toggleDialog()
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