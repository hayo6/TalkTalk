const app = getApp();
const db = wx.cloud.database()
const _ = db.command
Page({
  data: {
    messageList: [],
    param: app.globalData.param,
    message_number: 0,
    isClick:false
  },
  onLoad: function (option) {
    wx.showLoading({
      title: '加载中...',
    })
    this.setData({
      param: app.globalData.param
    })
  },
  onShow: function (option) {
    this.getData();
    this.setData({
      param: app.globalData.param
    })
  },
  /**
   * 获取消息列表
   */
  async getData(){
    const { data: messageList } = await  db.collection('add_friends').where({
      hisOpenid:wx.getStorageSync('openid')
    }).orderBy('created_at', 'desc').get()
    wx.hideLoading()
    this.setData({
      messageList: messageList,
      message_number:messageList.length
    })
    console.log(messageList)
  },

  async agree(e){
    this.setData({
      isClick:true
    })
    console.log(e.currentTarget.dataset)
    let target = e.currentTarget.dataset
    console.log(target)
    let groupid = `${Math.random()}${Date.now()}`
    await db.collection('friends').add({
      data:{
        nickname:wx.getStorageSync('userInfo').nickName,
        avatar: wx.getStorageSync('userInfo').avatarUrl,
        hisOpenid: target.hisopenid,
        hisAvatar:target.avatar,
        hisNickname:target.nickname,
        groupid: groupid,
        created_at:new Date()
      }
    })
    //添加到自己的即时聊天列表
    await db.collection('chatting_list').add({
      data:{
        myOpenid: wx.getStorageSync("openid"),
        hisOpenid: target.hisopenid,
        avatar: target.avatar,
        nickname: target.nickname,
        groupid: groupid,
        created_at: new Date(),
        content:'我们已经是好友啦，快来聊天吧~'
      }
    })
    //添加到对方的即时聊天列表
    await db.collection('chatting_list').add({
      data: {
        myOpenid: target.hisopenid,
        hisOpenid: wx.getStorageSync("openid"),
        avatar: wx.getStorageSync('userInfo').avatarUrl,
        nickname: wx.getStorageSync('userInfo').nickName,
        groupid: groupid,
        created_at: new Date(),
        content: '我们已经是好友啦，快来聊天吧~'
      }
    })

    // console.log(target.hisopenid + '--------' + wx.getStorageSync('openid'))
    //将消息变为已读状态
    await wx.cloud.callFunction({
      name: 'ChangeReadStatus',
      data: {
        openid:target.hisopenid,
        hisOpenid: wx.getStorageSync('openid'),
        dbname: 'add_friends',
      }
    })
    wx.showToast({
      title: '好友添加成功',
    })

    // wx.switchTab({
    //   url: '/pages/chat/index/index',
    // })
  },
  /**
   * 上拉加载跟多
   */
  onReachBottom: function () {
  },
  /**
   * 打开详情
   */
  opendDetail: function (e) {
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