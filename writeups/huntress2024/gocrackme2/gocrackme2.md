
# GoCrackMe2

Author: @HuskyHacks

Not bad gophers, but that one was the easiest of the three! How will you do against something a little more involved? I wouldn't expect to get any help from debugging symbols on this one...

Archive password: infected

## tl;dr

The following is the reverse engineering of a go binary to obtain the final flag. It assumes
familiarity with elf, gdb(gef), ghidra, and some python. Let's begin!

## What are we dealing with:

```bash
remnux@remnux:~$ file GoCrackMe2
GoCrackMe2: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), statically linked, Go BuildID=ZoJpBG92x8YsXkvYlAu_/U3EHV-7u2vOUwgqGwVrd/34uedjykpiiHm8Z79hII/NZH2W-dBCUwjncxq5v9g, stripped
```

Since it is stripped, we need an entry point to main:

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

Without much else to go on (I ran it through VT later but its not important right now),
let's just run this binary and see what happens:

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

For future reference, here is a script to run a binary a specified amount of times:

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

We get parts of a potential flag which gives the impression that if the binary is 
executed enough times, the flag components will be produced. Yet, when ran enough times, 
there is still a portion of the flag that is dynamically produced.

When I first opened up ghidra to analyze this stripped binary, I was hoping that it would 
be somewhat simple to trace through - I was wrong. After some searching, I found an analyzer
that rebuilds function names as best as it can.

Lets jump into the binary and see what is going on.

Using ghidra and a go analyzer: 

    https://github.com/mooncat-greenpy/Ghidra_GolangAnalyzerExtension


Reminder: as I go through any code, it is helpful to look for known values in all their forms.

Here is some code to help with that:

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

You may want to watch rcx or rbx, or just make a mental note that this holds the loop counter.

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
```

You will have to continue a few more times in a new gdb session:

```bash
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
32 flag characters. 

```bash
a = 57fc4d2324
b = f750878
c = f390751
d = remaining 8 characters
flag = set containing {abcd}
```

We are looking for any locations where we can get 8 characters, most likely from register values
because I do not see any file or memory writes. lVar4 is closely related to the flag and, given 
the while loop, we should watch lVar4 at the end of the loop.

