import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IQuestions } from '../modelInterfaces';
import { Questions } from './questions.model';

@Entity('questionnaire_title')
export class QuestionnaireTitle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  trigger: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  @OneToMany(() => Questions, (question) => question.Title)
  Questions: IQuestions[];
}
