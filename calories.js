const puppeteer = require('puppeteer');
const toUploadQiniu = require('./qiniu');
const { addFood, addCatalog } = require('./mysql');

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
