const mysql = require('mysql');
// CREATE TABLE `cal`.`foods` (
//   `id` INT NOT NULL,
//   `food_name` VARCHAR(45) NULL,
//   `food_cal` VARCHAR(45) NULL,
//   `food_image` VARCHAR(300) NULL,
//   `catalog_id` VARCHAR(45) NULL,
//   PRIMARY KEY (`id`));
// 连接数据库
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'xdks0823',
  database: 'cal'
});

connection.connect();

var addSql =
  'INSERT INTO foods(id,food_name,food_cal,food_image,catalog_id) VALUES(?,?,?,?,?)';
// var addSqlParams = ['1', '1', '1', '1', '1'];

module.exports = {
  addFood: params =>
    connection.query(addSql, params, function(err, result) {
      if (err) {
        console.log('添加失败 - ', err.message);
        return;
      }
      console.log('添加成功:', result);
      console.log(
        '-----------------------------------------------------------------\n\n'
      );
    })
};
