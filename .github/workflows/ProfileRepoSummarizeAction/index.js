const core = require('@actions/core');
const github = require('@actions/github');

class CommunityProfile {
  constructor(name, description, creators, imageUrl, isInstalled) {
    this.name = name;
    this.description = description;
    this.creators = creators;
    this.imageUrl = imageUrl;
    this.isInstalled = isInstalled;
  }
}

(async () => {
  try {
    const githubToken = process.env['token'];
    console.log(`token: ${githubToken}`);
    // Get the JSON webhook payload for the event that triggered the workflow
    const context = JSON.stringify(github.context, undefined, 2);
    console.log(`The context:\n\n${context}`);
  
    const client = github.getOctokit(githubToken);
    console.log('created client (octokit)');

    let org = github.context.repository.owner.name;
    console.log(`org: ${org}`);
    let repoName = github.context.repository.name;
    console.log(`repoName: ${repoName}`);
  
    const profiles = await client.rest.repos.getContent(org, repoName, "CustomProfiles");
  
    console.log(`client.rest.repos.getContent() returned:\n\n${JSON.stringify(profiles, undefined, 2)}`);
  
    // // loop through available profiles
    // for (let index = 0; index < profiles.data.length; index++) {
    //   let profile = profiles.data.at(index)
  
    //   if (profile.type != "dir")
    //     continue;
  
    //   let name = profile.name
    // }
  
    // for (const profile in profiles.data) {
    //   if (Object.hasOwnProperty.call(profiles.data, profiles)) {
    //     const element = profiles.data[profiles];
    //     console.log("a");
    //   }
    // }
  } catch (error) {
    core.setFailed(error.message);
  }
})();
