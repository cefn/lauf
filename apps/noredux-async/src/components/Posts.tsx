import React from "react";
import { Post } from "../plans";
import { Immutable } from "@lauf/store";

interface PostsProps {
  posts: Immutable<Post[]>;
}

export const Posts = ({ posts }: PostsProps) => (
  <ul>
    {posts.map((post, i) => (
      <li key={i}>{post.title}</li>
    ))}
  </ul>
);
