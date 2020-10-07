// pages/index/index.js
var app = getApp()
const db = wx.cloud.database()
const config = require("../../config.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show_auth: true,
    userInfo: null
  },

  /** 
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    wx.showLoading({
      title: '加载中...',
    });
    wx.getSetting({
      success(res) {
        // console.log(res)
        if (!res.authSetting['scope.userInfo']) {
          that.setData({
            show_auth: true
          });
          wx.hideLoading()
        } else {
          //获取用户信息
          that.getUserInfo()
          // that.login()
        }
      }
    })
  },
  // login
  login: function() {
    wx.showLoading({
      title: '登录中...',
    });
    // 调用login云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {}
    }).then(res => {
      app.globalData.userId = res.result.openid  //将openid存到全局变量中
      wx.setStorageSync('openid', res.result.openid)//将openid存到localstroage中
      db.collection('users').where({
        _openid: res.result.openid
      }).get().then(res => { //查询当前用户是否已经注册
        if (!res.data.length) { //若没有注册则注册将用户添加到数据库
          db.collection('users').add({
            data: this.userInfo
          }).then(res => {
            wx.setStorageSync('userInfo', this.userInfo)//将用户信息放到localstroage中
            wx.setStorageSync('isvip', false)
            wx.setStorageSync('online', true)
            app.globalData.userInfo = this.userInfo
            wx.switchTab({
              url: '/pages/home/index_v2/index_v2'
            })
          })
        } else { //否则则返回当前用户的登录信息
          wx.setStorageSync('userInfo', res.data[0])//将用户信息放到localstroage中
          db.collection('users').where({
            _openid: app.globalData.userId 
          }).update({
            data:{
              online:true
            }
          }).then(res=>{
            wx.setStorageSync('online', true)
          })
          if(new Date().getTime() < res.data[0].expire){ //如果当前会员还没过期
            wx.setStorageSync('isvip', true)
            wx.setStorageSync('expire',res.data[0].expire )
            wx.setStorageSync('days', Math.ceil((res.data[0].expire - new Date().getTime())/(24*60*60*1000)))
          }else{
            wx.setStorageSync('isvip', false)
          }
          app.globalData.userInfo = res.data[0]
          wx.switchTab({
            url: '/pages/home/index_v2/index_v2'
          })
        }
      })
    }).catch(err => {
      wx.showToast({
        title: '登录失败',
        content: err
      })
    })
  },
  /**
   * 获取用户信息 
   */
  getUserInfo: function() {
    wx.showLoading({
      title: '加载中...',
    });
    // console.log('get user info');
    let that = this;
    wx.getSetting({
      success: res => {
        // console.log('getuserinfo', res);
        if (res.authSetting['scope.userInfo']) {
          //   已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              // app.globalData.userInfo = res.userInfo
              // 缓存
              if (!wx.getStorageSync('userInfo')) {
                // this.userInfo = res.userInfo
                console.log(res.userInfo)
                this.userInfo = {
                  nickName: res.userInfo.nickName,
                  avatarUrl: res.userInfo.avatarUrl,
                  gender: res.userInfo.gender,
                  region: ['广东省', '广州市', '海珠区'],
                  age:0,
                  height: 0,
                  weight: 0,
                  graduation: '',
                  introduce: '',
                  online:false,
                  expire:0,
                  view_num:0,
                  bv_expression:0,
                  bv_value:0,
                  bv_gender:0,
                  bv_glass:false,
                  bv_age:0
                }
              }
              wx.hideLoading()
              that.login()
            }
          })
        } else {
          console.log('未授权');
          wx.navigateTo({
            url: '/pages/index/index',
          })
        }
      }
    })
  },

  /**
   * 监听用户点击授权按钮
   */
  getAuthUserInfo: function(data) {
    console.log('data', data.detail.errMsg)
    if (data.detail.errMsg == "getUserInfo:ok") {
      this.setData({
        show_auth: false
      });
      // 获取用户信息
      this.getUserInfo()
    } else {
      this.setData({
        show_auth: true
      });
    }

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