const app = getApp();
const config = require("../../config.js");
let genderArray = ['男', '女', '人妖', '未知生物'];
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    baseImageUrl: app.globalData.imageUrl,
    currentTime: '',
    pageSize: 10,
    pageNumber: 1,
    initPageNumber: 1,
    showGeMoreLoadin: false,
    notDataTips: false,
    newMessage: false,
    newMessageNumber: 0,
    select: 1,

    leftList: [],
    rightList: [],
    leftHeight: 0,
    rightHeigt: 1,
    messagefunc: Object
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getData: function () {
      wx.showLoading({
        title: '加载中...',
      })
      var that = this
      let leftList = this.data.leftList;
      let rightList = this.data.rightList;
      let leftHeight = this.data.leftHeight;
      let rightHeigt = this.data.rightHeigt;
      // 读取数据
      // 1. 获取数据库引用
      const db = wx.cloud.database()
      db.collection('sale_friends')
        .orderBy('updated_at', 'desc')
        .get({
          success(res) {
            if (res.errMsg == "collection.get:ok") {
              const datalength = res.data.length
              let item
              let comment_number
              for (var i = 0; i < datalength; i++) {
                var data = res.data[i]
                comment_number = data.comments.length
                item = {
                  "poster": data.poster,
                  "id": data._id,
                  "comment_number": comment_number,
                  "praise_number": data.praise_number,
                  "attachments": data.attachments
                }
                if (datalength >= 1) {
                  if (leftList.length <= rightList.length) {
                    leftList.push(item);
                    leftHeight += data.attachments[0]['height'];
                  } else {
                    rightList.push(item)
                    rightHeigt += data.attachments[0]['height'];
                  }
                }
                that.setData({
                  leftList: leftList,
                  rightList: rightList,
                  leftHeight: leftHeight,
                  rightHeigt: rightHeigt,
                })
              }
            }
            wx.hideLoading();
            that.setData({
              showGeMoreLoadin: false
            });
          }
        })
    },
    comment: function (e) {
      let id = e.currentTarget.dataset.objid;
      wx.navigateTo({
        url: '/pages/sale/comment_sale/comment_sale?id=' + id
      })
    },
    post: function () {
      wx.navigateTo({
        url: '/pages/sale/post_sale/post_sale'
      })
    }
  },

  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      var that = this
      this.setData({
        select: 1,
        sales: []
      })

      this.setData({
        pageNumber: this.data.initPageNumber,
        leftList: [],
        rightList: [],
        leftHeight: 0,
        rightHeigt: 1,
        objType: 1
      });
      this.getData()
      // 清除定时任务
      clearInterval(this.data.messagefunc)
      // 获取新消息提醒,每20秒刷新一次
      // 刷新消息
      // this.setData({
      //   messagefunc: setInterval(function () {
      //     that.newmessage()
      //     console.log('flash')
      //   }, config.FLASHTIME)
      // })
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
})
