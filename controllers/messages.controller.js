import {executeQuery} from "../utils/httpRequestController.js"

export async function addMessage(req, res, next) {
  try {
    const senderId = req.userId;
    const { receiverId, message } = req.body;

    const addMessageQuery = `
      INSERT INTO messages(sender_id, receiver_id, message_text)
      VALUES($1, $2, $3);
    `;

    await executeQuery(addMessageQuery, [senderId, receiverId, message]);

    return res.json({
      message: "Message added",
    });
  } catch (error) {
    req.error = error;
    next();
  }
}

export async function getChatMessages(req, res, next) {
  try {
    const senderId = req.userId;
    const { receiverId, offset } = req.params;

    const getMessagesQuery = `
      SELECT sender_id AS senderId, message_text AS message, send_time AS time
      FROM messages
      WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY id DESC
      LIMIT 10
      OFFSET $3;
      ;

    `;

    const messages = await executeQuery(getMessagesQuery, [senderId, receiverId, offset]);

    return res.json(messages);
  } catch (error) {
    req.error = error;
    next();
  }
}
