import { pushNotification } from "../services/notification.service.js";
import {executeQuery} from "../utils/httpRequestController.js"

export async function reactOnJoke(req, res, next) {
    try {
      const userId = req.userId;
      const { jokeId, reactionValue, author_id } = req.body;
  
      const jokeReactionQuery = `
        INSERT INTO reactions (author_id, joke_id, value)
        VALUES($1, $2, $3);
      `;
      console.log(reactionValue)
      await executeQuery(jokeReactionQuery, [userId, jokeId, reactionValue]);
  
      const incrementReactions = `
        UPDATE jokes 
        SET reaction_counter = reaction_counter + 1, reactions_sum = reactions_sum + $2
        WHERE id = $1;
      `;
      await executeQuery(incrementReactions, [jokeId, reactionValue]);
  
      await pushNotification(userId, author_id, "reaction")

      return res.json({
        message: "You reacted on joke",
      });
    } catch (error) {
      req.error = error;
      next();
    }
  }
  
  export async function getReactions(req, res, next) {
    try {
      const jokeId = req.params.jokeId;
      const userId = req.userId;
  
      const getReactionsQuery = `
        SELECT users.id as userId, profile_picture_url, username, value, users_relations.sender_id, users_relations.receiver_id
        FROM reactions 
        INNER JOIN users ON reactions.author_id = users.id
        LEFT JOIN users_relations ON users.id = users_relations.receiver_id AND users_relations.sender_id = $2
        WHERE joke_id = $1;
      `;
      const reactions = await executeQuery(getReactionsQuery, [jokeId, userId]);
  
      req.data = reactions;
      return res.json(reactions);
    } catch (error) {
      req.error = error;
      next();
    }
  }