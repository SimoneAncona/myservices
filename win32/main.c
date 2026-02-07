#include <windows.h>

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow)
{
    LPCSTR exe1 = ".\\ui.exe";
    LPCSTR exe2 = ".\\.venv\\Scripts\\uvicorn.exe main:app";

    STARTUPINFO si1 = { sizeof(si1) };
    PROCESS_INFORMATION pi1;

    STARTUPINFO si2 = { sizeof(si2) };
    PROCESS_INFORMATION pi2;

    if (!CreateProcessA(
        exe1,
        NULL,
        NULL,
        NULL,
        FALSE,
        CREATE_NO_WINDOW,
        NULL,
        NULL,
        &si1,
        &pi1))
    {
    }
    else
    {
        CloseHandle(pi1.hThread);
        CloseHandle(pi1.hProcess);
    }

    if (!CreateProcessA(
        exe2,
        NULL,
        NULL,
        NULL,
        FALSE,
        CREATE_NO_WINDOW,
        NULL,
        NULL,
        &si2,
        &pi2))
    {
    }
    else
    {
        CloseHandle(pi2.hThread);
        CloseHandle(pi2.hProcess);
    }

    while (1)
    {
        Sleep(1000);
    }

    return 0;
}