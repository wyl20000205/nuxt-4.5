// import OpenAI from 'openai';
// import * as Lark from '@Larksuiteoapi/node-sdk';
// import axios from 'axios'
// import fs from 'fs'

// let appId = 'cli_aaff17d68bb8dbc1'
// let appSecret = 'IusoaHBw36w37FGNRL1LbfstjsTmLRbT'
// let model_name = "gpt-5.6-sol"
// let apiKey = 'sk-9fnQWSRt0OpXVqMSj2Uaqx0zB9ltoyrX1AT6LhWYjZEmT9ep'
// let baseURL = 'https://www.eng-link-ai.com:1644/v1'
// // const file = fs.readFileSync("D:\\desktop\\eng_link\\public\\images\\bg1.webp");
// // const file = fs.readFileSync("https://eng-link-ai.com:1644/logo.png");





// let eng_client = new OpenAI({
//   apiKey,
//   baseURL,
// });

// let ai_reply = async (user_msg) => {
//   const response = await eng_client.chat.completions.create({
//     model: model_name,
//     messages: [{ role: 'user', content: user_msg }],
//   });
//   return response.choices[0].message.content
// }


// const client = new Lark.Client({
//   appId,
//   appSecret,
//   // disableTokenCache为true时，SDK不会主动拉取并缓存token，这时需要在发起请求时，调用Lark.withTenantToken("token")手动传递
//   // disableTokenCache为false时，SDK会自动管理租户token的获取与刷新，无需使用Lark.withTenantToken("token")手动传递token
//   disableTokenCache: false
// });

// const baseConfig = {
//   appId,
//   appSecret,
// }
// const wsClient = new Lark.WSClient(baseConfig);

// wsClient.start({
//   eventDispatcher: new Lark.EventDispatcher({}).register({
//     'im.message.receive_v1': async (data) => {
//       let msg_id = data.message.message_id
//       let receive_id = data.message.chat_id
//       let user_msg = JSON.parse(data.message.content).text.split(' ').slice(1).join(' ');
//       // console.log(data, msg_id, user_msg);
//       let reply_msg = await ai_reply(user_msg)
//       eng_reply_text(msg_id, user_msg, reply_msg)
//       // eng_reply_image(msg_id)
//     }
//   })
// });

// const get_image_key = async () => {
//   axios.get('https://eng-link-ai.com:1644/logo.png', { responseType: 'arraybuffer' })
//     .then(response => {
//       fs.writeFileSync('logo.png', response.data);
//     })
//     .catch(err => console.error('下载失败:', err));
//   const file = fs.readFileSync("D:\\desktop\\eng_link\\app\\pages\\logo.png");

//   try {
//     const res = await client.im.v1.image.create({
//       data: {
//         image_type: "message",
//         image: file,
//       },
//     });

//     if (!res?.image_key) {
//       throw new Error("上传成功，但没有返回 image_key");
//     }

//     return res.image_key;
//   } catch (error) {
//     console.error(error.response?.data ?? error);
//     throw error;
//   }
// };

// let eng_reply_image = async (msg_id) => {
//   let temp = '{"image_key":"test content"}'
//   let contentObj = JSON.parse(temp)
//   contentObj.image_key = await get_image_key();
//   let content = JSON.stringify(contentObj);
//   console.log(content);

//   await client.im.v1.message.reply({
//     path: {
//       message_id: msg_id,
//     },
//     data: {
//       content: content,
//       msg_type: 'image',
//       reply_in_thread: true
//       // uuid: '选填，每次调用前请更换，如a0d69e20-1dd1-458b-k525-dfeca4015204',
//     },
//   },
//     // Lark.withTenantToken("t-g104889mYCHRGW7EYR3X64I6ANYFRNBV74TJNUF2")
//   ).then(res => {
//     // console.log(res);
//     console.log(`模型：${model_name} 图片回复成功 `);
//   }).catch(e => {
//     console.error(JSON.stringify(e.response.data, null, 4));
//   });
// }

// let eng_reply_text = (msg_id, user_msg, reply_msg) => {
//   let temp = '{"text":"test content"}'
//   let contentObj = JSON.parse(temp)
//   contentObj.text = reply_msg;
//   let content = JSON.stringify(contentObj);

//   client.im.v1.message.reply({
//     path: {
//       message_id: msg_id,
//     },
//     data: {
//       content: content,
//       msg_type: 'text',
//       reply_in_thread: true
//       // uuid: '选填，每次调用前请更换，如a0d69e20-1dd1-458b-k525-dfeca4015204',
//     },
//   },
//     // Lark.withTenantToken("t-g104889mYCHRGW7EYR3X64I6ANYFRNBV74TJNUF2")
//   ).then(res => {
//     // console.log(res);
//     console.log(`模型：${model_name} 文本回复成功 `);

//   }).catch(e => {
//     console.error(JSON.stringify(e.response.data, null, 4));
//   });
// }






// // OpenAI

// // let ai_reply = response.choices[0].message.content
