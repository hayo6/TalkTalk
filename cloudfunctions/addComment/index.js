// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  const objId = event.id
  const dbname = event.dbname
  const comment = event.comment
  try {
    return await db.collection(dbname)
      .doc(objId)
      .update({
        data: {
          comment_number:_.inc(1),
          comment: _.push([comment])
        }
      })
  } catch (e) {
    console.error(e)
  }
}