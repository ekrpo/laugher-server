import { executeQuery, handleDbOperation, executeRequestOperation } from "../utils/httpRequestController.js"
import { pushNotification } from "../services/notification.service.js";

export async function addComment(req, res) {
  await handleDbOperation(req, res, async (req) => {
    const { userId } = req;
    const { jokeId, parrentCommentId, content, audio, authorId } = req.body;

    const insertCommentQuery = `
      INSERT INTO comments (author_id, joke_id, parrent_comment_id, content, audio)
      VALUES ($1, $2, $3, $4, $5) RETURNING id;
    `;

    const result = await executeRequestOperation(insertCommentQuery, [
      userId,
      jokeId,
      parrentCommentId,
      content,
      audio,
    ]);

    const increaseCommentsQuery = `
      UPDATE jokes SET comment_counter = comment_counter + 1
      WHERE id = $1;
    `;
    await executeRequestOperation(increaseCommentsQuery, [jokeId]);

    if (parrentCommentId) {
      const increaseRepliesQuery = `
        UPDATE comments 
        SET replies = replies + 1
        WHERE id = $1;
      `;
      await executeRequestOperation(increaseRepliesQuery, [parrentCommentId]);
    }

    await pushNotification(userId, authorId, "comment")

    return {
      message: "Comment added",
      id: result[0].id,
    };
  });
}

export async function deleteComment(req, res) {
  await handleDbOperation(req, res, async (req) => {
    const { userId } = req;
    const commentId = req.params.commentId;
    const { jokeId } = req.body;

    const deleteCommentQuery = `
      DELETE FROM comments
      WHERE id = $1 AND author_id = $2;
    `;

    const result = await executeRequestOperation(deleteCommentQuery, [
      commentId,
      userId,
    ]);

    if (result.rowCount === 0) {
      throw new Error("You do not have permission to delete this comment");
    }

    const decreaseCommentsQuery = `
      UPDATE jokes SET comment_counter = comment_counter - 1
      WHERE id = $1;
    `;
    await executeRequestOperation(decreaseCommentsQuery, [jokeId]);

    return {
      message: "Deleted comment",
    };
  });
}

export async function getComments(req, res) {
  await handleDbOperation(req, res, async (req) => {
    const { jokeId, offset } = req.params;
    const userId = req.userId;

    const getCommentsQuery = `
    SELECT
    comments.id,
    users.id as author_id,
    users.profile_picture_url,
    users.username,
    comments.content,
    comments.comment_time,
    comments.audio,
    comments.reaction_counter,
    comments.parrent_comment_id,
    comments.replies,
    comment_likes.user_id
    FROM
    comments
    INNER JOIN users ON comments.author_id = users.id
    LEFT JOIN comment_likes ON comments.id = comment_likes.comment_id AND comment_likes.user_id = $2  
    WHERE
    comments.joke_id = $1 AND comments.parrent_comment_id IS NULL
    ORDER BY
    comments.replies DESC,
    comments.reaction_counter DESC,
    comments.comment_time DESC
    LIMIT 10 OFFSET $3;  

    `;

    return executeQuery(getCommentsQuery, [jokeId, userId, offset]);
  });
}

export async function editComment(req, res) {
  await handleDbOperation(req, res, async (req) => {
    const { userId } = req;
    const { content } = req.body;
    const commentId = req.params.commentId;

    const editCommentQuery = `
      UPDATE comments SET content = $1
      WHERE id = $2 AND author_id = $3;
    `;

    const result = await executeRequestOperation(editCommentQuery, [
      content,
      commentId,
      userId,
    ]);

    if (result.rowCount === 0) {
      throw new Error("You do not have permission to edit this comment");
    }

    return {
      message: "Comment updated",
    };
  });
}

export async function getCommentReplies(req, res) {
  await handleDbOperation(req, res, async (req) => {
    const { commentId, offset } = req.params;
    const userId = req.userId;

    const getRepliesQuery = `
      SELECT comments.id, profile_picture_url, username, content, comment_time, audio, reaction_counter, parrent_comment_id, replies as comment_counter, comment_likes.user_id
      FROM comments
      INNER JOIN users ON comments.author_id = users.id
      LEFT JOIN comment_likes ON comment_likes.comment_id=comments.id AND comment_likes.user_id = $1
      WHERE comments.parrent_comment_id = $2
      LIMIT 10 OFFSET $3;
    `;

    return executeQuery(getRepliesQuery, [userId, commentId, offset]);
  });
}

export async function likeComment(req, res) {
  await handleDbOperation(req, res, async (req) => {
    const { userId } = req;
    const commentId = req.params.commentId;
    const authorId = req.params.authorId

    const likeCommentQuery = `
        INSERT INTO comment_likes(user_id, comment_id)
        VALUES($1, $2);
      `;

    await executeRequestOperation(likeCommentQuery, [userId, commentId]);

    const increaseCounterQuery = `
        UPDATE comments SET reaction_counter = reaction_counter + 1
        WHERE id = $1;
      `;
    await executeRequestOperation(increaseCounterQuery, [commentId]);

    await pushNotification(userId, authorId, "like")

    return {
      message: "Comment liked",
    };
  });
}

export async function unlikeComment(req, res) {
  await handleDbOperation(req, res, async (req) => {
    const { userId } = req;
    const commentId = req.params.commentId;

    const unlikeCommentQuery = `
        DELETE FROM comment_likes 
        WHERE user_id = $1 AND comment_id = $2;
      `;
    await executeRequestOperation(unlikeCommentQuery, [userId, commentId], false);

    const decreaseCounterQuery = `
        UPDATE comments SET reaction_counter = reaction_counter - 1
        WHERE id = $1;
      `;
    await executeRequestOperation(decreaseCounterQuery, [commentId]);

    return {
      message: "Comment unliked",
    };
  });
}



