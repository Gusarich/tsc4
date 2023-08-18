import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type Task5Config = {};

export function task5ConfigToCell(config: Task5Config): Cell {
    return beginCell().endCell();
}

export class Task5 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Task5(address);
    }

    static createFromConfig(config: Task5Config, code: Cell, workchain = 0) {
        const data = task5ConfigToCell(config);
        const init = { code, data };
        return new Task5(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getResult(provider: ContractProvider, n: number, k: number): Promise<string[]> {
        const rr = await provider.get('fibonacci_sequence', [
            { type: 'int', value: n as unknown as bigint },
            { type: 'int', value: k as unknown as bigint },
        ]);
        const r = rr.stack.readTuple();
        console.log(rr.gasUsed);
        const v = [];
        const l = r.remaining;
        for (let i = 0; i < l; i++) {
            v.push(r.readBigNumber().toString());
        }
        return v;
    }
}
