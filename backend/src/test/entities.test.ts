import { User, Post } from '../entities';

describe('Entity Tests', () => {
    describe('User Entity', () => {
        test('should create a user with valid data', () => {
            const user = new User('test@example.com', 'Test User', 'password123', 'Test bio');

            expect(user.email).toBe('test@example.com');
            expect(user.name).toBe('Test User');
            expect(user.password).toBe('password123');
            expect(user.bio).toBe('Test bio');
        });

        test('should validate email format', () => {
            expect(User.isValidEmail('test@example.com')).toBe(true);
            expect(User.isValidEmail('invalid-email')).toBe(false);
            expect(User.isValidEmail('')).toBe(false);
        });

        test('should validate password strength', () => {
            expect(User.isValidPassword('password123')).toBe(true);
            expect(User.isValidPassword('short')).toBe(false);
            expect(User.isValidPassword('')).toBe(false);
        });

        test('should validate bio length', () => {
            expect(User.isValidBio('Valid bio')).toBe(true);
            expect(User.isValidBio('a'.repeat(500))).toBe(true);
            expect(User.isValidBio('a'.repeat(501))).toBe(false);
        });
    });

    describe('Post Entity', () => {
        test('should create a post with valid data', () => {
            const user = new User('test@example.com', 'Test User', 'password123');
            const post = new Post('Test post content', user);

            expect(post.content).toBe('Test post content');
            expect(post.author).toBe(user);
        });

        test('should validate post content', () => {
            expect(Post.isValidContent('Valid content')).toBe(true);
            expect(Post.isValidContent('a'.repeat(1000))).toBe(true);
            expect(Post.isValidContent('')).toBe(false);
            expect(Post.isValidContent('   ')).toBe(false);
            expect(Post.isValidContent('a'.repeat(1001))).toBe(false);
        });
    });
});