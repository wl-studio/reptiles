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
  'INSERT INTO foods(id,food_name,food_cal,food_image,catalog_id) VALUES(?,?,?,?,?)';
// var addSqlParams = ['1', '1', '1', '1', '1'];

// CREATE TABLE `cal`.`catalog` (
//   `id` INT NOT NULL,
//   `name` VARCHAR(45) NULL,
//   PRIMARY KEY (`id`));
const addCatalog = 'INSERT INTO catalog(id,name) VALUES(?,?)';

module.exports = {
  addFood: params =>
    connection.query(addSql, params, function(err) {
      if (err) return console.log('添加失败 - ', err.message);
    }),
  addCatalog: params =>
    connection.query(addCatalog, params, function(err) {
      if (err) return console.log('添加失败 - ', err.message);
    })
};
