import pool from "../config/database.config.js"

export async function checkBlockList(req, res, next) {
    try {
        const requestAuthorId = req.userId
        const data = req.data
        if(!req.userId) {
            return res.json({
                data:data
            })
        }

        const dbClient = await pool.connect()



        const getUserBlockList = `
        SELECT * FROM block_list
        WHERE sender_id = $1 OR receiver_id = $2;
        `
        const dbResult = await dbClient.query(getUserBlockList, [requestAuthorId, requestAuthorId])
        const blockList = dbResult.rows

        await dbClient.release()
    
        if(blockList.length === 0){
            return res.json({
                data: data
            })
        }

        if(typeof(data) === "object") {
            for(blockRecord in blockList){
                if(blockRecord.sender_id === requestAuthorId && blockRecord.receiver_id === data.author_id || blockRecord.receiver_id === requestAuthorId && blockRecord.sender_id === data.author_id) {
                    throw new Error("You have not permission to see content of this user")
                }
            }
            
            return res.json({
                data: data
            })
        } else {
  
            const filteredData = []
            for(dataRecord of data) {
                for(blockRecord of blockList) {
                    if((blockRecord.sender_id === requestAuthorId && blockRecord.receiver_id === dataRecord.author_id) || (blockRecord.receiver_id === requestAuthorId && blockRecord.sender_id === dataRecord.author_id)) {
                        continue
                    }
                    filteredData.push(dataRecord)
                }
            }
            return res.json({
                data: filteredData
            })
        }       
    } catch (error) {
        req.error = error
        next()
    }


}