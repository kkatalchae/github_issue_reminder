import {Octokit} from "octokit";
import {WebClient} from "@slack/web-api";

// api 사용을 위한 초기화 작
const github_token = process.env.GIT_AUTH_TOKEN
const slack_api_token = process.env.SLACK_API_TOKEN;
const slack_web_client = new WebClient(slack_api_token);
const octokit = new Octokit({
    auth: github_token
});

// TODO 외부에서 설정할 수 있도록 수정
// 설정값
const posting_channel_name = '일반';
const max_showing_count = 5;
const owner = 'kkatalchae'
const repo_name = 'github_issue_reminder'

// 내부 변수
let slack_channels;
let posting_channel_id;
let reminder_text = '';


/**
 * 깃허브 이슈 리스트 가져오기
 * @param owner 깃허브 오너
 * @param repo_name 저장소 이름
 */
async function get_github_issue_list(owner, repo_name) {
    console.log("get_github_issue_list", github_token, slack_api_token);
    try {
        const response = await octokit.request("GET /repos/{owner}/{repo}/issues", {
            owner: owner,
            repo: repo_name,
            state: "open",
        });

        const github_issue_list = response?.data ?? [];
        // TODO 이슈 리스트 정렬
//          console.log("github_issue_list", github_issue_list);

        make_reminder_text(github_issue_list);
    } catch (error) {
        console.error(error);
    }
}

/**
 * 가져온 깃허브 이슈 리스트로 리마인더 내용 만들기
 * @param github_issue_list 깃허브 이슈 리스트
 */
function make_reminder_text(github_issue_list) {
//     console.log("make_reminder_text")

    if (!!github_issue_list) {
        let issue_count = 0;
        for (const issue of github_issue_list) {

            const url = issue?.url;
            const title = issue?.title;
            const issue_number = issue?.number;
            const assignee = issue?.assignee;
            const created_at = issue?.created_at?.substring(0, 10);
//            const label = issue?.label;

            // 이슈에 대한 리포팅 문구 추가
            reminder_text +=
                `[#${issue_number}] <${url}|${title}> (${!!assignee ? assignee?.login : '담당자 지정이 필요합니다'}) ${created_at}`

            // 리포팅한 이슈 개수 증가
            issue_count++;

            // 이슈가 많을 경우 개수로 노티
            if (issue_count > max_showing_count) {
                reminder_text += ` 외 ${github_issue_list.length - issue_count}건의 이슈가 있습니다.`
                break;
            } else {
                reminder_text += '\n'
            }

        }
    }
}


/**
 * 메시지를 보낼 슬랙 채널 찾기
 */
async function find_slack_channel() {
//    console.log("find_slack_channel");
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

//          console.log("find_slack_channel", slack_channels, posting_channel_id);
    } catch (error) {
        console.error(error);
    }
}

/**
 * 슬랙 메시지 보내기
 * @param channel_id 슬랙 채널 ID
 * @param message_text 메시지 본문
 */
async function post_slack_message(channel_id, message_text) {

//    console.log("post_slack_message", channel_id, message_text);
    if (!!channel_id) {
        try {
            const slack_response = await slack_web_client.chat.postMessage({
                text: message_text,
                channel: channel_id,
                mrkdwn: true,
            });

//            console.log("post_slack_messsage", slack_response);
        } catch (error) {
            console.error(error);
        }
    }
}

get_github_issue_list(owner, repo_name).then(() => {
    find_slack_channel().then(() => {
        post_slack_message(posting_channel_id, reminder_text);
    })
})
