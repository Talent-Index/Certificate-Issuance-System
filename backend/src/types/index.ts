/**
 * Represents a user in the system
 * @interface User
 * @property {string} id - Unique identifier for the user
 * @property {string} name - User's full name
 * @property {string} email - User's email address
 */
export interface User {
    id: string;
    name: string;
    email: string;
}

/**
 * Represents a post in the system
 * @interface Post
 * @property {string} id - Unique identifier for the post
 * @property {string} title - Title of the post
 * @property {string} content - Content of the post
 * @property {string} authorId - ID of the user who created the post
 */
export interface Post {
    id: string;
    title: string;
    content: string;
    authorId: string;
}

/**
 * Represents a comment on a post
 * @interface Comment
 * @property {string} id - Unique identifier for the comment
 * @property {string} postId - ID of the post this comment belongs to
 * @property {string} content - Content of the comment
 * @property {string} authorId - ID of the user who created the comment
 */
export interface Comment {
    id: string;
    postId: string;
    content: string;
    authorId: string;
}