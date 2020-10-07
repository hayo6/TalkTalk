// pages/personal/post_list/post_list.js
const app = getApp()
const db = wx.cloud.database()
Page({
  data: {
    userId:'',
    userInfo: {},
    hasUserInfo: false,
    school: '',
    praiseBorder: '',
    notPraiseBorder: '',
    posts: [],
    baseImageUrl: app.globalData.imageUrl,
    show: 0,
    hidden: false,
    showCommentInput: false,
    showCommentInput: false,
    commentContent: '',
    commentObjId: '',
    commentType: '',
    refcommentId: '',
    showGeMoreLoadin: false,
    currentTime: '',
    notDataTips: false,
    newMessage: false,
    newMessageNumber: 0,
    select: 1,
    param: app.globalData.param
  },

  onLoad: function(options) {
    // console.log(app.globalData.userId)
    wx.showLoading({
      title: '加载中...',
    });
    this.data.userId = options.userId ? options.userId : app.globalData.userId
    this.getPost();
    this.setData({
      param: app.globalData.param
    })
  },
  /**
   * 获取贴子
   */
  getPost: function() {
    var that = this
    wx.showLoading({
      title: '加载中...',
    })
    this.setData({
      posts: []
    })
    // 获取自己的帖子
    db.collection('posts')
      .where({
        _openid: this.data.userId // 填入当前用户 openid
      })
      .orderBy('updated_at', 'desc')
      .get({
        success(res) {
          console.log('posts', res)
          var posts = that.data.posts;
          const datalength = res.data.length
          let item

          for (var i = 0; i < datalength; i++) {

            var data = res.data[i]
            item = {
              "poster": data.poster,
              "private": data.private,
              "id": data._id,
              "topic": data.username,
              "content": data.content,
              "attachments": data.attachments,
              "updated_at": data.updated_at,
              "can_delete": true,
              "praises": data.parise,
              "comments": data.comment
            }
            posts.push(item)
          }
          wx.hideLoading();
          that.setData({
            posts: posts,
            hasUserInfo: true,
            notDataTips: false
          });
        }
      })

  },
  // 删除帖子
  deletePost: function(e) {
    var that = this
    var id = e.currentTarget.id
    var fileid = e.currentTarget.dataset.fileid
    wx.showModal({
      title: '提示',
      content: '确定删除这个动态吗？',
      success(res) {
        if (res.confirm) {
          // 删除帖子
          db.collection('posts')
            .doc(id)
            .remove({
              success: res => {
                that.getPost()
                // 删除帖子的图片
                // wx.cloud.deleteFile({
                //   fileList: [fileid],
                //   success: res => {
                //     // 获取删除后的帖子列表
                //     that.getPost()
                //   },
                //   fail: err => {
                //     wx.showToast({
                //       title: '删除失败',
                //     })
                //   }
                // })
              },
              fail: err => {
                // console.log(err)
                wx.showToast({
                  title: '删除失败',
                })
              },
            })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  // 查看帖子详情
  postdetail: function(e) {
    console.log(e)
    // 文章Id
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../../home/post_detail/post_detail?id=' + id,
    })
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