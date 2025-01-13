import { client } from '@devrev/typescript-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function handleEvent(event: any) {
  const devrevPAT = event.context.secrets.service_account_token;
  const API_BASE = event.execution_metadata.devrev_endpoint;
  // initialize the client
  const devrevSDK = client.setup({
    endpoint: API_BASE,
    token: devrevPAT,
  });

  // timeline id
  const object_id = event.payload.source_id;

  const timelineEntriesListBody = {
    object: event.payload.source_id,
  };
  // get timeline data
  const timelineDataList = devrevSDK.timelineEntriesListPost(timelineEntriesListBody as any);
  console.log('Timeline entries list', JSON.stringify((await timelineDataList).data));

  const genAI = new GoogleGenerativeAI(event.input_data.global_values.gemini_api_key);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // generate response
  const prompt = "You are a friendly professional AI assistant, Answer to queries posted to you. If you are unsure of the answer tell you are unsure." + event.payload.parameters;
  const result = await model.generateContent([prompt]);
  const output = `**Input text: ${event.payload.parameters}** \n ${[result.response.text()]}`;
  console.log(output);

  // add to timeline
  
  const timelineEntriesCreateBody = {
    object: object_id,
    type: 'timeline_comment',
    body: output,
  };

  const response = devrevSDK.timelineEntriesCreate(timelineEntriesCreateBody as any);
  return response;
}
export const run = async (events: any[]) => {
  console.info('events', JSON.stringify(events), '\n\n\n');
  for (let event of events) {
    try {
      const resp = await handleEvent(event);
      console.log(JSON.stringify(resp.data));
    } catch (e) {
      console.error(e);
    }
  }
};

export default run;
