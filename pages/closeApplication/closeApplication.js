import {
  request
} from "../../request/index.js"
const a = getApp()
Page({
  data: {
    baseUrl: a.globalData.baseUrl,
    imagesUrl: a.globalData.imagesUrl,
    statusTop: a.globalData.statusHeight,
    four: 2,
    msg: '',
    imgList: [],
    showpopup: false,
    open: 0,
    send: 0,
    imagesA: [],
    imgListA: [],
    imagesB: [],
    imgListB: [],
    serial: 0,
    guarantee: [], // 保修
    serialB: 0,
    upkeep: [], // 保养

    ary: 0,
    order_id: '',
    upkeepTotal: 0,
    guaranteeTotal: 0,
    statement: [],
    statementUrl: [],
    repair_images: [],
    repair_imagesUrl: [], //  维修作业照片， 多文件用英文逗号隔开
    session_key: '',
    showDlog: false,
    listError: '',
    showDialog2: true,
    count: '',

  },
  onLoad: function (options) {
    let that = this
    console.log(options);
    if (options.scene) {
      that.setData({
        order_id: options.scene,
      })
    }
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
  onShow: function () {
    let that = this

  },
  goback() {
    wx.navigateBack()
  },
  clickpup() {
    this.setData({
      showpopup: !this.data.showpopup,
      open: 0
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
        url: 'api/index/contact',
        data: {
          order_id: that.data.order_id
        }
      })
      console.log(data);
      that.setData({
        license_plate: data.license_plate,
        current_kilometers: data.current_kilometers,
        vin_num: data.vin_num,
      })
    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
  clickOpenA(e) {
    let that = this
    console.log(e.detail.value)
    let guarantee = that.data.guarantee
    let guaranteeTotal = 0
    let serial = that.data.serial
    let ar = Number(serial) + 1
    let obk = e.detail.value
    if (obk.project == '') {
      wx.showToast({
        title: '项目名称不能为空',
        icon: 'none',
        duration: 1000,
        mask: true
      })
      return false
    } else if (obk.care_fee == '') {
      wx.showToast({
        title: '工时费不能为空',
        icon: 'none',
        duration: 1000,
      })
    }
    obk.serial = ar
    guarantee.push(obk)
    guarantee.forEach((item, index) => {
      guaranteeTotal += item.care_fee * 1
    });
    that.setData({
      showpopup: !this.data.showpopup,
      open: 0,
      guarantee,
      serial: ar,
      guaranteeTotal,
    })
    console.log(that.data.serial);
    console.log(that.data.guarantee);
  },
  clickOpenB(e) {
    let that = this
    console.log(e.detail.value)
    let upkeep = that.data.upkeep
    let serialB = that.data.serialB
    let ar = Number(serialB) + 1
    console.log(ar);
    let obk = e.detail.value
    if (obk.part_code == '') {
      wx.showToast({
        title: '零件编号不能为空',
        icon: 'none',
        duration: 1000,
        mask: true
      })
      return false
    } else if (obk.part_name == '') {
      wx.showToast({
        title: '零件名称不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.part_price == '') {
      wx.showToast({
        title: '零件单价不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.part_num == '') {
      wx.showToast({
        title: '零件数量不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
    }
    obk.total = obk.part_price * obk.part_num
    let upkeepTotal = 0
    obk.serialB = ar
    upkeep.push(obk)
    upkeep.forEach((item, index) => {
      upkeepTotal += item.part_num * item.part_price
    });
    that.setData({
      open: 0,
      showpopup: !this.data.showpopup,
      upkeep,
      upkeepTotal,
      serialB: ar
    })
  },
  deltee(e) {
    let that = this
    let send = e.currentTarget.dataset.index
    let guarantee = that.data.guarantee
    let guaranteeTotal = 0
    guarantee.splice(send, 1)
    guarantee.forEach((item, index) => {
      guaranteeTotal += item.care_fee * 1
    });
    that.setData({
      guarantee,
      guaranteeTotal,
    })
    console.log(that.data.guarantee);
  },
  delkeep(e) {
    let that = this
    let send = e.currentTarget.dataset.index
    let upkeep = that.data.upkeep
    let upkeepTotal = 0
    upkeep.splice(send, 1)
    upkeep.forEach((item, index) => {
      upkeepTotal += item.part_num * item.part_price
    });
    that.setData({
      upkeep,
      upkeepTotal,
    })
    console.log(that.data.upkeep);
  },
  openB() {
    this.setData({
      showpopup: !this.data.showpopup,
      open: 2
    })
  },
  openA() {
    this.setData({
      showpopup: !this.data.showpopup,
      open: 1
    })
  },
  chooseImg: function (e) { //上传图片开始
    var that = this;
    let imagesA = ''
    let send = e.currentTarget.dataset.send
    that.setData({
      send
    })
    if (send == 0) {
      imagesA = that.data.statement //  结算单据，
    } else {
      imagesA = that.data.repair_images //维修作业照片
    }

    if (imagesA.length < 11) {
      wx.chooseImage({
        count: 10, // 最多可以选择的图片张数，默认9
        sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
        sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
        success: function (res) {
          console.log(res);
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          var tempFilePaths = res.tempFilePaths;
          let successUp = 0; //成功个数
          let failUp = 0; //失败个数
          let i = 0; //第几个
          let length = res.tempFilePaths.length //总共个数
          wx.showNavigationBarLoading()
          wx.showLoading({
            title: '上传中',
          })
          that.uploadAllfile(tempFilePaths, successUp, failUp, i, length);
        },
      });
    } else {
      wx.showToast({
        title: '最多上传10张图片',
        icon: 'none',
        duration: 3000
      });
    }
  },
  uploadAllfile(filePaths, successUp, failUp, i, length) { // 上传图片至后台
    let that = this;
    let url = 'api/common/upload';
    let headers = {
      "token": wx.getStorageSync("token") || '',
      'content-type': 'multipart/form-data'
    }
    wx.uploadFile({
      url: a.globalData.baseUrl + url, //仅为示例，非真实的接口地址
      header: headers,
      filePath: filePaths[i],
      name: 'file',
      formData: {
        file: '',
        filetype: 'image'
      },
      success: function (res) {
        console.log(res)
        wx.hideNavigationBarLoading()
        wx.hideLoading()
        if (res.statusCode == 200) {
          let data = JSON.parse(res.data)
          console.log(data);
          if (data.code == 1) {
            let send = that.data.send
            if (send == 0) {
              let list = that.data.statement;
              let statementUrl = that.data.statementUrl;
              list.push(data.data.url);
              statementUrl.push(data.data.fullurl);
              that.setData({
                statement: list,
                statementUrl,
              })
              console.log(that.data.statementUrl);
            } else {
              let repair_images = that.data.repair_images;
              let repair_imagesUrl = that.data.repair_imagesUrl;
              repair_images.push(data.data.url);
              repair_imagesUrl.push(data.data.fullurl);
              that.setData({
                repair_images: repair_images,
                repair_imagesUrl
              })
              console.log(that.data.repair_imagesUrl);
            }

          }
        } else {
          wx.showModal({
            title: '提示',
            content: res.msg,
            showCancel: false
          })
        }
      },
      fail: function (res) {
        wx.hideNavigationBarLoading()
        wx.hideLoading()
        console.log(res);
      },
      complete() {
        i++;
        // let img = t.data.img
        if (i == length) {
          // console.log('总共' + successUp + '张上传成功,' + failUp + '张上传失败！');
        } else {
          //递归调用uploadDIY函数
          that.uploadAllfile(filePaths, successUp, failUp, i, length);
        }
      }

    })

  },
  deleteImga: function (e) { // 删除图片
    console.log(e)
    var that = this;
    var index = e.currentTarget.dataset.index;
    let imgList = that.data.statementUrl
    let list = that.data.statement
    list.splice(index, 1);
    imgList.splice(index, 1);
    that.setData({
      statement: list,
      statementUrl: imgList
    })
    console.log(that.data.statement, imgList)
  },
  previewImga: function (e) { // 预览图片
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var images = this.data.statementUrl;
    wx.previewImage({
      //当前显示图片
      current: images[index],
      //所有图片
      urls: images
    })
  },
  deleteImb: function (e) { // 删除图片
    console.log(e)
    var that = this;
    var index = e.currentTarget.dataset.index;
    let imgList = that.data.repair_imagesUrl
    let list = that.data.repair_images
    list.splice(index, 1);
    imgList.splice(index, 1);
    this.setData({
      repair_images: list,
      repair_imagesUrl: imgList
    })
    console.log(that.data.repair_images, imgList)
  },
  previewImgb: function (e) { // 预览图片
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var images = this.data.repair_imagesUrl;
    wx.previewImage({
      //当前显示图片
      current: images[index],
      //所有图片
      urls: images
    })
  },
  async closeSubmit(e) {
    let that = this
    console.log(e.detail.value);
    let obk = e.detail.value
    obk.order_id = that.data.order_id
    obk.care_fee_data = that.data.guarantee
    obk.care_part_data = that.data.upkeep
    obk.current_kilometers = that.data.count
    obk.statement = that.data.statement.join(',')
    obk.repair_images = that.data.repair_images.join(',')

    if (obk.repair_desc == '') {
      wx.showToast({
        title: '故障描述不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.current_kilometers == '') {
      wx.showToast({
        title: '当前公里数不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
      // } else if (obk.care_part_data.length == 0) {
      //   wx.showToast({
      //     title: '更换零件项目表不能为空',
      //     icon: 'none',
      //     duration: 1000,
      //   })
      //   return false;
    } else if (obk.statement == '') {
      wx.showToast({
        title: '结算单据至少上传一张',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.repair_images == '') {
      wx.showToast({
        title: '维修作业照片至少上传一张',
        icon: 'none',
        duration: 1000,
      })
      return false;
    }

    if (obk.license_plate != '') {
      let reg = /^(([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z](([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳使领]))$/
      const careg = reg.test(obk.license_plate);
      if (!careg) {
        wx.showToast({
          icon: 'none',
          title: '请输入正确车牌号',
        })
        return;
      }
    }
    try {
      const {
        data
      } = await request({
        url: 'api/verifier/repairAdd',
        data: obk,
      })
      console.log(data);
      if (data.code == 1) {
        that.setData({
          listError: '已成功发往第三方延保公司结算中'
        })
        that.toggleDlog()
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
  toggleDlog() {
    this.setData({
      showDlog: !this.data.showDlog
    })
  },
  goswitchTab() {
    wx.switchTab({
      url: '/pages/customerCenter/customerCenter'
    })
    this.toggleDlog()
  },
  blurclick(e) {
    console.log(e);
    let carNum = e.detail.value
    let reg = /^(([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z](([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳使领]))$/
    const careg = reg.test(carNum);
    if (!careg) {
      wx.showToast({
        icon: 'none',
        title: '请输入正确车牌号',
      })
      return;
    } else {
      this.setData({
        license_plate: carNum
      })
    }

  },
  getconfirm(e) {
    console.log(e);
    let carNum = e.detail.value
    let reg = /^(([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z](([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳使领]))$/
    const careg = reg.test(carNum);
    if (!careg) {
      wx.showToast({
        icon: 'none',
        title: '请输入正确车牌号',
      })
      return;
    } else {
      this.setData({
        license_plate: carNum
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
})