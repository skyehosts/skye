import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Demo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'character varying',
  })
  foo: string;
}
