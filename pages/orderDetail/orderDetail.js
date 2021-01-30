import {
  request
} from "../../request/index.js"
const a = getApp()
Page({
  data: {
    baseUrl: a.globalData.baseUrl,
    statusTop: a.globalData.statusHeight,
    imagesUrl: a.globalData.imagesUrl,
    four: 2,
    msg: '',
    status: '',
    is_have_invoice: '',
    detail: '',
    dissabled: true,
    cancelA: 1, // 核销
    showDialog: false,
    order_id: '',
    detailList: [],
    identity: '',
    per: 0,
    repair_log: [],
    care_log: [],
    care_code: '',
    repair_code: '',
    is_true: false,
    listError: '',
    statusWay: '',
    it_change: 0,
    is_changed: 0
  },
  onLoad: function (options) {
    let that = this
    console.log(options);
    that.setData({
      order_id: options.order_id,
      per: options.per || '',
    })

  },
  onShow: function () {
    this.getDetail()
  },
  goback() {
    wx.navigateBack()
  },
  async getDetail() {
    let that = this

    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/user/orderInfo',
        data: {
          order_id: that.data.order_id
        }
      })
      console.log(data);
      that.setData({
        detail: data,
        is_have_invoice: data.is_have_invoice,
        status: data.status,
        care_log: data.care_log,
        repair_log: data.repair_log,
        care_code: data.care_code,
        repair_code: data.repair_code,
        identity: Number(data.contract.identity)
      })
      // console.log(that.data.care_log);
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
    let that = this
    let wit = e.currentTarget.dataset.wit
    let statusWay = e.currentTarget.dataset.statusway
    let nouse = e.currentTarget.dataset.nouse
    console.log(e);
    if (wit == 0) {
      that.setData({
        cancelA: 0,
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

      // that.setData({
      //   cancelA: 1
      // })
    }
    that.toggleDialog()

  },
  goswitchTab() {
    wx.switchTab({
      url: '/pages/customerCenter/customerCenter'
    })
  },
  lookShroffAccount(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/shroffAccount/shroffAccount'
    })
  },
  lookContract(e) {
    let that = this
    let cont = e.currentTarget.dataset.cont
    wx.downloadFile({
      url: cont,
      success(res) {
        console.log(res)
        wx.openDocument({
          filePath: res.tempFilePath
        })
      }
    })
  },
  onInvoice() {
    let that = this
    let identity = that.data.identity
    if (identity == 1) {
      wx.navigateTo({
        url: '/pages/consigneeAddress/consigneeAddress?order_id=' + that.data.order_id + '&warning=1'
      })
    } else {
      wx.navigateTo({
        url: '/pages/invoiceInformation/invoiceInformation?order_id=' + that.data.order_id + '&warning=1'
      })
    }
  },
  async gotoOrderPay() {
    let that = this
    that.setData({
      is_true: true
    })
    try {
      const {
        data
      } = await request({
        url: 'api/user/goPay',
        data: {
          order_id: that.data.order_id
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
            that.setData({
              is_true: false
            })
            wx.switchTab({
              url: '/pages/customerCenter/customerCenter'
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
  offlinePay() {
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
                order_id: that.data.order_id
              }
            })
            console.log(data);
            that.setData({
              is_true: false
            })
            wx.switchTab({
              url: '/pages/customerCenter/customerCenter'
            })

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
  remove() {
    let that = this
    that.setData({
      is_true: true
    })
    wx.showModal({
      title: '提示',
      content: '取消后您需要重新购买，确认取消？',
      success: async function (res) {
        if (res.confirm) {
          try {
            const {
              data
            } = await request({
              url: 'api/user/cancel',
              data: {
                order_id: that.data.order_id
              }
            })
            console.log(data);
            if (data.code == 1) {
              that.setData({
                msg: data.msg
              })
              that.popSuccessTest()
              setTimeout(() => {
                that.setData({
                  is_true: false
                })
                wx.switchTab({
                  url: '/pages/customerCenter/customerCenter'
                })
              }, 500);

            } else {
              console.log(data);
              that.setData({
                msg: data.msg
              })
              that.popTest()
            }

          } catch (err) {
            console.log(err);
            that.setData({
              msg: err.msg
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
  lookInvoice(e) {
    let that = this
    let in_url = e.currentTarget.dataset.in_url
    let is_have_invoice = e.currentTarget.dataset.is_have_invoice
    if (is_have_invoice == 1) {
      if (in_url != '') {
        that.setData({
          it_change: that.data.it_change + 1
        })
        console.log(that.data.it_change);
        if (that.data.it_change == 1) {
          let ceurl = e.currentTarget.dataset.ceurl
          let obj = a.getCaption(ceurl).toLowerCase();
          console.log(obj);
          console.log(ceurl);
          if (obj == 'pdf') {
            wx.downloadFile({
              url: ceurl, //要预览的PDF的地址
              success: function (res) {
                console.log(res);
                if (res.statusCode === 200) { //成功
                  var Path = res.tempFilePath //返回的文件临时地址，用于后面打开本地预览所用
                  that.setData({
                    it_change: 0
                  })
                  wx.openDocument({
                    filePath: Path, //要打开的文件路径
                    showMenu: true,
                    success: function (res) {
                      console.log('打开PDF成功');
                    }
                  })
                }
              },
              fail: function (res) {
                console.log(res); //失败
                that.setData({
                  it_change: 0
                })
              }
            })
          } else {
            let canurl = ceurl.split(',')
            console.log(canurl);
            wx.previewImage({
              current: canurl, // 当前显示图片的http链接
              urls: canurl, // 需要预览的图片http链接列表
              complete: function (res) {
                console.log(res);
              }
            })
            that.setData({
              it_change: 0
            })

          }
        } else {
          console.log('点错了');
        }
      } else {
        that.setData({
          msg: '电子发票还未开具'
        })
        that.popTest()
      }
    } else {
      that.setData({
        msg: '您未申请发票，电子发票还未开具'
      })
      that.popTest()
    }
  },
  keepInvoice(e) {
    let that = this
    let in_url = e.currentTarget.dataset.in_url
    let is_have_invoice = e.currentTarget.dataset.is_have_invoice
    if (is_have_invoice == 1) {
      if (in_url != '') {
        that.setData({
          is_changed: that.data.is_changed + 1
        })
        console.log(that.data.is_changed);
        if (that.data.is_changed == 1) {
          let ceurl = e.currentTarget.dataset.ceurl
          // let ceurl = 'http://qk2kxrf5z.hn-bkt.clouddn.com/uploads/20201123/FieNWrkUiAHzSaUI43aYcrBFp6f-.png'
          let obj = a.getCaption(ceurl).toLowerCase();
          console.log(obj);
          if (obj == 'pdf') {
            wx.downloadFile({
              url: ceurl, //要预览的PDF的地址
              success: function (res) {
                console.log(res);
                if (res.statusCode === 200) { //成功
                  var Path = res.tempFilePath //返回的文件临时地址，用于后面打开本地预览所用
                  that.setData({
                    is_changed: 0
                  })
                  wx.openDocument({
                    filePath: Path, //要打开的文件路径
                    showMenu: true,
                    success: function (res) {
                      console.log('打开PDF成功');
                    }
                  })
                }
              },
              fail: function (res) {
                console.log(res); //失败
                that.setData({
                  is_changed: 0
                })
              }
            })
          } else {
            wx.showLoading({
              title: '保存中',
              mask: true,
            })
            wx.downloadFile({
              url: ceurl,
              success: function (res) {
                wx.hideLoading()
                console.log('下载图片0', res)
                var tempFilePath = res.tempFilePath
                wx.saveFile({
                  tempFilePath: tempFilePath,
                  success: function (res) {
                    console.log(res)
                    var saveFilePath = res.savedFilePath;
                    console.log(saveFilePath);
                    that.setData({
                      water_url: saveFilePath,
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
                                    that.setData({
                                      is_changed: 0
                                    })
                                    wx.openSetting({
                                      success(res) {
                                        console.log(res.authSetting)
                                      }

                                    })
                                  } else if (res.cancel) {
                                    console.log('用户点击取消')
                                    that.setData({
                                      is_changed: 0
                                    })

                                  }
                                }
                              })

                            }
                          })
                        } else { //用户已经授权过了
                          console.log('333', that.data.water_url)
                          wx.saveImageToPhotosAlbum({
                            filePath: that.data.water_url,
                            success(res) {
                              console.log(res)
                              wx.showModal({
                                content: '发票已保存到相册',
                                showCancel: false,
                                confirmText: '好的',
                                confirmColor: '#333',
                                success: function (res) {
                                  if (res.confirm) {
                                    console.log('用户点击确定');
                                    /* 该隐藏的隐藏 */
                                    that.setData({
                                      maskHidden: false,
                                      is_changed: 0
                                    })
                                  }
                                },
                                fail: function (res) {
                                  that.setData({
                                    is_changed: 0
                                  })
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
                    that.setData({
                      is_changed: 0
                    })
                  },
                  complete: function (res) {
                    console.log('complete后的res数据：')
                    that.setData({
                      is_changed: 0
                    })
                  },
                })
              },
              complete: function (res) {
                that.setData({
                  is_changed: 0
                })
              },
            })
          }
        }
      } else {
        that.setData({
          msg: '电子发票还未开具'
        })
        that.popTest()
      }
    } else {
      that.setData({
        msg: '您未申请发票，电子发票还未开具'
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
      duration: 1500
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
      duration: 1500, //停留时间
    })
  },
})