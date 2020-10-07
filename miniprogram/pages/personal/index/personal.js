const app = getApp();
const db = wx.cloud.database()
const $ = db.command.aggregate
const _ = db.command
Page({
  data: {
    avatar: '',
    nickname: '',
    newLetterNumber: 0,
    serviceId: '',
    param: app.globalData.param,
    postNum: 0,
    showYourSelfNum: 0,
    friendsNum: 0,
    userInfo: null,
    mapGender: ['未知', '男', '女'],
    bv_expression: 0,
    bv_value: 0,
    bv_gender: 0,
    bv_glass: false,
    bv_age: 0,
    imgList:[],
    img_num:0,
    isvip:false,
    online: false,
    dataScore: 0,
    beautyScore:0,
    commentArr:[0,0,0,0,0,0,0],
    describe:'你还没检测哦，试一试8',
    userComment:[{
      content:'理想型',
      num:0,
      isChoose:false
    },{
      content:'高学历',
      num:0,
      isChoose:false
    },{
      content:'活跃分子',
      num:0,
      isChoose:false
    },{
      content:'二次元',
      num:0,
      isChoose:false
    },{
      content:'玩游戏',
      num:0,
      isChoose:false
    },{
      content:'唱歌好',
      num:0,
      isChoose:false
    },{
      content:'穿搭达人',
      num:0,
      isChoose:false
    },{
      content:'脾气好',
      num:0,
      isChoose:false
    }
  ]
  },
  onLoad: function() {
    this.setData({
      param: app.globalData.param
    })
    this.getPostNum()
    this.getShowYourSelfNum()
    this.getFriedsNum()
    this.getMyInfo()
    this.getUserComment()
    this.getUserCommentNum()
    this.getAlbums()
  },
  onShow: function() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        tabCur: 'my'
      })
    }
    this.getMyInfo()
  },
  onShowVip(){
    wx.navigateTo({
      url: '/pages/personal/vip/vip',
    })
  },
  onReady: function() {},
  pickTag(e){
    console.log(e.currentTarget.dataset.index)
    let index = e.currentTarget.dataset.index
    const data = this.data.userComment
    data[index].isChoose = !data[index].isChoose
    this.setData({
      userComment : data
    })
  },
  async getUserCommentNum(){
    const {list} = await db.collection('user_comment')
    .aggregate()
    .match({
      userId: wx.getStorageSync('openid')
    })
    .group({
      _id: null,
      data_avg: $.avg('$dataScore'),
      beauty_avg: $.avg('$beautyScore')
    }).end()
    this.setData({
      dataScore : list[0].data_avg,
      beautyScore : list[0].beauty_avg
    })
  },

  async getUserComment(){
    const arr = new Array(8).fill(0)
    const {data} = await db.collection('user_comment').where({
      userId: wx.getStorageSync('openid')
    }).get()
    console.log(data)
    for(let item of data){
      for(let i = 0; i < 8 ; i++){
        item.userComment[i] == true ? arr[i]++ : ''
      }
    }
    console.log(arr)
    this.setData({
      commentArr: arr
    })
  },

  getPostNum() {
    db.collection('posts').where({
      _openid: wx.getStorageSync('openid')
    }).count().then(res => {
      this.setData({
        postNum: res.total
      })
    })
  },
  getShowYourSelfNum() {
    db.collection('sale_friends').where({
      _openid: wx.getStorageSync('openid')
    }).count().then(res => {
      this.setData({
        showYourSelfNum: res.total
      })
    })
  },
  getFriedsNum() {
    db.collection('friends').where(_.or([{
        _openid: app.globalData.userId
      },
      {
        hisOpenid: app.globalData.userId
      }
    ])).count().then(res => {
      this.setData({
        friendsNum: res.total
      })
    })
  },
  getMyInfo() {
    let user = wx.getStorageSync('userInfo')
    console.log(user)
    let text = '是个'
    text += user.bv_glass ? '戴眼镜的' : '不戴眼镜的'
    text += user.bv_gender > 50 ? '男孩儿呢' : '女孩儿呢'
    console.log(text)
    this.setData({
      userInfo: user,
      avatar: user.avatarUrl,
      nickname: user.nickName,
      bv_expression: user.bv_expression,
      bv_value: user.bv_value,
      bv_gender: user.bv_gender,
      bv_glass: user.bv_glass,
      bv_age: user.bv_age,
      describe: text,
      isvip: wx.getStorageSync('isvip'),
      online: wx.getStorageSync('online')
    })
  },
  getAlbums(){
    db.collection('albums').where({
      _openid: app.globalData.userId
    }).get().then(res=>{
      this.setData({
        img_num : res.data.length,
        imgList: res.data.map(item=>{
          return item.url
        })
      })
    })
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },

  getBeautyValue(e) {
    if (e.type === 'tap') {
      // 短按拍照为拍摄照片
      this.getImage()
    } else if (e.type === 'longpress') {
      // 长按拍照为选择照片
      this.getImage('album')
    }
  },

  getImage(type = 'camera') {
    const that = this
    // 调用系统 API 选择或拍摄照片
    wx.chooseImage({
      sourceType: [type], // camera | album
      sizeType: ['compressed'], // original | compressed
      count: 1,
      success(res) {
        // 取照片对象
        const image = res.tempFiles[0]
        // 图片过大
        if (image.size > 1024 * 1000) {
          return wx.showToast({
            icon: 'none',
            title: '图片过大, 请重新拍张小的！'
          })
        }
        // 显示到界面上
        that.setData({
          image: image.path
        })

        // 分析检测人脸
        that.detectImage(image.path)
      }
    })

    // 关闭 Tips 显示
    this.setData({
      showTips: false
    })
  },

  /**
   * 分析照片
   */
  detectImage(src) {
    const that = this

    // 取消之前的结果显示
    that.setData({
      result: null
    })

    // loading
    wx.showLoading({
      title: '加载中...'
    })

    // 将图片上传至 AI 服务端点
    wx.uploadFile({
      url: 'https://ai.qq.com/cgi-bin/appdemo_detectface',
      name: 'image_file',
      filePath: src,
      success:res=> {
        // 解析 JSON
        const result = JSON.parse(res.data)

        if (result.ret === 0) {
          // 成功获取分析结果
          // console.log(res.data)
          db.collection('users').where({
            _openid: wx.getStorageSync('openid')
          }).update({
            data: {
              bv_expression: result.data.face[0].expression,
              bv_value: result.data.face[0].beauty,
              bv_gender: result.data.face[0].gender,
              bv_glass: result.data.face[0].glass,
              bv_age: result.data.face[0].age
            }
          }).then(res => {
            console.log(res)
            that.setData({
              bv_expression: result.data.face[0].expression,
              bv_value: result.data.face[0].beauty,
              bv_gender: result.data.face[0].gender,
              bv_glass: result.data.face[0].glass,
              bv_age: result.data.face[0].age
            })
            this.data.userInfo.bv_expression = result.data.face[0].expression,
            this.data.userInfo.bv_value = result.data.face[0].beauty
            this.data.userInfo.bv_gender = result.data.face[0].gender
            this.data.userInfo.bv_glass = result.data.face[0].glass
            this.data.userInfo.bv_age = result.data.face[0].age
            wx.setStorageSync('userInfo', this.data.userInfo)
            app.globalData.userInfo = this.data.userInfo
            this.getMyInfo()
          }).catch(err => {
            console.log(err)
          })
        } else {
          // 检测失败
          wx.showToast({
            icon: 'none',
            title: '找不到你的小脸蛋喽～'
          })
        }

        // end loading
        wx.hideLoading()
      }
    })
  },

  updateAvatar() {
    let that = this
    wx.chooseImage({
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: res => {
        let tempFilePath = res.tempFilePaths[0]
        let suffix = /\.\w+$/.exec(tempFilePath)[0] //获取图片扩展名
        console.log(res.tempFilePaths)
        wx.cloud.uploadFile({
          cloudPath: new Date().getTime() + suffix,
          filePath: tempFilePath, // 文件路径
          success: res => {
            // res.fileID
            let fileId = res.fileID
            db.collection('users').where({
              _openid: wx.getStorageSync('openid')
            }).update({
              data: {
                avatarUrl: fileId
              }
            }).then(res => {
              that.setData({
                avatar: fileId
              })
              that.userInfo.avatarUrl = fileId
              wx.setStorageSync('userInfo', that.data.userInfo)
              app.globalData.userInfo = that.data.userInfo
            }).catch(err => {
              console.log(err)
            })
          },
          fail: err => {
            console.log(err)
          }
        })
      }
    })
  },

  /**
   * 进入设置页面
   */
  openSet: function() {
    wx.navigateTo({
      url: '/pages/personal/set/set',
    })
  },

  /**
   * 进入表白墙列表
   */
  opendPostList: function() {
    wx.navigateTo({
      url: '/pages/personal/post_list/post_list'
    })
  },
  /**
   * 进入好友列表
   */
  openFriends() {
    wx.navigateTo({
      url: '/pages/personal/friends/friends',
    })
  },
  /**
   * 进入魅力秀
   */
  openShowYourselfList: function() {
    wx.navigateTo({
      url: '/pages/personal/sale_list/sale_list'
    })
  },
  /**
   * 进入匹配列表
   */
  openMatchList: function() {
    wx.navigateTo({
      url: '/pages/help/help_single/help_single'
    })
  },
  updateInfo: function() {
    wx.navigateTo({
      url: '/pages/personal/set_profile/set_profile'
    })
  }
})