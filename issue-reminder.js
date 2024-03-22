import {Octokit} from "octokit";
import { WebClient } from "@slack/web-api";

// api 사용을 위한 초기화 작
const octokit = new Octokit({
     auth: process.env.GITHUB_TOKEN
});
const slack_api_token = process.env.SLACK_API_TOKEN;
const slack_web_client = new WebClient(slack_api_token);

const posting_channel_name = '일반'
let slack_channels;
let github_issue_list;
let posting_channel_id;

//const response = await octokit.request("GET /repos/{owner}/{repo}/issues", {
//    owner: "kkatalchae",
//    repo: "github_issue_reminder",
//    state: "open",
//
//});
//
// github_issue_list = response?.data ?? [];
//
//for (const issue of issues) {
//
//    console.log(
//        `
//        ${issue?.title ?? '이슈 제목'} ${issue?.created_at ?? '생성일자'}
//
//        ${issue?.assignees?.length === 0 ? '담당자 지정이 필요합니다' : ''}
//        `
//    )
//}

// 슬랙으로 메시지 보내기

async function find_channel() {
     try {
          const response = await slack_web_client.conversations.list({
               types: "public_channel"
          })

          slack_channels = response?.channels;

          for (const channel of slack_channels) {
	         if (channel.name === posting_channel_name) {
                   posting_channel_id = channel.id;
                   break;
              }
          }
     } catch (error) {
          console.error(error);
     }
}

async function post_slack_message() {
     if (!!posting_channel_id) {
          try {
               const slack_response = await slack_web_client.chat.postMessage({
                    text: '테스트 메시지',
                    channel: posting_channel_id,
               });
          } catch (error) {
               console.error(error);
          }
     }
}

find_channel().then(() => {
     post_slack_message();
})




