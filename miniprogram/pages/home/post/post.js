// pages/home/post/post.js
const app = getApp();
let genderArray = ['男', '女'];
Page({
  data: {
    logs: [],
    imageArray: [],
    attachments: [],
    private: false,
    textContent: '',
    name: '',
    param: app.globalData.param,
    changePostType: false,
    imgList: [],
    modalName: null,
    array: genderArray,
    userImage: '',
    name: '',
    major: '',
    gender: '',
    genderValue: '',
    expectation: '',
    introduce: false,
    icon: {
      width: "100rpx",
      height: "100rpx",
      path: "",
      showImage: true
    },
    canPost: true
  },

  getPostType(e) {
    console.log(e.detail.value)
    this.setData({
      changePostType: e.detail.value
    })
  },


  ChooseImage() {
    wx.chooseImage({
      count: 4, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        this.setData({
          attachments: res.tempFilePaths
        })
      }
    });
  },

  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },

  DelImg(e) {
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            attachments: this.data.imgList
          })
        }
      }
    })
  },
  /** 提交 */
  post: function() {
    var that = this
    // console.log(nowtime)
    this.setData({
      canPost: false
    })

    let content = this.data.textContent;
    let attachments = this.data.attachments;
    let privateValue = this.data.private;
    let username = this.data.name;

    //获取图片
    this.data.imageArray.map(item => {
      attachments.push(item.uploadResult.key)
    })

    if (content == '' && attachments == '') {
      wx.showLoading({
        title: '内容不能为空！',
      });
      this.setData({
        canPost: true
      })
      setTimeout(function() {
        wx.hideLoading();
      }, 1500)
      return false;
    }

    wx.showLoading({
      title: '发送中..'
    });
    // 1. 获取数据库引用
    const db = wx.cloud.database()
    // 2. 构造查询语句
    // collection 方法获取一个集合的引用
    // where 方法传入一个对象，数据库返回集合中字段等于指定值的 JSON 文档。API 也支持高级的查询条件（比如大于、小于、in 等），具体见文档查看支持列表
    // get 方法会触发网络请求，往数据库取数据
    db.collection('posts').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        "poster": {
          "avatar": app.globalData.userInfo.avatarUrl,
          "gender": app.globalData.userInfo.gender,
          "nickname": app.globalData.userInfo.nickName
        },
        'username': username,
        "poster_id": app.globalData.userId,
        "college_id": "所属学校",
        "content": content,
        "attachments": attachments,
        // "topic": "主题,预留字段",
        // "type": "",
        // "status": false,
        "private": privateValue,
        "comment_number": 0,
        "parise": [],
        "comment": [],
        "praise_number": 0,
        "created_at": new Date(),
        "updated_at": app.getnowtime()
      },

      success(res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log('提交结果', res)
        var path = res._id + new Date().getTime() + '.png'

        var _id = res._id

        if (attachments.length > 0) {
          wx.cloud.uploadFile({
            // 指定上传到的云路径
            cloudPath: path,
            // 指定要上传的文件的小程序临时文件路径
            filePath: attachments[0],
            // 成功回调
            success: res => {
              console.log('上传成功', res)
              that.setData({
                canPost: true
              })
              wx.hideLoading();
              console.log('w', res.errMsg);
              // 文件上传成功
              if (res.errMsg == "cloud.uploadFile:ok") {
                var fileid = res.fileID
                db.collection('posts').doc(_id).update({
                  // data 传入需要局部更新的数据
                  data: {
                    "attachments": [fileid],
                  },
                  success: console.log,
                  fail: console.error
                })
                db.collection('albums').add({
                  data:{
                    url: fileid
                  }
                })
                app.globalData.reloadHome = true;
                wx.switchTab({
                  url: '/pages/home/index_v2/index_v2',
                })
              } else {
                wx.showToast({
                  title: res.errMsg,
                  icon: 'none'
                });
                setTimeout(function() {
                  wx.hideLoading();
                }, 1500)
              }
            },
          })
        } else {
          wx.hideLoading()
          wx.switchTab({
            url: '/pages/home/index_v2/index_v2',
            success: function (e) {
              var page = getCurrentPages().pop();
              if (page == undefined || page == null) return;
                page.onLoad();
              }
          })
        }
      }
    })
  },

  postShow: function() {
    var that = this
    this.setData({
      canPost: false
    })
    let attachments = this.data.attachments;
    let name = this.data.name;
    let gender = this.data.genderValue;
    let major = this.data.major;
    let expectation = this.data.expectation;
    let introduce = this.data.introduce;

    this.data.imageArray.map(item => {
      attachments.push(item.uploadResult.key)
    })

    if (!name) {
      wx.showToast({
        title: '名字不能为空',
        icon: 'none'
      })
      return false;
    }

    if (!gender) {
      wx.showToast({
        title: '性别不能为空',
        icon: 'none'
      })
      return false;
    }

    if (attachments.length <= 0) {
      wx.showToast({
        title: '图片不能为空',
        icon: 'none'
      })
      return false;
    }

    wx.showLoading({
      title: '发送中...',
    })

    if (gender == 0) {
      gender = '男'
    } else if (gender == 1) {
      gender = '女'
    } else if (gender == 2) {
      gender = '人妖'
    } else if (gender == 3) {
      gender = '未知生物'
    }
    // 1. 获取数据库引用
    const db = wx.cloud.database()
    db.collection('sale_friends').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        "poster": {
          "avatar": app.globalData.userInfo.avatarUrl,
          "gender": app.globalData.userInfo.gender,
          "nickname": app.globalData.userInfo.nickName
        },
        "id": "",
        "owner_id": app.globalData.userId,
        "college_id": "学校Id",
        "name": name,
        "gender": gender,
        "major": major,
        "expectation": expectation,
        "introduce": introduce,
        "attachments": [{'url':attachments[0]}],
        "comment_number": 0,
        "comments": [],
        "praise_number": 0,
        "praise": [],
        "type": "预留字段",
        "status": "预留字段",
        "created_at": new Date()
      },
      success(res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(res)
        var date = new Date
        const year = date.getFullYear().toString()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hour = date.getHours()
        const minute = date.getMinutes()
        const second = date.getSeconds()
        var uptime = year + month.toString() + day.toString() + hour + minute + second
        var path = res._id + uptime + '.png'

        var _id = res._id

        console.log(_id)

        if (attachments.length > 0) {
          wx.cloud.uploadFile({
            // 指定上传到的云路径
            cloudPath: path,
            // 指定要上传的文件的小程序临时文件路径
            filePath: attachments[0],
            // 成功回调
            success: res => {
              console.log('上传成功', res)
              that.setData({
                canPost: true
              })

              wx.hideLoading();
              console.log('w', res.errMsg);
              // 文件上传成功
              if (res.errMsg == "cloud.uploadFile:ok") {
                var fileid = res.fileID
                db.collection('sale_friends').doc(_id).update({
                  // data 传入需要局部更新的数据
                  data: {
                    "attachments": [{ 'url': fileid}],
                  },
                  success: console.log,
                  fail: console.error
                })
                db.collection('albums').add({
                  data:{
                    url: fileid
                  }
                })
                app.globalData.reloadHome = true;
                wx.switchTab({
                  'url': '/pages/home/index_v2/index_v2',
                })
              } else {
                wx.showToast({
                  title: res.errMsg,
                  icon: 'none'
                });
                setTimeout(function () {
                  wx.hideLoading();
                }, 1500)
              }


            },
          })
        } else {
          wx.hideLoading()
          wx.switchTab({
            url: '/pages/home/index_v2/index_v2',
          })
        }

      }
    })
  },


  getTopic: function(event) {
    let value = event.detail.value;
    this.setData({
      name: value
    });
  },


  /**
   * 预览图片
   */
  previewImage: function(event) {
    let url = event.target.id;
    wx.previewImage({
      current: '',
      urls: [url]
    })
  },

  /**
   * 设置是否匿
   */
  setPrivate: function(event) {
    this.setData({
      private: event.detail.value
    });
  },

  /**
   * 获取输入内容
   */
  getTextContent: function(event) {
    let value = event.detail.value;
    this.setData({
      textContent: value
    });
  },

  getName: function(e) {
    let value = e.detail.value;
    this.setData({
      name: value
    });
  },

  bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      gender: genderArray[e.detail.value],
      genderValue: e.detail.value
    })
  },

  getMajor: function(e) {
    let value = e.detail.value;
    this.setData({
      major: value
    });
  },

  getLike: function(e) {
    let value = e.detail.value;
    this.setData({
      expectation: value
    });
  },

  getContent: function(e) {
    let value = e.detail.value;
    this.setData({
      introduce: value
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        tabCur: 'post'
      })
    }
    this.setData({
      imageArray: [],
      attachments: [],
      private: false,
      textContent: '',
      changePostType:false,
      name: '',
      param: app.globalData.param,
      imgList: [],
      modalName: null,
      array: genderArray,
      userImage: '',
      name: '',
      major: '',
      gender: '',
      genderValue: '',
      expectation: '',
      introduce: false,
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})