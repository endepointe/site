# Capture keystroke data from shark

```bash
tshark -r keyboard_junkie -Y "usb.transfer_type == 0x01" -T fields -e usb.capdata
```

then:

```python
import pyshark

usb_key_map = {
    '04': 'a', '05': 'b', '06': 'c', '07': 'd', '08': 'e', '09': 'f',
    '0a': 'g', '0b': 'h', '0c': 'i', '0d': 'j', '0e': 'k', '0f': 'l',
    '10': 'm', '11': 'n', '12': 'o', '13': 'p', '14': 'q', '15': 'r',
    '16': 's', '17': 't', '18': 'u', '19': 'v', '1a': 'w', '1b': 'x',
    '1c': 'y', '1d': 'z', '1e': '1', '1f': '2', '20': '3', '21': '4',
    '22': '5', '23': '6', '24': '7', '25': '8', '26': '9', '27': '0',
    '2d': '-', '2e': '=', '28': 'Enter', '2a': 'Backspace', '2b': 'Tab',
    '2c': 'Space',
    # Add more special characters as needed
}


# Function to process the file and extract keystrokes
def process_capdata_file(file_path):
    keystrokes = []
    with open(file_path, 'r') as file:
        for line in file:
            line = line.strip()  # Remove any leading/trailing whitespace
            if line and len(line) >= 6:  # Ensure the line isn't empty and has enough length
                keycode = line[4:6]  # Extract the third byte (keycode)
                if keycode != '00':  # Ignore empty keystrokes
                    keystrokes.append(usb_key_map.get(keycode, '?'))  # Map keycode to character
    return ''.join(keystrokes)

# Path to your file containing the capdata output
file_path = "junkieoutput"
decoded_keystrokes = process_capdata_file(file_path)

print(f"Decoded keystrokes: {decoded_keystrokes}")
```

