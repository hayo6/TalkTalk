// components/tab-bar/tabbar.js
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
    tabCur: 'home',
    hasMessage:true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    tabSelect(e) {
      this.setData({
        tabCur: e.currentTarget.dataset.tabname
      })
      console.log('tabCur' + this.data.tabCur)
      if (e.currentTarget.dataset.tabname == 'search') {
        wx.switchTab({
          url: '/pages/home/search/search',
        })
      } else if (e.currentTarget.dataset.tabname == 'my') {
        wx.switchTab({
          url: '/pages/personal/index/personal',
        })
      } else if (e.currentTarget.dataset.tabname == 'post') {
        wx.switchTab({
          url: '/pages/home/post/post',
        })
      } else if (e.currentTarget.dataset.tabname == 'message') {
        wx.switchTab({
          url: '/pages/chat/index/index',
        })
      } else {
        wx.switchTab({
          url: '/pages/home/index_v2/index_v2',
        })
      }
    }
  }
})