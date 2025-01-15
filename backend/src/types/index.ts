export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Post {
    id: string;
    title: string;
    content: string;
    authorId: string;
}

export interface Comment {
    id: string;
    postId: string;
    content: string;
    authorId: string;
}