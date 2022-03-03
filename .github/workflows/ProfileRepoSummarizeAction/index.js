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

    const profiles = [];
  
    // loop through available profiles
    customProfilesRepoContent.data.forEach(async (profile) => {
      // return if element not directory
      if (profile.type != 'dir') return;

      const profileContent = await client.rest.repos.getContent({
        owner,
        repo,
        path: profile.path,
      });
      console.log(`profile ${profile.path} data:\n\n${JSON.stringify(profileContent.data, undefined, 2)}`);

      const aboutFilePath = (profileContent.data.find((file) => file.name == 'about.json'))?.path;
      const aboutFile = await client.rest.repos.getContent({
        owner,
        repo,
        path: aboutFilePath,
      });
      console.log(aboutFile.data.content);
      console.log(Buffer.from(aboutFile.data.content, aboutFile.data.encoding).toString());

      // profiles.push(new CommunityProfile(el.name, description, creators, imageUrl));
    });

  } catch (error) {
    core.setFailed(error.message);
  }
})();
