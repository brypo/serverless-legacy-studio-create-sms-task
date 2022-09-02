exports.handler = async function(context, event, callback) {

    //get twilio client
    const client = context.getTwilioClient();

    // set up success response
    const response = new Twilio.Response();
    response.setStatusCode(200);

    // get SIDs from studio widget
    const { instanceSid, channelSid, webhookSid, customerName } = event;
    console.log(event);

    // create sms Task
    try {
        await client.taskrouter.v1.workspaces(context.TR_WORKSPACE_SID)
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
    }
    catch(e) {
        console.log(`Task failed to create: ${instanceSid} ${channelSid} ${webhookSid}`);
        console.error(e);
        response.setStatusCode(500);
        return callback(null, response)
    }

    // delete studio<->chat channel webhook
    try {
        await client.chat.v2.services(instanceSid)
            .channels(channelSid)
            .webhooks(webhookSid)
            .remove();
    }
    catch(e) {
        console.log(`Chat Channel Webhook for Studio Flow failed to delete: ${channelSid} ${webhookSid}`);
        console.error(e);
        response.setStatusCode(500);
        return callback(null, response)
    }

    return callback(null, response)
};
