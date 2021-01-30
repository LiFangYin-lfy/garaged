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
    is_cloose: 1, // 1  或 2
    is_color: true,
    invoice: [],
    account: {},
    company_name: '',
    tax_number: '',
    company_address: '',
    telephone: '',
    bank_name: '',
    bank_account: '',
    order_id: '',
    type: 1,
    header: 1,
    wait: 2,
    warning: '',
  },
  onLoad: function (options) {
    let that = this
    console.log(options);
    that.setData({
      order_id: options.order_id,
      wait: options.wait,
      warning: options.warning || '',
    })
    // that.getInvoice()
  },
  onShow: function () {
    this.getAccount()
    this.getMyinfo()
  },
  onShareAppMessage: function () {
    let that = this;
    return {
      title: that.data.account.account_header, // 转发后 所显示的title
      path: '/pages/shroffAccount/shroffAccount', //分娩笔记分享2
    }
  },
  goback() {
    wx.navigateBack()
  },
  async formSubmit(e) {
    let that = this
    let art = e.detail.value
    let obk = {}
    obk.company_name = art.companyname
    obk.type = that.data.type
    obk.order_id = that.data.order_id
    obk.remark = art.remark
    obk.contact = art.contact
    obk.mobile = art.mobile
    obk.address = art.address
    if (that.data.type == 2) {
      obk.tax_number = art.taxnumber
      obk.company_address = art.companyaddress
      obk.telephone = art.telephone
      obk.bank_name = art.bankname
      obk.bank_account = art.bankaccount
    }
    console.log(obk);
    if (that.data.type == 2) {
      if (obk.tax_number == '') {
        wx.showToast({
          title: '发票税号不能为空',
          icon: 'none',
          duration: 1000,
        })
        return false;
      } else if (obk.company_address == '') {
        wx.showToast({
          title: '发票地址不能为空',
          icon: 'none',
          duration: 1000,
        })
        return false;
      } else if (obk.telephone == '') {
        wx.showToast({
          title: '发票电话不能为空',
          icon: 'none',
          duration: 1000,
        })
        return false;
      } else if (obk.bank_name == '') {
        wx.showToast({
          title: '发票开户行不能为空',
          icon: 'none',
          duration: 1000,
        })
        return false;
      } else if (obk.bank_account == '') {
        wx.showToast({
          title: '发票银行账号不能为空',
          icon: 'none',
          duration: 1000,
        })
        return false;
      }
    }
    if (obk.company_name == '') {
      wx.showToast({
        title: '发票企业名称不能为空',
        icon: 'none',
        duration: 1000,
        mask: true
      })
      return false
    } else if (obk.contact == '') {
      wx.showToast({
        title: '收件人不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.mobile == '') {
      wx.showToast({
        title: '	电话不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.mobile.length != 11) {
      wx.showToast({
        title: '手机号长度有误！',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.address == '') {
      wx.showToast({
        title: '收件地址不能为空',
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
    try {
      const {
        data
      } = await request({
        url: 'api/index/invoiceCompany',
        data: obk
      })
      console.log(data);
      if (data.code == 1) {
        that.setData({
          msg: data.msg
        })
        that.popSuccessTest()
        setTimeout(() => {
          if (that.data.wait == 2) {
            wx.switchTab({
              url: '/pages/customerCenter/customerCenter'
            })
          }
          if (that.data.warning == 1) {
            wx.navigateBack()
          } else {
            wx.navigateTo({
              url: '/pages/purchaseSuccess/purchaseSuccess'
            })
          }
        }, 1200);
      } else {
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
  },
  copyText() { // 复制
    wx.navigateTo({
      url: '/pages/shroffAccount/shroffAccount'
    })
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
  canporyOrPer(e) { //个人公司切换
    let that = this
    let way = e.currentTarget.dataset.way
    let is_cloose = that.data.is_cloose
    if (way == 0) {
      is_cloose = 1
      that.setData({
        is_cloose: is_cloose,
        is_color: true,
        type: 1,
        header: 1
      })
    } else if (way == 1) {
      is_cloose = 2
      that.setData({
        is_cloose: is_cloose,
        is_color: false,
        type: 2,
        header: 2
      })
    }
  },
  //点击保存到相册
  updownImg: function () {
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
                      wx.saveImageToPhotosAlbum({
                        filePath: that.data.water_url,
                        success(res) {
                          wx.showModal({
                            content: '图片已保存到相册',
                            showCancel: false,
                            confirmText: '好的',
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
                      // wx.openSetting({
                      //   success: function (data) {
                      //     console.log(data)
                      //     if (data.authSetting["scope.writePhotosAlbum"] === true) {
                      //      console.log("是否授权成功")
                      //     } else {
                      //       applyApi.toast("授权失败");
                      //     }
                      //   }
                      // })
                      wx.showModal({
                        title: '提示',
                        content: '您取消授权，无法保存图片，点击确定打开权限',
                        success(res) {
                          if (res.confirm) {
                            console.log('用户点击确定')
                            wx.openSetting({
                              success(res) {
                                console.log(res.authSetting)
                                // res.authSetting = {
                                //   "scope.userInfo": true,
                                //   "scope.userLocation": true
                                // }
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
  invoiceTitle() {
    let that = this
    wx.chooseInvoiceTitle({
      success(res) {
        console.log(res);
        that.setData({
          company_name: res.title,
          tax_number: res.taxNumber,
          company_address: res.companyAddress,
          telephone: res.telephone,
          bank_name: res.bankName,
          bank_account: res.bankAccount,
          header: 0,
        })

      },

    })
  },
  getbeizhu(e) {
    console.log(e);
  },
  async getMyinfo() {
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
        contact: data.contact,
        mobile: data.mobile,
        address: data.address,
      })
    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
  goSuccess() {
    let that = this
    if (that.data.wait == 2) {
      wx.navigateTo({
        url: '/pages/purchaseSuccess/purchaseSuccess'
      })
    }
    if (that.data.warning == 1) {
      wx.navigateBack()
    } else {
      wx.navigateTo({
        url: '/pages/purchaseSuccess/purchaseSuccess'
      })
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
  async getInvoice() {
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
        invoice: data
      })
    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
})