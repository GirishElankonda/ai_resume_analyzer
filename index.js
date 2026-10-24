// This file acts as a wrapper to seamlessly start the backend
// from the root directory. The actual backend codebase has been
// moved into the 'backend_ai' directory.

const path = require('path');
const fs = require('fs');

// Load .env from the root directory if it exists, to preserve
// any environment variables configured on the EC2 instance before the restructure.
if (fs.existsSync(path.join(__dirname, '.env'))) {
    require('dotenv').config({ path: path.join(__dirname, '.env') });
}

// Change the working directory to backend_ai so that it resolves
// uploads and other relative imports correctly.
process.chdir(path.join(__dirname, 'backend_ai'));

// Require the actual backend entry point
require('./index.js');