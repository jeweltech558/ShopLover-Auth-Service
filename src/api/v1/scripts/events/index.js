const eventEmitter = require("./eventEmitter");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
const handlebarOptions = {
  viewEngine: {
    extName: ".handlebars",
    partialsDir: path.join(__dirname, "../../utils/mailTemplate"),
    defaultLayout: false,
  },
  viewPath: path.join(__dirname, "../../utils/mailTemplate"),
  extName: ".handlebars",
};
module.exports = () => {
  eventEmitter.on("send_email", async (data) => {
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let context;
    if (data.hasTemplate) {
      transporter.use("compile", hbs(handlebarOptions));
      context = data.templateData;
      template = data.templateName;
    }

    let info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      ...data,
      context,
      template,
    });

    console.log("Message sent  = ", info.messageId);
    console.log("Preview URL = ", nodemailer.getTestMessageUrl(info));
  });
};
