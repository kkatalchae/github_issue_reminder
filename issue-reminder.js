import {Octokit} from "octokit";

const octokit = new Octokit({
     auth: process.env.GITHUB_TOKEN
});

const response = await octokit.request("GET /repos/{owner}/{repo}/issues", {
    owner: "kkatalchae",
    repo: "github_issue_reminder",
    state: "open",

});

const issues = response?.data ?? [];

for (const issue of issues) {

    console.log(
        `
        ${issue?.title ?? '이슈 제목'} ${issue?.created_at ?? '생성일자'}

        ${issue?.assignees?.length === 0 ? '담당자 지정이 필요합니다' : ''}
        `
    )
}

