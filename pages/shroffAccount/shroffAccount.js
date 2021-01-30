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
    statusTop: a.globalData.statusHeight,
    account: {},
    canvas: '',
  },
  onLoad: function (options) {
    let that = this
    console.log(options);
    that.setData({
      // order_id: options.order_id, 
    })
    that.getAccount()
  },
  onShow: function () {},
  goback() {
    wx.navigateBack()
  },
  async getAccount() {
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/index/account',
      })
      console.log(data);
      that.setData({
        account: data
      })
    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
  async savetheimage() {
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/index/accountImage',
      })
      console.log(data);
      that.setData({
        canvas: data.url
      })
      that.addShopCart()
    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
  trueOnclick() {
    wx.navigateBack()
  },
  copyBtn(e) {
    var that = this;
    let currentidx = e.currentTarget.dataset.type;
    let account = that.data.account
    let TemplateText = ''
    if (currentidx == 1) {
      TemplateText = account.account_company_name
    } else if (currentidx == 2) {
      TemplateText = account.account_bank
    } else if (currentidx == 3) {
      TemplateText = account.account
    }
    console.log(TemplateText);
    wx.setClipboardData({
      //准备复制的数据内容
      data: TemplateText,
      success: function (res) {
        wx.showToast({
          title: '复制成功',
        });
      }
    });
  },
  //点击保存到相册
  addShopCart: function () {
    var that = this;
    wx.showLoading({
      title: '加载中',
      icon: 'none'
    })
    wx.downloadFile({
      url: that.data.canvas,
      success: function (res) {
        wx.hideLoading()
        console.log('下载图片下载图片下载图片', res)
        var tempFilePath = res.tempFilePath
        //console.log('临时文件地址是：' + tempFilePath)
        wx.saveFile({
          tempFilePath: tempFilePath,
          success: function (res) {
            console.log(res)
            var saveFilePath = res.savedFilePath;
            that.setData({
              water_url: res.savedFilePath,
              savepic: 1
            })

            wx.getSetting({
              success(res) {
                if (!res.authSetting['scope.writePhotosAlbum']) {
                  wx.authorize({
                    scope: 'scope.writePhotosAlbum',
                    success() { //这里是用户同意授权后的回调
                      console.log('111', that.data.water_url)
                      wx.saveImageToPhotosAlbum({
                        filePath: that.data.water_url,
                        success(res) {
                          wx.showModal({
                            content: '图片已保存到相册',
                            showCancel: false,
                            confirmText: '好的',
                            confirmColor: '#333',
                            success: function (res) {
                              if (res.confirm) {
                                console.log('用户点击确定');
                                /* 该隐藏的隐藏 */
                                that.setData({
                                  maskHidden: false
                                })
                              }
                            },
                            fail: function (res) {

                            }
                          })
                        }
                      })



                    },
                    fail() { //这里是用户拒绝授权后的回调
                      wx.showModal({
                        title: '提示',
                        content: '您取消授权，无法保存图片，点击确定打开权限',
                        success(res) {
                          if (res.confirm) {
                            console.log('用户点击确定')
                            wx.openSetting({
                              success(res) {
                                console.log(res.authSetting)

                              }
                            })
                          } else if (res.cancel) {
                            console.log('用户点击取消')
                          }
                        }
                      })

                    }
                  })
                } else { //用户已经授权过了

                  console.log('333', that.data.water_url)

                  // console.log(that.data.imagePath)
                  wx.saveImageToPhotosAlbum({
                    filePath: that.data.water_url,
                    success(res) {
                      console.log(res)
                      wx.showModal({
                        content: '图片已保存到相册',
                        showCancel: false,
                        confirmText: '好的',
                        confirmColor: '#333',
                        success: function (res) {
                          if (res.confirm) {
                            console.log('用户点击确定');
                            /* 该隐藏的隐藏 */
                            that.setData({
                              maskHidden: false
                            })
                          }
                        },
                        fail: function (res) {

                        }
                      })
                    }
                  })
                }
              }
            })
            console.log('123456855555555', that.data.water_url)
          }, //可以将saveFilePath写入到页面数据中
          fail: function (res) {
            console.log('失败', res)
          },
          complete: function (res) {
            console.log('complete后的res数据：')
          },
        }) //,
      },
      // fail: function (res) {
      //   wx.showModal({
      //     title: '下载失败',
      //     content: '请联系管理员',
      //   })
      // },
      complete: function (res) {},
    })
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