const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "shubh20072001@gmail.com",
    pass: "xyvz bbzx tpmm kslb"
  }
})

const sendOTP = async (email, otp) => {

  const mailOptions = {
    from: "shubh20072001@gmail.com",
    to: email,
    subject: "Your Login OTP",
    text: `Your OTP is: ${otp}`
  }

  await transporter.sendMail(mailOptions)
}

module.exports = sendOTP