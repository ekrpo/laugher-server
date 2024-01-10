import {executeQuery, handleDbOperation, executeRequestOperation} from "../utils/httpRequestController.js"
import { pushNotification } from "../services/notification.service.js";

export async function followUser(req, res) {
    await handleDbOperation(req, res, async (req) => {
      const senderId = req.userId;
      const receiverId = req.params.receiverId;
  
      if (senderId === receiverId) {
        throw new Error("You cannot follow yourself");
      }
  
      const followQuery = `
        INSERT INTO users_relations (sender_id, receiver_id)
        VALUES($1, $2);
      `;
      const insertionResult = await executeQuery(followQuery, [senderId, receiverId]);
  
      if (insertionResult.rowCount === 0) {
        throw new Error("You are already following this user");
      }
  
      const updateFollowers = `
        UPDATE users SET followers = followers + 1
        WHERE id = $1;
      `;
      const updateFollowings = `
        UPDATE users SET followings = followings + 1
        WHERE id = $1;
      `;
      await executeQuery(updateFollowers, [receiverId]);
      await executeQuery(updateFollowings, [senderId]);

      await pushNotification(senderId, receiverId, "follow")
  
      return {
        message: "You followed the user successfully",
      };
    });
  }
  
  export async function unfollowUser(req, res) {
    await handleDbOperation(req, res, async (req) => {
      const senderId = req.userId;
      const receiverId = req.params.receiverId;
  
      if (senderId === receiverId) {
        throw new Error("You cannot unfollow yourself");
      }
  
      const unfollowQuery = `
        DELETE FROM users_relations
        WHERE sender_id = $1 AND receiver_id = $2;
      `;
      const deletionResult = await executeQuery(unfollowQuery, [senderId, receiverId]);
  
      if (deletionResult.rowCount === 0) {
        throw new Error("You are not following this user");
      }
  
      const decreaseFollowers = `
        UPDATE users SET followers = followers - 1
        WHERE id = $1;
      `;
      const decreaseFollowings = `
        UPDATE users SET followings = followings - 1
        WHERE id = $1;
      `;
      await executeQuery(decreaseFollowers, [receiverId]);
      await executeQuery(decreaseFollowings, [senderId]);
  
      if (req.reverseBlock) {
        req.params.receiverId = senderId;
        req.userId = receiverId;
        await unfollowUser(req, res);
      }
  
      return {
        message: "You unfollowed the user",
      };
    });
  }
  
  export async function blockUser(req, res) {
    await handleDbOperation(req, res, async (req) => {
      const senderId = req.userId;
      const receiverId = req.params.receiverId;
  
      if (senderId === receiverId) {
        throw new Error("You cannot block yourself");
      }
  
      const blockUserQuery = `
        INSERT INTO block_list(sender_id, receiver_id)
        VALUES($1, $2);
      `;
      await executeQuery(blockUserQuery, [senderId, receiverId]);
  
      req.reverseBlock = true;
      await unfollowUser(req, res);
  
      return {
        message: "You blocked the user",
      };
    });
  }
  
  export async function getUsersFollowings(req, res) {
    await handleDbOperation(req, res, async (req) => {
      const userId = req.userId;
  
      const getFollowingQuery = `
        SELECT profile_picture_url, username, users.id 
        FROM users
        INNER JOIN users_relations ON users.id = users_relations.receiver_id
        WHERE users_relations.sender_id = $1;
      `;
      return executeQuery(getFollowingQuery, [userId]);
    });
  }