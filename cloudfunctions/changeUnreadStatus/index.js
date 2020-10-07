// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const userId = event.userId
  try {
    return await db.collection('message')
      .where({
        messageuser:userId
      })
      .update({
        // data 传入需要局部更新的数据
        data: {
          isread : true
        }
      })

  } catch (e) {
    console.error(e)
  }

}