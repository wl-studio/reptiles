const puppeteer = require('puppeteer');
const uploadToken = require('./qiniu');
const qiniu = require('qiniu');
const { addFood, addCatalog } = require('./mysql');
const fs = require('fs');
const path = require('path');
const http = require('http');

const url = 'http://www.boohee.com';

async function toName() {
  const arr = $('.widget-group-content .item.clearfix');
  const ry = [];
  for (let key = 0; key < arr.length; key++) {
    if (arr.hasOwnProperty(key)) {
      const element = arr[key];
      ry.push({
        image_name: $(element)
          .children('.img-box')
          .children('a')
          .children('img')
          .attr('src'),
        name: $(element)
          .children('.text-box')
          .children('h4')
          .children('a')
          .html()
          .split('，')[0],
        cal: $(element)
          .children('.text-box')
          .children('p')
          .html()
          .split(' ')[0]
          .split('：')[1]
      });
    }
  }
  let maxPage = null;
  if ($('.next_page').attr('href')) {
    maxPage = +$('.next_page')
      .prev()
      .html();
  }
  return { arr: ry, maxPage };
}

// 上传图片到七牛云
async function toUploadQiniu(image_name) {
  await http.get(image_name, async function(res) {
    let chunks = [];
    let size = 0;
    await res.on('data', chunk => {
      chunks.push(chunk);
      size += chunk.length;
    });
    await res.on('end', async err => {
      const BufferImage = Buffer.concat(chunks, size).toString('base64');
      let base64Pre =
        'data:image/' + path.extname(image_name).substring(1) + ';base64,';
      let base64Img = base64Pre + BufferImage;
      var putExtra = new qiniu.form_up.PutExtra();
      var config = new qiniu.conf.Config();
      config.zone = qiniu.zone.Zone_z2; // 空间对应的机房
      var formUploader = new qiniu.form_up.FormUploader(config);
      const isImage = image_name.split('/');
      var key = isImage[isImage.length - 1];
      const pathUrl = `./${key}`;
      var base64Data = base64Img.replace(/^data:image\/\w+;base64,/, '');
      var dataBuffer = Buffer.from(base64Data, 'base64');
      await fs.writeFileSync(pathUrl, dataBuffer);
      await formUploader.putFile(
        uploadToken,
        `food/${key}`,
        pathUrl,
        putExtra,
        function(respErr, respBody, respInfo) {
          if (respErr) {
            throw respErr;
          }
          if (respInfo.statusCode == 200) {
            fs.unlinkSync(pathUrl);
          } else {
            console.log(失败, pathUrl);
          }
        }
      );
    });
  });
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.goto(`${url}/food/`);
  const list = await page.evaluate(() => {
    const arr = $('.widget-food-category ul li .text-box h3 a');
    const ry = [];
    for (let key = 0; key < arr.length; key++) {
      if (arr.hasOwnProperty(key)) {
        const element = arr[key];
        ry.push({
          name: element.innerHTML,
          href: element.getAttribute('href')
        });
      }
    }
    return ry;
  });

  const foods = [];
  let id = -1;

  for (const k in list) {
    const item = list[k];
    await page.goto(`${url}${item.href}`);
    const res = await page.evaluate(toName);

    let obj = {
      name: item.name,
      id: k,
      food: res.arr
    };
    // 添加分类到数据库
    await addCatalog([k, item.name]);
    for (let index = 2; index <= res.maxPage; index++) {
      await page.waitFor(800);
      await page.goto(`${url}${item.href}?page=${index}`);
      const result = await page.evaluate(toName);
      obj.food = [...obj.food, ...result.arr];
    }
    for (let index in obj.food) {
      const it = obj.food[index];
      id += 1;
      // 上传图片到七牛云
      await toUploadQiniu(it.image_name);
      const isImage = it.image_name.split('/');
      // 添加食物到数据库
      await addFood([id, it.name, it.cal, isImage[isImage.length - 1], k]);
    }
    foods.push(obj);
  }

  browser.close();
  process.exit(0);
})();
