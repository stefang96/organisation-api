import nodemailer from "nodemailer";

export class Nodemailer {
  static async getTransporter() {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    return transporter;
  }

  /**
   * @param to - which user receives mail
   * @param subject - email subject
   * @param template - email template
   */
  static async getEmail(to, subject, template) {
    const email = {
      from: "Organisation App",
      to,
      subject,
      html: template,
    };

    return email;
  }

  /**
   * @param to - which user receives mail
   * @param subject - email subject
   * @param template - email template
   */
  static async sendEmail(to, subject, template) {
    const transporter = await this.getTransporter();
    const mail = await this.getEmail(to, subject, template);
    return await transporter.sendMail(mail, function (error, response) {
      if (error) {
        console.log({ error });
      } else {
        console.log(`Email sent to ${to} successfully`);
      }
      transporter.close();
    });
  }

  static async inviteUser(user) {
    const subject = "Welcome to Organisation";
    const template =
      ` <div   >
    <a   href='http://localhost:5000/api/auth/verify?verifytoken=` +
      encodeURIComponent(user.verifytoken) +
      `&email=` +
      encodeURIComponent(user.email) +
      `' >  <span > http://localhost:5000/api/auth/verify?verifytoken=` +
      encodeURIComponent(user.verifytoken) +
      `&email=` +
      encodeURIComponent(user.email) +
      `</span>
    </a>
 </div>`;
    await this.sendEmail(user.email, subject, template);
  }

  static async resetPassword(password, email) {
    const subject = "Reset password";
    const template = ` <div   >
     Your password is: ${password}
 </div>`;
    await this.sendEmail(email, subject, template);
  }

  static async sendEmailToContactPerson(data, to) {
    const subject = "Add user";
    const template = ` <div   >
  Please add me into your organisation <br> <hr>
    First name : ${data.firstName}   <br>
    Last name : ${data.lastName}   <br>
    Email : ${data.email}   <br>
    ${data.message ? `Message: ` + data.message : ""} <br> <hr>
 </div>`;
    await this.sendEmail(to, subject, template);
  }
}
