// const Promise = require('../Promise')

// const promise = Promise.reject(1).then(null, () => promise)
// promise.catch(e => console.log(e))
let resolve1, resolve2
const p = new Promise((resolve,reject) => {
    resolve1 = resolve
}).then(res => {
    console.log(1)
},rej => {

})
const q = new Promise((resolve,reject) => {
    resolve2 = resolve
}).then(res => {
    console.log(2)
},rej => {})
resolve1(q)
resolve2(p)

console.log(Object.prototype.toString.call(new Promise(() => {})).slice(8,-1))





