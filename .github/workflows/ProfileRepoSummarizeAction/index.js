const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

(async () => {
  try {
    // github api token, passed through environment variables because github secrets didn't work
    const githubToken = process.env['token'];

    const client = github.getOctokit(githubToken);

    const owner = github.context.payload.repository.owner.name;
    const repo = github.context.payload.repository.name;

    // helper function for requesting content from github api
    const getContent = async (path) => {
      return await client.rest.repos.getContent({
        owner,
        repo,
        path,
      });
    };
  
    // get content of the entire 'CommunityProfiles' repository
    const customProfilesRepoContent = await getContent("CustomProfiles");

    const profiles = [];
  
    // loop through available profiles synchronously
    await Promise.all(customProfilesRepoContent.data.map(async (profile) => {
      // return if element not directory
      if (profile.type != 'dir') return;

      // get content of profile folder
      const profileContent = await getContent(profile.path);

      // try finding 'about.json' file path
      const aboutFilePath = (profileContent.data.find((file) => file.name == 'about.json'))?.path;
      if (aboutFilePath == undefined) {
        console.log(`Profile '${profile.name}' has no 'about.json' file. Continuing with next profile...`);
        return;
      }

      // get and parse content of 'about.json' file
      const aboutFileContent = await getContent(aboutFilePath);
      const aboutFile = JSON.parse(Buffer.from(aboutFileContent.data.content, aboutFileContent.data.encoding).toString());

      // try finding 'xxx.profile.json' download url
      const profileUrl = (profileContent.data.find((file) => file.name.endsWith('.profile.json')))?.download_url;
      if (profileUrl == undefined) {
        console.log(`Profile '${profile.name}' has no 'xxx.profile.json' file. Continuing with next profile...`);
        return;
      }

      // try finding image url
      const imageUrl = (profileContent.data.find((file) => file.name.endsWith('.jpg') || file.name.endsWith('.png')))?.download_url;
      if (imageUrl == undefined)
        console.log(`Profile '${profile.name}' has no image ('.jpg' or '.png') file. Ignoring...`)
      
      profiles.push({
        name: profile.name,
        description: aboutFile.Description,
        authors: aboutFile.Authors,
        version: aboutFile.Version,
        imageUrl: imageUrl,
        profileUrl: profileUrl,
      });
    }));

    fs.writeFile('./ProfilesSummary.json', JSON.stringify(profiles, undefined, 2), (err) => {
      if (err) {
        core.setFailed(err.message);
        return;
      }
    });

  } catch (error) {
    core.setFailed(error.message);
  }
})();
