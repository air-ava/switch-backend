import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IQuestionnaireTitle } from '../modelInterfaces';

@Entity('questions')
export class Questions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @Column()
  type: 'text' | 'radio' | 'checkbox';

  @Column()
  title_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at?: Date;

  @ManyToOne('QuestionnaireTitle', 'questions')
  @JoinColumn({ name: 'title_id', referencedColumnName: 'id' })
  Title: IQuestionnaireTitle;
}
