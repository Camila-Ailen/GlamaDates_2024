import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer'


@Injectable()
export class MailerService {

    transporter = nodemailer.createTransport({
        host: 'mailcrab',
        port: 1025,
      }); 

    async sendEmail(from, subjectEmail, sendTo, html){
        try {
            const info = await this.transporter.sendMail({
                from: from,
                to: sendTo, // list of receivers
                subject: subjectEmail, // Subject line
                html: html, // html body
              });
            
        } catch (error) {
            throw error            
        }
    }

    async testEmail(){
      try {
          const info = await this.transporter.sendMail({
          from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
          to: "bar@example.com, baz@example.com", // list of receivers
          subject: 'Email de prueba', // Subject line
          html: '<b>Test Email</b>', // html body
        });
      } catch (error) {
        throw error
      }
    }
}