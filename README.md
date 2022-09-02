# Twilio Serverless Function - SendToFlex

Twilio Serverless Function mimic for **Studio *SendToFlex* Widget**



## environment variables
| Variable | Resource |
| ---- | ---- | 
| TR_WORKSPACE_SID | TaskRouter Workspace SID 
| TR_WORKFLOW_SID | TaskRouter SMS Workflow SID


## studio configuration
In the `Run Function` Widget from the Studio Flow, pass the following key/value pairs to the Serverless Function:

| Variable | Studio Reference |
| ----- | ---- |
| Chat Channel SID | {{trigger.message.ChannelSid}}
| Chat Service SID | {{trigger.message.InstanceSid}}
| Chat Channel Webhook SID | {{trigger.message.WebhookSid}}


## disclaimer
This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. Twilio bears no responsibility to support the use or implementation of this software.
