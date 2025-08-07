import {
    Entity,
    PrimaryKey,
    Property,
    ManyToOne,
    Ref,
} from '@mikro-orm/core';
import { User } from './User';

@Entity()
export class Post {
    @PrimaryKey({ type: 'number' })
    id!: number;

    @Property({ type: 'string', length: 1000 })
    content!: string;

    @ManyToOne(() => User, { ref: true })
    author!: Ref<User>;

    @Property({ type: 'date' })
    createdAt: Date = new Date();

    @Property({ type: 'date', onUpdate: () => new Date() })
    updatedAt: Date = new Date();

    constructor(content: string, author: User) {
        this.content = content;
        this.author = author as any; // Will be properly handled by MikroORM
    }

    /**
     * Validate post content
     */
    static isValidContent(content: string): boolean {
        return content.trim().length > 0 && content.length <= 1000;
    }

    /**
     * Get post data with author information
     */
    toJSON() {
        return {
            id: this.id,
            content: this.content,
            author: {
                id: this.author.id,
                name: this.author.getEntity().name,
            },
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}