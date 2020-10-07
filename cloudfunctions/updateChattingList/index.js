// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const groupId = event.groupId
  const content = event.content
  const date = new Date()
  try{
    return await db.collection('chatting_list').where({
      groupid: groupId
    }).update({
      data:{
        created_at:date,
        content: content,
        sendTime:date.getHours()+8+ ':' + date.getMinutes()
      }
    })
  }catch(e){
    console.error(e)
  }
}