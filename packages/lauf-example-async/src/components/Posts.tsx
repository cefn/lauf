import React from "react";
import { Post } from "../domain";

type PostsProps = {
  posts: Post[];
};

export const Posts = ({ posts }: PostsProps) => (
  <ul>
    {posts.map((post, i) => (
      <li key={i}>{post.title}</li>
    ))}
  </ul>
);
