import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IQuestions } from '../modelInterfaces';

@Entity('questionnaire')
export class Questionnaire {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question_id: number;

  @Column()
  answer_text: string;

  @Column()
  answer_boolean: boolean;

  @Column()
  user_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  @OneToOne('Questions', 'questionnaire')
  @JoinColumn({ name: 'question_id' })
  Question: IQuestions;
}
