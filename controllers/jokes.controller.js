import pool from "../config/database.config.js";
import { errorHandler } from "../middlewares/error.middleware.js";
import fs from "fs";
import {executeQuery} from "../utils/httpRequestController.js"
import {getStorage, ref, getDownloadURL, uploadBytesResumable} from "firebase/storage"
import { fireBaseApp } from "../config/firebase.config.js";

async function addJokeToDatabase(req, fileData) {
    const { description, isPublic, battle } = req.body;
    const authorId = req.userId;
  
    const insertJoke = `
      INSERT INTO jokes (description, photo_url, audio, author_id, is_public, battle)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING id, photo_url, audio;
    `;

    let photoUrl;
    let audioUrl;
    if(fileData !== null){
      photoUrl = fileData.type === "photo" ? fileData.path : null
      audioUrl = fileData.type === "audio" ? fileData.path : null
    }


  
    const jokeValues = [
      description,
      photoUrl,
      audioUrl,
      authorId,
      Boolean(isPublic),
      JSON.parse(battle),
    ];
  
    return await executeQuery(insertJoke, jokeValues);
  }


  
  export async function addJoke(req, res, next) {
    try {
      if (!req.file || req.file === null) {
        const insertionResult = await addJokeToDatabase(req, null);
  
        return res.json({
          redirectUrl: "/",
          message: "You uploaded a joke successfully",
          id: insertionResult[0].id,
          photo_url: insertionResult[0].photo_url,
        });
      } else {
        const storage = getStorage()

        const storageRef = ref(storage, `files/${req.file.originalname}${Date.now()}`)
  
        const metadata = {
          contentType: req.file.mimetype
        }
  
        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata)
  
        const downloadURL = await getDownloadURL(snapshot.ref)
    
  
  
        let fileData = {
          path: downloadURL
        }
        if(downloadURL.includes("blob")){
          fileData.type = "audio"
        }else{
          fileData.type = "photo"
        }
    
        const insertionResult = await addJokeToDatabase(req, fileData);
  
    
        return res.json({
          redirectUrl: "/",
          message: "You uploaded a joke successfully",
          id: insertionResult[0].id,
          photo_url: insertionResult[0].photo_url,
          audio: insertionResult[0].audio
        });
      }
      
    } catch (error) {
      req.error = error;
      next();
    }
  }
  
  export async function getJoke(req, res, next) {
    try {
      const dbClient = await pool.connect();
      const jokeId = req.params.jokeId;
  
      const getJokeQuery = `
        SELECT description, photo_url, audio, publish_time, reaction_counter, comment_counter, username, profile_picture_url
        FROM jokes
        INNER JOIN users ON jokes.author_id = users.id
        WHERE jokes.id = $1;
      `;
  
      const dbResult = await dbClient.query(getJokeQuery, [jokeId]);
  
      await dbClient.release();
      return res.json(dbResult.rows);
    } catch (error) {
      req.error = error;
      next();
    }
  }
  
  export async function getPublicJokes(req, res, next) {
    try {
      const dbClient = await pool.connect();
      const { sortParameter, offset } = req.params;
      
      const userId = req.userId;
  
      let getPostsQuery;
  
      if (sortParameter === "latest") {
        getPostsQuery = `
          SELECT reactions.author_id AS reaction_author_id, reactions.value AS reaction_value, jokes.id, description, photo_url, audio, publish_time,jokes.author_id, reaction_counter, reactions_sum, comment_counter, username, profile_picture_url
          FROM jokes
          INNER JOIN users ON jokes.author_id = users.id
          LEFT JOIN reactions ON jokes.id = reactions.joke_id AND reactions.author_id = $1
          ORDER BY publish_time DESC
          LIMIT 10
          OFFSET $2;
        `;
      } else {
        getPostsQuery = `
          SELECT reactions.author_id AS reaction_author_id, reactions.value AS reaction_value, jokes.id, description, photo_url, audio, jokes.author_id, publish_time, reaction_counter, reactions_sum, comment_counter, username, profile_picture_url
          FROM jokes
          INNER JOIN users ON jokes.author_id = users.id
          LEFT JOIN reactions ON jokes.id = reactions.joke_id AND reactions.author_id = $1
          ORDER BY reaction_counter DESC, comment_counter DESC
          LIMIT 10
          OFFSET $2;
        `;
      }
  
      const dbResult = await dbClient.query(getPostsQuery, [userId, offset]);
      const jokes = dbResult.rows;
  
      await dbClient.release();
      req.data = jokes;
      next();
    } catch (error) {
      req.error = error;
      errorHandler(req, res);
    }
  }
  
  export async function modifyJoke(req, res) {
    try {
      const dbClient = await pool.connect();
  
      const description = req.body.description;
      const jokeId = req.params.jokeId;
      const userId = req.userId;
  
      const editDescription = `
        UPDATE jokes
        SET description = $1
        WHERE id = $2 AND author_id = $3;
      `;
  
      const dbResult = await dbClient.query(editDescription, [
        description,
        jokeId,
        userId,
      ]);
  
      if (dbResult.rowCount === 0) {
        throw new Error("You do not have permission to edit this post");
      }
  
      return res.json(dbResult);
    } catch (error) {
      req.error = error;
      errorHandler(req, res);
    }
  }
  
  export async function removeJoke(req, res, next) {
    try {
      const dbClient = await pool.connect();
  
      const jokeId = req.params.jokeId;
      const userId = req.userId;
  
      const deleteJokeQuery = `
        DELETE FROM jokes
        WHERE id = $1 AND author_id = $2;
      `;
  
      const dbResult = await dbClient.query(deleteJokeQuery, [jokeId, userId]);
  
      if (dbResult.rowCount === 0) {
        throw new Error("You do not have permission to delete this post");
      }
  
      return res.json(dbResult);
    } catch (error) {
      req.error = error;
      next();
    }
  }
  
  export async function getFavouriteJokes(req, res, next) {
    try {
      const dbClient = await pool.connect();
      const { sortParameter, offset } = req.params;
      const userId = req.userId;
  
      let getPostsQuery;
  
      if (sortParameter === "latest") {
        getPostsQuery = `
          SELECT reactions.author_id AS reaction_author_id, reactions_sum, jokes.author_id, reactions.value AS reaction_value, jokes.id, description, photo_url, audio, publish_time, reaction_counter, reactions_sum, comment_counter, username, profile_picture_url
          FROM jokes
          INNER JOIN users ON jokes.author_id = users.id
          INNER JOIN users_relations ON jokes.author_id = users_relations.receiver_id
          LEFT JOIN reactions ON jokes.id = reactions.joke_id AND reactions.author_id = $1
          WHERE users_relations.sender_id = $1
          ORDER BY publish_time DESC
          LIMIT 10
          OFFSET $2;
        `;
      } else {
        getPostsQuery = `
          SELECT reactions.author_id AS reaction_author_id, reactions_sum, jokes.author_id, reactions.value AS reaction_value, jokes.id, description, photo_url, audio, publish_time, reaction_counter, comment_counter, username, profile_picture_url
          FROM jokes
          INNER JOIN users ON jokes.author_id = users.id
          INNER JOIN users_relations ON jokes.author_id = users_relations.receiver_id
          LEFT JOIN reactions ON jokes.id = reactions.joke_id AND reactions.author_id = $1
          WHERE users_relations.sender_id = $1
          ORDER BY reaction_counter DESC, comment_counter DESC
          LIMIT 10
          OFFSET $2;
        `;
      }
  
      const dbResult = await dbClient.query(getPostsQuery, [userId, offset]);
      const jokes = dbResult.rows;
  
      await dbClient.release();
      req.data = jokes;
      next();
    } catch (error) {
      req.error = error;
      errorHandler(req, res);
    }
  }
  
  export async function getUsersJokes(req, res, next) {
    try {
      const dbClient = await pool.connect();
      const userId = req.params.userId !== "profile" ? req.params.userId : req.userId;
      const offset = req.params.offset
      let getPostsQuery = `
        SELECT reactions.author_id AS reaction_author_id, jokes.author_id, reactions.value AS reaction_value, jokes.id, description, reactions_sum, photo_url, audio, publish_time, reaction_counter, comment_counter, username, profile_picture_url
        FROM jokes
        INNER JOIN users ON jokes.author_id = users.id
        LEFT JOIN reactions ON jokes.id = reactions.joke_id
        WHERE jokes.author_id = $1
        ORDER BY publish_time DESC, reaction_counter DESC, comment_counter DESC
        LIMIT 10
        OFFSET $2;
      `;
  
      const dbResult = await dbClient.query(getPostsQuery, [userId, offset]);
      const jokes = dbResult.rows;
  
      await dbClient.release();
      req.data = jokes;
      next();
    } catch (error) {
      req.error = error;
      errorHandler(req, res);
    }
  }