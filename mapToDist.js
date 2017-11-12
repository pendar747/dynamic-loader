const path = require('path');
const browserEnv = require('browser-env');

browserEnv();

const givenPath = process.argv[2];

if (!givenPath) {
    throw new Error('No path given.');
}

const absolutePath = path.resolve(givenPath);

const sections = absolutePath.split(path.sep)
    .map(sec => {
        return sec === 'src' ? 'dist' : sec;
    });

const ext = path.extname(absolutePath);
if (ext === '.ts') {
    sections[sections.length - 1] = 
        path.basename(absolutePath).replace(ext, '.js');
}

const newPath = sections.join(path.sep);

process.argv[2] = newPath;

require('ava/profile.js');
