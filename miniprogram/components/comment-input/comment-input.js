const app = getApp()
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    refCommenter: String,
    objId: String,
    objType: String,
    userId: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    commentInfo: {},
    isshow: true,
    commentContent: ''
  },

  lifetimes: {
    attached: function() {
      let commentInfo = {}
      let title = '@' + this.data.refCommenter
      let placeholder = '你想回复 @' + this.data.refCommenter + ' 什么呢？'
      let btn = '回复 @' + this.data.refCommenter
      commentInfo.title = title
      commentInfo.placeholder = placeholder
      commentInfo.btn = btn
      this.setData({
        commentInfo,
        isshow: true
      })
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    hideModal: function() {
      this.triggerEvent('hideCommentInput', true, {})
    },
    getCommentContent: function(event) {
      let content = event.detail.value;
      this.setData({
        commentContent: ''
      })
      this.setData({
        commentContent: content
      })
    },
    postComment: function(e) {
      wx.showLoading({
        title: '发送中...',
      });
      // 帖子ID
      let objId = this.data.objId;
      // 评论人
      var nickname = wx.getStorageSync('userInfo').nickName
      // 评论内容
      let content = this.data.commentContent;
      // 回复评论人
      let refCommenter = this.data.refCommenter;
      // 内容为空，中断评论
      if (content == '') {
        wx.showToast({
          title: '请输入内容！',
        })
        wx.hideLoading()
        return false
      }
      // 将当前评论加入到已有评论
      var newcomment = {
        "objId": objId,
        "can_delete": false,
        "ref_comment": {
          "refCommenter": refCommenter
        },
        "commenter": {
          "nickname": nickname
        },
        "content": content
      }
      // messagedata
      var mesdata = {
        nickname: nickname,
        avatar: wx.getStorageSync('userInfo').avatarUrl,
        content: '@' + nickname + ' 评论你：' + content,
        messageuser: this.data.userId,
        objId: objId,
        obj_type: this.data.objType
      }

      // 调用云函数，提交评论
      wx.cloud.callFunction({
        name: 'addComment',
        data: {
          id: objId,
          dbname: 'posts',
          comment: newcomment
        }
      }).then(res=>{
        this.message(mesdata)
        wx.hideLoading()
        wx.showToast({
          title: '回复成功',
        })
        this.hideModal()
      }).catch(err=>{
        console.log(err)
      })
    },
    async message(data) {
      // 评论、点赞人昵称
      var nickname = data.nickname
      // 评论、点赞人头像
      var avatar = data.avatar
      // 评论、点赞内容
      var content = data.content
      // 接收的用户openid
      var messageuser = data.messageuser
      // 当前帖子id
      var objId = data.objId
      // 帖子类型
      var obj_type = data.obj_type
      await db.collection('message').add({
        data: {
          "from_user": {
            "avatar": avatar,
            "nickname": nickname
          },
          "created_at": app.getnowtime(),
          "update_at": new Date(),
          "content": content,
          "isread": false,
          "messageuser": messageuser,
          "objId": objId,
          "obj_type": obj_type
        }
      })
    }
  }
})