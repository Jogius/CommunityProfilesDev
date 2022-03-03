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
      console.log(`aboutFilePath: ${aboutFilePath}`);

      const aboutFileContent = await client.rest.repos.getContent({
        owner,
        repo,
        path: aboutFilePath,
      });
      console.log(`aboutFileContent: ${aboutFileContent}`);
      
      const aboutFile = JSON.parse(Buffer.from(aboutFileContent.data.content, aboutFileContent.data.encoding).toString());
      console.log(aboutFileContent.data.content);
      console.log(Buffer.from(aboutFileContent.data.content, aboutFileContent.data.encoding).toString());
      console.log(aboutFile.Authors);
      console.log(aboutFile.Description);
      
      // profiles.push(new CommunityProfile(el.name, description, creators, imageUrl));
    });

  } catch (error) {
    core.setFailed(error.message);
  }
})();
