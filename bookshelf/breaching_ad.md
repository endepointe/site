
# Breaching AD

- ntlm auth services
- ldap bind creds
- auth relays
- ms deployment toolkit
- configs





## Setup DNS

Using `resolvectl`, set your dns to point to the victim's domain controller ip.

`resolvectl dns <interface> <victim dc ip>`
`resolvectl domain <interface> <domain>`

The output should be similar to:
```bash
resolvectl status <interface>
    Current Scopes: DNS 
    Protocols: +DefaultRoute 
    Current DNS Serve: <your dns server ip>
    DNS Servers: <your dns server ip>
    DNS Domain: <your dns domain name>
```


## Authentication Process
1) User sends print request with AD credentials.
2) Printer users credentials to create LDAP bind request.
3) DC provides response.
4) Printer requests LDAP user search.
5) Returns user search reponse.
6) LDAP bind request made with user credentials.
7) Server sends bind response back to printer.
8) User is authenticated and print job is accepted.

User --- 1 ---> Printer 
                Printer --- 2 ---> DC
                Printer <--- 3 --- DC
                Printer --- 4 ---> DC
                Printer <--- 5 --- DC
                Printer --- 6 ---> DC
                Printer <--- 7 --- DC
User <--- 8 --- Printer


## Attacks

### Pass-back

Requirements:
- Initial Access
    - Initial access can be obtained through password spraying or other mechanisms on AD. 

Using tcpdump, Setup a listener: `tcpdump -SX -i <interface> tcp port <ldap port>

Find a credential portal, such as a printer login page and alter the server ip to point to an attacker machine.


### Authentication Relay

Using SMB:
    - SMB handles everything from inter-network file-sharing to remote admin.

Steps:
    - establish an ldap server on the attack machine to intercept an authenticated session.
    - `responder -I <interface>`
    - `hashcat -m 5600 <hash file> <password file> --force`



