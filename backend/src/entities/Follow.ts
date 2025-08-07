import { Entity, PrimaryKey, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { User } from './User';

@Entity()
@Unique({ properties: ['follower', 'following'] })
export class Follow {
    @PrimaryKey({ type: 'number' })
    id!: number;

    @ManyToOne(() => User)
    follower!: User;

    @ManyToOne(() => User)
    following!: User;

    @Property()
    createdAt: Date = new Date();

    @Property({ onUpdate: () => new Date() })
    updatedAt: Date = new Date();
}