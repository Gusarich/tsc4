import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type Task4Config = {};

export function task4ConfigToCell(config: Task4Config): Cell {
    return beginCell().endCell();
}

export class Task4 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Task4(address);
    }

    static createFromConfig(config: Task4Config, code: Cell, workchain = 0) {
        const data = task4ConfigToCell(config);
        const init = { code, data };
        return new Task4(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getEncrypt(provider: ContractProvider, shift: number, text: string): Promise<Cell> {
        const c = beginCell().storeUint(0, 32).storeStringTail(text).endCell();
        const r = await provider.get('caesar_cipher_encrypt', [
            { type: 'int', value: shift as unknown as bigint },
            { type: 'cell', cell: c },
        ]);
        return r.stack.readCell();
    }

    async getDecrypt(provider: ContractProvider, shift: number, text: string): Promise<Cell> {
        const c = beginCell().storeUint(0, 32).storeStringTail(text).endCell();
        return (
            await provider.get('caesar_cipher_decrypt', [
                { type: 'int', value: shift as unknown as bigint },
                { type: 'cell', cell: c },
            ])
        ).stack.readCell();
    }

    async getEncryptCell(provider: ContractProvider, shift: number, text: Cell): Promise<Cell> {
        const r = await provider.get('caesar_cipher_encrypt', [
            { type: 'int', value: shift as unknown as bigint },
            { type: 'cell', cell: text },
        ]);
        return r.stack.readCell();
    }
}
