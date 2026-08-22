const { MongoClient } = require('mongodb')
;(async () => {
  const c = new MongoClient(process.env.NOT_MONGODB_URL)
  await c.connect()
  const db = c.db()
  console.log('DB:', db.databaseName)
  const px = await db.collection('patients').find({}).toArray()
  console.log('patients:', px.length)
  px.forEach(p => console.log(JSON.stringify({
    _id: String(p._id), LUID: p.LUID, clues: p.clues,
    names: p.personalInfo?.names, mid: p.personalInfo?.middleName,
    last: p.personalInfo?.lastName, curp: p.personalInfo?.curp
  })))
  console.log('--- users ---')
  const us = await db.collection('users').find({}, { projection: { name:1, email:1, role:1, clues:1, patientsList:1 } }).toArray()
  us.forEach(u => console.log(JSON.stringify({ _id:String(u._id), name:u.name, email:u.email, role:u.role, clues:u.clues, nPacientes:(u.patientsList||[]).length })))
  console.log('--- somas (values) ---')
  const so = await db.collection('somas').find({}).limit(3).toArray()
  so.forEach(s => console.log(JSON.stringify({ _id:String(s._id), recordId:String(s.recordId), values:s.values })))
  console.log('--- orders ---')
  const or = await db.collection('orders').find({}).limit(3).toArray()
  or.forEach(o => console.log(JSON.stringify(o).slice(0,600)))
  await c.close()
})().catch(e => { console.error('ERR', e.message); process.exit(1) })
