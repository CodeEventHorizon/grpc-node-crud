import * as grpc from "@grpc/grpc-js";
import { DeletePostResponse } from "../../pb/DeletePostResponse";
import { GetPostsRequest__Output } from "../../pb/GetPostsRequest";
import { Post } from "../../pb/Post";
import { CreatePostRequest__Output } from "../../pb/post/CreatePostRequest";
import { UpdatePostRequest__Output } from "../../pb/post/UpdatePostRequest";
import { PostRequest__Output } from "../../pb/PostRequest";
import { PostResponse } from "../../pb/PostResponse";
import {
  createPost,
  deletePost,
  findAllPosts,
  findPost,
  findUniquePost,
  updatePost,
} from "../services/post.service";

// [...] Create a New Record RPC Handler
export const createPostHandler = async (
  req: grpc.ServerUnaryCall<CreatePostRequest__Output, PostResponse>,
  res: grpc.sendUnaryData<PostResponse>
) => {
  try {
    const post = await createPost({
      title: req.request.title,
      content: req.request.content,
      image: req.request.image,
      category: req.request.category,
      published: true,
    });

    return res(null, {
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        image: post.image,
        published: post.published,
        createdAt: {
          seconds: post.created_at.getTime() / 1000,
        },
        updatedAt: {
          seconds: post.updated_at.getTime() / 1000,
        },
      },
    });
  } catch (e: any) {
    if (e.code === "P2002") {
      return res({
        code: grpc.status.ALREADY_EXISTS,
        message: "Post with that title already exists",
      });
    }
    res({
      code: grpc.status.INTERNAL,
      message: e.message,
    });
  }
};

// [...] Update Record RPC Handler
export const updatePostHandler = async (
  req: grpc.ServerUnaryCall<UpdatePostRequest__Output, PostResponse>,
  res: grpc.sendUnaryData<PostResponse>
) => {
  try {
    const postExists = await findPost({ id: req.request.id });

    if (!postExists) {
      return res({
        code: grpc.status.NOT_FOUND,
        message: "No post with that ID exists",
      });
    }

    const updatedPost = await updatePost(
      { id: req.request.id },
      {
        title: req.request.title,
        content: req.request.content,
        category: req.request.category,
        image: req.request.image,
        published: req.request.published,
      }
    );

    res(null, {
      post: {
        id: updatedPost.id,
        title: updatedPost.title,
        content: updatedPost.content,
        image: updatedPost.image,
        published: updatedPost.published,
        createdAt: {
          seconds: updatedPost.created_at.getTime() / 1000,
        },
        updatedAt: {
          seconds: updatedPost.updated_at.getTime() / 1000,
        },
      },
    });
  } catch (e: any) {
    return res({
      code: grpc.status.INTERNAL,
      message: e.message,
    });
  }
};

// [...] Retrieve a Single Record RPC Handler
export const findPostHandler = async (
  req: grpc.ServerUnaryCall<PostRequest__Output, PostResponse>,
  res: grpc.sendUnaryData<PostResponse>
) => {
  try {
    const post = await findUniquePost({ id: req.request.id });

    if (!post) {
      return res({
        code: grpc.status.NOT_FOUND,
        message: "No post with that ID exists",
      });
    }

    res(null, {
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        image: post.image,
        published: post.published,
        createdAt: {
          seconds: post.created_at.getTime() / 1000,
        },
        updatedAt: {
          seconds: post.updated_at.getTime() / 1000,
        },
      },
    });
  } catch (e: any) {
    return res({
      code: grpc.status.INTERNAL,
      message: e.message,
    });
  }
};

// [...] Delete a Record RPC Handler
export const deletePostHandler = async (
  req: grpc.ServerUnaryCall<PostRequest__Output, DeletePostResponse>,
  res: grpc.sendUnaryData<DeletePostResponse>
) => {
  try {
    const postExists = await findPost({ id: req.request.id });

    if (!postExists) {
      return res({
        code: grpc.status.NOT_FOUND,
        message: "No post with that ID exists",
      });
    }

    const post = await deletePost({ id: req.request.id });

    if (!post) {
      return res({
        code: grpc.status.NOT_FOUND,
        message: "No post with that ID exists",
      });
    }

    return res(null, {
      success: true,
    });
  } catch (e: any) {
    return res({
      code: grpc.status.INTERNAL,
      message: e.message,
    });
  }
};

// [...] Retrieve all Records RPC Handler
export const findAllPostsHandler = async (
  call: grpc.ServerWritableStream<GetPostsRequest__Output, Post>
) => {
  try {
    const { page, limit } = call.request;
    const posts = await findAllPosts({
      page: parseInt(page),
      limit: parseInt(limit),
    });

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      call.write({
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category,
        image: post.image,
        published: post.published,
        createdAt: {
          seconds: post.created_at.getTime() / 1000,
        },
        updatedAt: {
          seconds: post.updated_at.getTime() / 1000,
        },
      });
    }
    call.end();
  } catch (e: any) {
    console.log(e);
  }
};
