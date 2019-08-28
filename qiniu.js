const qiniu = require('qiniu-js');

var accessKey = 'dSKG1M50pszNFsBqse1VbTxSp9FPN6Ox55S-e3S5';
var secretKey = 'a0TWgrrHE-JBwmkao1AeVcGk637kS_f78-HzyPgN';
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
var options = {
  scope: 'cal'
};
var options = {
  scope: bucket
};
var putPolicy = new qiniu.rs.PutPolicy(options);
var uploadToken = putPolicy.uploadToken(mac);
console.log(uploadToken);
// module.exports = uploadToken;
