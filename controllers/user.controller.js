import {executeQuery} from "../utils/httpRequestController.js"

export async function searchForUser(req, res, next) {
    try {
      const searchedInput = req.params.searchedInput;
      const userId = req.userId;
  
      const searchQuery = `
        SELECT id, username, first_name, last_name, profile_picture_url, users_relations.receiver_id
        FROM users
        LEFT JOIN users_relations ON users_relations.receiver_id = users.id AND users_relations.sender_id = $2
        WHERE username LIKE '%' || $1 || '%' OR first_name LIKE '%' || $1 || '%' OR last_name LIKE '%' || $1 || '%';
      `;
      const users = await executeQuery(searchQuery, [searchedInput, userId]);
  
      return res.json(users);
    } catch (error) {
      req.error = error;
      next();
    }
  }
  
  export async function suggestUsers(req, res, next) {
    try {
      const userId = req.userId;
  
      const randomFriendQuery = `
        SELECT sender_id, receiver_id
        FROM users_relations 
        WHERE sender_id = $1 OR receiver_id = $1
        LIMIT 1;
      `;
      const relationshipResult = await executeQuery(randomFriendQuery, [userId]);
  
      if (relationshipResult.length === 0) {
        const suggestionsQuery = `
          SELECT DISTINCT *
          FROM users
          WHERE users.id NOT IN (
            SELECT receiver_id
            FROM users_relations
            WHERE sender_id = $1 OR receiver_id = $1
          )
          AND users.id != $1
          LIMIT 3;
        `;
        const suggestions = await executeQuery(suggestionsQuery, [userId]);
  
        return res.json(suggestions);
      }
  
      const { sender_id, receiver_id } = relationshipResult[0];
      const friend_id = sender_id == userId ? receiver_id : sender_id;
  
      const randomSuggestionQuery = `
        SELECT DISTINCT *
        FROM users
        WHERE users.id IN (
          SELECT receiver_id
          FROM users_relations
          WHERE sender_id = $1
        )
        AND users.id NOT IN (
          SELECT receiver_id
          FROM users_relations
          WHERE users.id = $2 OR sender_id = $2
        )
        AND users.id = $2
        LIMIT 3;
      `;
      const suggestions = await executeQuery(randomSuggestionQuery, [
        friend_id,
        userId,
      ]);
  
      return res.json(suggestions);
    } catch (error) {
      req.error = error;
      next();
    }
  }
  
  export async function getUsersInfo(req, res, next) {
    try {
      const userId = req.params.userId == 0 ? req.userId : req.params.userId;
  
      const getUsersInfoQuery = `
        SELECT username, profile_picture_url, first_name, last_name, followings, followers, COUNT(jokes.id) AS numberOfJokes
        FROM users
        LEFT JOIN jokes ON users.id = jokes.author_id
        WHERE users.id = $1
        GROUP BY users.id, users.followings, users.followers;
      `;
      const usersInfo = await executeQuery(getUsersInfoQuery, [userId]);
  
      return res.json(usersInfo[0]);
    } catch (error) {
      req.error = error;
      next();
    }
  }
