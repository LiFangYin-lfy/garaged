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
    autoplay: true,
    circular: true,
    currentSwiper: 0,
    is_cloose: '1', // 1  或 2
    is_color: true,
    showDialog: false,
    homePage: {},
    chooseType: 1, //上传图片的序号
    storeName: '', // 店面名称 
    images: '',
    imgurl: '',
    store: '',
    session_key: '',
    code: '',
    encryptedData: '',
    iv: '',
    // ---------------------
    store_id: '',
    vehicle_license: '',
    vehicle_licenseUrl: '',
    vehicle_invoice: '',
    vehicle_invoiceUrl: '',
    dms_system: '',
    dms_systemUrl: '',
    idcard_front: '',
    idcard_frontUrl: '',
    vin_num: '',
    invoice_date: '',
    engine_num: '',
    vehicle_type: '',
    current_kilometers: '',
    license_plate: '',
    identity: 1, // 1个人  2 公司
    realname: '',
    idcard: '',
    business_license: '',
    business_licenseUrl: '',
    power_of_attorney: '',
    power_of_attorneyUrl: '',
    operator_idcard_front: '',
    operator_idcard_frontUrl: '',
    operator_idcard_back: '',
    operator_idcard_backUrl: '',
    company_name: '',
    credit_code: '',
    operator: '',
    address: '',
    mobile: '',
    store_saler_id: '',
    store_saler: '', // 销售代表
    date: '',
    formatDate: '',
    store_name: '',
    changeTrue: true,
    list: [],
    statusSuccess: '',
    contract_id: '',
    mobilePhone: '',
    openvar: false,
    vehicle_name: '',
    openid: '',
    openvary: [{
      id: 1,
      name: '汽油车'
    }, {
      id: 2,
      name: '混合动力'
    }, {
      id: 3,
      name: '电动汽车'
    }],
    listError: '',
    code0: 0,

  },
  onLoad: function (options) {
    let that = this
    let token = wx.getStorageSync('token')
    that.getLogin()
    console.log(options);
    if (options.scene) {
      that.setData({
        store_id: options.scene
      })
      if (token) {
        that.getStoreList()
      }
    }
    if (token) {
      that.getindex()
    } else {
      wx.showModal({
        title: '提示',
        content: '您尚未登录，是否登录',
        success: function (res) {
          if (res.confirm) {
            that.setData({
              changeTrue: true
            })
            that.showModal()
          } else {

          }
        }
      })
    }

  },
  onShow: function () {
    let that = this
    console.log(that.data.store_id, "store_id");
    let token = wx.getStorageSync('token')
    if (that.data.store_id == '') {
      let store_id = a.globalData.store_id
      let store_name = a.globalData.store_name
      that.setData({
        store_id,
        store_name
      })
    }
    console.log(that.data.store_id);
    that.getHomePage()
    if (token) {
      if (that.data.store_id != '') {
        that.getISalerList()
      }
    }

  },
  checksessionkey() {
    let that = this;
    wx.checkSession({
      success: function (res) {
        //session_key未过期
      },
      fail: (res => {
        // session_key已过期
        // 进行登录操作
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
  goSotrePage() {
    let that = this
    let token = wx.getStorageSync('token')
    let store_id = that.data.store_id
    if (token) {
      if (store_id == '') {
        wx.navigateTo({
          url: '/pages/changeStore/changeStore'
        })
      }
    } else {
      wx.showModal({
        title: '提示',
        content: '您尚未登录，请授权登录',
        success: function (res) {
          if (res.confirm) {
            that.showModal()
          } else {

          }
        }
      })
    }



  },
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      invoice_date: e.detail.value
    })
    console.log(this.data.invoice_date);
  },
  getSotreName() { //   识别
    let that = this
    let chooseType = Number(that.data.chooseType)
    if (chooseType == 1) {
      that.drivingLicense()
    } else if (chooseType == 2) {
      that.motorVehicle()
    } else if (chooseType == 3) {
      that.moteordms()
    } else if (chooseType == 4) {
      that.getIdcard()
    } else if (chooseType == 5) {
      that.moteordms()
    } else if (chooseType == 6) {
      that.businessLicense()
    } else if (chooseType == 8) {
      that.getIdcard()
    }

  },
  async getStoreList() {
    let that = this
    let store_id = that.data.store_id
    let ory = ''
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/index/storeList',
      })
      console.log(data);
      if (data.length != 0) {
        data.forEach(item => {
          if (item.id == store_id) {
            ory = item.store_name
          }
        })
      }
      that.setData({
        storeList: data,
        store_name: ory,
      })
    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
  async drivingLicense() { //  车辆行驶证识别 
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/index/vehicleLicense',
        data: {
          image: that.data.vehicle_licenseUrl,
          type: that.data.chooseType
        }
      })
      console.log(data);
      wx.hideNavigationBarLoading()
      wx.hideLoading()
      if (data.vehicle_type == 0) {
        that.setData({
          vehicle_type: 0,
          vehicle_name: '',
        })
      } else if (data.vehicle_type == 1) {
        that.setData({
          vehicle_type: 1,
          vehicle_name: '汽油车',
        })
      } else if (data.vehicle_type == 2) {
        that.setData({
          vehicle_type: 2,
          vehicle_name: '混合动力',
        })
      } else if (data.vehicle_type == 3) {
        that.setData({
          vehicle_type: 3,
          vehicle_name: '电动汽车',
        })
      }
      that.setData({
        address: data.address,
        engine_num: data.engine_num,
        license_plate: data.license_plate,
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
  async motorVehicle() { // 机动车销售发票识别
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/index/vehicleInvoice',
        data: {
          image: that.data.vehicle_invoiceUrl,
          type: that.data.chooseType
        }
      })
      console.log(data);
      wx.hideNavigationBarLoading()
      wx.hideLoading()
      if (data.vehicle_type == 0) {
        that.setData({
          vehicle_type: 0,
          vehicle_name: '',
        })
      } else if (data.vehicle_type == 1) {
        that.setData({
          vehicle_type: 1,
          vehicle_name: '汽油车',
        })
      } else if (data.vehicle_type == 2) {
        that.setData({
          vehicle_type: 2,
          vehicle_name: '混合动力',
        })
      } else if (data.vehicle_type == 3) {
        that.setData({
          vehicle_type: 3,
          vehicle_name: '电动汽车',
        })
      }
      that.setData({
        invoice_date: data.invoice_date,
        vin_num: data.vin_num,
        engine_num: data.engine_num,
        realname: data.realname,
        idcard: data.idcard,
        vehicle_type: data.vehicle_type,
      })
      console.log(that.data.invoice_date, "invoice_date");

    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
  async moteordms() { //DMS系统界面识别
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/index/dms',
        data: {
          image: that.data.dms_systemUrl,
          type: that.data.chooseType
        }
      })
      console.log(data);
      wx.hideNavigationBarLoading()
      wx.hideLoading()
      that.setData({
        current_kilometers: data.current_kilometers
      })

    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
  async getIdcard() { // 身份证识别
    let that = this
    let image = ''
    let operator_idcard_front = that.data.operator_idcard_front
    let chooseType = that.data.chooseType
    if (chooseType == 4) {
      image = that.data.idcard_frontUrl
    } else if (chooseType == 8) {
      image = operator_idcard_front
    }
    console.log(operator_idcard_front);
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/index/idcard',
        data: {
          image,
          type: that.data.chooseType
        }
      })
      console.log(data);
      wx.hideNavigationBarLoading()
      wx.hideLoading()
      if (chooseType == 8) {
        that.setData({
          operator: data.realname,
        })
      } else {
        that.setData({
          realname: data.realname,
          address: data.address,
        })
      }
      that.setData({
        idcard: data.idcard
      })

    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
  async businessLicense() { //营业执照识别 
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/index/businessLicense',
        data: {
          image: that.data.business_license,
          type: that.data.chooseType
        }
      })
      console.log(data);
      wx.hideNavigationBarLoading()
      wx.hideLoading()
      that.setData({
        company_name: data.company_name,
        address: data.address,
        credit_code: data.credit_code
      })

    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
  async getISalerList() { //  销售代表列表
    let that = this

    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/index/salerList',
        data: {
          store_id: that.data.store_id
        }
      })
      console.log(data);

      that.setData({
        list: data,
      })

    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
  getLogin() {
    let that = this
    wx.login({
      success(res) {
        that.setData({
          code: res.code
        })
        // console.log(res);
        that.getcode()
      }
    })
  },
  async getcode() {
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: '/api/user/get_session_key',
        method: "POST",
        data: {
          code: that.data.code
        }
      })
      console.log(data);
      that.checksessionkey()
      that.setData({
        session_key: data.session_key,
        openid: data.openid
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
  goArticleDetails(e) {
    let idItem = e.currentTarget.dataset.item
    if (idItem.title != '' && idItem.content != '') {
      console.log(e);
      wx.navigateTo({
        url: '/pages/articleDetails/articleDetails?banner_id=' + idItem.id
      })
    }


  },
  async submitCompany(e) {
    let that = this
    console.log(e.detail.value);
    let obk = e.detail.value
    obk.vehicle_license = that.data.vehicle_licenseUrl
    obk.vehicle_invoice = that.data.vehicle_invoiceUrl
    obk.dms_system = that.data.dms_systemUrl
    obk.power_of_attorney = that.data.power_of_attorney
    obk.operator_idcard_front = that.data.operator_idcard_front
    obk.operator_idcard_back = that.data.operator_idcard_back
    obk.store_id = that.data.store_id
    obk.store_saler_id = that.data.store_saler_id
    obk.identity = that.data.identity
    obk.business_license = that.data.business_license
    obk.invoice_date = that.data.invoice_date
    obk.vehicle_type = that.data.vehicle_type
    if (obk.vin_num == '') {
      wx.showToast({
        title: 'VIN码/车架号（17位）不能为空',
        icon: 'none',
        duration: 1000,
        mask: true
      })
      return false
    } else if (obk.invoice_date == '') {
      wx.showToast({
        title: '开票日期不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.engine_num == '') {
      wx.showToast({
        title: '发动机号不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.vehicle_type == '') {
      wx.showToast({
        title: '请选择车型',
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
    } else if (obk.company_name == '') {
      wx.showToast({
        title: '公司名称不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.credit_code == '') {
      wx.showToast({
        title: '统一社会信用代码不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.operator == '') {
      wx.showToast({
        title: '经办人不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.address == '') {
      wx.showToast({
        title: '通讯地址不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.mobile == '') {
      wx.showToast({
        title: '手机号不能为空',
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
    } else if (obk.store_id == '') {
      wx.showToast({
        title: '您尚未选择门店',
        icon: 'none',
        duration: 1000,
      })
      return false;

    } else if (obk.store_saler_id == '') {
      wx.showToast({
        title: '您尚未选择销售代表',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.identity == '') {
      wx.showToast({
        title: '请选择用户信息',
        icon: 'none',
        duration: 1000,
      })
      return false;
    }
    if (obk.business_license == '' && obk.power_of_attorney == '' && obk.operator_idcard_front == '' && obk.operator_idcard_back == '') {
      a.globalData.wechatTrue = true
    } else {
      a.globalData.wechatTrue = false
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
        url: 'api/index/contract',
        data: obk,
        method: 'POST'
      })
      console.log(data);
      if (data.code == 1) {
        that.setData({
          msg: data.msg,
          statusSuccess: data.data.status,
          contract_id: data.data.contract_id
        })
        that.popSuccessTest()
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/setmealChange/setmealChange?statusSuccess=' + that.data.statusSuccess + '&contract_id=' + that.data.contract_id
          })
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
        listError: err.msg,
        code0: err.code

      })
      that.toggleDialog()
    }

  },
  onClickopenCar() {
    this.setData({
      openvar: !this.data.openvar
    })
  },
  changenewci(e) {
    let that = this
    let send = e.currentTarget.dataset.index
    let openvary = that.data.openvary
    openvary.forEach((item, index) => {
      if (send == index) {
        that.setData({
          vehicle_name: item.name,
          vehicle_type: item.id
        })
      }
    });
    if (that.data.vehicle_type == 3) {
      wx.showToast({
        title: '暂不提供该车型延保产品',
        icon: 'none',
        duration: 1300,
      })
      return false;
    } else {
      console.log(that.data.vehicle_type);
      that.onClickopenCar()
    }

  },
  async onSubmit(e) {
    let that = this
    console.log(e.detail.value);
    let obk = e.detail.value
    obk.store_saler_id = that.data.store_saler_id
    obk.store_id = that.data.store_id
    obk.identity = that.data.identity
    obk.invoice_date = that.data.invoice_date
    obk.vehicle_license = that.data.vehicle_licenseUrl
    obk.vehicle_invoice = that.data.vehicle_invoiceUrl
    obk.dms_system = that.data.dms_systemUrl
    obk.idcard_front = that.data.idcard_frontUrl
    obk.vehicle_type = that.data.vehicle_type
    if (obk.vin_num == '') {
      wx.showToast({
        title: 'VIN码/车架号不能为空',
        icon: 'none',
        duration: 1000,
        mask: true
      })
      return false
    } else if (obk.invoice_date == '') {
      wx.showToast({
        title: '开票日期不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.engine_num == '') {
      wx.showToast({
        title: '发动机号不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.vehicle_type == '') {
      wx.showToast({
        title: '请选择车型',
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
    } else if (obk.realname == '') {
      wx.showToast({
        title: '姓名不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.idcard == '') {
      wx.showToast({
        title: '身份证号不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.address == '') {
      wx.showToast({
        title: '通讯地址不能为空',
        icon: 'none',
        duration: 1000,
      })
      return false;
    } else if (obk.mobile == '') {
      wx.showToast({
        title: '手机号不能为空',
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
    } else if (obk.store_saler_id == '') {
      wx.showToast({
        title: '销售代表不能为空',
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
    let myidcard = /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
    if (!myidcard.test(obk.idcard)) {
      wx.showToast({
        title: '身份证号码有误',
        duration: 1000,
        icon: 'none'
      });
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
        url: 'api/index/contract',
        data: obk,
        method: 'POST'
      })
      console.log(data);
      if (data.code == 1) {
        that.setData({
          msg: data.msg,
          statusSuccess: data.data.status,
          contract_id: data.data.contract_id
        })
        that.popSuccessTest()
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/setmealChange/setmealChange?statusSuccess=' + that.data.statusSuccess + '&contract_id=' + that.data.contract_id
          })
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
        listError: err.msg,
        code0: err.code

      })
      that.toggleDialog()
      // that.popTest()
    }

  },
  async getHomePage() { //获取轮播数据
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/index/bannerList',
        data: {
          store_id: that.data.store_id
        }
      })
      console.log(data);
      that.setData({
        homePage: data,
      })
    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
  async getindex() { //获取店铺数据
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/index/index',
        data: {
          store_id: that.data.store_id
        }
      })
      console.log(data);
      if (data.store != null) {
        that.setData({
          store_name: data.store.store_name
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '您尚未选择门店，请先选择门店',
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/changeStore/changeStore'
              })
            } else {

            }
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
  getToday() {
    var now = new Date()
    var year = now.getFullYear()
    var month = now.getMonth() + 1
    var day = now.getDate()
    if (month < 10) {
      month = '0' + month;
    }
    if (day < 10) {
      day = '0' + day;
    }
    var formatDate = year + '-' + month + '-' + day
    // console.log(formatDate);
    this.setData({
      formatDate: formatDate
    })
    return formatDate;
  },
  changeModel() {
    wx.navigateTo({
      url: '/pages/setmealChange/setmealChange'
    })
    // console.log(e.detail.value);
  },
  changeList() {
    let that = this
    let token = wx.getStorageSync('token')
    if (token) {
      if (that.data.store_id != '') {
        that.setData({
          changeTrue: false
        })
        that.showModal()
      } else {
        that.setData({
          msg: '请先选择门店'
        })
        that.popTest()
      }
    } else {
      wx.showModal({
        title: '提示',
        content: '您尚未登录，是否登录',
        success: function (res) {
          if (res.confirm) {
            that.setData({
              changeTrue: true
            })
            that.showModal()
          } else {

          }
        }
      })

    }

  },
  changeitem(e) {
    let that = this
    let ite = e.currentTarget.dataset.ite
    that.setData({
      store_saler: ite.realname,
      mobilePhone: ite.mobile,
      store_saler_id: ite.id,
    })
    that.hideModal()
  },
  otherChage() {
    this.showModal()
  },
  previewImage(e) {
    console.log(e);
    var current = e.target.dataset.src.split(',');
    console.log(current);
    var imgList = e.target.dataset.list.split(',')
    //图片预览
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: imgList // 需要预览的图片http链接列表
    })
  },
  swiperChange(e) {
    this.setData({
      currentSwiper: e.detail.current
    })
  },
  chejia(e) {
    let that = this
    let ary = e.detail.value
    let pdk = /^[A-Z0-9]+$/
    if (!pdk.test(ary)) {
      that.setData({
        msg: '字母请大写'
      })
      that.popTest()
      return
    }
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
        identity: 1
      })
    } else if (way == 1) {
      is_cloose = 2
      that.setData({
        is_cloose: is_cloose,
        is_color: false,
        identity: 2
      })
    }
  },
  chooseImg: function (e) { //上传图片开始
    console.log(e);
    let that = this;
    let type = e.currentTarget.dataset.type
    that.setData({
      chooseType: type,
    })
    wx.chooseImage({
      count: 1, // 最多可以选择的图片张数，默认9
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function (res) {
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
  },
  uploadAllfile(filePaths, successUp, failUp, i, length) { // 上传图片至后台
    let that = this;
    let url = 'api/common/upload';
    let headers = {
      "token": wx.getStorageSync("token"),
      'content-type': 'multipart/form-data'
    }
    console.log(headers);
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
        if (res.statusCode == 200) {
          console.log(res)
          let data = JSON.parse(res.data)
          if (data.code == 1) {
            console.log(data.data);
            let chooseType = Number(that.data.chooseType) // 图片序号
            let list = data.data.url;
            let imgurl = data.data.fullurl;
            switch (chooseType) {
              case 1:
                console.log(chooseType);
                that.setData({
                  vehicle_licenseUrl: data.data.url,
                  vehicle_license: data.data.fullurl,
                })
                break;
              case 2:
                that.setData({
                  vehicle_invoiceUrl: list,
                  vehicle_invoice: imgurl,
                })
                break;
              case 3:
                that.setData({
                  dms_systemUrl: list,
                  dms_system: imgurl,
                })
                break;
              case 4:
                that.setData({
                  idcard_frontUrl: list,
                  idcard_front: imgurl,
                })
                break;
              case 5:
                that.setData({
                  dms_systemUrl: list,
                  dms_system: imgurl,
                })
                break;
              case 6:
                that.setData({
                  business_licenseUrl: imgurl,
                  business_license: list,
                })
                break;
              case 7:
                that.setData({
                  power_of_attorneyUrl: imgurl,
                  power_of_attorney: list,
                })
                break;
              case 8:
                that.setData({
                  operator_idcard_frontUrl: imgurl,
                  operator_idcard_front: list,
                })
                break;
              case 9:
                that.setData({
                  operator_idcard_backUrl: imgurl,
                  operator_idcard_back: list,
                })
                break;
              default:
                that.setData({
                  msg: "错误",
                })
                that.popTest()
                break;
            }
          }
        } else {
          wx.showModal({
            title: '提示',
            content: res.msg,
            showCancel: false
          })
        }
        //do something 返回图片地址
        let chooseType = that.data.chooseType
        if (chooseType == 1 || chooseType == 2 || chooseType == 3 || chooseType == 4 || chooseType == 5 || chooseType == 6 || chooseType == 8) {
          that.getSotreName()
        } else {
          wx.hideNavigationBarLoading()
          wx.hideLoading()
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
  deleteImg: function (e) { // 删除图片
    console.log(e)
    let that = this;
    let ig = e.currentTarget.dataset.type;
    if (ig == 1) {
      that.setData({
        vehicle_license: '',
        vehicle_licenseUrl: '',
      })
      return false
    } else if (ig == 2) {
      that.setData({
        vehicle_invoice: '',
        vehicle_invoiceUrl: '',

      })
      return false
    } else if (ig == 3) {
      that.setData({
        dms_system: '',
        dms_systemUrl: '',

      })
      return false
    } else if (ig == 4) {
      that.setData({
        idcard_front: '',
        idcard_frontUrl: '',
      })
      return false
    } else if (ig == 5) {
      that.setData({
        dms_system: '',
        dms_systemUrl: '',

      })
      return false
    } else if (ig == 6) {
      that.setData({
        business_license: '',
        business_licenseUrl: '',
      })
      return false
    } else if (ig == 7) {
      that.setData({
        power_of_attorney: '',
        power_of_attorneyUrl: '',
      })
      return false
    } else if (ig == 8) {
      that.setData({
        operator_idcard_front: '',
        operator_idcard_frontUrl: '',
      })
      return false
    } else if (ig == 9) {
      that.setData({
        operator_idcard_back: '',
        operator_idcard_backUrl: '',
      })
      return false
    }



  },
  previewImg1: function (e) { // 预览图片
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var images = this.data.imgurl;
    wx.previewImage({
      //当前显示图片
      current: images[index],
      //所有图片
      urls: images
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
  async wechatWarranty(e) { // 立即授权
    let that = this;
    console.log(that.data.session_key);
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
        console.log(that.data.store_id);
        if (that.data.store_id != '') {
          that.getStoreList()
          that.getISalerList()
        } else {
          that.getindex()
          that.getLogin()
        }
      }
    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }

  },
  getPhoneNumber(e) { //手机号授权
    let that = this
    that.getLogin()
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
    that.getLogin()
    that.setData({
      msg: data.msg,
      mobile: data.data.phoneNumber
    })
    that.popSuccessTest();


    // setTimeout(function () {
    //   if (that.data.num == 1) {
    //     wx.navigateBack()
    //   }
    // }, 1300)
  },
  onShareAppMessage() {
    return {
      title: '研孚汽车延保', // 转发后 所显示的title
      path: '/pages/home/home', //分娩笔记分享2
    }
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