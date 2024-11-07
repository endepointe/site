

## Read ELF:

```bash
remnux@remnux:~$ readelf -h GoCrackMe2
ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00 
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              EXEC (Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x467040
  Start of program headers:          64 (bytes into file)
  Start of section headers:          1323832 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)
  Size of program headers:           56 (bytes)
  Number of program headers:         6
  Size of section headers:           64 (bytes)
  Number of section headers:         14
  Section header string table index: 13
```

## Initial Runs

```bash
remnux@remnux:~$ ./GoCrackMe2
flag{57fc4d2324

remnux@remnux:~$ ./GoCrackMe2
flag{f75087857fc4d2324

remnux@remnux:~$ ./GoCrackMe2
flag{57fc4d2324

remnux@remnux:~$ ./GoCrackMe2
flag{f75087857fc4d2324

remnux@remnux:~$ ./GoCrackMe2
flag{57fc4d2324

remnux@remnux:~$ ./GoCrackMe2
flag{

remnux@remnux:~$ ./GoCrackMe2
flag{f750878

remnux@remnux:~$ ./GoCrackMe2
flag{57fc4d2324f390751}
```

For future reference, here is a script to run a binary a specified amoutn of times:

```python
import sys
import subprocess

def main():
    if len(sys.argv) != 3:
        print("Usage: python run_binary.py <binary_path> <n>")
        sys.exit(1)

    binary_path = sys.argv[1]
    try:
        n = int(sys.argv[2])
    except ValueError:
        print("Please provide an integer value for n.")
        sys.exit(1)

    for i in range(n):
        result = subprocess.run([binary_path], capture_output=True, text=True)
        print(result.stdout)

if __name__ == "__main__":
    main()
```

We get parts of a potential flag which leads to the impression that if the binary is 
executed enough times, the flag components would be produced. Yet, when ran enough times, 
there is still a portion of the flag that is dynamically produced.

Lets jump into the binary and see what is going on. I used ghidra and a go analyzer: 

    insert url to analyzer 

As I go through any code, it is helpful to look for known values in all their forms:

```python
>>> flag = "flag{"
>>> v = [hex(ord(c)) for c in flag]
>>> v
['0x66', '0x6c', '0x61', '0x67', '0x7b']
>>> a = "0x666c61677b"
>>> h = a[2:]
>>> h
'666c61677b'
>>> letters = [bytes.fromhex(h[i:i+2]) for i in range(0,len(h),2)]
>>> letters
[b'f', b'l', b'a', b'g', b'{']
>>>
# use the letters one liner to read values we come across in the disassembly
```

Using Ghidra, scrolling through `main.main`, you will come across the following loop:
```go
for (lVar8 = 0; lVar8 < lVar4; lVar8 = lVar8 + 1) {
        /* /app/src/GoCrackMe2/GoCrackMe2.go:17 */
        /* /app/src/GoCrackMe2/GoCrackMe2.go:18 */
*(byte *)(extraout_RAX_00 + lVar8) = *(byte *)(lVar2 + lVar8) ^ 0x6d;
        /* /app/src/GoCrackMe2/GoCrackMe2.go:17 */
}
```

The corresponding assembly:
```asm
                     /app/src/GoCrackMe2/GoCrackMe2.go:17
                     LAB_00488316                                    XREF[1]:     00488327(j)  
00488316 0f b6 34 1a     MOVZX      ESI=>local_242, byte ptr [RDX + RBX*0x1]
                     /app/src/GoCrackMe2/GoCrackMe2.go:18
0048831a 83 f6 6d        XOR        ESI, 0x6d
0048831d 40 88 34 18     MOV        byte ptr [RAX + RBX*0x1], SIL
                     /app/src/GoCrackMe2/GoCrackMe2.go:17
00488321 48 ff c3        INC        RBX
                     LAB_00488324                                    XREF[1]:     004881cd(j)  
00488324 48 39 cb        CMP        RBX, RCX
00488327 7c ed           JL         LAB_00488316
00488329 e9 a4 fe        JMP        LAB_004881d2
```

