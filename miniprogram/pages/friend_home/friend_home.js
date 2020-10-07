// miniprogram/pages/friend_home/friend_home.js
const db = wx.cloud.database()
const _ = db.command
const $ = db.command.aggregate
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    postNum: 0,
    showYourSelfNum: 0,
    mapGender: ['未知', '男', '女'],
    userId:'',
    friendsNum:0,
    imgList:[],
    isvip:false,
    img_num:0,
    dataScore: 0,
    beautyScore:0,
    userComment:[false,false,false,false,false,false,false,false],
    commentTag:['理想型','高学历','活跃分子','二次元','玩游戏','唱歌好','穿搭达人','脾气好'],
    totalComment:[0,0,0,0,0,0,0,0],
    isComment:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.data.userId = options.userId
    let userId = options.userId
    this.incViewNumber(userId)
    this.getUserInfo(userId)
    this.getPostNum(userId)
    this.getShowYourSelfNum(userId)
    this.getFriedsNum(userId)
    this.getUserCommentNum(userId)
    this.getUserComment(userId)
    this.checkComment(userId)
    this.getAlbums(userId)
  },

  //选择标签
  pickTag(e){
    console.log(e.currentTarget.dataset.index)
    let index = e.currentTarget.dataset.index
    const data = this.data.userComment
    data[index]= !data[index]
    this.setData({
      userComment : data
    })
  },

  bSliderChange(e){
    this.setData({
      beautyScore: e.detail.value
    })
  },

  dSliderChange(e){
    this.setData({
      dataScore: e.detail.value
    })
  },

  async checkComment(userId){
    const {data} = await db.collection('user_comment').where({
      _openid: wx.getStorageSync('openid'),
      userId: userId
    }).get()
    console.log(data)
    if(data.length){
      this.setData({
        userComment: data[0].userComment,
        isComment: true
      })
    }
  },

  //确认提交
  async onSubmit(){
    await db.collection('user_comment').add({
      data:{
        userId: this.data.userId,
        beautyScore: this.data.beautyScore,
        dataScore: this.data.dataScore,
        userComment: this.data.userComment
      }
    })
    wx.showToast({
      title: '评论成功',
      icon: 'success'
    })
  },

  //获取用户信息
  getUserInfo(userId) {
    db.collection('users').where({
      _openid: userId
    }).get().then(res => {
      // console.log(res)
      this.setData({
        userInfo: res.data[0],
        isvip: wx.getStorageSync('isvip')
      })
    }).catch(err => {
      console.log(err)
    })
  },

  //更新用户人气值
  incViewNumber(userId){
    wx.cloud.callFunction({
      name:'incViewNumber',
      data:{
        openid: userId
      }
    })
  },

  getAlbums(userId){
    db.collection('albums').where({
      _openid: userId
    }).get().then(res=>{
      this.setData({
        img_num : res.data.length,
        imgList: res.data.map(item=>{
          return item.url
        })
      })
    })
  },

  async getUserCommentNum(userId){
    const {list} = await db.collection('user_comment')
    .aggregate()
    .match({
      userId: userId
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

  async getUserComment(userId){
    const arr = new Array(8).fill(0)
    const {data} = await db.collection('user_comment').where({
      userId: userId
    }).get()
    for(let item of data){
      for(let i = 0; i < 8 ; i++){
        item.userComment[i] == true ? arr[i]++ : ''
      }
    }
    this.setData({
      totalComment: arr
    })
  },

  //获取我的动态数
  getPostNum(userId) {
    db.collection('posts').where({
      _openid: userId
    }).count().then(res => {
      this.setData({
        postNum: res.total
      })
    })
  },

  //获取我的魅力秀数
  getShowYourSelfNum(userId) {
    db.collection('sale_friends').where({
      _openid: userId
    }).count().then(res => {
      this.setData({
        showYourSelfNum: res.total
      })
    })
  },

  //获取我的好友数
  getFriedsNum(userId) {
    db.collection('friends').where(_.or([{
      _openid: userId
    },
    {
      hisOpenid: userId
    }
    ])).count().then(res => {
      this.setData({
        friendsNum: res.total
      })
    })
  },

  requestAddFriend(){
    db.collection('add_friends').add({
      data:{
        content: `@${app.globalData.userInfo.nickName} 请求添加你为好友`,
        from_user:{
          avatar: app.globalData.userInfo.avatarUrl,
          nickname: app.globalData.userInfo.nickName,
        },
        isread:false,
        hisOpenid:this.data.userId,
        created_at: app.getnowtime(),
        update_at:new Date()
      }
    }).then(res=>{
      wx.showToast({
        title: '已发送请求',
      })
    })
  },

  opendPostList(){
    wx.navigateTo({
      url: `/pages/personal/post_list/post_list?userId=${this.data.userId}`,
    })
  },

  openShowYourselfList(){
    wx.navigateTo({
      url: `/pages/personal/sale_list/sale_list?userId=${this.data.userId}`,
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