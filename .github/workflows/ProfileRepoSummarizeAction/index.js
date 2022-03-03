const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

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
      if (aboutFilePath == undefined) return;

      const aboutFileContent = await client.rest.repos.getContent({
        owner,
        repo,
        path: aboutFilePath,
      });
      // console.log(`aboutFileContent: ${JSON.stringify(aboutFileContent, undefined, 2)}`);

      const aboutFile = JSON.parse(Buffer.from(aboutFileContent.data.content, aboutFileContent.data.encoding).toString());
      // console.log(aboutFileContent.data.content);
      // console.log(Buffer.from(aboutFileContent.data.content, aboutFileContent.data.encoding).toString());
      // console.log(aboutFile.Authors);
      // console.log(aboutFile.Description);

      let imageUrl = (profileContent.data.find((file) => file.name.endsWith('.jpg') || file.name.endsWith('.png')))?.download_url;
      // console.log(`imageUrl: ${imageUrl}`);
      
      profiles.push(new CommunityProfile(profile.name, aboutFile.Description, aboutFile.Authors, imageUrl ? imageUrl : ""));
      profiles.push({
        name: profile.name,
        description: aboutFile.Description,
        authors: aboutFile.authors,
        imageUrl: imageUrl ? imageUrl : "",
      });
    });

    fs.writeFile('./profiles.json', JSON.stringify(profiles, undefined, 2), (err) => {
      if (err) {
        core.setFailed(err.message);
        return;
      }
    });

  } catch (error) {
    core.setFailed(error.message);
  }
})();
