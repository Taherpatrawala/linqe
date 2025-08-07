import {
    Entity,
    PrimaryKey,
    Property,
    Unique,
    OneToMany,
    Collection,
    BeforeCreate,
    BeforeUpdate,
} from '@mikro-orm/core';
import { Post } from './Post';
import { Follow } from './Follow';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
    @PrimaryKey({ type: 'number' })
    id!: number;

    @Property({ type: 'string' })
    @Unique()
    email!: string;

    @Property({ type: 'string' })
    name!: string;

    @Property({ type: 'string', hidden: true }) // Hide password from serialization
    password!: string;

    @Property({ type: 'string', nullable: true, length: 500 })
    bio?: string;

    @Property({ type: 'date' })
    createdAt: Date = new Date();

    @Property({ type: 'date', onUpdate: () => new Date() })
    updatedAt: Date = new Date();

    @OneToMany(() => Post, post => post.author)
    posts = new Collection<Post>(this);

    @OneToMany(() => Follow, follow => follow.follower)
    following = new Collection<Follow>(this);

    @OneToMany(() => Follow, follow => follow.following)
    followers = new Collection<Follow>(this);

    constructor(email: string, name: string, password: string, bio?: string) {
        this.email = email;
        this.name = name;
        this.password = password;
        if (bio !== undefined) {
            this.bio = bio;
        }
    }

    /**
     * Hash password before creating user
     */
    @BeforeCreate()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password && !this.password.startsWith('$2b$')) {
            const saltRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
            this.password = await bcrypt.hash(this.password, saltRounds);
        }
    }

    /**
     * Verify password against hash
     */
    async verifyPassword(plainPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, this.password);
    }

    /**
     * Validate email format
     */
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate password strength
     */
    static isValidPassword(password: string): boolean {
        return password.length >= 8;
    }

    /**
     * Validate bio length
     */
    static isValidBio(bio: string): boolean {
        return bio.length <= 500;
    }

    /**
     * Get user data without sensitive information
     */
    toJSON() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}