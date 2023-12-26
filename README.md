# Uniswap-v3 Token Swapper

Hardhat task to swap tokens arbitrarily.

## Setup

* Install dependencies

    ```shell
    npm install
    ```

    run with `--force` if it throws errors

* Compile contracts

    ```shell
    npx hardhat compile
    ```

* Check task usage

    ```shell
    npx hardhat help swap
    ```

* Update `.env` with private keys and router address

    ```shell
    npx hardhat swap --amount <amount> --from <sourceTokenAddress> --to <destinationTokenAddress> --recipient <receiverAddress>
    ```

Example:

```shell
npx hardhat swap --amount 10.0 --from 0x07865c6E87B9F70255377e024ace6630C1Eaa37F --to 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6 --recipient 0xDC7d7A8920C8Eecc098da5B7522a5F31509b5Bfc
```

## Testing

* Compile contracts

    ```shell
    npx hardhat compile
    ```

* npx hardhat test test/test_swap.js
