const puppeteer = require('puppeteer');
const assert = require('assert');
const uploadToken = require('./qiniu');
const { Duplex } = require('stream');
const { addFood } = require('./mysql');

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

(async () => {
  const browser = await puppeteer.launch({
    // executablePath: '../../chromium/Chromium.app/Contents/MacOS/Chromium'
    headless: false
  });
  // const page = (await browser.pages())[0];
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

  // for (const key in list) {
  //   if (list.hasOwnProperty(key)) {
  //     const urls = list[key].href;
  //   }
  // }

  list.length = 1;

  // const foods = [];

  // let id = -1;

  for (const k in list) {
    const item = list[k];
    await page.goto(`${url}${item.href}`);
    const res = await page.evaluate(toName);

    res.arr.length = 1;

    const { content, base64Encoded } = await page._client.send(
      'Page.getResourceContent',
      { frameId: String(page.mainFrame()._id), url: res.arr[0].image_name }
    );
    assert.equal(base64Encoded, true);
    const contentBuffer = Buffer.from(content, 'base64');
    var stream = new Duplex();
    stream.push(buff);
    var putExtra = new qiniu.form_up.PutExtra();
    var config = new qiniu.conf.Config();
    config.zone = qiniu.zone.Zone_z1; // 空间对应的机房
    var formUploader = new qiniu.form_up.FormUploader(config);
    var key = 'test.png';
    formUploader.putStream(uploadToken, key, stream, putExtra, function(
      respErr,
      respBody,
      respInfo
    ) {
      if (respErr) {
        throw respErr;
      }
      if (respInfo.statusCode == 200) {
        console.log(1111);
      } else {
        console.log(respInfo.statusCode);
      }
    });
    // let obj = {
    //   name: item.name,
    //   id: k,
    //   food: res.arr
    // };
    // for (let index = 2; index <= res.maxPage; index++) {
    //   await page.waitFor(800);
    //   await page.goto(`${url}${item.href}?page=${index}`);
    //   const result = await page.evaluate(toName);
    //   obj.food = [...obj.food, ...result.arr];
    // }
    // for (let index in obj.food) {
    //   const it = obj.food[index];
    //   id += 1;
    //   await addFood([id, it.name, it.cal, it.image_name, k]);
    // }
    // foods.push(obj);
  }

  browser.close();
})();
