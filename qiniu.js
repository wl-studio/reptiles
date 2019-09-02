const qiniu = require('qiniu');
const fs = require('fs');
const path = require('path');
const http = require('http');

var accessKey = 'dSKG1M50pszNFsBqse1VbTxSp9FPN6Ox55S-e3S5';
var secretKey = 'a0TWgrrHE-JBwmkao1AeVcGk637kS_f78-HzyPgN';
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
var options = {
  scope: 'cal'
};
var putPolicy = new qiniu.rs.PutPolicy(options);
var uploadToken = putPolicy.uploadToken(mac);

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

module.exports = toUploadQiniu;
