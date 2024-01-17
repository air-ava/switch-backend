/* eslint-disable no-await-in-loop */
/* eslint-disable array-callback-return */
import * as bcrypt from 'bcrypt';
import randomstring from 'randomstring';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
import { StudentGuardian } from '../models/studentGuardian.model';
import { sendEmail } from '../../utils/mailtrap';

const tableName = 'studentGuardian';
const columnDetails = {
  name: 'authentication_pin',
  type: 'varchar',
  length: '255',
};
const inputLength = 6;

const tableData = {
  nationality: new TableColumn({
    name: 'nationality',
    type: 'varchar',
    length: '255',
    isNullable: true,
  }),
  is_owner: new TableColumn({
    name: 'is_owner',
    type: 'boolean',
    default: false,
  }),
  dob: new TableColumn({
    name: 'dob',
    type: 'timestamp',
    isNullable: true,
  }),
};
const { nationality, is_owner, dob } = tableData;

export class AddandSeedAuthenticationPinToStudentGuardian1701342652447 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('individual', [nationality, is_owner, dob]);
    await queryRunner.addColumn(tableName, new TableColumn({ ...columnDetails, isNullable: false }));

    const studentGuardians = await queryRunner.manager.find(StudentGuardian, {
      where: {},
      relations: ['Guardian', 'student', 'student.User', 'Guardian.phoneNumber'],
    });

    let body = `\n\n 🎊 New PIN for Guardians and their Kids: \n\n`;
    const updatedPinDetails = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const studentGuardian of studentGuardians) {
      const pin = randomstring.generate({ length: inputLength, charset: 'numeric' });
      const hashedPin = bcrypt.hashSync(pin, 8);

      const { id, code, student, Guardian } = studentGuardian;
      const { code: guardianCode, phoneNumber, firstName, lastName, email } = Guardian as any;
      const { internationalFormat } = phoneNumber;
      const { uniqueStudentId, User } = student as any;
      const { first_name, last_name } = User;

      body += `*Student Name*: ${first_name} ${last_name} \n *Student Id*: ${uniqueStudentId}  \n *Guardian PIN*: ${pin} \n *StudentGuardian Code*: ${code} \n *Guardian Code*: ${guardianCode} \n *Guardian Name*: ${firstName} ${lastName} \n *Guardian Email*: ${email} \n *Guardian Phone*: ${internationalFormat} \n\n`;

      updatedPinDetails.push({
        studentGuardian: code,
        guardianCode,
        pin,
        guardianPhone: internationalFormat,
        guardianfirstName: firstName,
        guardianlastName: lastName,
        guardianemail: email,
        studentfirst_name: first_name,
        studentlast_name: last_name,
        studentuniqueStudentId: uniqueStudentId,
      });

      await queryRunner.manager.createQueryBuilder().update(tableName).set({ authentication_pin: hashedPin }).where('id = :id', { id }).execute();
    }

    await queryRunner.changeColumns(tableName, [
      {
        oldColumn: new TableColumn({ ...columnDetails, isNullable: true }),
        newColumn: new TableColumn({ ...columnDetails, isNullable: false }),
      },
    ]);

    sendEmail({
      recipientEmail: 'daniel+migration@joinsteward.com',
      purpose: 'welcome_user',
      templateInfo: {
        otp: body,
        firstName: 'Daniel',
        userId: '1',
      },
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(tableName, columnDetails.name);
    await queryRunner.dropColumns('individual', [nationality, is_owner, dob]);
  }
}
