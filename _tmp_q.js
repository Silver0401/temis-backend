const { MongoClient } = require('mongodb')
const esc = v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
;(async () => {
  const c = new MongoClient(process.env.NOT_MONGODB_URL); await c.connect()
  const db = c.db()
  for (const q of ['Daniel','Jose','JURADO','daniel']) {
    const rx = { $regex: esc(q), $options: 'i' }
    const filter = { $or: [
      {'personalInfo.names': rx}, {'personalInfo.middleName': rx},
      {'personalInfo.lastName': rx}, {'personalInfo.curp': rx} ] }
    const n = await db.collection('patients').countDocuments(filter)
    const rows = await db.collection('patients').find(filter, {projection:{'personalInfo.names':1}}).toArray()
    console.log(`q="${q}" -> ${n}`, rows.map(r=>r.personalInfo?.names).join(' / '))
  }
  await c.close()
})().catch(e=>{console.error('ERR',e.message);process.exit(1)})
