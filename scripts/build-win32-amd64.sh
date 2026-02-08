echo "Building for Win32 - AMD64"
./scripts/build-client.sh
cd client
npx electron-forge package --platform=win32 --arch=x64
cd ..
mkdir ./out 2> /dev/null
mv ./client/out/mynotes-win32-x64 ./out/win32-amd64
