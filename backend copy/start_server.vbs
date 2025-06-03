Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c node """ & WScript.ScriptFullName & "\..\server.js""", 0, False
