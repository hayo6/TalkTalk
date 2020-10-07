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
    tabCur : 'home'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    tabSelect(e){
      this.setData({
        tabCur: e.currentTarget.dataset.tabname
      })
      if (e.currentTarget.dataset.tabname == 'search'){
        wx.switchTab({
          url: '/pages/home/search/search',
        })
      }
      else if (e.currentTarget.dataset.tabname == 'home') {
        wx.switchTab({
          url: '/pages/home/index_v2/index_v2',
        })
      }
    }
  }
})
