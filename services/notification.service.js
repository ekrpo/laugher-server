import { executeQuery } from "../utils/httpRequestController.js"


export async function pushNotification(senderId, receiverId, type){
    if(senderId === receiverId){
        return
    }

    const increaseNotificationCounter = `
    UPDATE users
    SET notification_counter = notification_counter + 1
    WHERE id = $1;
    `
    await executeQuery(increaseNotificationCounter, [receiverId])

    const pushNotificationQuery = `
    INSERT INTO notifications(sender_id, receiver_id, type)
    VALUES($1 ,$2 ,$3);
    `
    return await executeQuery(pushNotificationQuery, [senderId, receiverId, type])
}

