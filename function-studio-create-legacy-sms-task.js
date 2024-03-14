exports.handler = async function (context, event, callback) {
    //get twilio client
    const client = context.getTwilioClient();

    // set up response
    const response = new Twilio.Response();

    // get SIDs from studio widget payload
    const { instanceSid, channelSid, webhookSid, customerName } = event;

    try {
        // create sms Task
        let taskSid = await createSMSTask(channelSid, customerName, context.WORKSPACE_SID, context.WORKFLOWSID)

        // delete studio<->chat channel webhook
        await deleteWebhook(channelSid, instanceSid, webhookSid)

        // add taskSid to chat channel attributes
        await updateChannelAttributes(channelSid, instanceSid, taskSid)
    } catch (e) {
        console.error(e)
        response.setBody(JSON.stringify(e))
        response.setStatusCode(500)
    }

    return callback(null, response)
};

const createSMSTask = async (client, channelSid, customerName, workspaceSid, workflowSid) => {
    try {
        let task = await client.taskrouter.v1.workspaces(workspaceSid)
            .tasks
            .create({
                attributes: JSON.stringify({
                    channelType: 'sms',
                    channelSid: channelSid,
                    name: customerName,
                }), workflowSid: context.TR_WORKFLOW_SID,
                taskChannel: 'sms'
            })
            .then(task => console.log(`Created Task: ${task.sid}`));

        return task.sid
    }
    catch (e) {
        console.error(`Task failed to create: ${channelSid} ${customerName}`);
        throw new Error(JSON.stringify(e))
    }
}

const deleteWebhook = async (client, channelSid, instanceSid, webhookSid) => {
    try {
        await client.chat.v2.services(instanceSid)
            .channels(channelSid)
            .webhooks(webhookSid)
            .remove();
    }
    catch (e) {
        console.error(`Chat Channel Webhook for Studio Flow failed to delete: ${channelSid} ${webhookSid}`);
        throw new Error(JSON.stringify(e))
    }
}

const updateChannelAttributes = async (client, channelSid, instanceSid, taskSid) => {
    try {
        // get current channel
        let channel = await client.chat.v2.services(instanceSid)
            .channels(channelSid)
            .fetch();
        let newAttr = JSON.parse(channel.attributes);

        // add taskSid to new attributes
        newAttr.taskSid = taskSid;

        // update chat channel with new attributes
        await client.chat.v2.services(instanceSid)
            .channels(channel.sid)
            .update({ attributes: JSON.stringify(newAttr) })

        console.log(`chat channel ${channelSid} updated with ${taskSid}`)
    } catch (e) {
        console.error(`Chat channel ${channelSid} failed to update to with ${taskSid}`);
        throw new Error(JSON.stringify(e))
    }
}