Let's jump into gdb(GEF) to see what is happening at the XOR.

Set the entry point address to 0x467040:

```bash
remnux@remnux:~$ gdb -q GoCrackMe2
GEF for linux ready, type `gef' to start, `gef config' to configure
93 commands loaded and 5 functions added for GDB 9.2 in 0.00ms using Python engine 3.8
Reading symbols from GoCrackMe2...
(No debugging symbols found in GoCrackMe2)
gef➤  b *0x467040
Breakpoint 1 at 0x467040
gef➤  r
Starting program: /home/remnux/GoCrackMe2 

Breakpoint 1, 0x0000000000467040 in ?? ()

[ Legend: Modified register | Code | Heap | Stack | String ]

... rest of gef output ...
```

Set the next breakpoint at ESI within the loop from the assembly where the XOR occurs:

```bash
gef➤  b *0x488316
Breakpoint 2 at 0x488316
gef➤  c
Continuing.
[New LWP 2802]
[New LWP 2803]
[New LWP 2804]
[New LWP 2805]

Thread 1 "GoCrackMe2" hit Breakpoint 2, 0x0000000000488316 in ?? ()

[ Legend: Modified register | Code | Heap | Stack | String ]
─────────────────────────────────────────────────────────────────────────────────── registers ────
$rax   : 0x000000c000012100  →  0x0000000000000000
$rbx   : 0x0               
$rcx   : 0xa               
$rdx   : 0x000000c00007ad06  →  0x5e5f09590e0b5a58
$rsp   : 0x000000c00007acc0  →  0x180581d0fd09f850
$rbp   : 0x000000c00007af40  →  0x000000c00007afd0  →  0x0000000000000000
$rsi   : 0x1               
$rdi   : 0x0               
$rip   : 0x0000000000488316  →   movzx esi, BYTE PTR [rdx+rbx*1]
$r8    : 0x0000000000491240  →   add DWORD PTR [rax], eax
$r9    : 0x6d01            
$r10   : 0x00007ffff7fc41a8  →  0x0000000000000000
$r11   : 0x0               
$r12   : 0x000000c000012100  →  0x0000000000000000
$r13   : 0x0               
$r14   : 0x000000c0000061c0  →  0x000000c00007a000  →  0x000000c00007b000  →  0x000000c00007c000  →  0x000000c00007d000  →  0x0000000000000000
$r15   : 0x10              
$eflags: [zero CARRY PARITY ADJUST SIGN trap INTERRUPT direction overflow resume virtualx86 identification]
$cs: 0x33 $ss: 0x2b $ds: 0x00 $es: 0x00 $fs: 0x00 $gs: 0x00 
─────────────────────────────────────────────────────────────────────────────────────── stack ────
0x000000c00007acc0│+0x0000: 0x180581d0fd09f850	 ← $rsp
0x000000c00007acc8│+0x0008: 0x00000000004193f6  →   mov rcx, QWORD PTR [rip+0x18a7ab]        # 0x5a3ba8
0x000000c00007acd0│+0x0010: 0x00000000005a3b40  →  0x0000000000000064 ("d"?)
0x000000c00007acd8│+0x0018: 0x000000c000042560  →  0x000000c0000425d0  →  0x0000000000000000
0x000000c00007ace0│+0x0020: 0x000000000040d6fb  →   mov rax, QWORD PTR [rsp+0x30]
0x000000c00007ace8│+0x0028: 0x5b545d0e095cb108
0x000000c00007acf0│+0x0030: 0x5a555d585a0b5b5b
0x000000c00007acf8│+0x0038: 0x5c585a5d545e0b55
───────────────────────────────────────────────────────────────────────────────── code:x86:64 ────
     0x48830d                  add    rsp, 0x280
     0x488314                  pop    rbp
     0x488315                  ret    
