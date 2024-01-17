// src/database/models/Device.ts

import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('device')
@Unique(['code'])
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column({ type: 'boolean' })
  isMobile: boolean;

  @Column()
  os: string;

  @Column()
  name: string;

  @Column()
  model: string;

  @Column({ name: 'device_type' })
  deviceType: string;

  @Column()
  status: number;

  @Column({ name: 'school_id' })
  schoolId: number;

  @Column({ name: 'owner_id' })
  ownerId: string;
}
