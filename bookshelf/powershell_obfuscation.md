# Start

Once **Script Block Logging** is enabled, you can use **Event Viewer** to monitor PowerShell activities, including the execution of obfuscated scripts. Here’s a guide on **where and what to look for** in Event Viewer:

---

## **Steps to Monitor PowerShell in Event Viewer**

1. **Open Event Viewer**:
   - Press `Windows + R` → Type `eventvwr` → Press `Enter`

2. **Navigate to PowerShell Logs**:
   - In the left panel, go to:
     ```
     Applications and Services Logs 
         -> Microsoft 
             -> Windows 
                 -> PowerShell 
                     -> Operational
     ```

3. **Enable PowerShell Logs if Necessary**:
   - If the **Operational** log is not enabled, right-click on **Operational** → Select **Enable Log**.

---

## **Events to Look For**

### **1. Event ID 4104 – Script Block Logging**
   - **Description**: This event contains the actual **script blocks** that are being executed.
   - **What to Look For**:
     - You should see **deobfuscated code** if the PowerShell script dynamically generates or executes commands.
     - Look for fragments of the obfuscated content you are working with.
     - If the script uses `Invoke-Expression` (`iex`), this event logs the **final command** that was executed.

   **Example Entry:**
   ```
   Event ID: 4104
   Message: Script block text: 'iex ('{117569}{59212}...')'
   ```

---

### **2. Event ID 4103 – PowerShell Command Invocation**
   - **Description**: This logs the **PowerShell commands** that were invoked.
   - **What to Look For**:
     - This is useful for identifying the individual **steps the script executes**.
     - If the obfuscation involves multiple steps (e.g., decoding strings, running loops), you’ll see them logged here.

   **Example Entry:**
   ```
   Event ID: 4103
   Message: Command invocation: '[char](117569 % 65536)'
   ```

---

### **3. Event ID 400 or 800 – PowerShell Engine Start**
   - **Description**: These events indicate that a PowerShell instance started.
   - **What to Look For**:
     - Confirm if PowerShell is being triggered by your script.
     - Useful to ensure your script is executing as expected.

---
This error occurs because the `ScriptBlockLogging` settings might not exist by default on your system. You can **create the necessary registry paths manually** before applying the logging settings.

Here’s how you can fix it:

---

## **Step 1: Create the Registry Paths Manually**

1. **Open PowerShell as Administrator**.
2. Create the **missing registry paths** using the following commands:

   ```powershell
   New-Item -Path "HKLM:\Software\Policies\Microsoft\Windows\PowerShell" -Force
   New-Item -Path "HKLM:\Software\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging" -Force
   ```

---

## **Step 2: Set the Script Block Logging Properties**

Once the paths are created, try setting the properties again:

```powershell
Set-ItemProperty -Path "HKLM:\Software\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging" -Name "EnableScriptBlockLogging" -Value 1
Set-ItemProperty -Path "HKLM:\Software\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging" -Name "EnableScriptBlockInvocationLogging" -Value 1
```

---

## **Step 3: Verify the Configuration**

Run this command to confirm that the values were set correctly:

```powershell
Get-ItemProperty -Path "HKLM:\Software\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging"
```

---

## **Step 4: (Optional) Create Transcription Logging Path**

If you want transcription logging as well, create the necessary registry keys and paths:

```powershell
New-Item -Path "HKLM:\Software\Policies\Microsoft\Windows\PowerShell\Transcription" -Force
Set-ItemProperty -Path "HKLM:\Software\Policies\Microsoft\Windows\PowerShell\Transcription" -Name "EnableTranscripting" -Value 1
Set-ItemProperty -Path "HKLM:\Software\Policies\Microsoft\Windows\PowerShell\Transcription" -Name "OutputDirectory" -Value "C:\PowerShellLogs"
```

---

## **Step 5: Restart PowerShell**

After setting the values, restart PowerShell to apply the changes.

---

## **Step 6: Run Your Script and Capture Logs**

Now you can run your obfuscated PowerShell script:

```cmd
powershell -ExecutionPolicy Bypass -File C:\Users\vboxuser\Desktop\eco_friendly.ps1
```

---

### **What If You Encounter Further Issues?**

1. Ensure that **UAC (User Account Control)** is not blocking access to registry settings.
2. If you don’t have permissions to modify the registry, use **Regedit**:
   - Open **`regedit`** as Administrator.
   - Navigate to: `HKEY_LOCAL_MACHINE\Software\Policies\Microsoft\Windows\PowerShell`
   - Create the necessary subkeys manually:  
     `ScriptBlockLogging` and `Transcription`.

After following these steps, PowerShell logging should start capturing everything, including deobfuscated content.
## **Searching for Relevant Logs**

1. In the **Operational** log, click **Find** in the right-hand Actions pane.
2. Search for **keywords** like:
   - `Invoke-Expression`
   - `iex`
   - `char`
   - `script block`
   - `flag`

---

## **Exporting the Logs (Optional)**

1. Right-click on the **Operational** log and select **Save All Events As**.
2. Choose **.evtx** format and export it for further analysis (e.g., using PowerShell or another tool).

---

## **Next Steps**

1. Look for **decoded script blocks** in **Event ID 4104** logs.
2. Pay attention to any **dynamic code execution** using `iex`.
3. If a key or flag appears in the logs, you can capture it directly.

---

Let me know if you find anything interesting or need further help!
### **Summary of Steps to Retrieve the Flag**:

1. **Initial Issue Identification**:
   - The original PowerShell script was highly obfuscated.
   - Our attempts to decode it using various methods (PowerShell and Python) resulted in confusing or malformed output.
   - Direct execution of partial `iex` commands caused syntax errors, and the content seemed improperly formatted.

2. **Exploring a New Approach: Logging PowerShell Execution**:
   - We shifted focus from decoding manually to leveraging **Windows' PowerShell ScriptBlock Logging**.
   - This approach allows PowerShell to log executed commands and scripts, revealing hidden content during runtime.

3. **Enabling PowerShell ScriptBlock Logging**:
   - Tried to enable logging via:
     ```powershell
     Set-ItemProperty -Path "HKLM:\Software\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging" -Name "EnableScriptBlockLogging" -Value 1
     ```
   - Encountered an issue: the path didn’t exist. 

4. **Manually Creating Registry Keys**:
   - We created the necessary keys and values in the registry manually:
     - **Key**: `HKLM:\Software\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging`
     - **Value**: `EnableScriptBlockLogging` set to `1`
   - This enabled detailed logging of all PowerShell script execution.

5. **Triggering the Script Execution**:
   - We executed the obfuscated PowerShell script to let it decode itself and leave traces in the event logs.

6. **Using Event Viewer to Search Logs**:
   - Opened **Event Viewer** and navigated to:
     ```
     Applications and Services Logs → Microsoft → Windows → PowerShell → Operational
     ```
   - Searched for **ScriptBlockLogging** events or entries related to the executed script.

7. **Analyzing the Event Logs**:
   - Found the relevant log entries containing the **decoded content** from the obfuscated script.

8. **Extracting the Flag**:
   - Scanned through the decoded output in the logs.
   - Identified the **flag** in the format `flag\{[0-9a-f]{32}\}`.

---

This strategy allowed us to **bypass manual decoding** and leverage **Windows logging tools** to retrieve the decoded content directly. It’s a great reminder that sometimes, letting the system work for us is the fastest way forward! 🎯

Congratulations again! 🎉 If you have other challenges or need further help, I’m here. 😊
