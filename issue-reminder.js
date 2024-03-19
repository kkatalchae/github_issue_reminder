import { Octokit } from "octokit";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
})

const issues = octokit.rest.issues.listForRepo({
    owner: "kkatalchae",
    repo: "github_issue_reminder",
    per_page: 10,
})

