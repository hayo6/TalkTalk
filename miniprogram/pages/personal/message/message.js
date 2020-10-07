const app = getApp();
const db = wx.cloud.database()
Page({
  data: {
    image: 'tmp/wx46d5674c81153f30.o6zAJs3oh85Zb1lJE8oWix57vny0.2b862a6493fd893b7fbc37bd8dfd424f.jpg',
    baseImageUrl: app.globalData.imageUrl,
    messageList: [],
    showGeMoreLoadin: false,
    param: app.globalData.param,
    message_number: 0,
    showCommentInput: false,
    objId: '',
    refCommenter: '',
    objType: '',
    userId:''
  },
  onLoad: function(option) {
    let objType = option.type;
    let messageType = option.new_message;
    // this.getInboxList(objType, messageType);
    // this.setData({
    //   param: app.globalData.param
    // })
  },
  onShow: function(option) {
    this.getInboxList();
    this.cahngeUnreadStatus()
    this.setData({
      param: app.globalData.param
    })
  },
  onReplay(e) {
    console.log("显示回复弹窗")
    this.setData({
      showCommentInput: true,
      objId: e.currentTarget.dataset.objid,
      refCommenter: e.currentTarget.dataset.username,
      objType: e.currentTarget.dataset.type,
      userId: e.currentTarget.dataset.userid
    })
  },
  hideCommentInput(e) {
    console.log(e.detail)
    this.setData({
      showCommentInput: !e.detail
    })
  },
  cahngeUnreadStatus(){
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'changeUnreadStatus',
      // 传递给云函数的event参数
      data: {
        userId:wx.getStorageSync('openid')
      }
    })
  },
  /**
   * 获取消息列表
   */
  getInboxList: function() {
    let that = this
    wx.showLoading({
      title: '加载中...',
    })
    that.setData({
      messageList: [],
      message_number: 0,
      param: true
    })
    // 获取数据
    db.collection('message')
      .where({
        messageuser: app.globalData.userId // 填入当前用户 openid
      })
      .orderBy('update_at', 'desc')
      .get().then(res => {
        this.setData({
          messageList:this.data.messageList.concat(res.data),
          message_number: this.data.message_number+res.data.length,
          param:true
        })
        wx.hideLoading()
      }).catch(err => {
        console.log(err)
      })
  },
  jumpToHome(e){
    let sender = e.currentTarget.dataset.sender
    let myId = app.globalData.userId
    sender == myId ?
    wx.switchTab({
      url: `/pages/personal/index/personal`,
    }) :
    wx.navigateTo({
      url: `/pages/friend_home/friend_home?userId=${sender}`,
    })
  },
  // 清空消息列表
  clearnmassage: function() {
    var that = this
    wx.showLoading({
      title: '正在清除...',
    })
    // 调用自定义云函数
    wx.cloud.callFunction({
      name: 'DeleteMessage',
      data: {
        id: app.globalData.userId,
        dbname: 'message'
      },
      success: res => {
        wx.hideLoading()
        wx.showToast({
          title: '消息已清除',
        })
        that.getInboxList()
      },
      fail: res => {
        wx.hideLoading()
        wx.showToast({
          title: '清除失败！',
        })
      }
    })
  },

  /**
   * 上拉加载跟多
   */
  onReachBottom: function() {
    // this.getInboxList();
    // this.setData({
    //     showGeMoreLoadin: true
    // });
  },
  /**
   * 打开详情
   */
  opendDetail: function(e) {
    console.log(e)
    let objType = e.currentTarget.dataset.type
    let objid = e.currentTarget.dataset.objid

    if (objType == 'posts') {
      console.log(objType)
      wx.navigateTo({
        url: '../../home/post_detail/post_detail?id=' + objid
      })
      return false;
    }

    if (objType == 'sale') {
      wx.navigateTo({
        url: '../../sale/comment_sale/comment_sale?id=' + objid
      })
      return false;
    }

    if (objType == 'topic') {
      wx.navigateTo({
        url: '../../home/topic_detail/topic_detail?id=' + objid
      })
      return false;
    }

  }
})