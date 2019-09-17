const puppeteer = require('puppeteer');
const toUploadQiniu = require('./qiniu');
const fs = require('fs');
const { addFood, addCatalog } = require('./mysql');

const url = 'http://www.boohee.com';

async function toName() {
  const arr = $('.widget-group-content .item.clearfix');
  const ry = [];
  for (let key = 0; key < arr.length; key++) {
    if (arr.hasOwnProperty(key)) {
      const element = arr[key];
      const gram = $(element)
        .children('.text-box')
        .children('p')
        .html();
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
        unit:
          gram.indexOf('克') !== -1
            ? '1'
            : gram.indexOf('毫升') !== -1
            ? '2'
            : gram.indexOf('升') !== -1
            ? 3
            : '',
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
  for (let k = 0; k < list.length; k++) {
    const item = list[k];
    await page.goto(`${url}${item.href}`);
    const res = await page.evaluate(toName);

    let obj = {
      name: item.name,
      id: k,
      food: res.arr
    };
    // // 添加分类到数据库
    // await addCatalog([item.name]);

    for (let index = 2; index <= res.maxPage; index++) {
      await page.waitFor(400);
      await page.goto(`${url}${item.href}?page=${index}`);
      const result = await page.evaluate(toName);
      obj.food = [...obj.food, ...result.arr];
    }
    for (let index in obj.food) {
      const it = obj.food[index];
      const isImage = it.image_name.split('/');
    }
    foods.push(obj);
  }

  browser.close();
  process.exit(0);
})();
