echo "Building for Linux - AMD64"
./scripts/build-client.sh
cd client
npx electron-forge package --platform=linux --arch=x64
cd ..
mkdir ./out 2> /dev/null
mv ./client/out/mynotes-linux-x64 ./out/linux-amd64