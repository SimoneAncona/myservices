echo "Building client"
cd client
npm run build
npm install --save-dev electron@latest
npm install --save-dev @electron-forge/cli
npm install --save-dev @electron-forge/maker-zip