```go
lVar4 = 0;
while( true ) {
    if (4 < lVar4) {
      uVar7 = 0;
      uVar5 = 0;
      lVar4 = 0;
                /* /app/src/GoCrackMe2/GoCrackMe2.go:75 */
      while (lVar4 < 5) {
                /* /app/src/GoCrackMe2/GoCrackMe2.go:92 */
        *(undefined8 *)((long)register0x00000020 + -0x228) = uVar7;
        *(undefined8 *)((long)register0x00000020 + -0x1d0) = uVar5;
                /* /app/src/GoCrackMe2/GoCrackMe2.go:90 */
        *(long *)((long)register0x00000020 + -0x230) = lVar4;
                /* /app/src/GoCrackMe2/GoCrackMe2.go:91 */
        *(undefined8 *)((long)register0x00000020 + -0x290) = 0x48828f;
        runtime.mapaccess2_fast64
                  (&datatype.Map.map[int]string,(undefined *)((long)register0x00000020 + -0xe8),
                   lVar4);
        if ((char)(undefined *)((long)register0x00000020 + -0xe8) == '\0') {
                /* /app/src/GoCrackMe2/GoCrackMe2.go:92 */
          uVar7 = *(undefined8 *)((long)register0x00000020 + -0x228);
          uVar5 = *(undefined8 *)((long)register0x00000020 + -0x1d0);
                /* /app/src/GoCrackMe2/GoCrackMe2.go:91 */
        }
        else {
          uVar5 = *extraout_RAX_04;
          uVar3 = extraout_RAX_04[1];
                /* /app/src/GoCrackMe2/GoCrackMe2.go:92 */
          uVar7 = *(undefined8 *)((long)register0x00000020 + -0x1d0);
          *(undefined8 *)((long)register0x00000020 + -0x290) = 0x4882bd;
          runtime.concatstring2
                    (0,uVar7,*(undefined8 *)((long)register0x00000020 + -0x228),uVar5,uVar3);
          uVar5 = extraout_RAX_05;
        }
                /* /app/src/GoCrackMe2/GoCrackMe2.go:90 */
        lVar4 = *(long *)((long)register0x00000020 + -0x230) + 1;
                /* /app/src/GoCrackMe2/GoCrackMe2.go:92 */
                /* /app/src/GoCrackMe2/GoCrackMe2.go:90 */
      }
                /* /app/src/GoCrackMe2/GoCrackMe2.go:96 */
      *(undefined (*) [16])((long)register0x00000020 + -0x1c8) = in_XMM15;
      *(undefined8 *)((long)register0x00000020 + -0x290) = 0x4882d3;
      runtime.convTstring(uVar5,uVar7);
      *(runtime._type **)((long)register0x00000020 + -0x1c8) = &datatype.String.string;
      *(undefined8 *)((long)register0x00000020 + -0x1c0) = extraout_RAX_06;
                /* /usr/local/go/src/fmt/print.go:314 */
      *(undefined8 *)((long)register0x00000020 + -0x290) = 0x48830d;
      fmt.Fprintln(&PTR_datatype.Interface.io.Writer_004ca1e8,DAT_005432d0,
                   (undefined *)((long)register0x00000020 + -0x1c8),1,1);
                /* /app/src/GoCrackMe2/GoCrackMe2.go:97 */
      return;
    }
    uVar1 = puVar6[3];
    unaff_RBX = puVar6[1];
                /* /app/src/GoCrackMe2/GoCrackMe2.go:77 */
    if (4 < uVar1) break;
                /* /app/src/GoCrackMe2/GoCrackMe2.go:75 */
    *(undefined8 *)((long)register0x00000020 + -0x10) = *puVar6;
    *(long *)((long)register0x00000020 + -0x220) = unaff_RBX;
    *(long *)((long)register0x00000020 + -0x1e0) = lVar4;
    *(undefined8 **)((long)register0x00000020 + -0x18) = puVar6;
    *(ulong *)((long)register0x00000020 + -0x1e8) = uVar1;
                /* /app/src/GoCrackMe2/GoCrackMe2.go:77 */
                /* /app/src/GoCrackMe2/GoCrackMe2.go:11 */
    *(double *)((long)register0x00000020 + -0x1f0) =
         *(double *)((long)register0x00000020 + uVar1 * 8 + -0x218) / 100.0;
    *(undefined8 *)((long)register0x00000020 + -0x290) = 0x488196;
    math/rand.Float64();
                /* /app/src/GoCrackMe2/GoCrackMe2.go:80 */
    if (extraout_XMM0_Qa < *(double *)((long)register0x00000020 + -0x1f0)) {
                /* /app/src/GoCrackMe2/GoCrackMe2.go:16 */
      *(undefined8 *)((long)register0x00000020 + -0x290) = 0x4881be;
      runtime.makeslice(&datatype.Uint8.uint8,*(undefined8 *)((long)register0x00000020 + -0x220)
                        ,*(undefined8 *)((long)register0x00000020 + -0x220));
                /* /app/src/GoCrackMe2/GoCrackMe2.go:17 */
      lVar4 = *(long *)((long)register0x00000020 + -0x220);
      lVar2 = *(long *)((long)register0x00000020 + -0x10);
      for (lVar8 = 0; lVar8 < lVar4; lVar8 = lVar8 + 1) {
                /* /app/src/GoCrackMe2/GoCrackMe2.go:17 */
                /* /app/src/GoCrackMe2/GoCrackMe2.go:18 */
        *(byte *)(extraout_RAX_00 + lVar8) = *(byte *)(lVar2 + lVar8) ^ 0x6d;
                /* /app/src/GoCrackMe2/GoCrackMe2.go:17 */
      }
                /* /app/src/GoCrackMe2/GoCrackMe2.go:20 */
      *(undefined8 *)((long)register0x00000020 + -0x290) = 0x4881dc;
      runtime.slicebytetostring(0,extraout_RAX_00,lVar4);
      *(long *)((long)register0x00000020 + -0x238) = extraout_RAX_00;
      *(undefined8 *)((long)register0x00000020 + -0x1d8) = extraout_RAX_01;
                /* /app/src/GoCrackMe2/GoCrackMe2.go:84 */
      *(undefined8 *)((long)register0x00000020 + -0x290) = 0x488205;
      runtime.mapassign_fast64
                (&datatype.Map.map[int]string,(undefined *)((long)register0x00000020 + -0xe8),
                 *(undefined8 *)((long)register0x00000020 + -0x1e8));
      extraout_RAX_02[1] = *(undefined8 *)((long)register0x00000020 + -0x238);
      if (DAT_005a3170 == 0) {
        uVar7 = *(undefined8 *)((long)register0x00000020 + -0x1d8);
        puVar6 = extraout_RAX_02;
      }
      else {
        *(undefined8 *)((long)register0x00000020 + -0x290) = 0x488227;
        runtime.gcWriteBarrier2();
        uVar7 = *(undefined8 *)((long)register0x00000020 + -0x1d8);
        *in_R11 = uVar7;
        in_R11[1] = *extraout_RAX_03;
        puVar6 = extraout_RAX_03;
      }
      *puVar6 = uVar7;
    }
    puVar6 = (undefined8 *)(*(long *)((long)register0x00000020 + -0x18) + 0x20);
    lVar4 = *(long *)((long)register0x00000020 + -0x1e0) + 1; # <----HERE
}
```

