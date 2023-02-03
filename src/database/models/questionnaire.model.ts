import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('questionnaire')
export class Questionnaire {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: number;

  @Column()
  answer_text: string;

  @Column()
  answer_boolean: boolean;

  @Column()
  user_id: number;

  @Column()
  title_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at?: Date;
}
