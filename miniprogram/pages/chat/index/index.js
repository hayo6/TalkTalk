// miniprogram/pages/chat/index/index.js
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chattingList: [],
    messageUnreadNum:0,
    addfriendUnreadNum:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
  },

  getChattingList() {
    db.collection('chatting_list').where({
      myOpenid: wx.getStorageSync("openid")
    }).orderBy('created_at','desc').get().then(res => {
      this.setData({
        chattingList: res.data
      })
    })
  },
  
  async getMessageUnread(){
    const {total} = await db.collection('message')
    .where({
      messageuser: app.globalData.userId,
      isread:false
    }).count()
    this.setData({
      messageUnreadNum: total
    })
  },

  async getAddfriendUnread(){
    const {total} = await db.collection('add_friends').where({
      hisOpenid: app.globalData.userId,
      isread:false
    }).count()
    this.setData({
      addfriendUnreadNum: total
    })
  },


  Remove(e){
    console.log(e.currentTarget.dataset)
  },

  // ListTouch触摸开始
  ListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  // ListTouch计算方向
  ListTouchMove(e) {
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  // ListTouch计算滚动
  ListTouchEnd(e) {
    if (this.data.ListTouchDirection == 'left') {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
    })
  },
  openMessage() {
    wx.navigateTo({
      url: '/pages/personal/message/message',
    })
  },

  openAddFriend() {
    wx.navigateTo({
      url: '/pages/chat/new_friends/new_friends',
    })
  },

  openChatRoom(e) {
    console.log(e.currentTarget.dataset)
    let groupid = e.currentTarget.dataset.groupid
    let nickname = e.currentTarget.dataset.nickname
    wx.navigateTo({
      url: `/pages/chat/chatroom/chat?groupid=${groupid}&nickname=${nickname}`,
    })
  },
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
        tabCur: 'message'
      })
    }
    this.getChattingList()
    this.getMessageUnread()
    this.getAddfriendUnread()
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