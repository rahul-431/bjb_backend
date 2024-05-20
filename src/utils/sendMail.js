import nodemailer from "nodemailer";
export async function sendMail(to, body, subject) {
  // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: "porterharry1050@gmail.com",
      //this password is a app passoword that get from google to give this app all accessibility
      //to get this first enable two factor auth and then create new app password
      //dont add actual gmail password, this will not work
      pass: "kxrk dilt akue qjkv",
    },
  });
  try {
    const mailOptions = {
      from: "porterharry1050@gmail.com",
      to: to,
      subject: subject,
      text: body, // Plain text body
    };
    // Send email
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        return res
          .status(200)
          .json(new ApiResponse(info, "Email sent successfully"));
      }
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ApiError(500, "Error while sending email");
  }
}
