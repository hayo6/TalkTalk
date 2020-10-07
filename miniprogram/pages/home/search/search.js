const db = wx.cloud.database()
const _ = db.command
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchArr: ['动态', '用户'],
    index: 0,
    showType:0,
    value: '',
    posts: [],
    users:[],
    isvip:wx.getStorageSync('isvip'),
    userInfo: wx.getStorageSync('userInfo'),
    showCommentInput: false,
    commentContent: '',
    commentType: '',
    commentInfo: {
      title: '',
      placeholder: '',
      btn: ''
    }
  },

  message: function(data) {
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
    // 更新消息
    db.collection('message').add({
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

      },
      success(res) {
        // console.log('messageres',res)
      },
      fail: console.log
    })
  },

  showCommentInput: function(e) {
    // console.log('curdataset', e)
    var objid = e.currentTarget.dataset.objid;
    var index = e.currentTarget.dataset.index
    var refCommenter = e.currentTarget.dataset.refcommenter
    var commentType = e.currentTarget.dataset.type
    var commentInfo
    // 帖子类型
    var obj_type = e.currentTarget.dataset.obj_type

    // 根据不同的评论，显示不同评论框的提示
    if (commentType == 'normalcomment') {
      // 正常的评论
      commentInfo = this.data.commentInfo
      commentInfo.title = '请输入评论内容'
      commentInfo.placeholder = '你对这个帖子有啥看法呢？'
      commentInfo.btn = '发布评论'
    } else if (commentType == 'refcomment') {
      commentInfo = this.data.commentInfo
      let title = '回复 @' + refCommenter
      let placeholder = '你想回复 @' + refCommenter + ' 什么呢？'
      let btn = '回复 @' + refCommenter
      commentInfo.title = title
      commentInfo.placeholder = placeholder
      commentInfo.btn = btn
    } else {
      this.hideModal()
    }
    // 显示输入评论
    // this.showModal()
    this.setData({
      commentInfo: commentInfo,
      refCommenter: e.currentTarget.dataset.refcommenter,
      modalName: e.currentTarget.dataset.target,
      dbname: e.currentTarget.dataset.dbname,
      showCommentInput: true,
      objId: objid,
      objIndex: index,
      // 帖子类型
      obj_type: obj_type,
      posteropenid: e.currentTarget.dataset.posteropenid
    });
  },
  // 隐藏评论输入框
  hideModal: function() {
    var commentInfo = {
      title: '',
      placeholder: '',
      btn: ''
    }
    this.setData({
      commentInfo: commentInfo,
      commentContent: '',
      dbname: '',
      posteropenid: '',
      modalName: null,
      showCommentInput: false
    })
  },

  /**
   * 获取评论框的输入内容
   */
  getCommentContent: function(event) {
    let content = event.detail.value;
    this.setData({
      commentContent: ''
    })
    this.setData({
      commentContent: content
    })
  },
  /**
   * 提交评论
   */
  postComment: function(e) {
    var that = this
    wx.showLoading({
      title: '发送中...',
    });
    // 帖子ID
    let objId = this.data.objId;
    let objIndex = this.data.objIndex
    // 评论人
    var nickname = this.data.userInfo.nickName
    // 评论内容
    let content = this.data.commentContent;
    // 回复评论人
    let refCommenter = this.data.refCommenter;
    if (!refCommenter) {
      refCommenter = ''
    }
    // 内容为空，中断评论
    if (content == '') {
      wx.showToast({
        title: '请输入内容！',
      })
      wx.hideLoading()
      return false
    }
    // 已有评论
    let posts = this.data.posts

    // 如果objIndex为空，则计算出objIndex
    if (!objIndex) {
      // console.log('objIndex', objIndex)
      for (let i = 0; i < posts.length; i++) {
        // 找到onjIndex,返回index
        if (objId === posts[i].id) {
          objIndex = i
          continue;
        }
      }
    }
    // console.log('objIndex', objIndex)

    let comments = posts[objIndex].comments

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
    comments.push(newcomment)

    // 当前评论数
    var newcomment_number = comments.length

    // messagedata
    var mesdata = {
      nickname: nickname,
      avatar: that.data.userInfo.avatarUrl,
      content: '@' + nickname + ' 评论你：' + content,
      messageuser: that.data.posteropenid,
      objId: objId,
      obj_type: that.data.obj_type
    }

    // 调用云函数，提交评论
    wx.cloud.callFunction({
      name: 'FrofessComment',
      data: {
        id: objId,
        dbname: that.data.dbname,
        newcomment_number: newcomment_number,
        comments: comments
      },
      success: res => {
        // console.log('评论结果',res)
        // 发送message
        that.message(mesdata)
        // 更新页面信息
        that.setData({
          posts: posts,
          commentContent: '',
          objId: '',
          obj_type: '',
          refcommenter: '',
          modalName: null,
          showCommentInput: false
        })
        wx.hideLoading()

      },
      fail: err => {
        wx.showModal({
          title: '加载失败...',
          content: err,
        })
      }
    })
  },
  // 删除评论
  deleteComment: function(e) {
    var that = this
    // 帖子类型，话题、表白墙
    var type = e.currentTarget.dataset.type
    // 评论位置
    var index = e.currentTarget.dataset.index
    // 评论内容
    var item = e.currentTarget.dataset.item
    // 帖子ID
    var id = item.id
    var comments = item.comments
    // 删除确认
    wx.showModal({
      title: '提示',
      content: '确定删除这条评论吗？',
      success(res) {
        if (res.confirm) {
          // 确定删除
          comments.splice(index, 1)
          wx.cloud.callFunction({
            name: 'FrofessComment',
            data: {
              id: id,
              dbname: type,
              newcomment_number: comments.length,
              comments: comments
            },
            success: function() {
              if (type == 'posts') {
                that.getPost(false)
                that.setData({
                  select: 1,
                  showTopic: false,
                  showposts: true
                })
              } else if (type == 'topics') {
                that.topics()
                that.setData({
                  select: 2,
                  showTopic: true,
                  showposts: false
                })
              }
            },
            fail: console.log
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  // 赞、取消赞
  zan: function(e) {
    // iszan为true,代表已经点赞，可取消赞
    // iszan为false,代表没有点赞，可以点赞
    var iszan = e.currentTarget.dataset.iszan
    // 当前内容的id
    var id = e.currentTarget.dataset.id
    // 当前赞信息
    var index = e.currentTarget.dataset.index
    var zan = this.data.posts[index].praises || []
    var dbname = e.currentTarget.dataset.dbname
    // 接收的用户openid
    var posteropenid = e.currentTarget.dataset.posteropenid
    // 帖子类型
    var obj_type = e.currentTarget.dataset.obj_type
    // 修改赞状态
    this.changezan(id, zan, dbname, index, iszan, posteropenid, obj_type)
  },

  changezan: function(id, zan, dbname, index, iszan, posteropenid, obj_type) {
    var that = this
    var content
    // iszan == true 已赞，可以取消赞
    if (iszan === 'true') {
      var ownernickname = this.data.userInfo.nickName
      // 删除已赞
      for (let i = 0; i < zan.length; i++) {
        if (ownernickname == zan[i].nickname) {
          zan.splice(i, 1);
        }
      }
      // 更新点赞数
      var newpraise_number = zan.length
      iszan = false
      //messagedata
      content = '@' + that.data.userInfo.nickName + ' 取消了赞!'
    } else {
      // iszan == false 未赞，可以赞
      var item = {
        "id": id,
        "nickname": that.data.userInfo.nickName,
        "avatar": that.data.userInfo.avatarUrl
      }
      // 添加赞
      zan.push(item)
      // 更新点赞数
      var newpraise_number = zan.length
      content = '@' + that.data.userInfo.nickName + ' 给你点赞了!'
    }

    // messagedata
    var mesdata = {
      nickname: that.data.userInfo.nickName,
      avatar: that.data.userInfo.avatarUrl,
      content: content,
      messageuser: posteropenid,
      objId: id,
      obj_type: obj_type
    }

    // 调用云函数,点赞
    wx.cloud.callFunction({
      name: 'FrofessZan',
      data: {
        id: id,
        dbname: dbname,
        newpraise_number: newpraise_number,
        zan: zan
      },
      success: res => {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        // 发送message
        that.message(mesdata)

        // 修改本地显示
        var posts = that.data.posts
        posts[index].praises = zan
        posts[index].haszan = iszan
        that.setData({
          posts: posts
        })
      },
      fail: err => {
        wx.showModal({
          title: '加载失败...',
          content: err,
        })
      }
    })
  },

  previewImage: function(event) {
    let url = event.target.id;
    wx.previewImage({
      current: '',
      urls: [url]
    })
  },
  
  getPosterInfo(e) {
    let userId = e.currentTarget.dataset.openid
    let myId = wx.getStorageSync('openid')
    wx.navigateTo({
      url: userId == myId ? `/pages/personal/index/personal` : `/pages/friend_home/friend_home?userId=${userId}`,
    })
  },

  bindPickerChange(e) {
    this.setData({
      index: e.detail.value
    })
  },

  async getPost() {
    const {
      data
    } = await db.collection('posts').where(_.or([{
      content: {
        $regex: '.*' + this.data.value,
        $options: 'i'
      }
    }, {
      username: {
        $regex: '.*' + this.data.value,
        $options: 'i'
      }
    }])).orderBy('created_at', 'desc').get()
    this.setData({
      posts: data
    })
    let len = data.length,
      ownernickname = this.data.userInfo.nickName
    let posts = []
    console.log(data)
    for (var i = 0; i < len; i++) {

      // 获取点赞列表
      var pariselist = data[i].parise
      var haszan = false

      // 判断自己是否已点赞
      if (pariselist.length > 0) {

        for (var k = 0; k < pariselist.length; k++) {
          let nickname = pariselist[k].nickname
          if (nickname === ownernickname) {
            haszan = true
            continue;
          }
        }
      }
      let item = {
        "posteropenid": data[i]._openid,
        "poster": data[i].poster,
        "private": data[i].private,
        "id": data[i]._id,
        "follow": "",
        "topic": data[i].username,
        "content": data[i].content,
        "attachments": data[i].attachments,
        "updated_at": data[i].updated_at,
        "can_delete": "",
        "praises": pariselist,
        "comments": data[i].comment,
        "haszan": haszan
      }
      posts.push(item)
    }
    console.log(posts)
    this.setData({
      posts: posts,
      showGeMoreLoadin: false
    })
    wx.hideLoading();
  },

  //用户搜索
  async getUsers() {
    if(!this.data.isvip){
      const {
        data
      } = await db.collection('users').where(_.or([{  //查询users集合
        nickName: {     // 用户名模糊匹配
          $regex: '.*' + this.data.value,
          $options: 'i'
        }
      }])).orderBy('view_number','desc').get()
      this.setData({ //更新视图
        users: data  
      })
    }else{
      const {
        data
      } = await db.collection('users').where(_.or([{  //查询users集合
        nickName: {     // 用户名模糊匹配
          $regex: '.*' + this.data.value,
          $options: 'i'
        }
      },{
        gender:{  //对地区进行模糊匹配
          $regex: '.*' + this.data.value,
          $options: 'i'
        },
      },{
        region:{  //对地区进行模糊匹配
          $regex: '.*' + this.data.value,
          $options: 'i'
        }
      },{
        height:{  //对地区进行模糊匹配
          $regex: '.*' + this.data.value,
          $options: 'i'
        }
      },{
        weight:{  //对地区进行模糊匹配
          $regex: '.*' + this.data.value,
          $options: 'i'
        }
      },{
        graduation:{  //对地区进行模糊匹配
          $regex: '.*' + this.data.value,
          $options: 'i'
        }
      }])).orderBy('view_number','desc').get()
      this.setData({ //更新视图
        users: data  
      })
    }
  },

  getInputValue(e) {
    this.setData({
      value: e.detail.value
    })
  },

  Search() {
    if(this.data.index == 0){ //idnex==0 为动态搜索
      this.getPost()
      this.setData({
        showType:0 //showType==0 显示动态搜索相应界面
      })
    }else{//用户搜索
      this.getUsers()
      this.setData({
        showType:1 //showType==1 显示用户搜索相应界面
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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
        tabCur: 'search'
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.setData({
      index:0,
      posts:[],
      users:[],
      value:''
    })
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