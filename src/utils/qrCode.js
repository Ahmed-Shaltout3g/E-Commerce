import qrcode from "qrcode";
export const QRCodeFunction = async ({ data = "" } = {}) => {
  const qrCodeResult = qrcode.toDataURL(JSON.stringify(data), {
    errorCorrectionLevel: "H",
  });
  return qrCodeResult;
};
