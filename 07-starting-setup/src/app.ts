const names: Array<string> = ["Max", "Minnie", "Donald", "Manu"];
//names[0].split(" ");


// const promise: Promise<number> = new Promise((resolve, reject) => {
//     setTimeout(() => {
//         resolve(10);
//     }, 1000)
// });

// const result = promise.then((data) => {
//     return data+10;
// })

function merge<T extends Object, U>(objA: T, objB: U){
    return Object.assign(objA, objB);
}

const mergeObj = merge({name: "test"}, {age: 20});
console.log(mergeObj); 

interface Lenghty {
    length: number
}

function countAndDescribe<T extends Lenghty>(value: T){
    let descriptionText = "Got no length:(";
    if(value.length === 1){
        descriptionText = "Got a length of 1 elements";
    } else if (value.length > 1){
        descriptionText = "Got a length of "+value.length+" elements";
    }
    return [value, descriptionText];
}

console.log(countAndDescribe("Hi there!"));