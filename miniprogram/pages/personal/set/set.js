const app = getApp()
const db = wx.cloud.database()
const config = require("../../../config.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:null,
    gender: ['未知', '男', '女'],
    index:0,
    age:0,
    region: ['广东省', '广州市', '海珠区'],
    nickName:'',
    avatarUrl:'',
    height: 0,
    weight: 0,
    graduation: '',
    introduce: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('setstart')
    console.log(wx.getStorageSync('userInfo'))
    let userInfo = wx.getStorageSync('userInfo')
    this.setData({
      userInfo:userInfo,
      nickName: userInfo.nickName,
      index: userInfo.gender,
      age:userInfo.age,
      region: userInfo.region,
      height: userInfo.height,
      weight: userInfo.weight,
      graduation: userInfo.graduation,
      introduce: userInfo.introduce
    })
  },

  submit(){
    wx.showLoading({
      title: '提交中',
    })
    db.collection('users').where({_openid:wx.getStorageSync('openid')}).update({
      data:{
        nickName: this.data.nickName,
        gender: this.data.index,
        age:this.data.age,
        region: this.data.region ,
        height: this.data.height,
        weight: this.data.weight,
        graduation: this.data.graduation,
        introduce: this.data.introduce
      }
    }).then(res=>{
      // console.log(res)
      this.data.userInfo.nickName = this.data.nickName
      this.data.userInfo.gender = this.data.index
      this.data.userInfo.age = this.data.age
      this.data.userInfo.region = this.data.region
      this.data.userInfo.height = this.data.height
      this.data.userInfo.weight = this.data.weight
      this.data.userInfo.graduation = this.data.graduation
      this.data.userInfo.introduce = this.data.introduce
      wx.setStorageSync('userInfo', this.data.userInfo)
      app.globalData.userInfo = this.data.userInfo
      wx.hideLoading()
      wx.switchTab({
        url: '/pages/personal/index/personal'
      })
    }).catch(err=>{
      console.log(err)
    })
  },

  bindPickerChange(e) {
    // console.log(this.data.index)
    this.setData({
      index: e.detail.value
    })
  },

  bindRegionChange(e) {
    this.setData({
      region: e.detail.value
    })
  },
  getIntroduce(e){
    this.setData({
      introduce:e.detail.value
    })
  },
  getAge(e){
    this.setData({
      age: e.detail.value
    })
  },
  getHeight(e){
    this.setData({
      height: e.detail.value
    })
  },
  getWeight(e){
    this.setData({
      weight:e.detail.value
    })
  },
  getGraduation(e){
    this.setData({
      graduation:e.detail.value
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