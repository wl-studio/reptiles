const mysql = require('mysql');
// 连接数据库
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'xdks0823',
  database: 'cal'
});

connection.connect();

// select * from cal.foods;
// drop table cal.foods;
// CREATE TABLE `cal`.`foods` (
//   `id` INT NOT NULL,
//   `food_name` VARCHAR(45) NULL,
//   `food_cal` VARCHAR(45) NULL,
//   `food_image` VARCHAR(300) NULL,
//   `catalog_id` VARCHAR(45) NULL,
//   PRIMARY KEY (`id`));
var addSql =
  'INSERT INTO foods(food_name,food_unit,food_cal,food_image,catalog_id) VALUES(?,?,?,?,?)';

// select * from cal.catalog;
// drop table cal.catalog;
// CREATE TABLE `cal`.`catalog` (
//   `id` INT NOT NULL,
//   `name` VARCHAR(45) NULL,
//   PRIMARY KEY (`id`));
const addCatalog = 'INSERT INTO catalog(name) VALUES(?)';

module.exports = {
  addFood: async params =>
    await connection.query(addSql, params, function(err) {
      if (err) return console.log('添加食物失败 - ', err.message);
    }),
  addCatalog: async params => {
    await connection.query(addCatalog, params, function(err) {
      if (err) return console.log('添加分类失败 - ', err.message);
    });
  }
};
