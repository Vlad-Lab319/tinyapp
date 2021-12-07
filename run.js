let randString = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
let randString2 = Math.random().toString(36).replace(/g+/[^a-z], '').substr(0, 6);
let randString3 = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);


console.log(randString);
console.log(randString2);
console.log(randString3);

// function makeid(length) {
//   var result           = '';
//   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   var charactersLength = characters.length;
//   for ( var i = 0; i < length; i++ ) {
//     result += characters.charAt(Math.floor(Math.random() * 
// charactersLength));
//  }
//  return result;
// }

// console.log(makeid(5));