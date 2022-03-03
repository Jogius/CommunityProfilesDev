const core = require('@actions/core');
const github = require('@actions/github');

class CommunityProfile {
  constructor(name, description, creators, imageUrl) {
    this.name = name;
    this.description = description;
    this.creators = creators;
    this.imageUrl = imageUrl;
  }
}

(async () => {
  try {
    const githubToken = process.env['token'];

    const client = github.getOctokit(githubToken);

    let owner = github.context.payload.repository.owner.name;
    let repo = github.context.payload.repository.name;
  
    const customProfilesRepoContent = await client.rest.repos.getContent({
      owner,
      repo,
      path: "CustomProfiles",
    });
  
    // loop through available profiles
    customProfilesRepoContent.data.forEach(async (el) => {
      if (el.type != 'dir') return;

      const profileContent = await client.rest.repos.getContent({
        owner,
        repo,
        path: el.path,
      });
      console.log(`profile ${el.path} data:\n\n${JSON.stringify(profileContent.data, undefined, 2)}`);

    });

  } catch (error) {
    core.setFailed(error.message);
  }
})();
