import pool from "../config/database.config.js"

export async function getNotifications(req, res, next){
    try {
        const senderId = req.userId
        const dbClient = await pool.connect()

        const notificationsQuery = `
        SELECT users.id, users.username, users.profile_picture_url, type, timestamp as time
        FROM notifications
        INNER JOIN users ON notifications.sender_id = users.id
        WHERE receiver_id = $1;
        `
        const queryResult = await dbClient.query(notificationsQuery, [senderId])
        const notifications = queryResult.rows

        return res.json(notifications)

    } catch (error) {
        req.error = error
        next()
    }
}

export async function getNotificationCounter(req, res, next){
    try {
        const userId = req.userId
        const dbClient = await pool.connect()

        const notificationsQuery = `
        SELECT notification_counter
        FROM users
        WHERE id = $1;
        `
        const queryResult = await dbClient.query(notificationsQuery, [userId])
        const notificationData = queryResult.rows[0]

        await dbClient.release()

        return res.json(notificationData)

    } catch (error) {
        req.error = error
        next()
    }
}

export async function clearNotificationCounter(req, res, next){
    try {
        const userId = req.userId
        const dbClient = await pool.connect()

        const notificationsQuery = `
        UPDATE users
        SET notification_counter = 0
        WHERE id = $1;
        `
        await dbClient.query(notificationsQuery, [userId])

        await dbClient.release()

        return res.json("Updated")

    } catch (error) {
        req.error = error
        next()
    }
}

