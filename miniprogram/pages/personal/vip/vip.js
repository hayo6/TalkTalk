const app = getApp()
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    priceList:[{
      title:'一个月',
      price:15,
      discount:12,
      isChoose:false,
      months:1
    },{
      title:'三个月',
      price:45,
      discount: 36,
      isChoose:false,
      months: 3
    },{
      title:'一年',
      price:180,
      discount: 120,
      isChoose:false,
      months: 12
    }],
    isagree:false,
    index:0,
    days:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      days: wx.getStorageSync('days')
    })
  },
  onChoose(e){
    console.log(e.currentTarget.dataset.index)
    let index = e.currentTarget.dataset.index
    let data = this.data.priceList
    if(data[index].isChoose == true){
      data[index].isChoose = false
    }else{
      for(let item of data){
        item.isChoose = false
      }
      data[index].isChoose = true
    }
    this.setData({
      priceList: data,
      index
    })
  },

  checkboxChange(){
    this.setData({
      isagree: !this.data.isagree
    })
  },

  onSubmit(){
    if(!this.data.isagree){
      wx.showToast({
        title: '请同意自动续费',
      })
      return
    }
    let index = this.data.index
    let d = new Date()
    let year = d.getFullYear()
    let month = d.getMonth()
    console.log(new Date(year,month+this.data.priceList[index].months,1))
    let expire = new Date(year,month+this.data.priceList[index].months,1) -  new Date(year,month,1)//获取vip过期的时间戳
    let days = Math.ceil(expire/(24*60*60*1000)) //计算剩余天数
    console.log(days)
    db.collection('users').where({
      _openid:wx.getStorageSync('openid')
    }).update({ //更新会员过期时间
      data:{
        expire: expire + d.getTime()
      }
    }).then(res=>{
      this.setData({
        isvip: true,
        expire
      })
      wx.setStorageSync('isvip', true)  //将会员身份写到localStroage
      wx.setStorageSync('expire', expire) //将过期时间写到lcoalStroage
      wx.setStorageSync('days', days)//将会员剩余天数写到lcoalStroage
      this.setData({     //将天数更新到视图
        days
      })
      wx.switchTab({
        url: '/pages/personal/index/personal',
        success: function (e) {
          var page = getCurrentPages().pop();
          if (page == undefined || page == null) return;
          page.onLoad();
          }
      })
      wx.showToast({
        title: '开通成功',
        icon:'success'
      })
    }).catch(err=>{
      console.log(err)
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