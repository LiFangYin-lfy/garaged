import {
  request
} from "../../request/index.js"
const a = getApp()
Page({
  data: {
    baseUrl: a.globalData.baseUrl,
    imagesUrl: a.globalData.imagesUrl,
    four: 4,
    msg: '',
    status: 0,
    showDialog: false,
    orderStatus: 2,
    customer: [],
    cancelA: 1, // 核销
    page: 1,
    page_num: 10,
    userinfo: {},
    session_key: '',
    code: '',
    encryptedData: '',
    iv: '',
    guarantee: '',
    upkeep: '',
    is_true: false,
    listError: '',
    statusWay: '',
    mobile: '',
    showdLog: true,
  },
  onLoad: function (options) {
    let token = wx.getStorageSync('token')
    let that = this
    that.getnumber()
    if (!token) {
      that.getLogin()
    }
  },
  onShow: function () {
    let that = this
    let token = wx.getStorageSync('token')
    if (token) {
      that.getCustomer()
      that.getUserIndex()
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
  async getUserIndex() {
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/user/index',
      })
      console.log(data);
      if (data.mobile == '') {
        that.setData({
          showdLog: true
        })
      } else {
        that.setData({
          showdLog: false
        })
      }
      that.setData({
        userinfo: data,
        mobile: data.mobile
      })
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
  cancelAfter(e) {
    console.log(e);
    let that = this
    let statusWay = e.currentTarget.dataset.statusway
    let nouse = e.currentTarget.dataset.nouse
    let id = e.currentTarget.dataset.id
    let cilit = e.currentTarget.dataset.cilit
    let customer = that.data.customer
    let guarantee = '';
    let upkeep = "";
    customer.forEach(item => {
      if (item.id == id) {
        guarantee = item.repair_code
        upkeep = item.care_code
      }
    });
    if (cilit == 0) {
      that.setData({
        cancelA: 0, // 保修
        statusWay: 1
      })
    } else {
      if (nouse == 0) {
        that.setData({
          statusWay: 2,
          listError: '免费保养次数已用尽'
        })
        console.log(that.data.listError);
      } else {
        that.setData({
          cancelA: 1, // 保养
          statusWay: 1
        })
      }
    }
    that.setData({
      guarantee,
      upkeep
    })
    that.toggleDialog()
  },
  offlinePay(e) {
    console.log(e);
    let that = this
    that.setData({
      is_true: true
    })
    wx.showModal({
      title: '提示',
      content: '您确认要选择线下支付吗？',
      success: async function (res) {
        if (res.confirm) {
          try {
            const {
              data
            } = await request({
              url: 'api/user/offlinePay',
              data: {
                order_id: e.currentTarget.dataset.id
              }
            })
            console.log(data);
            if (data.code == 1) {
              that.getCustomer()
              that.setData({
                is_true: false
              })
            }


          } catch (err) {
            console.log(err);
            that.setData({
              msg: err.msg,
              is_true: false
            })
            that.popTest()
          }
        } else {
          that.setData({
            is_true: false
          })
        }
      }
    })

  },
  getPhoneNumber(e) { //手机号授权
    let that = this
    that.getnumber()
    setTimeout(() => {
      if (e.detail.errMsg == "getPhoneNumber:ok") {
        console.log(e);
        that.setData({
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv
        })
        that.getPhoneCall()
      }
    }, 500);
  },
  async getPhoneCall() {
    let that = this
    const {
      data
    } = await request({
      url: 'api/user/getPhoneNumber',
      data: {
        encryptData: that.data.encryptedData,
        iv: that.data.iv,
        sessionKey: that.data.session_key,
        openid: that.data.openid
      },
      method: 'POST'
    })
    console.log(data);
    if (data.code == 1) {
      that.getnumber()
      that.getCustomer()
      that.getUserIndex()
      that.setData({
        msg: data.msg,
        showdLog: false
      })
      that.popSuccessTest();
    }

  },
  getnumber() {
    let that = this
    wx.login({
      success(res) {
        that.setData({
          code: res.code
        })
        console.log(res);
        that.getcode()
      }
    })
  },
  async getcode() {
    let that = this
    try {
      const {
        data
      } = await request({
        url: '/api/user/get_session_key',
        method: "POST",
        data: {
          code: that.data.code
        }
      })
      console.log(data);
      if (data.code == 1) {
        that.setData({
          session_key: data.data.session_key,
          openid: data.data.openid
        })
        setTimeout(() => {
          that.checksessionkey()
        }, 500);
      }


    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
  checksessionkey() {
    let that = this;
    wx.checkSession({
      success: function (res) {
        //session_key未过期
      },
      fail: (res => {
        wx.login({
          success: async (res) => {
            console.log(res)
            let code = res.code
            try {
              const {
                data: {
                  data
                }
              } = await request({
                url: '/api/user/get_session_key',
                method: "POST",
                data: {
                  code: code
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
        });
      })
    })

  },
  goverification() {
    wx.navigateTo({
      url: '/pages/verification/verification'
    })
  },
  lookShroffAccount(e) {
    wx.navigateTo({
      url: '/pages/shroffAccount/shroffAccount'
    })
  },
  goorderDetail(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail?order_id=' + id
    })
  },
  async getCustomer() {
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/user/orderList',
        data: {
          page: that.data.page,
          page_num: that.data.page_num
        }
      })
      console.log(data);
      that.setData({
        customer: data.data
      })
    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
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
  onShareAppMessage() {
    return {
      title: '研孚汽车延保', // 转发后 所显示的title
      path: '/pages/customerCenter/customerCenter', //分娩笔记分享2
    }
  },
  async gotoOrderPay(e) {
    let that = this
    that.setData({
      is_true: true
    })
    setTimeout(() => {
      that.setData({
        is_true: false,
      })
    }, 1500);
    try {
      const {
        data
      } = await request({
        url: 'api/user/goPay',
        data: {
          order_id: e.currentTarget.dataset.id
        }
      })
      console.log(data);
      if (data.code == 1) {
        wx.requestPayment({
          timeStamp: data.data.payment.timeStamp,
          nonceStr: data.data.payment.nonceStr,
          package: data.data.payment.package,
          signType: 'MD5',
          paySign: data.data.payment.paySign,
          appId: data.data.payment.appId,
          success(res) {
            console.log(res);
            that.getUserIndex()
            that.setData({
              is_true: false
            })
          },
          fail(res) {
            console.log(res)
            that.setData({
              is_true: false
            })
          }
        })
      }

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