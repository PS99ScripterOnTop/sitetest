const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = 3000;

// 🛑 Store your GitHub token in Replit Secrets (NOT in the code directly)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 
const REPO_OWNER = 'your-username';
const REPO_NAME = 'your-repo';
const FILE_PATH = 'keys.txt';

app.use(bodyParser.json());

app.post('/upload-key', async (req, res) => {
    const { newKey } = req.body;

    if (!newKey) {
        return res.status(400).send('Missing key');
    }

    try {
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

        // Get existing keys.txt content
        const getResponse = await axios.get(url, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        const oldContent = Buffer.from(getResponse.data.content, 'base64').toString('utf8');
        const newContent = `${oldContent.trim()}\n${newKey}`;

        // Upload updated keys.txt
        const uploadResponse = await axios.put(url, {
            message: 'Add new key',
            content: Buffer.from(newContent).toString('base64'),
            sha: getResponse.data.sha
        }, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        res.send('✅ Key uploaded successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error uploading key');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
