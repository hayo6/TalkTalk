// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const openid = event.openid
  const hisOpenid = event.hisOpenid
  const dbname = event.dbname
  try {
    return await db.collection(dbname)
      .where({
        _openid: openid,
        hisOpenid: hisOpenid
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