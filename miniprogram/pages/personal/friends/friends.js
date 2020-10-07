// pages/personal/friends/friends.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    frinedsList:[],
    groupids:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getFrinedsList()
  },

  async getFrinedsList(){
    let openid = wx.getStorageSync('openid')
    const { data } = await db.collection('friends').where(_.or([
      {
        _openid:openid
      },
      {
        hisOpenid:openid
      }
    ])).get()
    let groups = [],friendids = []
    for(let item of data){
      groups.push(item.groupid)
      item._openid == openid ? friendids.push(item.hisOpenid) : friendids.push(item._openid)
    }
    console.log(friendids)
    const {data : res} = await db.collection('users').where({
      _openid: _.or(friendids)
    }).orderBy('_id', 'desc').get()
    console.log(res)
    this.setData({
      frinedsList:res,
      groupids : groups
    })
    console.log(this.data.frinedsList)
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
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})