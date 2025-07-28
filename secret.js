const fs = require("fs");

const MOD = 10n ** 18n + 3n;

function modPow(base, exp, mod) {
    base %= mod;
    let result = 1n;
    while (exp > 0n) {
        if (exp % 2n === 1n) result = (result * base) % mod;
        base = (base * base) % mod;
        exp /= 2n;
    }
    return result;
}

function modInv(a, mod) {
    return modPow(a, mod - 2n, mod);
}

function lagrangeInterpolation(points, mod) {
    let result = 0n;
    const k = points.length;

    for (let i = 0; i < k; i++) {
        const { x: xi, y: yi } = points[i];
        let num = 1n;
        let den = 1n;

        for (let j = 0; j < k; j++) {
            if (i === j) continue;
            const { x: xj } = points[j];
            num = (num * (mod - xj)) % mod;
            den = (den * (xi - xj + mod)) % mod;
        }
        const term = (yi * num * modInv(den, mod)) % mod;
        result = (result + term + mod) % mod;
    }
    return result;
}

function* combinationsGenerator(arr, k) {
    const backtrack = function* (start, path) {
        if (path.length === k) {
            yield [...path];
            return;
        }
        for (let i = start; i < arr.length; i++) {
            path.push(arr[i]);
            yield* backtrack(i + 1, path);
            path.pop();
        }
    };
    yield* backtrack(0, []);
}

function parseInput(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const k = data.keys.k;
    const points = [];

    for (const key in data) {
        if (key === "keys") continue;
        points.push({
            x: BigInt(key),
            y: BigInt(parseInt(data[key].value, data[key].base))
        });
    }
    return { k, points };
}

function recoverSecretFromFile(filePath) {
    const { k, points } = parseInput(filePath);
    const secretCounts = new Map();

    for (const combo of combinationsGenerator(points, k)) {
        try {
            const secret = lagrangeInterpolation(combo, MOD);
            const key = secret.toString();
            secretCounts.set(key, (secretCounts.get(key) || 0) + 1);
        } catch (err) {
            // Intentionally left blank
        }
    }

    let maxCount = 0;
    let mostLikelySecret = null;
    for (const [secret, count] of secretCounts.entries()) {
        if (count > maxCount) {
            maxCount = count;
            mostLikelySecret = secret;
        }
    }

    console.log(`Recovered Secret from ${filePath}:`, mostLikelySecret);
}

function main() {
    const inputFiles = ["input1.json", "input2.json"];
    inputFiles.forEach(recoverSecretFromFile);
}

main();