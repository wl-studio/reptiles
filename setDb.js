const fs = require('fs');
const { addFood, addCatalog } = require('./mysql');
const { toUploadQiniu, writeFileImage } = require('./qiniu');

fs.readFile('./result.txt', (err, data) => {
  if (err) return;
  const res = JSON.parse(data.toString());

  // const arr = [];
  res.map((item, k) => {
    // 添加食物到数据库
    // item.food.map(async it => {
    //   const isImage = it.image_name.split('/');
    //   await addFood([
    //     it.name,
    //     it.unit,
    //     it.cal,
    //     isImage[isImage.length - 1],
    //     +k + 1
    //   ]);
    // });
  });
  // console.log(Array.from(new Set(arr)).length);

  // process.exit(0);
});

// let i = 0;
// fs.readdir('./image', (err, data) => {
//   console.log(data.length);
//   data.map(async item => {
//     await toUploadQiniu(item, () => (i = i + 1));
//   });
// });