Set a breakpoint at: `0x48812f` and step through the code, making note of any hex values that 
have not been seen.

As you step through, you will see a few register values that already contain segments of the flag 
if you do the conversions. However, there is a new hex string that has not been seen yet in the 
ecx register.

```bash
gef➤ c 
Continuing.

Thread 1 "GoCrackMe2" hit Breakpoint 4, 0x000000000048812f in ?? ()

───────────────────────────────────────────────────────────────────────────────────── registers ────
$rax   : 0x3               
$rbx   : 0x0               
$rcx   : 0x000000c00011ef10  →  0x000000c00011ecea  →  0x5b5b5b545d0e095c
$rdx   : 0x000000c00012c000  →  0x000000000000025b
$rsp   : 0x000000c00011ecc0  →  0x0000000000494f40  →   or BYTE PTR [rax], al
$rbp   : 0x000000c00011ef40  →  0x000000c00011efd0  →  0x0000000000000000
$rsi   : 0x25b             
$rdi   : 0x766ad44cfd155af9
$rip   : 0x000000000048812f  →   inc rax
$r8    : 0x000000c00011ed90  →  0x000000000000c88e
$r9    : 0x1               
$r10   : 0x0               
$r11   : 0x000000c00011ed90  →  0x000000000000c88e
$r12   : 0x000000c000126030  →  0x0000007b67616c66 ("flag{"?)
$r13   : 0x0               
$r14   : 0x000000c0000061c0  →  0x000000c00011e000  →  0x000000c00011f000  →  0x000000c000120000  →  
                                                                0x000000c000121000  →  0x0000000000000000
$r15   : 0x3               
$eflags: [zero carry parity adjust sign trap INTERRUPT direction overflow resume virtualx86 identification]
$cs: 0x33 $ss: 0x2b $ds: 0x00 $es: 0x00 $fs: 0x00 $gs: 0x00 
───────────────────────────────────────────────────────────────────────────────────────── stack ────
0x000000c00011ecc0│+0x0000: 0x0000000000494f40  →   or BYTE PTR [rax], al	 ← $rsp
0x000000c00011ecc8│+0x0008: 0x000000c00011ee60  →  0x0000000000000002
0x000000c00011ecd0│+0x0010: 0x0000000000000000
0x000000c00011ecd8│+0x0018: 0x000000c00011ed60  →  0x0000000000000001
0x000000c00011ece0│+0x0020: 0x000000000040d6fb  →   mov rax, QWORD PTR [rsp+0x30]
0x000000c00011ece8│+0x0028: 0x5b545d0e095cba68
0x000000c00011ecf0│+0x0030: 0x5a555d585a0b5b5b
0x000000c00011ecf8│+0x0038: 0x5c585a5d545e0b55
─────────────────────────────────────────────────────────────────────────────────── code:x86:64 ────
     0x48811b                  mov    rcx, QWORD PTR [rsp+0x270]
     0x488123                  add    rcx, 0x20
     0x488127                  mov    rax, QWORD PTR [rsp+0xa8]
●→   0x48812f                  inc    rax
     0x488132                  cmp    rax, 0x5
     0x488136                  jge    0x488245
     0x48813c                  mov    rdx, QWORD PTR [rcx+0x18]
     0x488140                  mov    rbx, QWORD PTR [rcx+0x8]
     0x488144                  mov    rsi, QWORD PTR [rcx]
────────────────────────────────────────────────────────────────────────────────────────────────────
```

From what has already been seen, the flag is a combination of strings produced at random so it would
make sense that, if this new hex string is the final key to the flag, we can find the permutations and
guess a result. 

NOTE: This is the downside of not having a standard flag format and was addressed by the creators 
        post-competition.

Go ahead and run this script and try out the strings .... or .... see the flag below ...:

```python
hex_values = [
    0x5b545d0e095cba68,
    0x5a555d585a0b5b5b,
    0x5c585a5d545e0b55,
    0x5b5b5b545d0e095c,
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

Now generate the permutations:

```python
from itertools import permutations

def generate_combinations(values):
    if len(values) != 4:
        raise ValueError("needs 4 string values.")

    combinations = list(permutations(values))

    return ["".join(comb) for comb in combinations]

values = ["57fc4d2324", "f750878", "f390751", "1dc09666"]
combinations = generate_combinations(values)
print("Combinations:")
for comb in combinations:
    print(comb)
```

flag{f75087857fc4d23241dc09666f390751}


## Conclusion

This challenge was challenging to say the least but I learned a great deal about ghidra that has 
shored up my confidence in reversing other binaries and doing general debugging. The analyzer
was invaluable to get a grasp of program flow so shout out to those creators. I hope you enjoyed 
the walkthrough and found it helpful!
