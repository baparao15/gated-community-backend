const QRCode = require('qrcode');

const generateQR = async (data) => {
  return QRCode.toDataURL(JSON.stringify(data), {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 1,
  });
};

module.exports = { generateQR };
