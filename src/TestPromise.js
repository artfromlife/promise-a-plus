const Promise = require('../Promise')

const p = Promise.reject(1)
p.then(null,() => {
  throw new Error()
}).catch(e => {})
p.then(null,() => console.log(3))
p.then(null,() => console.log(4))

const q = Promise.resolve(1)
q.then(()=> console.log(2))
q.then(()=> console.log(3))
q.then(()=> console.log(4))
