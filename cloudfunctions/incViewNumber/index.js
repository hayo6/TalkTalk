// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  const openid = event.openid
  try{
  return await db.collection('users').where({
    _openid: openid
  }).update({
    data:{
      view_number: _.inc(1)
    }
  })
} catch(e){
  console.error(e)
}
}