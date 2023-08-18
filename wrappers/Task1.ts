import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    TupleItemCell,
} from 'ton-core';

export type Task1Config = {};

export function task1ConfigToCell(config: Task1Config): Cell {
    return beginCell().endCell();
}

export class Task1 implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Task1(address);
    }

    static createFromConfig(config: Task1Config, code: Cell, workchain = 0) {
        const data = task1ConfigToCell(config);
        const init = { code, data };
        return new Task1(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getResult(provider: ContractProvider, hash: bigint, tree: Cell): Promise<Cell | null> {
        const result = await provider.get('find_branch_by_hash', [
            { type: 'int', value: hash },
            { type: 'cell', cell: tree },
        ]);
        console.log(result.logs);
        return result.stack.readCellOpt();
    }
}
