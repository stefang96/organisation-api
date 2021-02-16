import nodemailer from 'nodemailer'


export class Nodemailer{
    static async getTransporter() {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "organisationetf@gmail.com",
            pass: "1677stef",
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
          from: " 'Organisation App' <organisationetf@gmail.com>",
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


  static async inviteContactPerson( user) {
    const subject = "Welcome to Organisation";
    const template =` <div   >
    <a   href='http://localhost:5000/auth/verify?verifytoken=` +
encodeURIComponent(user.verifytoken) +
`&email=` +
encodeURIComponent(user.email) +
`' >  <span > http://localhost:5000/auth/verify?verifytoken=` +
encodeURIComponent(user.verifytoken) +
`&email=` +
encodeURIComponent(user.email) +
`</span>
    </a>
 </div>`;
    await this.sendEmail(user.email, subject, template);
  }

}