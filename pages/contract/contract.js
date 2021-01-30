import {
  request
} from "../../request/index.js"
const a = getApp()
var context = null; // 使用 wx.createContext 获取绘图上下文 context
var isButtonDown = false; //是否在绘制中
var arrx = []; //动作横坐标
var arry = []; //动作纵坐标
var arrz = []; //总做状态，标识按下到抬起的一个组合
var canvasw = 0; //画布宽度
var canvash = 0; //画布高度
Page({
  data: {
    baseUrl: a.globalData.baseUrl,
    imagesUrl: a.globalData.imagesUrl,
    statusTop: a.globalData.statusHeight,
    four: 4,
    msg: '',
    //canvas宽高
    canvasw: 0,
    canvash: 0,
    //canvas生成的图片路径
    canvasimgsrc: "",
    signStatus: false,
    package_id: '',
    contract_id: '',
    signFullurl: '',
    signUrl: '',
    contracTurl: '', // 合同
    lookPath: false,
    signature: '电子签名',
    cartLength: false,
    is_sign: '', //  0  || 1
    price: "",
    identity: '',
    buttonClicked: false,
    buttonClickeda: true,
    buttonClickedb: false,
    coloe: true,
    wechatTrue: '',
    is_cloose: false,
    heheight: '',
    comeback: false,
    imgurls: 'https://carcare.brofirst.cn/assets/img/miniProgram/contract_image.png'
  },
  onLoad: function (options) {
    let that = this
    console.log(options);
    that.setData({
      package_id: options.package_id,
      contract_id: options.contract_id,
      price: options.price
    })
    that.getContract()
    //画布初始化执行
    that.startCanvas();
  },
  onShow: function () {
    let that = this;
    let wechatTrue = a.globalData.wechatTrue
    this.setData({
      wechatTrue: wechatTrue,
    })
    console.log(wechatTrue);
    wx.getSystemInfo({
      success: function (res) {
        console.log(res, '3498349')
        that.setData({
          heheight: res.screenHeight - 250
        })
        console.log(that.data.heheight)
      }
    })
  },
  goback() {
    if (this.data.comeback == true) {
      wx.switchTab({
        url: '/pages/customerCenter/customerCenter'
      })
    } else {
      wx.navigateBack()
    }

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
  changeTrue() {
    let that = this
    that.setData({
      is_cloose: !that.data.is_cloose
    })
  },
  electronicSignature() {
    let that = this
    let lookPath = that.data.lookPath
    if (!lookPath) {
      that.setData({
        signStatus: !that.data.signStatus
      })
    }
  },
  onResize(res) {
    console.log('屏幕方向旋转', res)
  },
  async getContract() {
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/index/getContract',
        data: {
          contract_id: that.data.contract_id,
          package_id: that.data.package_id
        }
      })
      console.log(data);
      that.setData({
        contracTurl: data.contract_url,
        is_sign: data.is_sign,
        identity: data.identity
      })
    } catch (err) {
      console.log(err);
      that.setData({
        msg: err.msg
      })
      that.popTest()
    }
  },
  async lookSign() { //签名
    let that = this
    try {
      const {
        data: {
          data
        }
      } = await request({
        url: 'api/index/sign',
        data: {
          contract_id: that.data.contract_id,
          package_id: that.data.package_id,
          sign_url: that.data.signUrl
        }
      })
      console.log(data);
      that.setData({
        contracTurl: data.contract_url
      })
      console.log(that.data.contracTurl);

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
    let url = that.data.contracTurl;
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
  promptlyPay() {
    let that = this
    let lookPath = that.data.lookPath
    let identity = that.data.identity
    let is_cloose = that.data.is_cloose
    if (is_cloose) {
      if (lookPath) {
        if (identity == 1) {
          this.setData({
            cartLength: !this.data.cartLength
          })
        } else {
          this.setData({
            cartLength: !this.data.cartLength
          })
        }
      } else {
        that.setData({
          msg: '请先阅读电子合同并签名'
        })
        that.popTest()
      }
    } else {
      that.setData({
        msg: '请先阅读电子合同并签名'
      })
      that.popTest()
    }


  },
  clickCartLength() {
    this.setData({
      cartLength: !this.data.cartLength
    })
  },
  async wechatPay() {
    let that = this
    let identity = that.data.identity
    that.setData({
      buttonClickeda: false
    })
    try {
      const {
        data
      } = await request({
        url: 'api/index/pay',
        data: {
          contract_id: that.data.contract_id,
          package_id: that.data.package_id,
          pay_type: 1,
        }
      })
      console.log(data);

      if (data.code == 1) {
        that.setData({
          order_id: data.data.order_id,
        })
        wx.requestPayment({
          timeStamp: data.data.payment.timeStamp,
          nonceStr: data.data.payment.nonceStr,
          package: data.data.payment.package,
          signType: 'MD5',
          paySign: data.data.payment.paySign,
          appId: data.data.payment.appId,
          success(res) {
            console.log(res);
            if (identity == 1) {
              wx.navigateTo({
                url: '/pages/consigneeAddress/consigneeAddress?order_id=' + data.data.order_id
              })
            } else {
              wx.navigateTo({
                url: '/pages/invoiceInformation/invoiceInformation?order_id=' + data.data.order_id + '&wait=1',
              })
            }
          },
          fail(res) {
            console.log(res)
          }
        })

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
  async wechatPayt() {
    let that = this
    let identity = that.data.identity
    let wechatTrue = that.data.wechatTrue
    that.setData({
      buttonClickeda: true,

    })
    try {
      const {
        data
      } = await request({
        url: 'api/index/pay',
        data: {
          contract_id: that.data.contract_id,
          package_id: that.data.package_id,
          pay_type: 1,
        }
      })
      console.log(data);
      if (data.code == 1) {
        that.setData({
          order_id: data.data.order_id,
          comeback: true
        })
        wx.requestPayment({
          timeStamp: data.data.payment.timeStamp,
          nonceStr: data.data.payment.nonceStr,
          package: data.data.payment.package,
          signType: 'MD5',
          paySign: data.data.payment.paySign,
          appId: data.data.payment.appId,
          success(res) {
            console.log(res);
            if (identity == 1) {
              wx.navigateTo({
                url: '/pages/consigneeAddress/consigneeAddress?order_id=' + data.data.order_id
              })
            } else {
              wx.navigateTo({
                url: '/pages/invoiceInformation/invoiceInformation?order_id=' + data.data.order_id + '&wait=1',
              })
            }
          },
          fail(res) {
            console.log(res)
          }
        })

      } else {
        that.setData({
          msg: data.msg,
          comeback: false
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
  async Payment() {
    let that = this
    let identity = that.data.identity
    that.setData({
      buttonClickedb: true,
    })
    try {
      const {
        data
      } = await request({
        url: 'api/index/pay',
        data: {
          contract_id: that.data.contract_id,
          package_id: that.data.package_id,
          pay_type: 2,
        }
      })
      console.log(data);
      if (data.code == 1) {
        that.setData({
          order_id: data.data.order_id,
          comeback: true
        })
        if (identity == 1) {
          //更改的话就改这里
          wx.navigateTo({
            url: '/pages/invoiceInformation/invoiceInformation?order_id=' + data.data.order_id + '&wait=3'
          })
        } else {
          wx.navigateTo({
            url: '/pages/invoiceInformation/invoiceInformation?wait=2' + '&order_id=' + data.data.order_id
          })
        }
      } else {
        that.setData({
          msg: data.msg,
          comeback: false
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
  // 签名（ 画布 ）
  // 显示签名
  signFun: function () {
    let that = this;
    wx.setNavigationBarTitle({
      title: '签名',
    });
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#ffffff',
    });
    //画布初始化执行
    that.startCanvas();
    //移除画布内容
    that.cleardraw();
  },
  //关闭签名画布
  closeCanvasFun: function () {
    let that = this;
    that.setData({
      signStatus: false,
    })
  },
  //画布初始化执行
  startCanvas: function () {
    var that = this;
    //创建canvas
    this.initCanvas();
    //获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        canvasw = res.windowWidth; //设备宽度
        canvash = res.windowHeight - 40;
        that.setData({
          'canvasw': canvasw
        });
        that.setData({
          'canvash': canvash
        });
      }
    });

  },
  //初始化函数
  initCanvas: function () {
    // 使用 wx.createContext 获取绘图上下文 context
    context = wx.createCanvasContext('canvas');
    context.beginPath()
    context.setStrokeStyle('#000000');
    context.setLineWidth(4);
    context.setLineCap('round');
    context.setLineJoin('round');
  },
  //事件监听
  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg)
  },
  canvasStart: function (event) {
    let that = this
    that.setData({
      coloe: false
    })
    isButtonDown = true;
    arrz.push(0);
    arrx.push(event.changedTouches[0].x);
    arry.push(event.changedTouches[0].y);

  },
  canvasMove: function (event) {
    if (isButtonDown) {
      arrz.push(1);
      arrx.push(event.changedTouches[0].x);
      arry.push(event.changedTouches[0].y);
    };
    for (var i = 0; i < arrx.length; i++) {
      if (arrz[i] == 0) {
        context.moveTo(arrx[i], arry[i])
      } else {
        context.lineTo(arrx[i], arry[i])
      };
    };
    context.clearRect(0, 0, canvasw, canvash);
    context.setStrokeStyle('#000000');
    context.setLineWidth(4);
    context.setLineCap('round');
    context.setLineJoin('round');
    context.stroke();
    context.draw(false);
  },
  canvasEnd: function (event) {
    isButtonDown = false;
  },
  //清除画布
  cleardraw: function () {
    //清除画布
    arrx = [];
    arry = [];
    arrz = [];
    context.clearRect(0, 0, canvasw, canvash);
    context.draw(true);
  },
  //提交签名内容
  setSign: function () {
    var that = this;
    if (arrx.length == 0) {
      wx.showModal({
        title: '提示',
        content: '签名内容不能为空！',
        showCancel: false
      });
      return false;
    };
    // console.log("不是空的，canvas即将生成图片")
    //生成图片
    wx.canvasToTempFilePath({
      canvasId: 'canvas',
      success: function (res) {
        // console.log("canvas可以生成图片")
        // console.log(res.tempFilePath, 'canvas图片地址');
        that.setData({
          imgArr: [res.tempFilePath]
        });
        //code 比如上传操作
        let successUp = 0; //成功个数
        let failUp = 0; //失败个数
        let i = 0; //第几个
        let tempFilePaths = that.data.imgArr //总文件
        let length = that.data.imgArr.length //总共个数
        wx.showNavigationBarLoading()
        wx.showLoading({
          title: '上传中',
        })
        that.uploadAllfile(tempFilePaths, successUp, failUp, i, length)
      },
      fail: function () {
        // console.log("canvas不可以生成图片")
        wx.showModal({
          title: '提示',
          content: '微信当前版本不支持，请更新到最新版本！',
          showCancel: false
        });
      },
      complete: function () {

      }
    })

  },
  // 上传图片到服务器
  uploadAllfile: function (filePaths, successUp, failUp, i, length) {

    let that = this;
    let identity = that.data.identity
    let head = {
      'token': wx.getStorageSync('token'),
      'Accept': '*/*',
      // 'userId': wx.getStorageSync('userId') || ''
      'content-type': 'multipart/form-data'
    }
    let url = "api/common/upload";
    wx.uploadFile({
      url: a.globalData.baseUrl + url, //仅为示例，非真实的接口地址
      filePath: filePaths[i],
      name: 'file',
      header: head,
      formData: {},
      success: function (res) {
        wx.hideNavigationBarLoading()
        wx.hideLoading()
        if (res.statusCode == 200) {
          let data = JSON.parse(res.data)
          console.log(data, "dataJson");
          that.setData({
            signFullurl: data.data.fullurl,
            signUrl: data.data.url,
            signStatus: false,
            lookPath: true,
            signature: '已签名',

          });
          if (identity == 1) {
            that.setData({
              buttonClicked: false
            })
          }
          that.lookSign()
          console.log(that.data.signUrl);
        }
      },
      fail: function (res) {
        wx.hideNavigationBarLoading()
        wx.hideLoading()
      },
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