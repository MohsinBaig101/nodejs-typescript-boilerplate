import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('plants')
export class Plant {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ name: 'plant_name' })
    public plantName: string;

    @Column({ name: 'state' })
    public state: string;

    @Column({ name: 'net_generation', type: 'numeric', precision: 10, scale: 2 })
    public annualNetGeneration: number;

    @Column({ name: 'latitude', nullable: true })
    public latitude: string;

    @Column({ name: 'longitude', nullable: true })
    public longitude: string;
}
