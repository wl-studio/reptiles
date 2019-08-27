const puppeteer = require("puppeteer");

const url = "http://www.boohee.com";

(async () => {
  const browser = await puppeteer.launch({
    // executablePath: '../../chromium/Chromium.app/Contents/MacOS/Chromium'
    headless: false
  });
  // const page = (await browser.pages())[0];

  const page = await browser.newPage();
  await page.goto(`${url}/food/`);

  const list = await page.evaluate(() => {
    const arr = $(".widget-food-category ul li .text-box h3 a");
    const ry = [];
    for (let key = 0; key < arr.length; key++) {
      if (arr.hasOwnProperty(key)) {
        const element = arr[key];
        ry.push({
          name: element.innerHTML,
          href: element.getAttribute("href")
        });
      }
    }
    return ry;
  });

  // list.length = 1;

  let pageNum = 1;

  async function toName() {
    const arr = $(".widget-group-content .item.clearfix");
    const ry = [];
    for (let key = 0; key < arr.length; key++) {
      if (arr.hasOwnProperty(key)) {
        const element = arr[key];
        ry.push({
          image_name: $(element)
            .children(".img-box")
            .children("a")
            .children("img")
            .attr("src"),
          name: $(element)
            .children(".text-box")
            .children("h4")
            .children("a")
            .html(),
          cal: $(element)
            .children(".text-box")
            .children("p")
            .html()
        });
      }
    }
    // if ($(".next_page").attr("href")) {
    //   await page.goto(`${url}${$(".next_page").attr("href")}`);
    //   const res = await page.evaluate(toName);
    //   ry.push(res);
    // }
    return ry;
  }

  await page.goto("http://www.boohee.com/food/group/1");
  const res = await page.evaluate(toName);
  console.log(res);
  const product = await list.map(async item => {
    // await page.goto(`${url}${item.href}`);

    // const res = await page.evaluate(() => {
    //   const arr = $(".widget-group-content .item.clearfix");
    //   const ry = [];
    //   for (let key = 0; key < arr.length; key++) {
    //     if (arr.hasOwnProperty(key)) {
    //       const element = arr[key];
    //       ry.push({
    //         image_name: $(element)
    //           .children(".img-box")
    //           .children("a")
    //           .children("img")
    //           .attr("href"),
    //         name: $(element)
    //           .children(".text-box")
    //           .children("h4")
    //           .children("a")
    //           .html(),
    //         cal: $(element)
    //           .children(".text-box")
    //           .children("p")
    //           .html()
    //       });
    //     }
    //   }
    //   return ry;
    // });

    return item;
  });

  // console.log(product);

  browser.close();
})();