●→   0x488316                  movzx  esi, BYTE PTR [rdx+rbx*1]
     0x48831a                  xor    esi, 0x6d
     0x48831d                  mov    BYTE PTR [rax+rbx*1], sil
     0x488321                  inc    rbx
     0x488324                  cmp    rbx, rcx
     0x488327                  jl     0x488316
───────────────────────────────────────────────────────────────────────────────────── threads ────
[#0] Id 1, Name: "GoCrackMe2", stopped 0x488316 in ?? (), reason: BREAKPOINT
[#1] Id 2, Name: "GoCrackMe2", stopped 0x467217 in ?? (), reason: BREAKPOINT
[#2] Id 3, Name: "GoCrackMe2", stopped 0x4677e3 in ?? (), reason: BREAKPOINT
[#3] Id 4, Name: "GoCrackMe2", stopped 0x4677e3 in ?? (), reason: BREAKPOINT
[#4] Id 5, Name: "GoCrackMe2", stopped 0x4677e3 in ?? (), reason: BREAKPOINT
─────────────────────────────────────────────────────────────────────────────────────── trace ────
[#0] 0x488316 → movzx esi, BYTE PTR [rdx+rbx*1]
gef➤  ni
0x000000000048831a in ?? ()

[ Legend: Modified register | Code | Heap | Stack | String ]
─────────────────────────────────────────────────────────────────────────────────── registers ────
$rax   : 0x000000c000012100  →  0x0000000000000000
$rbx   : 0x0               
$rcx   : 0xa               
$rdx   : 0x000000c00007ad06  →  0x5e5f09590e0b5a58
$rsp   : 0x000000c00007acc0  →  0x180581d0fd09f850
$rbp   : 0x000000c00007af40  →  0x000000c00007afd0  →  0x0000000000000000
$rsi   : 0x58              
$rdi   : 0x0               
$rip   : 0x000000000048831a  →   xor esi, 0x6d
$r8    : 0x0000000000491240  →   add DWORD PTR [rax], eax
$r9    : 0x6d01            
$r10   : 0x00007ffff7fc41a8  →  0x0000000000000000
$r11   : 0x0               
$r12   : 0x000000c000012100  →  0x0000000000000000
$r13   : 0x0               
$r14   : 0x000000c0000061c0  →  0x000000c00007a000  →  0x000000c00007b000  →  0x000000c00007c000  →  
                                                                0x000000c00007d000  →  0x0000000000000000
$r15   : 0x10              
$eflags: [zero CARRY PARITY ADJUST SIGN trap INTERRUPT direction overflow resume virtualx86 identification]
$cs: 0x33 $ss: 0x2b $ds: 0x00 $es: 0x00 $fs: 0x00 $gs: 0x00 
─────────────────────────────────────────────────────────────────────────────────────── stack ────
0x000000c00007acc0│+0x0000: 0x180581d0fd09f850	 ← $rsp
0x000000c00007acc8│+0x0008: 0x00000000004193f6  →   mov rcx, QWORD PTR [rip+0x18a7ab]        # 0x5a3ba8
0x000000c00007acd0│+0x0010: 0x00000000005a3b40  →  0x0000000000000064 ("d"?)
0x000000c00007acd8│+0x0018: 0x000000c000042560  →  0x000000c0000425d0  →  0x0000000000000000
0x000000c00007ace0│+0x0020: 0x000000000040d6fb  →   mov rax, QWORD PTR [rsp+0x30]
0x000000c00007ace8│+0x0028: 0x5b545d0e095cb108
0x000000c00007acf0│+0x0030: 0x5a555d585a0b5b5b
0x000000c00007acf8│+0x0038: 0x5c585a5d545e0b55
───────────────────────────────────────────────────────────────────────────────── code:x86:64 ────
     0x488314                  pop    rbp
     0x488315                  ret    
●    0x488316                  movzx  esi, BYTE PTR [rdx+rbx*1]
 →   0x48831a                  xor    esi, 0x6d
     0x48831d                  mov    BYTE PTR [rax+rbx*1], sil
     0x488321                  inc    rbx
     0x488324                  cmp    rbx, rcx
     0x488327                  jl     0x488316
     0x488329                  jmp    0x4881d2
───────────────────────────────────────────────────────────────────────────────────── threads ────
[#0] Id 1, Name: "GoCrackMe2", stopped 0x48831a in ?? (), reason: SINGLE STEP
[#1] Id 2, Name: "GoCrackMe2", stopped 0x467217 in ?? (), reason: SINGLE STEP
[#2] Id 3, Name: "GoCrackMe2", stopped 0x4677e3 in ?? (), reason: SINGLE STEP
[#3] Id 4, Name: "GoCrackMe2", stopped 0x4677e3 in ?? (), reason: SINGLE STEP
[#4] Id 5, Name: "GoCrackMe2", stopped 0x4677e3 in ?? (), reason: SINGLE STEP
─────────────────────────────────────────────────────────────────────────────────────── trace ────
[#0] 0x48831a → xor esi, 0x6d
──────────────────────────────────────────────────────────────────────────────────────────────────

-- continue a few more times and in a new gdb session --

gef➤  
Continuing.

Thread 4 "GoCrackMe2" hit Breakpoint 1, 0x000000000048831a in ?? ()

[ Legend: Modified register | Code | Heap | Stack | String ]
──────────────────────────────────────────────────────────────────────────────────── registers ────
$rax   : 0x000000c00019201a  →  0x3735000067616c66 ("flag"?)
$rbx   : 0x4               
$rcx   : 0x5               
$rdx   : 0x000000c00018ad01  →  0x0b5a58160a0c010b
$rsp   : 0x000000c00018acc0  →  0x0000000000494f40  →   or BYTE PTR [rax], al
$rbp   : 0x000000c00018af40  →  0x000000c00018afd0  →  0x0000000000000000
$rsi   : 0x16              
$rdi   : 0x1               
$rip   : 0x000000000048831a  →   xor esi, 0x6d
$r8    : 0x0000000000491240  →   add DWORD PTR [rax], eax
$r9    : 0x1               
$r10   : 0xa               
$r11   : 0xf               
$r12   : 0x000000c000192010  →  "57fc4d2324flag"
$r13   : 0x0               
$r14   : 0x000000c0000061c0  →  0x000000c00018a000  →  0x000000c00018b000  →  0x000000c00018c000  →  
                                                                0x000000c00018d000  →  0x0000000000000000
$r15   : 0x2               
$eflags: [zero CARRY PARITY ADJUST SIGN trap INTERRUPT direction overflow resume virtualx86 identification]
$cs: 0x33 $ss: 0x2b $ds: 0x00 $es: 0x00 $fs: 0x00 $gs: 0x00 
──────────────────────────────────────────────────────────────────────────────────────── stack ────
0x000000c00018acc0│+0x0000: 0x0000000000494f40  →   or BYTE PTR [rax], al	 ← $rsp
0x000000c00018acc8│+0x0008: 0x000000c00018ae60  →  0x0000000000000001
0x000000c00018acd0│+0x0010: 0x0000000000000002
0x000000c00018acd8│+0x0018: 0x000000c00018ad60  →  0x0000000000000000
0x000000c00018ace0│+0x0020: 0x000000000040d6fb  →   mov rax, QWORD PTR [rsp+0x30]
0x000000c00018ace8│+0x0028: 0x5b545d0e095cbf18
0x000000c00018acf0│+0x0030: 0x5a555d585a0b5b5b
0x000000c00018acf8│+0x0038: 0x5c585a5d545e0b55
────────────────────────────────────────────────────────────────────────────────── code:x86:64 ────
     0x488314                  pop    rbp
     0x488315                  ret    
     0x488316                  movzx  esi, BYTE PTR [rdx+rbx*1]
●→   0x48831a                  xor    esi, 0x6d
     0x48831d                  mov    BYTE PTR [rax+rbx*1], sil
     0x488321                  inc    rbx
     0x488324                  cmp    rbx, rcx
     0x488327                  jl     0x488316
     0x488329                  jmp    0x4881d2
────────────────────────────────────────────────────────────────────────────────────── threads ────
[#0] Id 1, Name: "GoCrackMe2", stopped 0x4677e3 in ?? (), reason: BREAKPOINT
[#1] Id 2, Name: "GoCrackMe2", stopped 0x467217 in ?? (), reason: BREAKPOINT
[#2] Id 3, Name: "GoCrackMe2", stopped 0x4677e3 in ?? (), reason: BREAKPOINT
[#3] Id 4, Name: "GoCrackMe2", stopped 0x48831a in ?? (), reason: BREAKPOINT
[#4] Id 5, Name: "GoCrackMe2", stopped 0x4677e3 in ?? (), reason: BREAKPOINT
[#5] Id 6, Name: "GoCrackMe2", stopped 0x4677e3 in ?? (), reason: BREAKPOINT
──────────────────────────────────────────────────────────────────────────────────────── trace ────
[#0] 0x48831a → xor esi, 0x6d
[#1] 0x494f40 → or BYTE PTR [rax], al
[#2] 0xc00018ae60 → add DWORD PTR [rax], eax
───────────────────────────────────────────────────────────────────────────────────────────────────
gef➤  
Continuing.
flag{57fc4d2324
[LWP 3849 exited]
[LWP 3847 exited]
[LWP 3846 exited]
[LWP 3845 exited]
[LWP 3841 exited]
[Inferior 1 (process 3841) exited normally]
```

At r12, a familiar output is held at this register which we know is output at random. This is where 
the flag is constructed and the rest of the flag may be held on one of these registers.

The rax register also gives the flag, in little-endian, indicating that the rest of the flag is 
read in the same direction.

The value in rdx, when XOR'd with 0x6d, produces the string: `flag{57f` .

Assuming you have ran the binary enough times, you will get a set of values to construct 24 of the 
32 flag characters. Given that this is little-endian, the remaining flag belongs in the front of 
this string:

```bash
a = 57fc4d2324
b = f750878
c = f390751
d = 66f75087 remaining 8 characters
flag = set containing {abcd}
```

We are looking for any locations where we can get 8 characters, most likely from register values
because I do not see any file or memory writes.

The following five values do not change during the XOR stage. XOR these values for 
possible flag:

```bash
$rdx   : 0x000000c00018ad06  →  0x5e5f09590e0b5a58
$rsp   : 0x000000c00018acc0  →  0x180589de37d6a9ab
0x000000c00010ace8│+0x0028: 0x5b545d0e095cba68
0x000000c00010acf0│+0x0030: 0x5a555d585a0b5b5b
0x000000c00010acf8│+0x0038: 0x5c585a5d545e0b55
```

```python
hex_values = [
    0x5b545d0e095cba68,
    0x5a555d585a0b5b5b,
    0x5c585a5d545e0b55,
    0x5e5f09590e0b5a58,
    0x180589de37d6a9ab,
]

def process_hex_values(hex_values):
    results = []
    for hex_value in hex_values:
        bytes_list = [(hex_value >> (8 * i)) & 0xFF for i in range(8)][::-1]

        xored_chars = [chr(byte ^ 0x6d) for byte in bytes_list]

        results.append(xored_chars)
    
    return results

resulting_values = process_hex_values(hex_values)
for idx, values in enumerate(resulting_values):
    print(f"Result for hex string {hex(hex_values[idx])}:")
    print("".join(values)[::-1]) #reverse for little endian
```

