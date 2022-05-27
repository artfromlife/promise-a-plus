// const Promise = require('../Promise')

const p = new Promise((resolve, reject) => {
    console.log(1)
    resolve()
})
p.then(res => {
    setImmediate(() => {console.log(3)})
})
p.then(res => {
    console.log(4)
}).then(res => {
    console.log(5)
})
console.log(2)