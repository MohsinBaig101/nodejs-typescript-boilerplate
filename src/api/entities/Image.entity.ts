import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('images')
export class Image {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column('float')
    public depth: number;

    @Column('bytea', { nullable: true, name: 'data' })
    public pixels: Buffer;

}
