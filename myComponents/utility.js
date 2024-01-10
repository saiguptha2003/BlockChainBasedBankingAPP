function stringToCharCodeArray(str) {
    // Convert a string to an array of character codes
    return Array.from(str, char => char.charCodeAt(0));
}


function stringXOR(str1, str2) {
    const charCodes1 = stringToCharCodeArray(str1);
    const charCodes2 = stringToCharCodeArray(str2);

    if (charCodes1.length !== charCodes2.length) {
        throw new Error('Strings should have the same length for XOR operation.');
    }

    const resultChars = [];
    for (let i = 0; i < charCodes1.length; i++) {
        // XOR operation for each pair of character codes
        const xorResult = charCodes1[i] ^ charCodes2[i];
        resultChars.push(String.fromCharCode(xorResult));
    }

    return resultChars.join('');
}
