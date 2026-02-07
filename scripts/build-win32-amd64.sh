echo "Building for Win32 - AMD64"
# ./scripts/build-client.sh
# cd client
# npx electron-forge package --platform=win32 --arch=x64
# cd ..
# mkdir ./out 2> /dev/null
# mv ./client/out/mynotes-win32-x64 ./out/win32-amd64
# mv ./out/win32-amd64/mynotes.exe ./out/win32-amd64/ui.exe
vs=$("C:/Program Files (x86)/Microsoft Visual Studio/Installer/vswhere.exe" -property installationPath)
echo "Found VS at $vs"
cwd=$(pwd)
cd "$vs"
echo "cl" | "$vs/Common7/Tools/VsDevCmd.bat"